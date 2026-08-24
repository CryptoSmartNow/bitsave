'use client';

import { Logout01Icon, Wallet01Icon } from "hugeicons-react";
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function CustomConnectButton() {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const { isConnected: isWagmiConnected, address: wagmiAddress } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const [mounted, setMounted] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset disconnecting state when auth states are cleared
  useEffect(() => {
    if (!authenticated && !isWagmiConnected) {
      setIsDisconnecting(false);
    }
  }, [authenticated, isWagmiConnected]);

  if (!mounted) return null;

  const isConnected = ready && (authenticated || isWagmiConnected) && !isDisconnecting;
  const address = user?.wallet?.address || wagmiAddress;
  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : user?.email?.address || "Connected";

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    const toastId = toast.loading('Disconnecting wallet...');
    try {
      if (isWagmiConnected) {
        wagmiDisconnect();
      }
      await logout();
      toast.success('Wallet disconnected successfully', { id: toastId });
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
          <span className="font-mono font-medium tracking-wide text-gray-700 dark:text-gray-300">{displayAddress}</span>
        </div>

        <button
          onClick={handleDisconnect}
          className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors font-medium text-sm p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
          title="Disconnect Wallet"
        >
          <Logout01Icon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => login()}
      className="w-full justify-center bg-gradient-to-r from-[#81D7B4] via-[#74CEAB] to-[#5DBF99] hover:from-[#74CEAB] hover:to-[#50B28C] text-white font-extrabold py-4 px-6 rounded-2xl transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(129,215,180,0.4)] hover:shadow-[0_14px_30px_-5px_rgba(129,215,180,0.5)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 flex items-center gap-2.5 cursor-pointer text-[15px]"
    >
      <Wallet01Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
      <span>Connect Wallet</span>
    </button>
  );
}
