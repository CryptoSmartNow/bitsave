'use client'

import { useState, memo } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwitchChain } from 'wagmi';

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
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackIcon?: string) => {
    if (fallbackIcon) {
      e.currentTarget.src = fallbackIcon;
    }
  };
  
  const handleSwitchNetwork = async (chainId: number) => {
    try {
      await switchChain({ chainId });
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
                          <img
                            src={network.icon}
                            alt={`${network.name} logo`}
                            className="w-8 h-8 object-contain"
                            onError={(e) => handleImageError(e, network.fallbackIcon)}
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

const UnsupportedWalletModal = memo(function UnsupportedWalletModal({ isOpen, onClose }: UnsupportedWalletModalProps) {
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#81D7B4] to-[#66C4A3] rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Wallet Not Supported</h3>
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
                  Your current wallet is not supported. BitSave works best with MetaMask for optimal security and functionality.
                </p>
                <div className="bg-gradient-to-r from-[#81D7B4]/10 to-[#66C4A3]/10 rounded-lg p-4 border border-[#81D7B4]/20">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Why MetaMask?</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Enhanced security features</li>
                    <li>• Better transaction handling</li>
                    <li>• Seamless DeFi integration</li>
                    <li>• Wide ecosystem support</li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors"
                >
                  Continue Anyway
                </button>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] hover:from-[#66C4A3] hover:to-[#81D7B4] text-white rounded-xl font-medium transition-all duration-300 text-center shadow-lg hover:shadow-xl"
                  onClick={onClose}
                >
                  Get MetaMask
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
})

const CustomConnectButton = memo(function CustomConnectButton() {
  const [showUnsupportedModal, setShowUnsupportedModal] = useState(false);
  const [showUnsupportedNetworkModal, setShowUnsupportedNetworkModal] = useState(false);

  return (
    <>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                'style': {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={() => {
                        // Check if user has an unsupported wallet
                        if (typeof window !== 'undefined' && window.ethereum) {
                          const isMetaMask = window.ethereum.isMetaMask;
                          const isCoinbaseWallet = window.ethereum.isCoinbaseWallet;
                          const isRabby = window.ethereum.isRabby;
                          const isTrust = window.ethereum.isTrust;
                          
                          // If it's not a supported wallet, show modal
                          if (!isMetaMask && !isCoinbaseWallet && !isRabby && !isTrust) {
                            setShowUnsupportedModal(true);
                            return;
                          }
                        }
                        
                        openConnectModal();
                      }}
                      type="button"
                      className="group relative bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] hover:from-[#66C4A3] hover:to-[#81D7B4] text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                      <span className="relative z-10 flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Connect Wallet</span>
                      </span>
                      
                      {/* Animated background */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#66C4A3] to-[#81D7B4] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={() => setShowUnsupportedNetworkModal(true)}
                      type="button"
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span>Switch Network</span>
                    </button>
                  );
                }

                return (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={openChainModal}
                      className="flex items-center space-x-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50"
                      type="button"
                    >
                      {chain.hasIcon && (
                        <div className="w-5 h-5 rounded-full overflow-hidden">
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              className="w-5 h-5"
                            />
                          )}
                        </div>
                      )}
                      <span className="text-sm">{chain.name}</span>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] hover:from-[#66C4A3] hover:to-[#81D7B4] text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>
                        {account.displayName}
                        {account.displayBalance
                          ? ` (${account.displayBalance})`
                          : ''}
                      </span>
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
      
      <UnsupportedWalletModal 
        isOpen={showUnsupportedModal} 
        onClose={() => setShowUnsupportedModal(false)} 
      />
      
      <UnsupportedNetworkModal 
        isOpen={showUnsupportedNetworkModal} 
        onClose={() => setShowUnsupportedNetworkModal(false)} 
      />
    </>
  );
})

export default CustomConnectButton;