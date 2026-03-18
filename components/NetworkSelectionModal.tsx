'use client'

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { HiOutlineCheck, HiOutlineXMark, HiOutlineLink } from 'react-icons/hi2';

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
        <div className="ds-modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[420px] mx-4 relative bg-white rounded-[2.5rem] shadow-[0_24px_50px_rgba(0,0,0,0.15)] overflow-hidden border border-gray-100/80"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top aesthetic accent layout */}
            <div className="absolute top-0 left-0 right-0 h-28 bg-[#F8FAF9] pointer-events-none rounded-t-[2.5rem] border-b border-gray-100" />
            <div className="absolute -left-16 -top-16 w-64 h-64 bg-[#81D7B4]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative pt-8 pb-6 px-6 sm:px-8 max-h-[85vh] flex flex-col z-10">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 text-[#2D5A4A]">
                    <HiOutlineLink className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-[22px] font-black tracking-tight text-gray-900 leading-tight">Select Network</h2>
                    <p className="text-[13px] font-medium text-gray-400 mt-0.5">Switch your active blockchain</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-9 h-9 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center shadow-sm border border-gray-100 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal">
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>

              {/* Network List */}
              <div className="overflow-y-auto flex-1 space-y-3 pb-2 custom-scrollbar pr-1 -mr-1">
                {isLoadingLogos && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-100 border-t-[#81D7B4] shadow-[0_0_15px_rgba(129,215,180,0.5)]" />
                    <span className="mt-4 text-sm font-semibold text-gray-500">Syncing networks...</span>
                  </div>
                )}
                {!isLoadingLogos && networks.map((network) => (
                  <button
                    key={`${network.name}-${network.isActive}`}
                    onClick={async () => {
                      if (!network.isActive && !isNetworkSwitching && !network.isComingSoon) {
                        await onSelectNetwork(network);
                        onClose();
                      }
                    }}
                    disabled={isNetworkSwitching || network.isActive || network.isComingSoon}
                    className={`group w-full flex items-center justify-between p-4 rounded-[1.5rem] transition-all duration-300 ${network.isActive
                        ? 'bg-[#F4FBF8] border border-[#81D7B4]/40 shadow-sm cursor-default'
                        : network.isComingSoon
                          ? 'bg-gray-50/50 border border-gray-100/50 opacity-60 cursor-not-allowed'
                          : 'bg-white border border-gray-100 hover:border-[#81D7B4] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(129,215,180,0.15)] hover:-translate-y-0.5 cursor-pointer'
                      } ${isNetworkSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Network Icon */}
                      <div className={`relative rounded-2xl w-14 h-14 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${network.isActive ? 'bg-white shadow-[0_4px_10px_rgba(0,0,0,0.05)] border border-[#81D7B4]/20' : 'bg-[#F8FAF9] border border-gray-100 group-hover:scale-105 group-hover:bg-white group-hover:shadow-[0_4px_10px_rgba(0,0,0,0.05)]'
                        }`}>
                        <Image
                          src={ensureImageUrl(network.icon)}
                          alt={network.name}
                          width={32}
                          height={32}
                          className="object-contain w-8 h-8"
                        />
                      </div>

                      {/* Network Info */}
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`font-bold text-[16px] tracking-tight ${network.isActive ? 'text-[#2D5A4A]' : 'text-gray-900 group-hover:text-black'}`}>
                            {network.name}
                          </span>
                          {network.isComingSoon && (
                            <span className="text-[9px] font-bold text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded-md uppercase tracking-wide">Soon</span>
                          )}
                        </div>
                        <p className={`text-[12px] font-medium leading-snug truncate max-w-[160px] sm:max-w-[200px] ${network.isActive ? 'text-[#3E7B65]' : 'text-gray-400'}`}>{network.desc}</p>
                      </div>
                    </div>

                    {/* Active check indicator */}
                    <div className="flex-shrink-0 ml-2">
                       {network.isActive ? (
                        <div className="w-7 h-7 rounded-full bg-[#81D7B4] flex items-center justify-center shadow-[0_0_10px_rgba(129,215,180,0.4)]">
                          <HiOutlineCheck className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                      ) : !network.isComingSoon && (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-[#81D7B4] transition-colors duration-300" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
