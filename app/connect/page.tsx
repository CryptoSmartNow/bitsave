'use client'

import { useEffect } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function ConnectPage() {
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    openConnectModal?.();
  }, [openConnectModal]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Fallback in case auto-open is blocked */}
      <div className="text-center space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">Connect your wallet</h1>
        <p className="text-sm text-gray-600">If the modal didn’t open, use the button below.</p>
        <div className="inline-block">
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}