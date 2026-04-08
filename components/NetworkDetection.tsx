'use client'

import { useState } from 'react';
import { useSavingsData } from '../hooks/useSavingsData';
import { useAccount } from 'wagmi';
import { useNetworkSync } from '../hooks/useNetworkSync';
import { useOptimizedDisconnect } from '../lib/useOptimizedDisconnect';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { HiOutlineLink, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '../utils/networkLogos';
import { useEffect } from 'react';

interface NetworkDetectionProps {
  className?: string;
}

export default function NetworkDetection({ className = '' }: NetworkDetectionProps) {
  const [switchingNetwork, setSwitchingNetwork] = useState(false);
  const { isCorrectNetwork } = useSavingsData();
  const { address } = useAccount();
  const { switchToNetwork, isNetworkSwitching } = useNetworkSync();
  const { disconnect, isDisconnecting } = useOptimizedDisconnect();
  
  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});
  const [isLoadingLogos, setIsLoadingLogos] = useState(true);

  useEffect(() => {
    const loadNetworkLogos = async () => {
        try {
            setIsLoadingLogos(true);
            const logos = await fetchMultipleNetworkLogos(['base', 'celo', 'lisk', 'avalanche', 'bsc']);
            setNetworkLogos(logos);
        } catch (error) {
            console.error('Error loading network logos:', error);
        } finally {
            setIsLoadingLogos(false);
        }
    };
    if (address && !isCorrectNetwork) {
      loadNetworkLogos();
    }
  }, [address, isCorrectNetwork]);

  const ensureImageUrl = (url: string | undefined): string => {
    if (!url) return '/default-network.png';
    if (url.startsWith('/')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `/${url}`;
    }
    return url;
  };

  const handleSwitchToNetwork = async (networkName: string) => {
    setSwitchingNetwork(true);
    try {
      const success = await switchToNetwork(networkName);
      if (!success) {
        console.log(`Network switch to ${networkName} failed or was cancelled`);
      }
    } catch (error) {
      console.error(`Unexpected error switching to ${networkName}:`, error);
    } finally {
      setSwitchingNetwork(false);
    }
  };

  if (!address || isCorrectNetwork) {
    return null;
  }

  const isLoading = switchingNetwork || isNetworkSwitching;

  const networks = [
    { name: 'Base', id: 'base', desc: 'Ethereum L2' },
    { name: 'Celo', id: 'celo', desc: 'Mobile-First' },
    { name: 'Lisk', id: 'lisk', desc: 'Ethereum L2' },
    { name: 'Binance Smart Chain', id: 'bsc', desc: 'EVM Mainnet' },
    { name: 'Avalanche', id: 'avalanche', desc: 'EVM Mainnet' },
  ];

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-gray-900/40 backdrop-blur-[6px] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] mx-4 relative bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.2)] overflow-hidden border border-gray-100/80"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top aesthetic accent layout */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-[#F8FAF9] pointer-events-none rounded-t-[2.5rem] border-b border-gray-100" />
          <div className="absolute -left-16 -top-16 w-64 h-64 bg-[#81D7B4]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative pt-8 pb-6 px-6 sm:px-8 max-h-[85vh] flex flex-col z-10">
            
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 mb-4 bg-white rounded-3xl flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 text-[#81D7B4]">
                <HiOutlineLink className="w-8 h-8 text-[#81D7B4]" />
              </div>
              <h2 className="text-[26px] font-black tracking-tight text-gray-900 mb-2.5 leading-tight">Unsupported Network</h2>
              <p className="text-[15px] text-gray-500 mt-1 max-w-[280px] font-medium leading-relaxed">
                Please switch to a supported chain below to continue using the platform.
              </p>
            </div>

            {/* Network List */}
            <div className="overflow-y-auto flex-1 space-y-3 pb-4 custom-scrollbar pr-1 -mr-1">
              {isLoadingLogos && (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-100 border-t-[#81D7B4]" />
                </div>
              )}
              {!isLoadingLogos && networks.map((network) => (
                <button
                  key={network.id}
                  onClick={() => handleSwitchToNetwork(network.name)}
                  disabled={isLoading}
                  className={`group w-full flex items-center justify-between p-4 rounded-[1.5rem] transition-all duration-300 bg-white border border-gray-100 hover:border-[#81D7B4] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(129,215,180,0.15)] hover:-translate-y-0.5 cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative rounded-2xl w-12 h-12 flex items-center justify-center flex-shrink-0 transition-transform duration-300 bg-[#F8FAF9] border border-gray-100 group-hover:scale-105 group-hover:bg-white group-hover:shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
                      <Image
                        src={ensureImageUrl(networkLogos[network.id]?.logoUrl || networkLogos[network.id]?.fallbackUrl || `/${network.id}.png`)}
                        alt={network.name}
                        width={28}
                        height={28}
                        className="object-contain w-7 h-7"
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-[16px] tracking-tight text-gray-900 group-hover:text-black">
                        {network.name}
                      </span>
                      <p className="text-[12px] font-medium leading-snug text-gray-400">{network.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Disconnect Wallet Button */}
            <div className="pt-2 border-t border-gray-100 mt-2">
              <button
                onClick={() => disconnect()}
                disabled={isDisconnecting || isLoading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 bg-gray-50 border border-gray-100 text-gray-600 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50 shadow-sm"
              >
                {isDisconnecting ? (
                  <svg className="animate-spin w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <HiOutlineArrowRightOnRectangle className="w-5 h-5 flex-shrink-0" />
                )}
                <span>Disconnect Wallet</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}