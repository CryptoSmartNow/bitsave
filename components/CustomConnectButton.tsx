'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

export default function CustomConnectButton() {
  const { login, ready, authenticated, user } = usePrivy();
  // We use local state to ensure hydration match, though ready/authenticated usually handle it.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (ready && authenticated) {
    const displayAddress = user?.wallet?.address 
      ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
      : user?.email?.address || "Connected";

    return (
      <div className="flex justify-end">
        <div className="bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] text-white font-semibold py-3 px-8 rounded-xl shadow-lg cursor-default flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          {displayAddress}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <button
        onClick={() => login({ loginMethods: ['wallet'] })}
        disabled={!ready}
        className="bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] hover:from-[#66C4A3] hover:to-[#81D7B4] text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <span>Connect Wallet</span>
      </button>
    </div>
  );
}
