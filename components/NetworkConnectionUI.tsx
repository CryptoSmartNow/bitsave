'use client'

import { memo } from 'react';
import ModernCard from '@/components/ui/ModernCard';
import {
  ConnectWallet,
  Wallet,
} from '@coinbase/onchainkit/wallet';

interface NetworkConnectionUIProps {
  onDisconnect?: () => void;
  showNetworkInfo?: boolean;
  className?: string;
}

const NetworkConnectionUI = memo(function NetworkConnectionUI({
  onDisconnect,
  showNetworkInfo,
  className
}: NetworkConnectionUIProps) {
  return (
    <div className={`w-full max-w-4xl mx-auto px-4 ${className || ''}`}>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 border border-gray-100">
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
          <Wallet>
            <ConnectWallet className="inline-flex items-center justify-center rounded-md px-6 py-3 bg-[#2D5A4A] text-white hover:bg-[#264c3f] transition-colors">
              Connect Wallet
            </ConnectWallet>
          </Wallet>

          {/* "How to connect" button could link to docs or show a modal, leaving it as a button for now */}
          <button
            className="inline-flex items-center justify-center rounded-md px-6 py-3 border border-gray-300 text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#81D7B4] transition-colors"
            onClick={() => window.open('https://www.coinbase.com/wallet', '_blank')}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to connect
          </button>
        </div>
      </div>
    </div>
  );
});

export default NetworkConnectionUI;
