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
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

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
        // Scroll element into comfortable view
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Re-measure after scroll animation completes
        const timer1 = setTimeout(updateTargetRect, 150);
        const timer2 = setTimeout(updateTargetRect, 400);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
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
  const isMobile = windowSize.width > 0 && windowSize.width < 640;

  // Responsive popover style calculation
  let popoverStyle: React.CSSProperties = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: 'calc(100vw - 32px)',
    width: '360px',
  };

  if (targetRect && windowSize.width > 0) {
    const padding = 16;
    const cardWidth = Math.min(360, windowSize.width - (padding * 2));
    const cardEstHeight = 220;

    if (isMobile) {
      // Mobile-first positioning: check vertical fit relative to highlight
      const spaceBelow = windowSize.height - targetRect.bottom;
      const spaceAbove = targetRect.top;

      let topPos = 0;
      if (spaceBelow >= cardEstHeight + padding) {
        // Fits below the highlighted element
        topPos = targetRect.bottom + padding;
      } else if (spaceAbove >= cardEstHeight + padding) {
        // Fits above the highlighted element
        topPos = targetRect.top - cardEstHeight - padding;
      } else {
        // Fixed at bottom of screen with safe margin
        topPos = Math.max(padding, windowSize.height - cardEstHeight - padding);
      }

      popoverStyle = {
        top: Math.max(padding, Math.min(topPos, windowSize.height - cardEstHeight - padding)),
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${cardWidth}px`,
        maxWidth: 'calc(100vw - 32px)',
      };
    } else {
      // Desktop positioning
      const requestedPos = currentTourStep.position || 'bottom';

      if (requestedPos === 'bottom') {
        popoverStyle = {
          top: Math.min(targetRect.bottom + padding, windowSize.height - cardEstHeight - padding),
          left: Math.max(padding, Math.min(targetRect.left + (targetRect.width / 2) - (cardWidth / 2), windowSize.width - cardWidth - padding)),
          width: `${cardWidth}px`,
        };
      } else if (requestedPos === 'top') {
        popoverStyle = {
          top: Math.max(padding, targetRect.top - cardEstHeight - padding),
          left: Math.max(padding, Math.min(targetRect.left + (targetRect.width / 2) - (cardWidth / 2), windowSize.width - cardWidth - padding)),
          width: `${cardWidth}px`,
        };
      } else if (requestedPos === 'left') {
        popoverStyle = {
          top: Math.max(padding, Math.min(targetRect.top + (targetRect.height / 2) - 100, windowSize.height - cardEstHeight - padding)),
          left: Math.max(padding, targetRect.left - padding - cardWidth),
          width: `${cardWidth}px`,
        };
      } else if (requestedPos === 'right') {
        popoverStyle = {
          top: Math.max(padding, Math.min(targetRect.top + (targetRect.height / 2) - 100, windowSize.height - cardEstHeight - padding)),
          left: Math.min(targetRect.right + padding, windowSize.width - cardWidth - padding),
          width: `${cardWidth}px`,
        };
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none">
      <AnimatePresence>
        {/* Background Overlay with Cutout */}
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-auto overflow-hidden"
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
              transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              className="absolute bg-transparent rounded-2xl pointer-events-none"
              style={{
                boxShadow: '0 0 0 9999px rgba(10, 15, 26, 0.75), 0 0 0 2.5px #81D7B4, 0 0 20px rgba(129, 215, 180, 0.45)',
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-slate-950/75" />
          )}
        </motion.div>

        {/* Popover Card */}
        <motion.div
          key={`step-${currentStep}`}
          layout
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          style={popoverStyle}
          className="absolute bg-white dark:bg-[#151b28] text-gray-900 dark:text-white rounded-3xl shadow-2xl border border-gray-200/80 dark:border-white/10 pointer-events-auto flex flex-col overflow-hidden backdrop-blur-xl"
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-black tracking-widest uppercase text-[#047857] dark:text-[#81D7B4] bg-[#81D7B4]/20 border border-[#81D7B4]/30 px-2.5 py-0.5 rounded-full">
                Step {currentStep + 1} of {steps.length}
              </span>
              <button 
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"
                aria-label="Close tour"
              >
                <Cancel01Icon className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
              {currentTourStep.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {currentTourStep.content}
            </p>
          </div>

          <div className="px-4 sm:px-5 py-3 bg-gray-50/80 dark:bg-white/[0.03] border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer ${
                currentStep === 0 
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ArrowLeft01Icon className="w-3.5 h-3.5" /> Back
            </button>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#81D7B4] hover:bg-[#6ec9a4] text-[#070A0F] text-xs font-black rounded-xl transition-all duration-150 cursor-pointer shadow-[0_2px_12px_rgba(129,215,180,0.35)] active:scale-95"
            >
              {isLastStep ? (
                <span className="flex items-center gap-1">Finish <Tick01Icon className="w-3.5 h-3.5 stroke-[2.5]" /></span>
              ) : (
                <span className="flex items-center gap-1">Next <ArrowRight01Icon className="w-3.5 h-3.5" /></span>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

