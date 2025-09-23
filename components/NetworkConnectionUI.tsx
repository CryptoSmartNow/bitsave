'use client'

import { memo, useState } from 'react';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

interface NetworkConnectionUIProps {
  onDisconnect?: () => void;
  showNetworkInfo?: boolean;
  className?: string;
}



const SUPPORTED_NETWORKS = [
  {
    id: 'base',
    name: 'Base',
    chainId: 8453,
    icon: '/base.svg',
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
    icon: '/lisk-logo.png',
    fallbackIcon: '/lisk-logo.png',
    description: 'Ethereum-compatible sidechain',
    color: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
];



const NetworkInfo = memo(function NetworkInfo() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const currentNetwork = SUPPORTED_NETWORKS.find(network => network.chainId === chainId);
  const isUnsupportedNetwork = chainId && !currentNetwork;

  const handleSwitchNetwork = async (targetChainId: number) => {
    try {
      await switchChain({ chainId: targetChainId });
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  return (
    <div className="space-y-4">
      {isUnsupportedNetwork && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-1">Unsupported Network</h4>
              <p className="text-orange-700 text-sm mb-3">You&apos;re connected to an unsupported network. Please switch to one of our supported networks to use BitSave.</p>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_NETWORKS.map((network) => (
                  <button
                    key={network.id}
                    onClick={() => handleSwitchNetwork(network.chainId)}
                    className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    Switch to {network.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900">
        Supported Networks
      </h3>
      <div className="grid gap-3">
        {SUPPORTED_NETWORKS.map((network) => {
          const isCurrentNetwork = currentNetwork?.chainId === network.chainId;
          return (
            <div
              key={network.id}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                isCurrentNetwork 
                  ? `${network.color} ${network.borderColor || 'border-gray-200'} ring-2 ring-[#81D7B4] ring-opacity-50` 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full ${network.color} flex items-center justify-center border ${network.borderColor || 'border-gray-200'}`}>
                    <Image 
                      src={network.icon} 
                      alt={network.name} 
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{network.name}</h4>
                      {isCurrentNetwork && (
                        <span className="px-2 py-1 bg-[#81D7B4] text-white text-xs font-medium rounded-full">
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{network.description}</p>
                  </div>
                </div>
                {!isCurrentNetwork && chainId && (
                  <button
                    onClick={() => handleSwitchNetwork(network.chainId)}
                    className="px-3 py-1.5 bg-[#81D7B4] hover:bg-[#6bc4a0] text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    Switch
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const NetworkConnectionUI = memo(function NetworkConnectionUI({
  onDisconnect,
  showNetworkInfo = true,
  className = ''
}: NetworkConnectionUIProps) {
  const { isConnected, address } = useAccount();
  const [showStepsModal, setShowStepsModal] = useState(false);


  if (isConnected) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Wallet Connected</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
              </p>
            </div>
          </div>
          <button
            onClick={onDisconnect}
            className="px-4 py-2 text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 font-medium transition-colors"
          >
            Disconnect
          </button>
        </div>
        {showNetworkInfo && <NetworkInfo />}
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-3xl shadow-lg border border-gray-100 p-8 space-y-8 w-full ${className}`}>
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-[#81D7B4] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto text-lg leading-relaxed">
            Connect your wallet to access BitSave and start building your automated savings plans on Base, Celo, and Lisk networks.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="bg-[#81D7B4] hover:bg-[#6bc4a0] text-white font-semibold py-4 px-8 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <span className="flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Connect Wallet</span>
                </span>
              </button>
            )}
          </ConnectButton.Custom>
          <button
            onClick={() => setShowStepsModal(true)}
            className="border-2 border-[#81D7B4] text-[#81D7B4] hover:bg-[#81D7B4] hover:text-white font-semibold py-4 px-8 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span className="flex items-center justify-center space-x-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>How to Connect?</span>
            </span>
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              title: "Secure",
              description: "Your keys, your crypto. We never store your private keys."
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: "Fast",
              description: "Connect in seconds and start saving immediately."
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              ),
              title: "Multi-Chain",
              description: "Save on Base, Celo, and Lisk networks."
            }
          ].map((feature, index) => (
            <div key={index} className="bg-gray-50 border border-gray-100 rounded-2xl text-center p-6 group hover:scale-105 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-[#81D7B4] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-md group-hover:shadow-lg transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {showNetworkInfo && <NetworkInfo />}
      </div>

      {/* Steps Modal */}
      {showStepsModal && (
        <div className="fixed inset-0 bg-white bg-opacity-10 backdrop-blur-xl backdrop-saturate-150 flex items-center justify-center p-4 z-50 transition-all duration-300 ease-out">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white border-opacity-20 transform transition-all duration-300 ease-out scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">How to Connect Your Wallet</h2>
              <button
                onClick={() => setShowStepsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#81D7B4] text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Install a Wallet</h3>
                  <p className="text-gray-600">Download and install a compatible wallet like MetaMask, Rainbow, or Coinbase Wallet from their official websites or app stores.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#81D7B4] text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Create or Import Account</h3>
                  <p className="text-gray-600">Set up a new wallet account or import an existing one using your seed phrase. Make sure to securely store your recovery phrase.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#81D7B4] text-white rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Connect to BitSave</h3>
                  <p className="text-gray-600">Click the &ldquo;Connect Wallet&rdquo; button above and select your wallet from the list. Approve the connection request in your wallet.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#81D7B4] text-white rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Start Saving</h3>
                  <p className="text-gray-600">Once connected, you can start creating automated savings plans and earning rewards on supported networks.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Security Tip</h4>
                  <p className="text-blue-700 text-sm">Never share your private keys or seed phrase with anyone. BitSave will never ask for this information.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default NetworkConnectionUI;