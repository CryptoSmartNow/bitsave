'use client'

import { useState } from 'react';
import { useSavingsData } from '../hooks/useSavingsData';
import { useAccount } from 'wagmi';

interface NetworkDetectionProps {
  className?: string;
}

export default function NetworkDetection({ className = '' }: NetworkDetectionProps) {
  const [switchingNetwork, setSwitchingNetwork] = useState(false);
  const { isCorrectNetwork } = useSavingsData();
  const { address } = useAccount();

  // Function to switch to a specific network
  const switchToNetwork = async (networkName: string) => {
    if (!window.ethereum) {
      alert('Please install MetaMask to switch networks');
      return;
    }

    setSwitchingNetwork(true);
    try {
      // First try to switch to the network
      const chainId = networkName === 'Base' ? '0x2105' : networkName === 'Celo' ? '0xA4EC' : '0x46F';
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error: unknown) {
      // If the network is not added to the wallet, add it
      if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 4902) {
        try {
          if (networkName === 'Base') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x2105', // Base chainId in hex
                  chainName: 'Base',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://mainnet.base.org'],
                  blockExplorerUrls: ['https://basescan.org'],
                },
              ],
            });
          } else if (networkName === 'Celo') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0xA4EC', // Celo chainId in hex
                  chainName: 'Celo',
                  nativeCurrency: {
                    name: 'CELO',
                    symbol: 'CELO',
                    decimals: 18,
                  },
                  rpcUrls: ['https://forno.celo.org'],
                  blockExplorerUrls: ['https://explorer.celo.org'],
                },
              ],
            });
          } else if (networkName === 'Lisk') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x46F', // Lisk chainId in hex
                  chainName: 'Lisk',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://rpc.api.lisk.com'],
                  blockExplorerUrls: ['https://blockscout.lisk.com'],
                },
              ],
            });
          }

          // Attempt to switch to the newly added network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: networkName === 'Base' ? '0x2105' : networkName === 'Celo' ? '0xA4EC' : '0x46F' }],
          });
        } catch (addError) {
          console.error(`Error adding ${networkName} network:`, addError);
        }
      } else {
        console.error(`Error switching to ${networkName} network:`, error);
      }
    } finally {
      setSwitchingNetwork(false);
    }
  };

  // Don't render if user is not connected or on correct network
  if (!address || isCorrectNetwork) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-200 z-50 p-3 flex items-center justify-center ${className}`}>
      <div className="flex items-center max-w-4xl mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="text-yellow-800 text-sm">Please switch to Base, Celo, or Lisk network to use BitSave</span>
        <div className="ml-4 flex space-x-2">
          <button
            onClick={() => switchToNetwork('Base')}
            disabled={switchingNetwork}
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium py-1 px-3 rounded-full transition-colors disabled:opacity-70"
          >
            {switchingNetwork ? 'Switching...' : 'Switch to Base'}
          </button>
          <button
            onClick={() => switchToNetwork('Celo')}
            disabled={switchingNetwork}
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium py-1 px-3 rounded-full transition-colors disabled:opacity-70"
          >
            {switchingNetwork ? 'Switching...' : 'Switch to Celo'}
          </button>
          <button
            onClick={() => switchToNetwork('Lisk')}
            disabled={switchingNetwork}
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium py-1 px-3 rounded-full transition-colors disabled:opacity-70"
          >
            {switchingNetwork ? 'Switching...' : 'Switch to Lisk'}
          </button>
        </div>
      </div>
    </div>
  );
}