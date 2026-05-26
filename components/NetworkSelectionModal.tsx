import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { HiOutlineCheck, HiOutlineXMark, HiOutlineLink, HiOutlineExclamationTriangle } from 'react-icons/hi2';

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
  isEVMConnected?: boolean;
  isSolanaConnected?: boolean;
  disconnectEVM?: () => void;
  disconnectSolana?: () => void;
}

export default function NetworkSelectionModal({
  isOpen,
  onClose,
  networks,
  onSelectNetwork,
  isNetworkSwitching,
  isLoadingLogos = false,
  isEVMConnected = false,
  isSolanaConnected = false,
  disconnectEVM,
  disconnectSolana
}: NetworkSelectionModalProps) {
  const [blockPrompt, setBlockPrompt] = useState<{ type: 'evm' | 'solana', targetNetwork: Network } | null>(null);

  const handleClose = () => {
    setBlockPrompt(null);
    onClose();
  };

  const handleNetworkClick = async (network: Network) => {
    if (network.isActive || isNetworkSwitching || network.isComingSoon) return;

    const isTargetSolana = network.name === 'Solana';

    // Rigid UX check: Prevent mixing EVM and Solana connections
    if (isTargetSolana && isEVMConnected) {
      setBlockPrompt({ type: 'evm', targetNetwork: network });
      return;
    }
    if (!isTargetSolana && isSolanaConnected) {
      setBlockPrompt({ type: 'solana', targetNetwork: network });
      return;
    }

    await onSelectNetwork(network);
    handleClose();
  };

  const handleDisconnectAndProceed = async () => {
    if (!blockPrompt) return;
    
    try {
      if (blockPrompt.type === 'evm' && disconnectEVM) {
        await disconnectEVM();
      } else if (blockPrompt.type === 'solana' && disconnectSolana) {
        await disconnectSolana();
      }
      
      const targetNetwork = blockPrompt.targetNetwork;
      setBlockPrompt(null);
      
      // Proceed seamlessly to connect to the new network
      await onSelectNetwork(targetNetwork);
      handleClose();
    } catch (error) {
      console.error('Failed to disconnect:', error);
      setBlockPrompt(null);
    }
  };

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
        <div className="ds-modal-overlay" style={{ zIndex: 9999 }} onClick={handleClose}>
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

            <div className="relative pt-6 pb-4 px-4 sm:pt-8 sm:pb-6 sm:px-8 max-h-[85vh] sm:max-h-[90vh] flex flex-col z-10">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div className="flex gap-3 sm:gap-4 items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-[1rem] sm:rounded-2xl flex items-center justify-center shadow-[0_8px_16px_rgba(129,215,180,0.12)] border border-[#81D7B4]/20 text-[#81D7B4]">
                    <HiOutlineLink className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[20px] sm:text-[24px] font-black tracking-tight text-gray-900 leading-tight">Select Network</h2>
                    <p className="text-[13px] sm:text-[14px] font-medium text-gray-500 mt-0.5 sm:mt-1">Switch your active blockchain</p>
                  </div>
                </div>
                <button onClick={handleClose} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center shadow-sm border border-gray-100 text-gray-400 hover:text-gray-700 transition-colors" aria-label="Close modal">
                  <HiOutlineXMark className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Block Prompt or Network List */}
              {blockPrompt ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="bg-white border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)] rounded-[1.5rem] p-8 text-center"
                >
                  <div className="w-16 h-16 bg-[#F8FAF9] text-[#81D7B4] rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-gray-100">
                    <HiOutlineExclamationTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="text-gray-900 font-black text-[20px] mb-2 tracking-tight">Disconnect Required</h3>
                  <p className="text-gray-500 text-[14px] leading-relaxed mb-8 font-medium">
                    To switch to <span className="font-bold text-gray-900">{blockPrompt.targetNetwork.name}</span>, 
                    we need to safely disconnect your {blockPrompt.type === 'evm' ? 'EVM' : 'Solana'} wallet first.
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleDisconnectAndProceed}
                      className="w-full py-4 px-4 bg-[#81D7B4] hover:bg-[#6BC7A0] text-white rounded-[1.2rem] font-bold text-[15px] transition-all shadow-[0_4px_14px_rgba(129,215,180,0.3)] hover:shadow-[0_6px_20px_rgba(129,215,180,0.4)] hover:-translate-y-0.5"
                    >
                      Disconnect & Continue
                    </button>
                    <button 
                      onClick={() => setBlockPrompt(null)}
                      className="w-full py-4 px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200/60 rounded-[1.2rem] font-bold text-[15px] transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Modal Body */
                isNetworkSwitching ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col items-center justify-center py-12"
                  >
                    <div className="relative w-20 h-20 mb-6">
                      <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
                      <div className="absolute inset-0 border-4 border-[#81D7B4] rounded-full border-t-transparent animate-spin shadow-[0_0_15px_rgba(129,215,180,0.5)]" />
                      <div className="absolute inset-0 flex items-center justify-center text-[#81D7B4]">
                        <HiOutlineLink className="w-8 h-8" strokeWidth={2} />
                      </div>
                    </div>
                    <h3 className="text-[18px] font-black tracking-tight text-gray-900 mb-2">Connecting...</h3>
                    <p className="text-[14px] font-medium text-gray-500">Please confirm in your wallet...</p>
                  </motion.div>
                ) : (
                  <div className="overflow-y-auto flex-1 pb-2 custom-scrollbar pr-1 -mr-1">
                    {isLoadingLogos && (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-100 border-t-[#81D7B4] shadow-[0_0_15px_rgba(129,215,180,0.5)]" />
                        <p className="mt-4 text-sm font-medium text-gray-400">Loading networks...</p>
                      </div>
                    )}

                    {!isLoadingLogos && (
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 mt-2 sm:mt-3">
                        {networks.map((network) => (
                          <button
                            key={`${network.name}-${network.isActive}`}
                            onClick={() => handleNetworkClick(network)}
                            disabled={isNetworkSwitching || network.isActive || network.isComingSoon}
                            className={`group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-[1.25rem] transition-all duration-300 border-2 ${network.isActive
                                ? 'bg-[#F4FBF8] border-[#81D7B4] shadow-[0_8px_20px_rgba(129,215,180,0.2)] cursor-default'
                                : network.isComingSoon
                                  ? 'bg-gray-50/50 border-gray-100/50 opacity-60 cursor-not-allowed'
                                  : 'bg-white border-transparent hover:border-[#81D7B4]/40 hover:bg-[#F9FCFA] shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(129,215,180,0.15)] hover:-translate-y-1 cursor-pointer'
                              } ${isNetworkSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {/* Active Checkmark Badge */}
                            {network.isActive && (
                              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#81D7B4] flex items-center justify-center shadow-sm">
                                <HiOutlineCheck className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                              </div>
                            )}

                            {/* Network Icon */}
                            <div className={`relative rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-3 transition-transform duration-300 ${network.isActive ? 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]' : 'bg-[#F8FAF9] group-hover:scale-105 group-hover:bg-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]'}`}>
                              <Image
                                src={ensureImageUrl(network.icon)}
                                alt={network.name}
                                width={40}
                                height={40}
                                priority={true}
                                unoptimized={true}
                                className="object-contain w-8 h-8 sm:w-10 sm:h-10"
                              />
                            </div>

                            {/* Network Info */}
                            <div className="text-center w-full">
                              <div className="flex items-center justify-center gap-1.5 mb-1">
                                <span className={`font-black text-[14px] sm:text-[16px] tracking-tight truncate ${network.isActive ? 'text-[#1D3B31]' : 'text-gray-900 group-hover:text-[#1D3B31]'}`}>
                                  {network.name}
                                </span>
                                {network.isComingSoon && (
                                  <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 bg-gray-200/60 px-1.5 py-0.5 rounded-md uppercase tracking-wide">Soon</span>
                                )}
                              </div>
                              <p className={`text-[11px] sm:text-[12px] font-medium leading-relaxed truncate px-1 ${network.isActive ? 'text-[#81D7B4]' : 'text-gray-400 group-hover:text-gray-500'}`}>
                                {network.desc}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
