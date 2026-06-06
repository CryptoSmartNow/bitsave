'use client';

import React, { useEffect, useState } from 'react';
import { Activity01Icon, LinkSquare01Icon } from "hugeicons-react";
import { useWallet } from '@solana/wallet-adapter-react';
import { usePrivy } from '@privy-io/react-auth';
import toast from 'react-hot-toast';
import { CertificateCard } from '@/components/CertificateCard';

interface Holding {
  _id: string;
  instrument: string;
  investmentAmount: number;
  status: string;
  mintAddress: string;
  serialNumber: string;
  purchaseDate: string;
  apr: string;
}

export default function CertificatesPage() {
  const { publicKey, connected: isSolanaConnected } = useWallet();
  const { ready, authenticated, user } = usePrivy();

  const connected = ready && (authenticated || isSolanaConnected);
  const privySolanaWallet = user?.linkedAccounts?.find(
    (account) => account.type === 'wallet' && account.chainType === 'solana'
  ) as { address: string } | undefined;
  
  const walletAddress = isSolanaConnected 
    ? publicKey?.toBase58() 
    : (privySolanaWallet?.address || user?.wallet?.address);

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (connected && walletAddress) {
      fetchHoldings(walletAddress);
    } else if (!connected && ready) {
      setHoldings([]);
      setLoading(false);
    }
  }, [connected, walletAddress, ready]);

  const fetchHoldings = async (wallet: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bizswap/holdings?wallet=${wallet}`);
      const data = await res.json();
      if (res.ok) {
        setHoldings(data.data);
      } else {
        toast.error('Failed to load certificates');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading certificates');
    } finally {
      setLoading(false);
    }
  };



  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <Activity01Icon className="w-16 h-16 text-[#2C3E5D] mb-6" />
        <h2 className="text-2xl font-black text-[#F9F9FB] mb-2">Wallet Not Connected</h2>
        <p className="text-[#7B8B9A] mb-8 max-w-sm">Please connect your Solana wallet to view your digital certificates.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-[1600px] mx-auto space-y-6 md:space-y-8 min-w-0">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#1C2538] pb-6">
        <div>
          <h1 className="text-2xl font-black text-[#F9F9FB]">My Certificates</h1>
          <p className="text-sm text-[#7B8B9A] mt-1">Digital, on-chain proof of your Real World Asset investments.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#7B8B9A]">Loading certificates...</div>
      ) : holdings.length === 0 ? (
        <div className="py-12 text-center text-[#7B8B9A]">You have no active certificates.</div>
      ) : (
        <div className="flex flex-col gap-12 items-center w-full">
          {holdings.map((h) => (
            <CertificateCard key={h._id} holding={h} />
          ))}
        </div>
      )}
    </div>
  );
}
