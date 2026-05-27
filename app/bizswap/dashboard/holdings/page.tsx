'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  HiOutlineBriefcase, 
  HiOutlineChartBar, 
  HiOutlineShieldCheck, 
  HiOutlineCurrencyDollar,
  HiOutlineChevronDown
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

interface Holding {
  _id: string;
  instrument: string;
  investmentAmount: number;
  entitlement: string;
  status: string;
  nextPayment: string;
  mintAddress: string;
  serialNumber: string;
  apr: string;
  payoutFrequency: string;
  purchaseDate: string;
}

export default function HoldingsPage() {
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
        toast.error('Failed to load holdings');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading holdings');
    } finally {
      setLoading(false);
    }
  };

  const totalValue = holdings.reduce((sum, h) => sum + h.investmentAmount, 0);
  const byTotal = holdings.filter(h => h.instrument === 'BizYield').reduce((s, h) => s + h.investmentAmount, 0);
  const bcTotal = holdings.filter(h => h.instrument === 'BizCredit').reduce((s, h) => s + h.investmentAmount, 0);
  const bbTotal = holdings.filter(h => h.instrument === 'BizBond').reduce((s, h) => s + h.investmentAmount, 0);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInstrumentIcon = (name: string) => {
    switch(name) {
      case 'BizYield': return <HiOutlineChartBar className="w-5 h-5 text-[#FF6B6B]" />;
      case 'BizCredit': return <HiOutlineCurrencyDollar className="w-5 h-5 text-[#3B82F6]" />;
      case 'BizBond': return <HiOutlineShieldCheck className="w-5 h-5 text-[#81D7B4]" />;
      default: return <HiOutlineBriefcase className="w-5 h-5 text-[#7B8B9A]" />;
    }
  };

  const getInstrumentColorClass = (name: string, type: 'bg') => {
    switch(name) {
      case 'BizYield': return 'bg-[#FF6B6B]/10';
      case 'BizCredit': return 'bg-[#3B82F6]/10';
      case 'BizBond': return 'bg-[#81D7B4]/10';
      default: return 'bg-gray-800';
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <HiOutlineBriefcase className="w-16 h-16 text-[#2C3E5D] mb-6" />
        <h2 className="text-2xl font-black text-[#F9F9FB] mb-2">Wallet Not Connected</h2>
        <p className="text-[#7B8B9A] mb-8 max-w-sm">Please connect your Solana wallet to view your active holdings.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-[1600px] mx-auto space-y-6 md:space-y-8 min-w-0">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F9F9FB]">All Holdings</h1>
          <p className="text-sm text-[#7B8B9A] mt-1">Detailed view of your current investment portfolio.</p>
        </div>
        <div className="bg-[#121A27] border border-[#1C2538] rounded-xl px-4 py-2 flex items-center gap-4">
          <div>
            <p className="text-[10px] text-[#7B8B9A] font-bold uppercase tracking-widest">Total Value</p>
            <p className="text-lg font-black text-[#81D7B4]">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1A2538] border border-[#2C3E5D] p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center">
            <HiOutlineChartBar className="w-6 h-6 text-[#FF6B6B]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-1">BizYield</p>
            <h3 className="text-xl font-black text-[#F9F9FB]">
              ${byTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
              <span className="text-sm font-normal text-[#7B8B9A] ml-2">({Math.floor(byTotal / 10)} Shares)</span>
            </h3>
          </div>
        </div>
        <div className="bg-[#1A2538] border border-[#2C3E5D] p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center">
            <HiOutlineCurrencyDollar className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-1">BizCredit</p>
            <h3 className="text-xl font-black text-[#F9F9FB]">
              ${bcTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
              <span className="text-sm font-normal text-[#7B8B9A] ml-2">({Math.floor(bcTotal / 100)} Shares)</span>
            </h3>
          </div>
        </div>
        <div className="bg-[#1A2538] border border-[#2C3E5D] p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#81D7B4]/10 flex items-center justify-center">
            <HiOutlineShieldCheck className="w-6 h-6 text-[#81D7B4]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-1">BizBond</p>
            <h3 className="text-xl font-black text-[#F9F9FB]">
              ${bbTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
              <span className="text-sm font-normal text-[#7B8B9A] ml-2">({Math.floor(bbTotal / 1000)} Shares)</span>
            </h3>
          </div>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-[#121A27] border border-[#1C2538] rounded-2xl overflow-hidden min-w-0">
        <div className="p-5 border-b border-[#1C2538] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-bold text-sm tracking-wider uppercase text-[#F9F9FB]">Active Contracts</h3>
          <div className="flex gap-2">
            <button className="text-xs font-bold text-[#F9F9FB] hover:text-[#81D7B4] border border-[#1C2538] bg-[#0A0F17] px-3 py-1.5 rounded-lg transition-colors">
              Filter
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-[#7B8B9A]">Loading holdings...</div>
        ) : holdings.length === 0 ? (
          <div className="p-12 text-center text-[#7B8B9A]">No active holdings found in your portfolio.</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#0A0F17]">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold text-[#4B5A75] uppercase tracking-widest">Asset</th>
                  <th className="px-5 py-4 text-xs font-bold text-[#4B5A75] uppercase tracking-widest">Type / Return</th>
                  <th className="px-5 py-4 text-xs font-bold text-[#4B5A75] uppercase tracking-widest">Initial Investment</th>
                  <th className="px-5 py-4 text-xs font-bold text-[#4B5A75] uppercase tracking-widest">Purchase Date</th>
                  <th className="px-5 py-4 text-xs font-bold text-[#4B5A75] uppercase tracking-widest">Next Payout</th>
                  <th className="px-5 py-4 text-xs font-bold text-[#4B5A75] uppercase tracking-widest">Serial #</th>
                  <th className="px-5 py-4 text-xs font-bold text-[#4B5A75] uppercase tracking-widest">Status</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2538]">
                {holdings.map((h) => (
                  <tr key={h._id} className="hover:bg-[#1C2538]/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getInstrumentColorClass(h.instrument, 'bg')}`}>
                          {getInstrumentIcon(h.instrument)}
                        </div>
                        <div>
                          <p className="font-bold text-[#F9F9FB]">{h.instrument}</p>
                          <p className="text-xs text-[#7B8B9A]">{h.instrument === 'BizYield' ? 'Rev Share' : h.instrument === 'BizCredit' ? 'Private Credit' : 'Treasury'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#F9F9FB]">{h.apr}</p>
                      <p className="text-xs text-[#7B8B9A]">{h.payoutFrequency}</p>
                    </td>
                    <td className="px-5 py-4 font-bold text-[#F9F9FB]">
                      ${h.investmentAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-5 py-4 text-[#7B8B9A]">
                      {formatDate(h.purchaseDate)}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#F9F9FB]">{formatDate(h.nextPayment)}</p>
                      <p className="text-[10px] text-[#81D7B4] font-bold">~${(h.investmentAmount * 0.05).toFixed(2)} est.</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs text-[#4B5A75] bg-[#0A0F17] px-2 py-1 rounded inline-block">
                        #{h.serialNumber.substring(0, 8)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest ${h.status.includes('Active') ? 'bg-[#059669]/20 text-[#059669] border border-[#059669]/30' : 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30'}`}>
                        {h.status.split('—')[0]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button className="w-8 h-8 rounded-lg bg-[#1C2538] hover:bg-[#2C3E5D] flex items-center justify-center text-[#7B8B9A] transition-colors border border-[#2C3E5D]">
                        <HiOutlineChevronDown className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
