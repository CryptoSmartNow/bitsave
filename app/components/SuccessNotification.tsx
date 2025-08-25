'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  redirectPath?: string;
  redirectDelay?: number;
  showCountdown?: boolean;
}

export default function SuccessNotification({
  isOpen,
  onClose,
  title,
  message,
  redirectPath = '/admin',
  redirectDelay = 5000,
  showCountdown = true
}: SuccessNotificationProps) {
  const [countdown, setCountdown] = useState(redirectDelay / 1000);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
      if (redirectPath) {
        router.push(redirectPath);
      }
    }, redirectDelay);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [isOpen, onClose, redirectPath, redirectDelay, router]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(redirectDelay / 1000);
    }
  }, [isOpen, redirectDelay]);

  const handleStayHere = () => {
    onClose();
  };

  const handleGoNow = () => {
    onClose();
    if (redirectPath) {
      router.push(redirectPath);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden">
              {/* Success Animation Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 opacity-50" />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Success Icon */}
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-800 text-center mb-3">
                  {title}
                </h3>

                {/* Message */}
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  {message}
                </p>

                {/* Countdown */}
                {showCountdown && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Redirecting to dashboard in
                    </p>
                    <div className="text-3xl font-bold text-[#81D7B4] mb-2">
                      {countdown}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-[#81D7B4] to-emerald-500 h-2 rounded-full"
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: redirectDelay / 1000, ease: "linear" }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleStayHere}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Stay Here
                  </button>
                  <button
                    onClick={handleGoNow}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#81D7B4] to-emerald-500 text-white rounded-xl hover:from-[#66C4A3] hover:to-emerald-600 transition-all duration-200 font-medium shadow-lg"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}