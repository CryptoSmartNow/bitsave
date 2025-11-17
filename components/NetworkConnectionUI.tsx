'use client'

import { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import ModernCard from '@/components/ui/ModernCard';
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
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    chainId: 43114,
    icon: '/eth.png',
    fallbackIcon: '/eth.png',
    description: 'High-performance EVM blockchain',
    color: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    id: 'solana',
    name: 'Solana',
    chainId: 0, // Placeholder - Solana uses different chain identification
    icon: '/solana.png',
    fallbackIcon: '/solana.png',
    description: 'High-Performance Blockchain (Coming Soon)',
    color: 'bg-gray-50',
    borderColor: 'border-gray-200',
    isComingSoon: true
  }
];



const NetworkInfo = memo(function NetworkInfo() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const currentNetwork = SUPPORTED_NETWORKS.find(network => network.chainId === chainId);
  const isUnsupportedNetwork = chainId && !currentNetwork;

  // Fetch dynamic network logos from CoinGecko (with fallbacks)
  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});
  useEffect(() => {
    fetchMultipleNetworkLogos(['base', 'celo', 'lisk', 'avalanche', 'solana'])
      .then(setNetworkLogos)
      .catch(() => {});
  }, []);

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
                      src={ensureImageUrl(
                        networkLogos[network.id]?.logoUrl ||
                        networkLogos[network.id]?.fallbackUrl ||
                        network.icon
                      )} 
                      alt={network.name} 
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-semibold ${network.isComingSoon ? 'text-gray-500' : 'text-gray-900'}`}>{network.name}</h4>
                      {isCurrentNetwork && (
                        <span className="px-2 py-1 bg-[#81D7B4] text-white text-xs font-medium rounded-full">
                          Connected
                        </span>
                      )}
                      {network.isComingSoon && (
                        <span className="px-2 py-1 bg-gray-400 text-white text-xs font-medium rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${network.isComingSoon ? 'text-gray-400' : 'text-gray-600'}`}>{network.description}</p>
                  </div>
                </div>
                {!isCurrentNetwork && chainId && (
                  <div className="flex items-center space-x-2">
                    {network.isComingSoon ? (
                      <span className="px-3 py-1.5 bg-gray-200 text-gray-500 text-sm font-medium rounded-lg">
                        Coming Soon
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSwitchNetwork(network.chainId)}
                        className="px-3 py-1.5 bg-[#81D7B4] hover:bg-[#6bc4a0] text-white text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        Switch
                      </button>
                    )}
                  </div>
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
      <div className={`relative w-full ${className}`}>
        <div className="mx-auto max-w-3xl">
          <ModernCard
            title="Connect your wallet"
            subtitle="Start automated savings across Base, Celo, and Lisk."
            imageSrc="/bitsave-dashboard.svg"
            imageAlt="BitSave"
            align="center"
            badges={["Secure", "Fast", "Multi-chain"]}
            toneFrom="#81D7B4"
            toneTo="#66C4A3"
            ringColors={{ c1: '#81D7B4', c2: '#66C4A3' }}
            className="bg-[#f7f7f7]"
          />
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="inline-flex items-center justify-center rounded-md px-6 py-3 bg-[#2D5A4A] text-white hover:bg-[#264c3f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#81D7B4] transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="inline-flex items-center justify-center rounded-md px-6 py-3 border border-gray-300 text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#81D7B4] transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How to connect
                </button>
              )}
            </ConnectButton.Custom>
          </div>
          {showNetworkInfo && (
            <div className="mt-6">
              <NetworkInfo />
            </div>
          )}
        </div>
      </div>

      
    </>
  );
});

export default NetworkConnectionUI;