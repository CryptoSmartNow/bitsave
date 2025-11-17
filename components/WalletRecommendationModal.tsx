'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark, HiOutlineShieldCheck, HiOutlineEye, HiOutlineCheckCircle, HiOutlineArrowPath, HiOutlineCurrencyDollar } from 'react-icons/hi2';
import NextImage from 'next/image';

interface WalletRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
  currentWallet: string;
}

export default function WalletRecommendationModal({
  isOpen,
  onClose,
  onDontShowAgain,
  currentWallet
}: WalletRecommendationModalProps) {

  const getWalletLogo = (walletName: string) => {
    const name = walletName.toLowerCase();
    if (name.includes('metamask')) return '/metamasklogo.svg';
    if (name.includes('rabby')) return '/rabbylogo.svg';
    if (name.includes('trust')) return '/trustlogo.svg';
    return null;
  };

  const getWalletBgColor = (walletName: string) => {
    const name = walletName.toLowerCase();
    if (name.includes('rabby')) return '#dbe0ff';
    return '#f9fafb'; // gray-50 for other wallets
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto overflow-hidden relative"
          >
            {/* Header with improved design - compressed */}
            <div className="bg-gradient-to-br from-[#81D7B4]/5 to-white p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#81D7B4]/10 rounded-xl flex items-center justify-center">
                    <HiOutlineShieldCheck className="w-5 h-5 text-[#81D7B4]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Upgrade Your Wallet</h2>
                    <p className="text-xs text-gray-600 mt-0.5">Enhanced security & better DeFi experience</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <HiOutlineXMark className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Compressed content area */}
            <div className="p-5 space-y-4">
              {/* Current wallet - compressed */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Wallet</span>
                  <HiOutlineCheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center gap-3">
                  {getWalletLogo(currentWallet) && (
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                      <NextImage
                        src={getWalletLogo(currentWallet)!}
                        alt={currentWallet}
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{currentWallet}</p>
                    <p className="text-xs text-gray-500">Connected & Active</p>
                  </div>
                </div>
              </div>

              {/* Rabby recommendation - compressed */}
              <div className="rounded-xl p-4 border-2" style={{ backgroundColor: '#f0f4ff', borderColor: '#dbe0ff' }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-[#dbe0ff]">
                    <NextImage
                      src="/rabbylogo.svg"
                      alt="Rabby Wallet"
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">Rabby Wallet</h3>
                      <span className="px-2 py-0.5 bg-[#4c65ff]/10 text-[#4c65ff] text-xs font-semibold rounded-full">Recommended</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-snug">
                      Enhanced security with transaction previews and phishing protection.
                    </p>
                  </div>
                </div>
                
                {/* Feature highlights - compressed */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                    <div className="w-5 h-5 bg-[#81D7B4]/10 rounded flex items-center justify-center flex-shrink-0">
                      <HiOutlineShieldCheck className="w-3 h-3 text-[#81D7B4]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-xs">Security</p>
                      <p className="text-[10px] text-gray-500">Multi-layer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                    <div className="w-5 h-5 bg-[#81D7B4]/10 rounded flex items-center justify-center flex-shrink-0">
                      <HiOutlineEye className="w-3 h-3 text-[#81D7B4]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-xs">Preview</p>
                      <p className="text-[10px] text-gray-500">Before sign</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional benefits - ultra compact */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-[#81D7B4]/10 rounded flex items-center justify-center">
                      <HiOutlineArrowPath className="w-3 h-3 text-[#81D7B4]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-xs">Multi-Chain</p>
                      <p className="text-[10px] text-gray-500">All networks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-[#81D7B4]/10 rounded flex items-center justify-center">
                      <HiOutlineCurrencyDollar className="w-3 h-3 text-[#81D7B4]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-xs">Gas Saver</p>
                      <p className="text-[10px] text-gray-500">Lower fees</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compressed action buttons */}
            <div className="p-5 pt-0 space-y-3">
              <a
                href="https://rabby.io/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full px-4 py-3 bg-[#81D7B4] text-white rounded-xl font-semibold hover:shadow-md hover:shadow-[#81D7B4]/20 transition-all flex items-center justify-center gap-2 group"
              >
                <span className="text-sm">Upgrade to Rabby</span>
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl font-medium transition-all border border-gray-200 text-sm"
              >
                Continue with {currentWallet.split(' ')[0]}
              </button>
              <p className="text-xs text-gray-500 text-center leading-tight">
                Works alongside your current wallet
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}