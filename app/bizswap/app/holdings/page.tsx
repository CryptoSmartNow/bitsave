'use client';

import React, { useEffect, useState } from 'react';
import { Activity01Icon, ChartAverageIcon, Shield01Icon, Dollar01Icon, ArrowDown01Icon, Briefcase01Icon, TextIcon, Search01Icon, FilterIcon } from "hugeicons-react";
import { useWallet } from '@solana/wallet-adapter-react';
import { usePrivy } from '@privy-io/react-auth';
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

  const getInstrumentIcon = (name: string, sizeClass = "w-5 h-5") => {
    let initials = 'BZ';
    let colorClass = 'text-[#7B8B9A]';
    if (name === 'BizYield') { initials = 'BY'; colorClass = 'text-[#FF6B6B]'; }
    if (name === 'BizCredit') { initials = 'BC'; colorClass = 'text-[#3B82F6]'; }
    if (name === 'BizBond') { initials = 'BB'; colorClass = 'text-[#81D7B4]'; }

    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${colorClass}`}>
        <path d="M12 2L20.6603 7V17L12 22L3.33975 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/>
        <text x="12" y="13.5" dominantBaseline="central" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">
          {initials}
        </text>
      </svg>
    );
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
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-[#1C2538]/50 flex items-center justify-center mb-6 border border-[#2C3E5D]">
          <Activity01Icon className="w-10 h-10 text-[#4B5A75]" />
        </div>
        <h2 className="text-3xl font-black text-[#F9F9FB] mb-3 tracking-tight">Wallet Not Connected</h2>
        <p className="text-[#7B8B9A] mb-8 max-w-sm text-lg">Please connect your Solana wallet to view your active holdings and portfolio analytics.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full max-w-[1600px] mx-auto space-y-8 min-w-0 pb-24 relative">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-[#81D7B4]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3 z-0"></div>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#81D7B4]/10 border border-[#81D7B4]/20 rounded-full mb-4">
            <Briefcase01Icon className="w-4 h-4 text-[#81D7B4]" />
            <span className="text-[10px] font-bold text-[#81D7B4] uppercase tracking-widest">Portfolio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#F9F9FB] tracking-tight">All Holdings</h1>
          <p className="text-base text-[#7B8B9A] mt-2 max-w-md">Detailed view of your current investment portfolio and asset distribution across BizSwap instruments.</p>
        </div>
        
        <div className="bg-gradient-to-br from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/0 via-[#81D7B4]/5 to-[#81D7B4]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div>
            <p className="text-[10px] text-[#7B8B9A] font-bold uppercase tracking-widest mb-1">Total Value Locked</p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-black text-[#81D7B4]">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              <span className="text-xs text-[#4B5A75] font-bold uppercase tracking-wider">USD</span>
            </div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-[#1C2538]"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#81D7B4]/10 flex items-center justify-center border border-[#81D7B4]/20">
              <ChartAverageIcon className="w-5 h-5 text-[#81D7B4]" />
            </div>
            <div>
              <p className="text-[10px] text-[#7B8B9A] font-bold uppercase tracking-widest mb-0.5">Assets</p>
              <p className="text-sm font-bold text-[#F9F9FB]">{holdings.length} Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="relative group bg-gradient-to-b from-[#121A27] to-[#0A0F17] backdrop-blur-xl border border-[#1C2538] p-6 rounded-3xl overflow-hidden transition-all hover:border-[#FF6B6B]/30 hover:shadow-[0_8px_32px_rgba(255,107,107,0.1)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B6B]/5 rounded-full blur-[40px] group-hover:bg-[#FF6B6B]/15 transition-colors duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B6B]/10 flex items-center justify-center border border-[#FF6B6B]/20 shadow-inner">
              {getInstrumentIcon('BizYield', 'w-6 h-6')}
            </div>
            <span className="px-3 py-1 rounded-full bg-[#1C2538] text-[10px] font-bold text-[#7B8B9A] uppercase tracking-widest border border-[#2C3E5D]">Revenue Share</span>
          </div>
          <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-2 relative z-10">BizYield Balance</p>
          <div className="flex items-baseline gap-2 relative z-10">
            <h3 className="text-2xl font-black text-[#F9F9FB] tracking-tight">
              ${byTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </h3>
            <span className="text-sm font-bold text-[#FF6B6B]">({Math.floor(byTotal / 10)} Shares)</span>
          </div>
        </div>

        <div className="relative group bg-gradient-to-b from-[#121A27] to-[#0A0F17] backdrop-blur-xl border border-[#1C2538] p-6 rounded-3xl overflow-hidden transition-all hover:border-[#3B82F6]/30 hover:shadow-[0_8px_32px_rgba(59,130,246,0.1)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/5 rounded-full blur-[40px] group-hover:bg-[#3B82F6]/15 transition-colors duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center border border-[#3B82F6]/20 shadow-inner">
              {getInstrumentIcon('BizCredit', 'w-6 h-6')}
            </div>
            <span className="px-3 py-1 rounded-full bg-[#1C2538] text-[10px] font-bold text-[#7B8B9A] uppercase tracking-widest border border-[#2C3E5D]">Private Credit</span>
          </div>
          <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-2 relative z-10">BizCredit Balance</p>
          <div className="flex items-baseline gap-2 relative z-10">
            <h3 className="text-2xl font-black text-[#F9F9FB] tracking-tight">
              ${bcTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </h3>
            <span className="text-sm font-bold text-[#3B82F6]">({Math.floor(bcTotal / 100)} Shares)</span>
          </div>
        </div>

        <div className="relative group bg-gradient-to-b from-[#121A27] to-[#0A0F17] backdrop-blur-xl border border-[#1C2538] p-6 rounded-3xl overflow-hidden transition-all hover:border-[#81D7B4]/30 hover:shadow-[0_8px_32px_rgba(129,215,180,0.1)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#81D7B4]/5 rounded-full blur-[40px] group-hover:bg-[#81D7B4]/15 transition-colors duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#81D7B4]/10 flex items-center justify-center border border-[#81D7B4]/20 shadow-inner">
              {getInstrumentIcon('BizBond', 'w-6 h-6')}
            </div>
            <span className="px-3 py-1 rounded-full bg-[#1C2538] text-[10px] font-bold text-[#7B8B9A] uppercase tracking-widest border border-[#2C3E5D]">Treasury</span>
          </div>
          <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-2 relative z-10">BizBond Balance</p>
          <div className="flex items-baseline gap-2 relative z-10">
            <h3 className="text-2xl font-black text-[#F9F9FB] tracking-tight">
              ${bbTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </h3>
            <span className="text-sm font-bold text-[#81D7B4]">({Math.floor(bbTotal / 1000)} Shares)</span>
          </div>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-gradient-to-b from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-3xl overflow-hidden min-w-0 shadow-2xl relative z-10">
        <div className="p-6 border-b border-[#1C2538] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0A0F17]/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h3 className="font-black text-lg tracking-wide text-[#F9F9FB]">Active Contracts</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
            <div className="relative w-full sm:w-64">
              <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5A75]" />
              <input 
                type="text" 
                placeholder="Search holdings..." 
                className="w-full bg-[#0A0F17] border border-[#1C2538] rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold text-[#F9F9FB] outline-none focus:border-[#81D7B4]/50 transition-colors shadow-inner placeholder:font-normal placeholder:text-[#4B5A75]"
              />
            </div>
            <button className="flex items-center justify-center gap-2 text-xs font-bold text-[#F9F9FB] hover:text-[#81D7B4] border border-[#1C2538] bg-[#0A0F17] px-4 py-2.5 rounded-xl transition-colors shadow-sm w-full sm:w-auto shrink-0">
              <FilterIcon className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="w-full">
            <div className="px-6 py-4 bg-[#0A0F17] border-b border-[#1C2538] flex gap-4">
              <div className="h-4 bg-[#1C2538] rounded w-1/6 animate-pulse"></div>
              <div className="h-4 bg-[#1C2538] rounded w-1/6 animate-pulse"></div>
              <div className="h-4 bg-[#1C2538] rounded w-1/6 animate-pulse"></div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-6 py-6 border-b border-[#1C2538]/50 flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-[#1C2538] animate-pulse shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-[#1C2538] rounded w-1/3 animate-pulse"></div>
                  <div className="h-3 bg-[#1C2538]/50 rounded w-1/4 animate-pulse"></div>
                </div>
                <div className="flex-1 space-y-3 hidden sm:block">
                  <div className="h-4 bg-[#1C2538] rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="flex-1 space-y-3 hidden md:block">
                  <div className="h-8 bg-[#1C2538] rounded-lg w-2/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : holdings.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#1C2538]/30 flex items-center justify-center mb-4 border border-[#2C3E5D]/30">
              <Briefcase01Icon className="w-8 h-8 text-[#4B5A75]" />
            </div>
            <h3 className="text-xl font-black text-[#F9F9FB] mb-2">No Active Holdings</h3>
            <p className="text-[#7B8B9A] max-w-sm mb-6">You don't have any active investment contracts in your portfolio yet.</p>
            <a href="/bizswap/buy" className="text-sm font-bold text-[#0A0F17] bg-gradient-to-r from-[#81D7B4] to-[#6BC4A0] px-6 py-3 rounded-xl hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(129,215,180,0.2)]">
              Explore BizShares
            </a>
          </div>
        ) : (
          <div className="w-full">
            {/* MOBILE CARD LAYOUT */}
            <div className="md:hidden flex flex-col divide-y divide-[#1C2538]/50">
              {holdings.map((h) => (
                <div key={h._id} className="p-5 flex flex-col gap-4 hover:bg-[#1C2538]/20 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-inner ${
                        h.instrument === 'BizYield' ? 'bg-[#FF6B6B]/10 border-[#FF6B6B]/20 text-[#FF6B6B]' :
                        h.instrument === 'BizCredit' ? 'bg-[#3B82F6]/10 border-[#3B82F6]/20 text-[#3B82F6]' :
                        'bg-[#81D7B4]/10 border-[#81D7B4]/20 text-[#81D7B4]'
                      }`}>
                        {getInstrumentIcon(h.instrument, 'w-5 h-5')}
                      </div>
                      <div>
                        <p className="font-black text-sm text-[#F9F9FB]">{h.instrument}</p>
                        <p className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-wider mt-0.5">
                          {h.instrument === 'BizYield' ? 'Rev Share' : h.instrument === 'BizCredit' ? 'Private Credit' : 'Treasury'}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm ${h.status.includes('Active') ? 'bg-[#059669]/10 text-[#059669] border border-[#059669]/20' : 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${h.status.includes('Active') ? 'bg-[#059669]' : 'bg-[#3B82F6]'}`}></span>
                      {h.status.split('—')[0]}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 bg-[#0A0F17]/50 rounded-xl p-3 border border-[#1C2538]/50">
                    <div>
                      <p className="text-[9px] font-bold text-[#4B5A75] uppercase tracking-widest mb-1">Investment</p>
                      <p className="font-black text-sm text-[#F9F9FB]">${h.investmentAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[#4B5A75] uppercase tracking-widest mb-1">Return / APY</p>
                      <p className="font-black text-sm text-[#81D7B4]">{h.apr}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[#4B5A75] uppercase tracking-widest mb-1">Next Payout</p>
                      <p className="font-bold text-xs text-[#F9F9FB]">{formatDate(h.nextPayment)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[#4B5A75] uppercase tracking-widest mb-1">Serial</p>
                      <p className="font-mono text-[10px] text-[#7B8B9A]">#{h.serialNumber.substring(0, 8)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE LAYOUT */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#0A0F17]/80 backdrop-blur-md sticky top-0">
                  <tr>
                    <th className="px-6 py-5 text-[10px] font-black text-[#4B5A75] uppercase tracking-widest border-b border-[#1C2538]">Asset</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[#4B5A75] uppercase tracking-widest border-b border-[#1C2538]">Type / Return</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[#4B5A75] uppercase tracking-widest border-b border-[#1C2538]">Initial Investment</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[#4B5A75] uppercase tracking-widest border-b border-[#1C2538]">Purchase Date</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[#4B5A75] uppercase tracking-widest border-b border-[#1C2538]">Next Payout</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[#4B5A75] uppercase tracking-widest border-b border-[#1C2538]">Serial #</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[#4B5A75] uppercase tracking-widest border-b border-[#1C2538]">Status</th>
                    <th className="px-6 py-5 border-b border-[#1C2538]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2538]/50">
                  {holdings.map((h) => (
                    <tr key={h._id} className="hover:bg-[#1C2538]/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-inner ${
                            h.instrument === 'BizYield' ? 'bg-[#FF6B6B]/10 border-[#FF6B6B]/20 text-[#FF6B6B]' :
                            h.instrument === 'BizCredit' ? 'bg-[#3B82F6]/10 border-[#3B82F6]/20 text-[#3B82F6]' :
                            'bg-[#81D7B4]/10 border-[#81D7B4]/20 text-[#81D7B4]'
                          }`}>
                            {getInstrumentIcon(h.instrument, 'w-6 h-6')}
                          </div>
                          <div>
                            <p className="font-black text-base text-[#F9F9FB]">{h.instrument}</p>
                            <p className="text-[11px] font-bold text-[#7B8B9A] uppercase tracking-wider mt-0.5">{h.instrument === 'BizYield' ? 'Rev Share' : h.instrument === 'BizCredit' ? 'Private Credit' : 'Treasury'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-black text-[#F9F9FB] text-base">{h.apr}</p>
                        <p className="text-[11px] font-bold text-[#7B8B9A] uppercase tracking-wider mt-0.5">{h.payoutFrequency}</p>
                      </td>
                      <td className="px-6 py-5 font-black text-[#F9F9FB] text-base">
                        ${h.investmentAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-6 py-5 text-[#7B8B9A] font-medium">
                        {formatDate(h.purchaseDate)}
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-[#F9F9FB]">{formatDate(h.nextPayment)}</p>
                        <p className="text-[10px] text-[#81D7B4] font-black uppercase tracking-widest mt-1">~${(h.investmentAmount * 0.05).toFixed(2)} est.</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-mono text-[11px] font-bold text-[#4B5A75] bg-[#0A0F17] border border-[#1C2538] px-3 py-1.5 rounded-lg inline-block shadow-inner">
                          #{h.serialNumber.substring(0, 8)}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm ${h.status.includes('Active') ? 'bg-[#059669]/10 text-[#059669] border border-[#059669]/20' : 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${h.status.includes('Active') ? 'bg-[#059669]' : 'bg-[#3B82F6]'}`}></span>
                          {h.status.split('—')[0]}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <button className="w-8 h-8 rounded-lg bg-[#1C2538] hover:bg-[#2C3E5D] hover:text-[#F9F9FB] flex items-center justify-center text-[#7B8B9A] transition-colors border border-[#2C3E5D] shadow-sm ml-auto opacity-0 group-hover:opacity-100">
                          <ArrowDown01Icon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
