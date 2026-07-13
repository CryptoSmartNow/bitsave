'use client';

import React, { useState, useEffect } from 'react';
import { Activity01Icon, Download01Icon, LinkSquare01Icon, BarChartIcon, Dollar01Icon, Shield01Icon, Search01Icon, FilterIcon } from "hugeicons-react";
import { useWallet } from '@solana/wallet-adapter-react';
import { usePrivy } from '@privy-io/react-auth';

interface Payment {
  _id: string;
  date: string;
  instrument: string;
  amount: number;
  currency: string;
  txHash: string;
}

export default function HistoryPage() {
  const { publicKey, connected: isSolanaConnected } = useWallet();
  const { ready, authenticated, user } = usePrivy();
  const connected = ready && (authenticated || isSolanaConnected);
  const privySolanaWallet = user?.linkedAccounts?.find(
    (account) => account.type === 'wallet' && account.chainType === 'solana'
  ) as { address: string } | undefined;
  
  const walletAddress = isSolanaConnected 
    ? publicKey?.toBase58() 
    : (privySolanaWallet?.address || user?.wallet?.address);

  const [filter, setFilter] = useState('All');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (connected && walletAddress) {
      fetchPayments(walletAddress);
    } else if (!connected && ready) {
      setPayments([]);
      setLoading(false);
    }
  }, [connected, walletAddress, ready]);

  const fetchPayments = async (wallet: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bizswap/payments?wallet=${wallet}`);
      const data = await res.json();
      if (res.ok) setPayments(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = filter === 'All' ? payments : payments.filter(h => h.instrument === filter);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getInstrumentIcon = (name: string) => {
    switch(name) {
      case 'BizYield': return <BarChartIcon className="w-4 h-4 text-[#FF6B6B]" />;
      case 'BizCredit': return <Dollar01Icon className="w-4 h-4 text-[#3B82F6]" />;
      case 'BizBond': return <Shield01Icon className="w-4 h-4 text-[#81D7B4]" />;
      default: return null;
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center py-32">
        <div className="w-24 h-24 rounded-full bg-[#1C2538]/30 flex items-center justify-center mb-6 border border-[#2C3E5D]/30 relative">
          <div className="absolute inset-0 bg-[#81D7B4]/10 rounded-full blur-xl"></div>
          <Activity01Icon className="w-10 h-10 text-[#4B5A75] relative z-10" />
        </div>
        <h2 className="text-3xl font-black text-[#F9F9FB] mb-3 tracking-tight">Wallet Not Connected</h2>
        <p className="text-[#7B8B9A] mb-8 max-w-md text-lg">Please connect your Solana wallet to view your complete payment history and ledger.</p>
      </div>
    );
  }

  const totalYield = payments.reduce((acc, p) => acc + (p.txHash.includes('Pending') ? 0 : p.amount), 0);

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full max-w-[1600px] mx-auto space-y-8 min-w-0 pb-24 relative">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-[#81D7B4]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 -translate-x-1/3 z-0"></div>

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#81D7B4]/10 border border-[#81D7B4]/20 rounded-full mb-4">
            <span className="text-[10px] font-bold text-[#81D7B4] uppercase tracking-widest">Ledger</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#F9F9FB] tracking-tight">Payment History</h1>
          <p className="text-base text-[#7B8B9A] mt-2 max-w-md">A complete and immutable ledger of all your received yield distributions.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="bg-gradient-to-br from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-2xl relative overflow-hidden group w-full lg:w-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/0 via-[#81D7B4]/5 to-[#81D7B4]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div>
              <p className="text-[10px] text-[#7B8B9A] font-bold uppercase tracking-widest mb-1">Total Yield Received</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black text-[#81D7B4]">+${totalYield.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-[#1C2538]"></div>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-[10px] text-[#7B8B9A] font-bold uppercase tracking-widest mb-0.5">Transactions</p>
                <p className="text-sm font-bold text-[#F9F9FB]">{payments.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-gradient-to-b from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-3xl overflow-hidden min-w-0 shadow-2xl relative z-10">
        <div className="p-6 border-b border-[#1C2538] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0A0F17]/50 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5A75]" />
              <input 
                type="text" 
                placeholder="Search history..." 
                className="w-full bg-[#0A0F17] border border-[#1C2538] rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold text-[#F9F9FB] outline-none focus:border-[#81D7B4]/50 transition-colors shadow-inner placeholder:font-normal placeholder:text-[#4B5A75]"
              />
            </div>
            <div className="bg-[#0A0F17] border border-[#1C2538] rounded-xl px-3 py-2.5 flex items-center gap-2 shadow-inner w-full sm:w-auto">
              <FilterIcon className="w-4 h-4 text-[#4B5A75]" />
              <select 
                className="bg-transparent text-sm font-bold text-[#F9F9FB] outline-none w-full"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="All">All Instruments</option>
                <option value="BizYield">BizYield</option>
                <option value="BizCredit">BizCredit</option>
                <option value="BizBond">BizBond</option>
              </select>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 text-xs font-bold text-[#F9F9FB] hover:text-[#81D7B4] border border-[#1C2538] bg-[#0A0F17] px-4 py-2.5 rounded-xl transition-colors shadow-sm w-full md:w-auto shrink-0">
            <Download01Icon className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {loading ? (
          <div className="w-full">
            <div className="hidden md:flex px-6 py-4 bg-[#0A0F17] border-b border-[#1C2538] gap-4">
              <div className="h-4 bg-[#1C2538] rounded w-1/6 animate-pulse"></div>
              <div className="h-4 bg-[#1C2538] rounded w-1/6 animate-pulse"></div>
              <div className="h-4 bg-[#1C2538] rounded w-1/6 animate-pulse"></div>
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-6 py-6 border-b border-[#1C2538]/50 flex items-center gap-6">
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
        ) : filteredHistory.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#1C2538]/30 flex items-center justify-center mb-4 border border-[#2C3E5D]/30">
              <Activity01Icon className="w-8 h-8 text-[#4B5A75]" />
            </div>
            <h3 className="text-xl font-black text-[#F9F9FB] mb-2">No History Found</h3>
            <p className="text-[#7B8B9A] max-w-sm mb-6">You don't have any payment history matching the current filter.</p>
          </div>
        ) : (
          <div className="w-full">
            {/* MOBILE CARD LAYOUT */}
            <div className="md:hidden flex flex-col divide-y divide-[#1C2538]/50">
              {filteredHistory.map((h) => (
                <div key={h._id} className="p-5 flex flex-col gap-4 hover:bg-[#1C2538]/20 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getInstrumentIcon(h.instrument)}
                        <p className="font-black text-sm text-[#F9F9FB]">{h.instrument}</p>
                      </div>
                      <p className="text-[10px] font-bold text-[#7B8B9A]">{formatDate(h.date)}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm ${h.txHash.includes('Pending') ? 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20' : 'bg-[#059669]/10 text-[#059669] border border-[#059669]/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${h.txHash.includes('Pending') ? 'bg-[#F5A623]' : 'bg-[#059669]'}`}></span>
                      {h.txHash.includes('Pending') ? 'Pending' : 'Completed'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-[#0A0F17]/50 rounded-xl p-4 border border-[#1C2538]/50">
                    <div>
                      <p className="text-[9px] font-bold text-[#4B5A75] uppercase tracking-widest mb-1">Amount</p>
                      <p className="font-black text-lg text-[#81D7B4]">+${h.amount.toFixed(2)} <span className="text-[10px] text-[#4B5A75]">{h.currency?.includes('Fiat') ? 'Fiat' : (h.currency || 'USDC')}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-[#4B5A75] uppercase tracking-widest mb-1">Tx Hash</p>
                      {h.txHash.includes('Pending') ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#7B8B9A] bg-[#1C2538] px-2.5 py-1 rounded-md border border-[#2C3E5D]">N/A</span>
                      ) : (
                        <a 
                          href={`https://explorer.solana.com/tx/${h.txHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#7B8B9A] bg-[#1C2538] px-2.5 py-1 rounded-md border border-[#2C3E5D]"
                        >
                          {h.txHash.slice(0, 4)}...{h.txHash.slice(-4)} <LinkSquare01Icon className="w-3 h-3" />
                        </a>
                      )}
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
                    <th className="px-6 py-5 text-[10px] font-black text-[#4B5A75] uppercase tracking-widest border-b border-[#1C2538]">Date & Time</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[#4B5A75] uppercase tracking-widest border-b border-[#1C2538]">Instrument</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[#4B5A75] uppercase tracking-widest border-b border-[#1C2538]">Amount Received</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[#4B5A75] uppercase tracking-widest border-b border-[#1C2538]">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[#4B5A75] uppercase tracking-widest border-b border-[#1C2538]">Transaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2538]/50">
                  {filteredHistory.map((h) => (
                    <tr key={h._id} className="hover:bg-[#1C2538]/30 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="font-bold text-[#F9F9FB]">{formatDate(h.date)}</p>
                        <p className="text-[10px] text-[#7B8B9A] uppercase tracking-widest mt-1">Solana Network</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-inner ${
                            h.instrument === 'BizYield' ? 'bg-[#FF6B6B]/10 border-[#FF6B6B]/20 text-[#FF6B6B]' :
                            h.instrument === 'BizCredit' ? 'bg-[#3B82F6]/10 border-[#3B82F6]/20 text-[#3B82F6]' :
                            'bg-[#81D7B4]/10 border-[#81D7B4]/20 text-[#81D7B4]'
                          }`}>
                            {getInstrumentIcon(h.instrument)}
                          </div>
                          <div>
                            <p className="font-black text-sm text-[#F9F9FB]">{h.instrument}</p>
                            <p className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-wider mt-0.5">Yield Distribution</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-baseline gap-1.5">
                          <p className="font-black text-lg text-[#81D7B4] tracking-tight">+{h.amount.toFixed(2)}</p>
                          <span className="text-[10px] font-bold text-[#4B5A75] uppercase tracking-widest">{h.currency?.includes('Fiat') ? 'Fiat' : (h.currency || 'USDC')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm ${h.txHash.includes('Pending') ? 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20' : 'bg-[#059669]/10 text-[#059669] border border-[#059669]/20'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${h.txHash.includes('Pending') ? 'bg-[#F5A623]' : 'bg-[#059669]'}`}></span>
                          {h.txHash.includes('Pending') ? 'Pending' : 'Completed'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {h.txHash.includes('Pending') ? (
                          <span className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#7B8B9A] bg-[#0A0F17] px-3 py-1.5 rounded-lg border border-[#1C2538] shadow-inner">
                            N/A
                          </span>
                        ) : (
                          <a 
                            href={`https://explorer.solana.com/tx/${h.txHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#7B8B9A] hover:text-[#81D7B4] bg-[#0A0F17] px-3 py-1.5 rounded-lg border border-[#1C2538] transition-colors shadow-inner"
                          >
                            {h.txHash.slice(0, 4)}...{h.txHash.slice(-4)} <LinkSquare01Icon className="w-3 h-3" />
                          </a>
                        )}
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
