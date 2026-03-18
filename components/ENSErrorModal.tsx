'use client'

import { AnimatePresence, motion } from 'framer-motion'

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
        <div className="ds-modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
          <motion.div
            className="ds-modal-content max-w-md"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent bar */}
            <div className="ds-modal-accent ds-modal-accent--error" />

            <div className="ds-modal-body pt-6">
              {/* Header */}
              <div className="ds-modal-header">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-50">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="ds-modal-title">{title}</h3>
                </div>
                <button onClick={onClose} className="ds-modal-close" aria-label="Close">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Message */}
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{message}</p>

              {/* ENS Name Display */}
              {ensName && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-4">
                  <p className="ds-section-label mb-0.5">ENS Name Entered</p>
                  <p className="text-sm font-semibold text-gray-900 font-mono">{ensName}</p>
                </div>
              )}

              {/* Tips */}
              <div className="bg-[#81D7B4]/5 rounded-xl p-4 border border-[#81D7B4]/10 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-[#81D7B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-900">Tips for valid ENS names</span>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#81D7B4] rounded-full flex-shrink-0" />
                    Must end with <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.eth</code>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#81D7B4] rounded-full flex-shrink-0" />
                    Must resolve to your connected wallet
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#81D7B4] rounded-full flex-shrink-0" />
                    Check spelling and try again
                  </li>
                </ul>
              </div>

              {/* Action */}
              <button
                onClick={onClose}
                className="ds-btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}