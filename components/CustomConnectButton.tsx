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
      <div className="flex justify-end items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse shadow-[0_0_8px_rgba(129,215,180,0.5)]" />
          <span className="font-mono font-medium tracking-wide text-gray-300">{displayAddress}</span>
        </div>

        <button
          onClick={handleDisconnect}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors font-medium text-sm"
          title="Disconnect Wallet"
        >
          <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full">
      <button
        onClick={() => login({ loginMethods: ['wallet'] })}
        className="w-full justify-center bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] hover:from-[#66C4A3] hover:to-[#81D7B4] text-white font-semibold py-3.5 px-8 rounded-[1.25rem] transition-all duration-300 shadow-[0_8px_20px_rgba(129,215,180,0.25)] hover:shadow-[0_12px_25px_rgba(129,215,180,0.35)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 flex items-center gap-2"
      >
        <HiOutlineWallet className="w-5 h-5 flex-shrink-0" />
        <span className="text-[15px]">Connect Wallet</span>
      </button>
    </div>
  );
}
