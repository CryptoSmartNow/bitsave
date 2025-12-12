'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface ENSErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  ensName?: string
}

export default function ENSErrorModal({
  isOpen,
  onClose,
  title,
  message,
  ensName
}: ENSErrorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent bar */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-1.5 bg-red-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              ></motion.div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white hover:bg-gray-50 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center group border border-gray-200 z-10"
              >
                <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header Section */}
              <div className="relative p-4 sm:p-6 md:p-8 pb-3 sm:pb-4 md:pb-6 pr-12 sm:pr-14 md:pr-16">
                <div className="flex items-start space-x-4">
                  {/* Icon Container */}
                  <motion.div
                    className="flex-shrink-0 relative"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  >
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-red-50 rounded-2xl flex items-center justify-center shadow-lg border border-red-100">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </motion.div>

                  {/* Title Section */}
                  <div className="flex-1 pt-1 sm:pt-2">
                    <motion.h3
                      className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {title}
                    </motion.h3>
                    <motion.p
                      className="text-sm sm:text-base text-gray-600 leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {message}
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-5 md:pb-6 space-y-4 sm:space-y-5 md:space-y-6">
                {ensName && (
                  <motion.div
                    className="bg-gray-50 rounded-2xl p-4 border border-gray-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                      ENS Name Entered:
                    </p>
                    <p className="text-base font-semibold text-gray-900 font-mono">
                      {ensName}
                    </p>
                  </motion.div>
                )}

                {/* Tips Section */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="relative bg-gradient-to-br from-[#81D7B4]/5 to-transparent rounded-2xl p-4 sm:p-5 border border-[#81D7B4]/20">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-[#81D7B4] rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                        Tips for valid ENS names:
                      </h4>
                    </div>
                    <ul className="space-y-2 sm:space-y-3">
                      <li className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#81D7B4] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                        <span className="text-sm sm:text-base text-gray-700 leading-relaxed">Must end with <span className="font-mono bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">.eth</span> (e.g., vitalik.eth)</span>
                      </li>
                      <li className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#81D7B4] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                        <span className="text-sm sm:text-base text-gray-700 leading-relaxed">Must resolve to your connected wallet</span>
                      </li>
                      <li className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#81D7B4] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                        <span className="text-sm sm:text-base text-gray-700 leading-relaxed">Check spelling and try again</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-gray-50 border-t border-gray-200">
                <motion.button
                  onClick={onClose}
                  className="w-full bg-[#81D7B4] hover:shadow-lg hover:shadow-[#81D7B4]/30 text-white font-semibold py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 md:px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-1.5 sm:space-x-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-sm sm:text-base">Try Again</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}