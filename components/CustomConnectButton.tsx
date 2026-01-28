'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useDisconnect } from 'wagmi';
import { useEffect, useState, useRef } from 'react';
import { HiOutlineArrowRightOnRectangle, HiOutlineChevronDown, HiOutlineWallet } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function CustomConnectButton() {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const { isConnected: isWagmiConnected, address: wagmiAddress } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  
  // We use local state to ensure hydration match
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!mounted) return null;

  // Combined auth state
  const isConnected = ready && (authenticated || isWagmiConnected);
  
  // Determine display address
  const address = isWagmiConnected ? wagmiAddress : user?.wallet?.address;
  const displayAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : user?.email?.address || "Connected";

  const handleDisconnect = async () => {
    try {
      if (isWagmiConnected) {
        wagmiDisconnect();
      }
      await logout();
      setShowDropdown(false);
      toast.success('Wallet disconnected successfully');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  if (isConnected) {
    return (
      <div className="flex justify-end relative" ref={dropdownRef}>
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          <span className="font-mono">{displayAddress}</span>
          <HiOutlineChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-1">
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        )}
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
