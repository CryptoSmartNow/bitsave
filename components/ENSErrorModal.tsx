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
          {/* Clean Backdrop without Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-[9999]"
            onClick={onClose}
          />
          
          {/* Modal Container - Fully Responsive */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ 
                type: "spring", 
                duration: 0.4,
                bounce: 0.3
              }}
              className="relative bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto overflow-hidden border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#81D7B4]/20 to-red-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-[#81D7B4]/10 to-orange-500/10 rounded-full blur-3xl"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay"></div>
              </div>

              {/* Close Button - Mobile Optimized */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center group border border-gray-200/50 z-10"
              >
                <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Header Section - Responsive with Safe Area */}
              <div className="relative p-4 sm:p-6 md:p-8 pb-3 sm:pb-4 md:pb-6 pr-12 sm:pr-14 md:pr-16">
                <div className="flex items-start space-x-4">
                  {/* Enhanced Icon Container - Responsive */}
                  <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-red-500/20 rounded-xl sm:rounded-2xl blur-lg animate-pulse"></div>
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-50 to-red-100 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border border-red-200/50">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Title Section - Responsive */}
                  <div className="flex-1 pt-1 sm:pt-2">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 mb-1 sm:mb-2">
                      {title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Content Section - Responsive */}
              <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-5 md:pb-6 space-y-4 sm:space-y-5 md:space-y-6">
                {ensName && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/10 to-[#81D7B4]/5 rounded-2xl"></div>
                    <div className="relative bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#81D7B4]/20 shadow-sm">
                      <p className="text-xs sm:text-sm font-medium text-[#81D7B4] mb-2">
                        ENS Name Entered:
                      </p>
                      <p className="font-mono text-sm sm:text-base md:text-lg text-gray-900 break-all bg-gray-50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-gray-200/50">
                        {ensName}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Tips Section - Brand Styled */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/10 via-[#81D7B4]/5 to-transparent rounded-2xl"></div>
                  <div className="relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-[#81D7B4]/20 shadow-sm">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-br from-[#81D7B4] to-[#81D7B4]/80 rounded-md sm:rounded-lg flex items-center justify-center shadow-sm">
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
                </div>
              </div>
              
              {/* Footer - Responsive Button */}
              <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/90 hover:from-[#81D7B4]/90 hover:to-[#81D7B4] text-white font-semibold py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 md:px-6 rounded-xl sm:rounded-2xl shadow-[0_6px_20px_rgba(129,215,180,0.25)] hover:shadow-[0_8px_25px_rgba(129,215,180,0.35)] transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#81D7B4]/30"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-1.5 sm:space-x-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm sm:text-base">Try Again</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}