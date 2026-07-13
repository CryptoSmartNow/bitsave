'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Certificate01Icon, Activity01Icon, LinkSquare01Icon, Download01Icon, Cancel01Icon, Search01Icon } from "hugeicons-react";
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
      <div className="flex flex-col items-center justify-center h-full px-4 text-center py-32">
        <div className="w-24 h-24 rounded-full bg-[#1C2538]/30 flex items-center justify-center mb-6 border border-[#2C3E5D]/30 relative">
          <div className="absolute inset-0 bg-[#81D7B4]/10 rounded-full blur-xl"></div>
          <Certificate01Icon className="w-10 h-10 text-[#4B5A75] relative z-10" />
        </div>
        <h2 className="text-3xl font-black text-[#F9F9FB] mb-3 tracking-tight">Wallet Not Connected</h2>
        <p className="text-[#7B8B9A] mb-8 max-w-md text-lg">Please connect your Solana wallet to view your digital certificates.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full max-w-[1600px] mx-auto space-y-8 min-w-0 pb-24 relative">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-[#81D7B4]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 -translate-x-1/3 z-0"></div>

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#81D7B4]/10 border border-[#81D7B4]/20 rounded-full mb-4 shadow-[0_0_15px_rgba(129,215,180,0.15)]">
            <Certificate01Icon className="w-4 h-4 text-[#81D7B4]" />
            <span className="text-[10px] font-bold text-[#81D7B4] uppercase tracking-widest">Digital Assets</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#F9F9FB] tracking-tight">My Certificates</h1>
          <p className="text-base text-[#7B8B9A] mt-2 max-w-md">Cryptographically verifiable, on-chain proof of your real-world asset investments.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="bg-gradient-to-br from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-2xl relative overflow-hidden group w-full lg:w-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/0 via-[#81D7B4]/5 to-[#81D7B4]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div>
              <p className="text-[10px] text-[#7B8B9A] font-bold uppercase tracking-widest mb-1">Total Certificates</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black text-[#F9F9FB]">{holdings.length}</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-[#1C2538]"></div>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-[10px] text-[#7B8B9A] font-bold uppercase tracking-widest mb-0.5">Total Value Locked</p>
                <p className="text-sm font-bold text-[#81D7B4]">
                  ${holdings.reduce((acc, h) => acc + h.investmentAmount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 pt-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {[1,2,3,4].map(i => (
               <div key={i} className="aspect-[3/2] bg-[#0A0F17] border border-[#1C2538] rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : holdings.length === 0 ? (
          <div className="bg-gradient-to-b from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-3xl p-16 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-[#1C2538]/30 flex items-center justify-center mx-auto mb-6 border border-[#2C3E5D]/30 relative">
              <div className="absolute inset-0 bg-[#81D7B4]/10 rounded-full blur-xl"></div>
              <Certificate01Icon className="w-8 h-8 text-[#4B5A75] relative z-10" />
            </div>
            <h3 className="text-xl font-black text-[#F9F9FB] mb-2">No Certificates Found</h3>
            <p className="text-[#7B8B9A] max-w-sm mx-auto">Purchase an instrument to mint your first RWA certificate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {holdings.map((h) => (
              <div 
                key={h._id} 
                onClick={() => setSelectedCert(h)}
                className="group relative w-full aspect-[3/2] rounded-2xl overflow-hidden cursor-pointer bg-[#0A0F17] border border-[#1C2538] hover:border-[#81D7B4]/50 transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(129,215,180,0.1)] flex justify-center items-center"
              >
                {/* Glare effect */}
                <div className="absolute inset-0 z-30 bg-gradient-to-tr from-white/0 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none transform -translate-x-full group-hover:translate-x-full ease-in-out"></div>
                
                {/* Certificate Scaling container */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] flex-shrink-0 pointer-events-none scale-[0.25] sm:scale-[0.28] md:scale-[0.30] lg:scale-[0.26] xl:scale-[0.30] transition-transform duration-300 group-hover:scale-[0.26] sm:group-hover:scale-[0.29] md:group-hover:scale-[0.31] lg:group-hover:scale-[0.27] xl:group-hover:scale-[0.31]">
                  <CertificateCard holding={{ ...h, wallet: walletAddress }} />
                </div>
                
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#05080C]/90 via-[#05080C]/20 to-transparent pointer-events-none" />
                
                {/* Badge Overlay */}
                <div className="absolute top-4 left-4 z-20">
                   <span className={`px-3 py-1.5 text-[9px] font-black rounded-md uppercase tracking-widest backdrop-blur-md border ${h.status.includes('Active') ? 'bg-[#059669]/80 text-white border-[#059669]/50 shadow-[0_0_15px_rgba(5,150,105,0.5)]' : 'bg-[#3B82F6]/80 text-white border-[#3B82F6]/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]'}`}>
                     {h.status.split('—')[0]}
                   </span>
                </div>

                {/* Footer Overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end opacity-90 group-hover:opacity-100 transition-opacity">
                  <div>
                    <p className="text-[10px] font-bold text-[#81D7B4] uppercase tracking-widest drop-shadow-md">View Certificate</p>
                    <p className="text-xs font-bold text-white drop-shadow-md">${h.investmentAmount.toLocaleString()}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                    <Search01Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

            <div ref={certificateRef} className="bg-[#0F1825] rounded-xl shadow-[0_0_50px_rgba(129,215,180,0.1)] border border-[#1C2538]/50">
              <CertificateCard holding={{ ...selectedCert, wallet: walletAddress }} />
            </div>

            {/* Action Buttons */}
            <div id="cert-action-btns" className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={downloadCertificate}
                className="w-full sm:w-auto text-sm font-bold text-[#0F1825] bg-gradient-to-r from-[#81D7B4] to-[#6BC4A0] hover:brightness-110 transition-all px-8 py-4 rounded-xl shadow-[0_4px_20px_rgba(129,215,180,0.2)] flex items-center justify-center gap-2"
              >
                <Download01Icon className="w-5 h-5" />
                Download Certificate
              </button>
              <a 
                href={`https://explorer.solana.com/address/${selectedCert.mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto text-sm font-bold text-[#F9F9FB] bg-[#0A0F17] hover:bg-[#1C2538] transition-colors border border-[#2C3E5D] px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg"
              >
                Verify on Explorer
                <LinkSquare01Icon className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
