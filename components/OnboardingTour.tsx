'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        updateTargetRect();
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const updateTargetRect = () => {
    if (!isOpen || !steps[currentStep]) return;
    
    const targetElement = document.querySelector(steps[currentStep].target);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      setTimeout(() => {
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);
      }, 300);
    } else {
      setTargetRect(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateTargetRect();
    } else {
      setCurrentStep(0);
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

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

  if (!isOpen) return null;

  const currentTourStep = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Calculate popover position
  let popoverStyle: React.CSSProperties = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  if (targetRect) {
    const position = currentTourStep.position || 'bottom';
    const padding = 16;
    
    if (position === 'bottom') {
      popoverStyle = {
        top: targetRect.bottom + padding,
        left: Math.max(padding, Math.min(targetRect.left + (targetRect.width / 2) - 170, windowSize.width - 340 - padding)),
      };
    } else if (position === 'top') {
      popoverStyle = {
        top: Math.max(padding, targetRect.top - padding - 220),
        left: Math.max(padding, Math.min(targetRect.left + (targetRect.width / 2) - 170, windowSize.width - 340 - padding)),
      };
    } else if (position === 'left') {
      popoverStyle = {
        top: Math.max(padding, targetRect.top + (targetRect.height / 2) - 100),
        left: targetRect.left - padding - 340,
      };
    } else if (position === 'right') {
      popoverStyle = {
        top: Math.max(padding, targetRect.top + (targetRect.height / 2) - 100),
        left: targetRect.right + padding,
      };
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none">
      <AnimatePresence>
        {/* Background Overlay with Cutout - No global blur so highlighted element is crystal clear */}
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
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
              }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              className="absolute bg-transparent rounded-2xl pointer-events-none"
              style={{
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.70), 0 0 0 3px #81D7B4, 0 0 24px rgba(129, 215, 180, 0.5)',
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-slate-900/70" />
          )}
        </motion.div>

        {/* Popover */}
        <motion.div
          key={`step-${currentStep}`}
          layout
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
          style={popoverStyle}
          className="absolute w-full max-w-[340px] bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-100 pointer-events-auto flex flex-col overflow-hidden"
        >
          <div className="p-5 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black tracking-widest uppercase text-[#14532d] bg-[#81D7B4]/20 border border-[#81D7B4]/40 px-2.5 py-0.5 rounded-full">
                Step {currentStep + 1} of {steps.length}
              </span>
              <button 
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-900 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
                aria-label="Close tour"
              >
                <Cancel01Icon className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-base font-bold text-gray-900 mb-1.5">
              {currentTourStep.title}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {currentTourStep.content}
            </p>
          </div>

          <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
                currentStep === 0 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft01Icon className="w-3.5 h-3.5" /> Back
            </button>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#81D7B4] hover:bg-[#6BBF9E] text-white text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer shadow-[0_2px_10px_rgba(129,215,180,0.4)] active:scale-95"
            >
              {isLastStep ? (
                <span className="flex items-center gap-1 text-white">Finish <Tick01Icon className="w-3.5 h-3.5 text-white stroke-[2.5]" /></span>
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
