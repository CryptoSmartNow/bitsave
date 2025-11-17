'use client'

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { HiOutlineCheck, HiOutlineXMark } from 'react-icons/hi2';

interface Network {
  name: string;
  desc: string;
  icon: string;
  isActive: boolean;
  isComingSoon?: boolean;
}

interface NetworkSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  networks: Network[];
  onSelectNetwork: (network: Network) => Promise<void>;
  isNetworkSwitching: boolean;
  isLoadingLogos?: boolean;
}

export default function NetworkSelectionModal({
  isOpen,
  onClose,
  networks,
  onSelectNetwork,
  isNetworkSwitching,
  isLoadingLogos = false
}: NetworkSelectionModalProps) {
  // Ensure image URLs are valid for Next.js Image
  const ensureImageUrl = (url: string | undefined): string => {
    if (!url) return '/default-network.png';
    if (url.startsWith('/')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `/${url}`;
    }
    return url;
  };
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Light Backdrop without dark gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-white/20 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />
          
          {/* Stunning Modal with glassmorphism - Perfectly Centered */}
          <div className="fixed inset-0 flex items-center justify-center z-[10000] p-4 sm:p-6 md:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.4
              }}
              className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Container with advanced glassmorphism */}
              <div className="relative bg-gradient-to-br from-white/95 via-white/90 to-white/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border-2 border-white/60 shadow-[0_25px_80px_rgba(129,215,180,0.4),0_10px_40px_rgba(34,158,217,0.2),inset_0_1px_0_rgba(255,255,255,0.8)] overflow-hidden max-h-[90vh] flex flex-col">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/10 via-transparent to-[#229ED9]/10 opacity-50"></div>
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#81D7B4]/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#229ED9]/20 rounded-full blur-3xl"></div>
              
              {/* Header with enhanced styling - Responsive */}
              <div className="relative flex items-start sm:items-center justify-between p-4 sm:p-5 md:p-6 border-b border-gray-200/50 bg-gradient-to-r from-white/50 to-transparent flex-shrink-0">
                <div className="flex-1 min-w-0 pr-3">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    Select Network
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Choose your preferred blockchain network</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-100/80 transition-all duration-200 hover:scale-110 group flex-shrink-0"
                  aria-label="Close modal"
                >
                  <HiOutlineXMark className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-gray-900 transition-colors" />
                </button>
              </div>

              {/* Network List with enhanced cards - Scrollable Grid Layout */}
              <div className="relative p-4 sm:p-5 md:p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {isLoadingLogos && (
                  <div className="col-span-1 sm:col-span-2 flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#81D7B4]"></div>
                    <span className="ml-3 text-gray-600">Loading network logos...</span>
                  </div>
                )}
                {!isLoadingLogos && networks.map((network, index) => (
                  <motion.button
                    key={`${network.name}-${network.isActive}`}
                    initial={{ opacity: 0, x: -30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ 
                      delay: index * 0.08, 
                      duration: 0.3,
                      type: "spring",
                      stiffness: 200
                    }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      if (!network.isActive && !isNetworkSwitching && !network.isComingSoon) {
                        await onSelectNetwork(network);
                        onClose();
                      }
                    }}
                    disabled={isNetworkSwitching || network.isActive || network.isComingSoon}
                    className={`group relative w-full flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 text-left overflow-hidden ${
                      network.isActive
                        ? 'bg-gradient-to-r from-[#81D7B4]/20 via-[#81D7B4]/15 to-[#81D7B4]/20 cursor-default border-2 border-[#81D7B4]/50 shadow-[0_8px_24px_rgba(129,215,180,0.2),inset_0_1px_0_rgba(255,255,255,0.5)]'
                        : network.isComingSoon
                        ? 'bg-gray-100/60 cursor-not-allowed border-2 border-gray-200/50 opacity-60'
                        : 'bg-white/60 hover:bg-white/80 cursor-pointer border-2 border-transparent hover:border-[#81D7B4]/30 hover:shadow-[0_8px_24px_rgba(129,215,180,0.15),inset_0_1px_0_rgba(255,255,255,0.6)]'
                    } ${isNetworkSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {/* Hover glow effect */}
                    {!network.isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/0 via-[#81D7B4]/5 to-[#81D7B4]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                    
                    {/* Network Icon with enhanced styling - Responsive */}
                    <div className="relative flex-shrink-0 z-10">
                      <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-300 ${
                        network.isActive 
                          ? 'bg-[#81D7B4]/50 scale-125 animate-pulse' 
                          : 'bg-gray-400/20 group-hover:bg-[#81D7B4]/30 group-hover:scale-110'
                      }`}></div>
                      <div className={`relative rounded-full w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center transition-all duration-300 ${
                        network.isActive
                          ? 'bg-gradient-to-br from-white to-white/90 border-2 border-[#81D7B4]/50 shadow-[0_4px_16px_rgba(129,215,180,0.4),inset_0_1px_0_rgba(255,255,255,0.8)]'
                          : network.isComingSoon
                          ? 'bg-gradient-to-br from-gray-200/50 to-gray-100/50 border-2 border-gray-300/50 opacity-60'
                          : 'bg-gradient-to-br from-white/90 to-white/70 border-2 border-gray-200/50 group-hover:border-[#81D7B4]/40 group-hover:shadow-[0_4px_16px_rgba(129,215,180,0.2)]'
                      }`}>
                        <Image
                          src={ensureImageUrl(network.icon)}
                          alt={network.name}
                          width={28}
                          height={28}
                          className="object-contain w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    </div>
                    
                    {/* Network Info with enhanced typography - Responsive */}
                    <div className="flex-1 min-w-0 z-10">
                      <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                        <h4 className={`font-bold text-base sm:text-lg md:text-xl flex-1 min-w-0 truncate transition-all duration-300 ${
                          network.isActive ? 'text-gray-900' : network.isComingSoon ? 'text-gray-500' : 'text-gray-800 group-hover:text-gray-900'
                        }`}>
                          {network.name}
                        </h4>
                        {network.isActive && (
                          <span className="px-2 py-0.5 bg-[#81D7B4] text-white text-[10px] sm:text-xs font-semibold rounded-full flex-shrink-0">
                            Active
                          </span>
                        )}
                        {network.isComingSoon && (
                          <span className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-md whitespace-nowrap flex-shrink-0">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className={`text-xs sm:text-sm truncate transition-all duration-300 ${
                        network.isActive ? 'text-gray-600' : 'text-gray-500 group-hover:text-gray-600'
                      }`}>
                        {network.desc}
                      </p>
                    </div>
                    
                    {/* Active Indicator with animation - Responsive */}
                    {network.isActive && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#81D7B4] to-[#6BC4A0] flex items-center justify-center shadow-[0_4px_12px_rgba(129,215,180,0.4)]"
                      >
                        <HiOutlineCheck className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </motion.div>
                    )}
                    
                    {/* Hover arrow indicator - Responsive */}
                    {!network.isActive && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="flex-shrink-0 text-[#81D7B4] hidden sm:block"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

