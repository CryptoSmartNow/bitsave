'use client'

import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwitchChain, useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '@/utils/networkLogos';

// Helper function to ensure image URLs are properly formatted for Next.js Image
const ensureImageUrl = (url: string | undefined): string => {
  if (!url) return '/default-network.png'
  // If it's a relative path starting with /, it's fine
  if (url.startsWith('/')) return url
  // If it starts with // (protocol-relative), convert to https
  if (url.startsWith('//')) return `https:${url}`
  // If it doesn't start with http/https and doesn't start with /, add /
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `/${url}`
  }
  return url
}

const SUPPORTED_NETWORKS = [
  {
    id: 'base',
    name: 'Base',
    chainId: 8453,
    icon: '/base-logo.svg',
    fallbackIcon: '/base.svg',
    description: 'Low-cost Ethereum L2 by Coinbase',
    color: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'celo',
    name: 'Celo',
    chainId: 42220,
    icon: '/celo.png',
    description: 'Mobile-first blockchain platform',
    color: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'lisk',
    name: 'Lisk',
    chainId: 1135,
    icon: '/lisk-logo.svg',
    fallbackIcon: '/lisk-logo.png',
    description: 'Ethereum-compatible sidechain',
    color: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    id: 'hedera',
    name: 'Hedera Testnet',
    chainId: 296,
    icon: '/hedera-logo.svg',
    fallbackIcon: '/hedera-logo.png',
    description: 'High-performance hashgraph network',
    color: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    chainId: 43114,
    icon: '/avalanche-logo.svg', // Assuming you have this or similar
    fallbackIcon: '/avalanche.png',
    description: 'Scalable smart contracts dApp',
    color: 'bg-red-50',
    borderColor: 'border-red-200'
  }
];

interface UnsupportedWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UnsupportedNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UnsupportedNetworkModal = memo(function UnsupportedNetworkModal({ isOpen, onClose }: UnsupportedNetworkModalProps) {
  const { switchChain } = useSwitchChain();
  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});
  
  useEffect(() => {
    // Fetch dynamic logos for supported networks
    fetchMultipleNetworkLogos(['base', 'celo', 'lisk', 'avalanche', 'solana'])
      .then(setNetworkLogos)
      .catch(() => {});
  }, []);
  
  const handleSwitchNetwork = async (chainId: number) => {
    try {
      switchChain({ chainId });
      onClose();
    } catch (error) {
      console.error('Failed to switch network:', error);
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#81D7B4] to-[#66C4A3] rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unsupported Network</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You&apos;re connected to an unsupported network. Please switch to one of our supported networks to use BitSave.
                </p>
                
                {/* Supported Networks */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Switch to a supported network:</h4>
                  {SUPPORTED_NETWORKS.map((network) => (
                    <div
                      key={network.id}
                      className={`${network.color} ${network.borderColor} border rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all duration-200`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
                          <Image
                            src={ensureImageUrl(
                              networkLogos[network.id]?.logoUrl ||
                              networkLogos[network.id]?.fallbackUrl ||
                              network.icon
                            )}
                            alt={`${network.name} logo`}
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">{network.name}</h5>
                          <p className="text-sm text-gray-600">{network.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSwitchNetwork(network.chainId)}
                        className="bg-[#81D7B4] hover:bg-[#6bc4a0] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Switch
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

const CustomConnectButton = memo(function CustomConnectButton() {
  const [showUnsupportedNetworkModal, setShowUnsupportedNetworkModal] = useState(false);
  const { login, ready, authenticated, user, logout } = usePrivy();
  const { chain } = useAccount();

  // Check if chain is supported
  const supportedChainIds = SUPPORTED_NETWORKS.map(n => n.chainId);
  const isUnsupported = chain && !supportedChainIds.includes(chain.id);

  if (!ready) {
    return (
      <div className="h-12 w-36 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
    );
  }

  if (!authenticated) {
    return (
      <button
        onClick={() => login({ loginMethods: ['wallet'] })}
        type="button"
        className="group relative bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] hover:from-[#66C4A3] hover:to-[#81D7B4] text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
      >
        <span className="relative z-10 flex items-center justify-center space-x-2">
          <span>Connect Wallet</span>
        </span>
        
        {/* Animated background */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#66C4A3] to-[#81D7B4] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    );
  }

  if (isUnsupported) {
    return (
      <>
        <button
          onClick={() => setShowUnsupportedNetworkModal(true)}
          type="button"
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>Wrong Network</span>
        </button>
        <UnsupportedNetworkModal
          isOpen={showUnsupportedNetworkModal}
          onClose={() => setShowUnsupportedNetworkModal(false)}
        />
      </>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Network Indicator */}
      {chain && (
        <button
           onClick={() => setShowUnsupportedNetworkModal(true)}
           className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {/* We could add network icon here if we map chain.id to icon */}
          <span className="font-semibold text-gray-900 dark:text-white">{chain.name}</span>
        </button>
      )}

      {/* Account Button */}
      <button
        onClick={logout}
        className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl hover:shadow-md transition-all"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#81D7B4] to-[#66C4A3] flex items-center justify-center text-white text-xs font-bold">
            {/* Avatar or Icon */}
            {user?.wallet?.address?.slice(2, 4)}
        </div>
        <span className="font-semibold text-gray-700 dark:text-gray-200">
          {user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'Connected'}
        </span>
      </button>

      <UnsupportedNetworkModal
        isOpen={showUnsupportedNetworkModal}
        onClose={() => setShowUnsupportedNetworkModal(false)}
      />
    </div>
  );
});

export default CustomConnectButton;
