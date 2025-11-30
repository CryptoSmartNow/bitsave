'use client'

import { useState } from 'react';
import { useSavingsData } from '../hooks/useSavingsData';
import { useAccount } from 'wagmi';
import { useNetworkSync } from '../hooks/useNetworkSync';

interface NetworkDetectionProps {
  className?: string;
}

export default function NetworkDetection({ className = '' }: NetworkDetectionProps) {
  const [switchingNetwork, setSwitchingNetwork] = useState(false);
  const { isCorrectNetwork } = useSavingsData();
  const { address } = useAccount();
  const { switchToNetwork, isNetworkSwitching } = useNetworkSync();

  // Function to switch to a specific network using the proper hook
  const handleSwitchToNetwork = async (networkName: string) => {
    setSwitchingNetwork(true);
    try {
      const success = await switchToNetwork(networkName);
      if (!success) {
        // The hook already shows appropriate error notifications
        console.log(`Network switch to ${networkName} failed or was cancelled`);
      }
    } catch (error) {
      console.error(`Unexpected error switching to ${networkName}:`, error);
    } finally {
      setSwitchingNetwork(false);
    }
  };

  // Don't render if user is not connected or on correct network
  if (!address || isCorrectNetwork) {
    return null;
  }

  const isLoading = switchingNetwork || isNetworkSwitching;

  return (
    <div className={`fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-200 z-50 p-3 flex items-center justify-center ${className}`}>
      <div className="flex items-center max-w-5xl mx-auto flex-wrap justify-center gap-2">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-yellow-800 text-sm mr-2">Please switch to a supported network:</span>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => handleSwitchToNetwork('Base')}
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium py-1 px-3 rounded-full transition-colors disabled:opacity-70"
          >
            Base
          </button>
          <button
            onClick={() => handleSwitchToNetwork('Celo')}
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium py-1 px-3 rounded-full transition-colors disabled:opacity-70"
          >
            Celo
          </button>
          <button
            onClick={() => handleSwitchToNetwork('Lisk')}
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium py-1 px-3 rounded-full transition-colors disabled:opacity-70"
          >
            Lisk
          </button>
          <button
            onClick={() => handleSwitchToNetwork('Avalanche')}
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium py-1 px-3 rounded-full transition-colors disabled:opacity-70"
          >
            Avalanche
          </button>
          {/* Hedera support might need specific wallet handling, keeping it optional/hidden if not fully tested with standard switch */}
        </div>
      </div>
    </div>
  );
}