'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import { HiOutlineArrowRightOnRectangle, HiOutlineWallet } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function CustomConnectButton() {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const { isConnected: isWagmiConnected, address: wagmiAddress } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  // We use local state to ensure hydration match
  const [mounted, setMounted] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset disconnecting state when both auth states are cleared
  useEffect(() => {
    if (!authenticated && !isWagmiConnected) {
      setIsDisconnecting(false);
    }
  }, [authenticated, isWagmiConnected]);

  if (!mounted) return null;

  // Use Privy's authenticated state as primary indicator
  // Only show as connected if Privy is authenticated AND not in disconnecting state
  const isConnected = ready && authenticated && !isDisconnecting;

  // Determine display address
  const address = user?.wallet?.address || wagmiAddress;
  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : user?.email?.address || "Connected";

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    const toastId = toast.loading('Disconnecting wallet...');
    try {
      // Disconnect Wagmi first
      if (isWagmiConnected) {
        wagmiDisconnect();
      }

      // Then logout from Privy to ensure auth state is cleared
      await logout();

      toast.success('Wallet disconnected successfully', { id: toastId });
      // State update will be handled by the effects
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect wallet', { id: toastId });
      setIsDisconnecting(false);
    }
  };

  if (isConnected) {
    return (
      <div className="flex justify-end">
        <button
          onClick={handleDisconnect}
          className="group bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] hover:from-red-500 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
          title="Click to disconnect"
        >
          <div className="w-2 h-2 rounded-full bg-white animate-pulse group-hover:hidden"></div>
          <HiOutlineArrowRightOnRectangle className="w-5 h-5 hidden group-hover:block" />
          <span className="font-mono group-hover:hidden">{displayAddress}</span>
          <span className="hidden group-hover:inline font-medium">Disconnect</span>
        </button>
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
        <HiOutlineWallet className="w-5 h-5" />
        <span>Connect Wallet</span>
      </button>
    </div>
  );
}
