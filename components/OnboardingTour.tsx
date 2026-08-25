'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight01Icon, ArrowLeft01Icon, Cancel01Icon, Tick01Icon } from 'hugeicons-react';

export interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TourStep[];
}

export default function OnboardingTour({ isOpen, onClose, steps }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? window.innerHeight : 844,
  }));

  const updateTargetRect = useCallback(() => {
    if (!isOpen || !steps[currentStep]) return;
    
    const targetElement = document.querySelector(steps[currentStep].target);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, steps, currentStep]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResizeOrScroll = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        updateTargetRect();
      };

      handleResizeOrScroll();
      window.addEventListener('resize', handleResizeOrScroll);
      window.addEventListener('scroll', handleResizeOrScroll, { passive: true });

      return () => {
        window.removeEventListener('resize', handleResizeOrScroll);
        window.removeEventListener('scroll', handleResizeOrScroll);
      };
    }
  }, [updateTargetRect]);

  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      const targetElement = document.querySelector(steps[currentStep].target);
      if (targetElement) {
        // Scroll element into view smoothly
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Multiple re-measurements to account for mobile scroll inertia
        const t1 = setTimeout(updateTargetRect, 100);
        const t2 = setTimeout(updateTargetRect, 300);
        const t3 = setTimeout(updateTargetRect, 600);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        };
      } else {
        setTargetRect(null);
      }
    } else {
      setCurrentStep(0);
      setTargetRect(null);
    }
  }, [isOpen, currentStep, steps, updateTargetRect]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('bitsave_tour_completed', 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('bitsave_tour_completed', 'true');
    onClose();
  };

  if (!isOpen || !steps.length) return null;

  const currentTourStep = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const screenW = windowSize.width || (typeof window !== 'undefined' ? window.innerWidth : 390);
  const screenH = windowSize.height || (typeof window !== 'undefined' ? window.innerHeight : 844);
  const cardWidth = Math.min(340, screenW - 32);
  const cardEstHeight = 220;

  // Pixel-perfect clamping so the card is NEVER cut off on any mobile or desktop screen
  let clampedLeft = Math.max(16, (screenW - cardWidth) / 2);
  let clampedTop = Math.max(16, (screenH - cardEstHeight) / 2);

  if (targetRect) {
    const targetCenterX = targetRect.left + (targetRect.width / 2);
    const idealLeft = targetCenterX - (cardWidth / 2);
    clampedLeft = Math.max(16, Math.min(idealLeft, screenW - cardWidth - 16));

    const spaceBelow = screenH - targetRect.bottom;
    const spaceAbove = targetRect.top;

    let topPos = targetRect.bottom + 12;
    if (spaceBelow < cardEstHeight + 20 && spaceAbove > cardEstHeight + 20) {
      topPos = targetRect.top - cardEstHeight - 12;
    }

    clampedTop = Math.max(16, Math.min(topPos, screenH - cardEstHeight - 16));
  }

  const popoverStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${clampedLeft}px`,
    top: `${clampedTop}px`,
    width: `${cardWidth}px`,
    maxWidth: 'calc(100vw - 32px)',
    zIndex: 100000,
  };

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none">
      <AnimatePresence>
        {/* Darkened Cutout Overlay */}
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-auto overflow-hidden z-[99999]"
          onClick={handleSkip}
        >
          {targetRect ? (
            <motion.div
              layout
              initial={false}
              animate={{
                top: Math.max(0, targetRect.top - 6),
                left: Math.max(0, targetRect.left - 6),
                width: targetRect.width + 12,
                height: targetRect.height + 12,
              }}
              transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
              className="fixed bg-transparent rounded-2xl pointer-events-none"
              style={{
                boxShadow: '0 0 0 9999px rgba(7, 10, 15, 0.82), 0 0 0 2.5px #81D7B4, 0 0 24px rgba(129, 215, 180, 0.5)',
              }}
            />
          ) : (
            <div className="fixed inset-0 bg-[#070A0F]/85" />
          )}
        </motion.div>

        {/* Popover Card */}
        <motion.div
          key={`step-${currentStep}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={popoverStyle}
          className="bg-[#0D131F]/95 text-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-white/10 pointer-events-auto flex flex-col overflow-hidden backdrop-blur-2xl"
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-black tracking-widest uppercase text-[#81D7B4] bg-[#81D7B4]/15 border border-[#81D7B4]/30 px-2.5 py-0.5 rounded-full">
                Step {currentStep + 1} of {steps.length}
              </span>
              <button 
                onClick={handleSkip}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1 rounded-xl hover:bg-white/5"
                aria-label="Close tour"
              >
                <Cancel01Icon className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-sm sm:text-base font-bold text-white mb-1 tracking-tight">
              {currentTourStep.title}
            </h3>
            <p className="text-xs text-[#A0AEC0] leading-relaxed">
              {currentTourStep.content}
            </p>
          </div>

          <div className="px-4 sm:px-5 py-3 bg-[#070A0F]/60 border-t border-white/[0.08] flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer ${
                currentStep === 0 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <ArrowLeft01Icon className="w-3.5 h-3.5" /> Back
            </button>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#81D7B4] hover:opacity-90 text-white font-black rounded-xl transition-all duration-150 cursor-pointer shadow-[0_2px_12px_rgba(129,215,180,0.35)] active:scale-95"
            >
              {isLastStep ? (
                <span className="flex items-center gap-1 text-white">Finish <Tick01Icon className="w-3.5 h-3.5 stroke-[2.5] text-white" /></span>
              ) : (
                <span className="flex items-center gap-1 text-white">Next <ArrowRight01Icon className="w-3.5 h-3.5 text-white" /></span>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

