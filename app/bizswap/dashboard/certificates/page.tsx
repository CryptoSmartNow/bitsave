'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineCurrencyDollar,
  HiOutlineShieldCheck,
  HiOutlineArrowTopRightOnSquare
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

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
  const { publicKey, connected } = useWallet();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (connected && publicKey) {
      fetchHoldings(publicKey.toBase58());
    } else {
      setHoldings([]);
      setLoading(false);
    }
  }, [connected, publicKey]);

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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getInstrumentIcon = (name: string) => {
    switch(name) {
      case 'BizYield': return <HiOutlineChartBar className="w-8 h-8 text-[#FF6B6B]" />;
      case 'BizCredit': return <HiOutlineCurrencyDollar className="w-8 h-8 text-[#3B82F6]" />;
      case 'BizBond': return <HiOutlineShieldCheck className="w-8 h-8 text-[#81D7B4]" />;
      default: return <HiOutlineDocumentText className="w-8 h-8 text-[#7B8B9A]" />;
    }
  };

  const getInstrumentColorClass = (name: string, type: 'gradientFrom' | 'border' | 'text' | 'bg') => {
    switch(name) {
      case 'BizYield': return type === 'gradientFrom' ? 'from-[#FF6B6B]/10' : type === 'border' ? 'border-[#FF6B6B]/30' : type === 'text' ? 'text-[#FF6B6B]' : 'bg-[#FF6B6B]/10';
      case 'BizCredit': return type === 'gradientFrom' ? 'from-[#3B82F6]/10' : type === 'border' ? 'border-[#3B82F6]/30' : type === 'text' ? 'text-[#3B82F6]' : 'bg-[#3B82F6]/10';
      case 'BizBond': return type === 'gradientFrom' ? 'from-[#81D7B4]/10' : type === 'border' ? 'border-[#81D7B4]/30' : type === 'text' ? 'text-[#81D7B4]' : 'bg-[#81D7B4]/10';
      default: return type === 'gradientFrom' ? 'from-gray-800/10' : type === 'border' ? 'border-gray-700' : type === 'text' ? 'text-gray-400' : 'bg-gray-800/10';
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <HiOutlineDocumentText className="w-16 h-16 text-[#2C3E5D] mb-6" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {holdings.map((h) => (
            <div key={h._id} className={`group bg-[#121A27] rounded-3xl border ${getInstrumentColorClass(h.instrument, 'border')} relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl cursor-pointer`}>
              
              {/* Card Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getInstrumentColorClass(h.instrument, 'gradientFrom')} to-transparent opacity-50`} />
              
              {/* Card Content */}
              <div className="relative p-8 flex flex-col h-full">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className={`text-xl font-black ${getInstrumentColorClass(h.instrument, 'text')}`}>{h.instrument}</h3>
                    <p className="text-xs text-[#F9F9FB] font-bold mt-1 tracking-widest uppercase">
                      {h.instrument === 'BizYield' ? 'Revenue Share' : h.instrument === 'BizCredit' ? 'Private Credit' : 'Treasury Bond'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-2xl ${getInstrumentColorClass(h.instrument, 'bg')}`}>
                    {getInstrumentIcon(h.instrument)}
                  </div>
                </div>

                {/* Main Value */}
                <div className="mb-8">
                  <p className="text-xs text-[#7B8B9A] uppercase tracking-wider font-bold mb-1">Face Value</p>
                  <p className="text-4xl font-black text-[#F9F9FB]">${h.investmentAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                  <div>
                    <p className="text-[#7B8B9A] text-xs uppercase tracking-wider mb-1">Issue Date</p>
                    <p className="font-bold text-[#F9F9FB]">{formatDate(h.purchaseDate)}</p>
                  </div>
                  <div>
                    <p className="text-[#7B8B9A] text-xs uppercase tracking-wider mb-1">Yield Rate</p>
                    <p className="font-bold text-[#F9F9FB]">{h.apr}</p>
                  </div>
                </div>

                {/* Serial & Footer */}
                <div className="mt-auto pt-6 border-t border-[#1C2538] flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-[#4B5A75] uppercase tracking-widest mb-1">Certificate Serial</p>
                    <p className="font-mono text-xs text-[#7B8B9A]">#{h.serialNumber.substring(0, 12)}...</p>
                  </div>
                  <button className="w-10 h-10 rounded-xl bg-[#1C2538] flex items-center justify-center text-[#7B8B9A] hover:text-[#81D7B4] hover:bg-[#2C3E5D] transition-colors" title="View on Explorer">
                    <HiOutlineArrowTopRightOnSquare className="w-5 h-5" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
