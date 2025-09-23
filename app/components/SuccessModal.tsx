'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  autoClose = true,
  autoCloseDelay = 4000
}: SuccessModalProps) {
  const [timeLeft, setTimeLeft] = useState(autoCloseDelay);

  useEffect(() => {
    if (!isOpen || !autoClose) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          onClose();
          return autoCloseDelay;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(autoCloseDelay);
    }
  }, [isOpen, autoCloseDelay]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Enhanced Backdrop with Brand Colors */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/20 via-[#6BC5A0]/30 to-[#81D7B4]/40 backdrop-blur-xl"
          />

          {/* Floating Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-[#81D7B4]/30 to-[#6BC5A0]/20 rounded-full blur-3xl"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.4 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-gradient-to-tl from-[#6BC5A0]/25 to-[#81D7B4]/15 rounded-full blur-2xl"
            />
          </div>

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.4 
            }}
            className="relative bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_rgba(129,215,180,0.3)] max-w-md w-full mx-4 overflow-hidden border border-white/60"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#81D7B4]/5 via-transparent to-white/30 pointer-events-none"></div>

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#81D7B4] via-[#6BC5A0] to-[#81D7B4]"></div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 hover:bg-white/90 backdrop-blur-sm transition-all duration-200 z-10 shadow-lg hover:shadow-xl border border-white/60 group"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
            </button>

            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Success Icon with enhanced styling */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 20,
                  delay: 0.1 
                }}
                className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-[#81D7B4] via-[#6BC5A0] to-[#81D7B4] rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(129,215,180,0.4)] relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
                <CheckCircle className="w-10 h-10 text-white drop-shadow-lg" />
                
                {/* Animated rings */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                  className="absolute inset-0 border-2 border-[#81D7B4]/40 rounded-2xl"
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5, delay: 0.3 }}
                  className="absolute inset-0 border border-[#6BC5A0]/30 rounded-2xl"
                />
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 mb-3"
              >
                {title}
              </motion.h3>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-gray-600 mb-8 leading-relaxed text-lg"
              >
                {message}
              </motion.p>

              {/* Action Button */}
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                onClick={onClose}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] hover:from-[#6BC5A0] hover:to-[#81D7B4] text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-[0_8px_25px_rgba(129,215,180,0.4)] hover:shadow-[0_12px_35px_rgba(129,215,180,0.5)] transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative">Got it!</span>
              </motion.button>

              {/* Auto-close indicator */}
              {autoClose && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 text-sm text-gray-500 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-white/60"
                >
                  Auto-closing in {Math.ceil(timeLeft / 1000)} seconds
                </motion.div>
              )}
            </div>

            {/* Enhanced Progress bar for auto-close */}
            {autoClose && (
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-200/50 to-gray-300/50 backdrop-blur-sm">
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-[#81D7B4] via-[#6BC5A0] to-[#81D7B4] origin-left shadow-[0_0_10px_rgba(129,215,180,0.5)]"
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}