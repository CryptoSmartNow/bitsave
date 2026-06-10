'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Activity01Icon, LinkSquare01Icon, Download01Icon, Cancel01Icon } from "hugeicons-react";
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
  const [selectedCert, setSelectedCert] = useState<Holding | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

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

  const downloadCertificate = async () => {
    if (!certificateRef.current || !selectedCert) return;
    
    try {
      const toastId = toast.loading('Generating certificate image...', { id: 'download-cert' });
      
      const closeBtn = document.getElementById('cert-close-btn');
      const actionBtns = document.getElementById('cert-action-btns');
      if (closeBtn) closeBtn.style.display = 'none';
      if (actionBtns) actionBtns.style.display = 'none';

      const htmlToImage = await import('html-to-image');
      const dataUrl = await htmlToImage.toPng(certificateRef.current, {
        backgroundColor: '#0F1825',
        pixelRatio: 2,
        style: {
          margin: '0',
        }
      });
      
      if (closeBtn) closeBtn.style.display = 'block';
      if (actionBtns) actionBtns.style.display = 'flex';

      const link = document.createElement('a');
      link.download = `BizMarket-Certificate-${selectedCert.serialNumber || '001'}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success('Certificate downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to download certificate', { id: 'download-cert' });
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {holdings.map((h) => (
            <div 
              key={h._id} 
              onClick={() => setSelectedCert(h)}
              className="relative w-full aspect-[3/2] rounded-xl overflow-hidden cursor-pointer group border border-[#1C2538] bg-[#0A0D10] flex justify-center items-center hover:border-[#81D7B4]/50 transition-colors"
            >
              {/* Magic scaling container to fit the massive 1100px CertificateCard nicely into a responsive card */}
              <div className="absolute w-[1100px] origin-center pointer-events-none scale-[0.25] sm:scale-[0.30] md:scale-[0.28] lg:scale-[0.24] xl:scale-[0.28]">
                <CertificateCard holding={{ ...h, wallet: walletAddress }} />
              </div>
              <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-white/5 transition-colors" />
              
              {/* Badge Overlay */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                 <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${h.status.includes('Active') ? 'bg-[#059669]/90 text-white shadow-lg' : 'bg-[#3B82F6]/90 text-white shadow-lg'}`}>
                   {h.status.split('—')[0]}
                 </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CERTIFICATE MODAL */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto" onClick={() => setSelectedCert(null)}>
          <div 
            className="relative w-full max-w-[1100px] my-8 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              id="cert-close-btn"
              onClick={() => setSelectedCert(null)}
              className="absolute -top-4 -right-4 text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors z-50 bg-[#1A2538] p-2 rounded-full border border-[#2C3E5D] shadow-lg"
            >
              <Cancel01Icon className="w-5 h-5" />
            </button>

            <div ref={certificateRef} className="bg-[#0F1825] rounded-xl">
              <CertificateCard holding={{ ...selectedCert, wallet: walletAddress }} />
            </div>

            {/* Action Buttons */}
            <div id="cert-action-btns" className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={downloadCertificate}
                className="text-xs font-bold text-[#0F1825] bg-[#81D7B4] hover:bg-[#6BC4A0] transition-colors px-6 py-2.5 rounded-full shadow-lg flex items-center gap-2"
              >
                <Download01Icon className="w-4 h-4" />
                Download Certificate
              </button>
              <a 
                href={`https://explorer.solana.com/address/${selectedCert.mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#81D7B4] hover:text-[#0F1825] transition-colors border border-[#81D7B4]/50 px-6 py-2.5 rounded-full hover:bg-[#81D7B4] inline-block shadow-lg bg-[#0F1825]"
              >
                Verify on Solana Explorer →
              </a>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
