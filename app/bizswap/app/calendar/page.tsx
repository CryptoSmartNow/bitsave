'use client';

import React, { useEffect, useState } from 'react';
import { Calendar01Icon, Activity01Icon, Tick01Icon, Dollar01Icon } from "hugeicons-react";
import { useWallet } from '@solana/wallet-adapter-react';
import { usePrivy } from '@privy-io/react-auth';
import toast from 'react-hot-toast';

interface Holding {
  _id: string;
  instrument: string;
  investmentAmount: number;
  nextPayment: string;
  payoutFrequency: string;
}

interface CalendarEvent {
  date: Date;
  instrument: string;
  amount: number;
  status: 'upcoming' | 'processing';
}

export default function CalendarPage() {
  const { publicKey, connected: isSolanaConnected } = useWallet();
  const { ready, authenticated, user } = usePrivy();

  const connected = ready && (authenticated || isSolanaConnected);
  const privySolanaWallet = user?.linkedAccounts?.find(
    (account) => account.type === 'wallet' && account.chainType === 'solana'
  ) as { address: string } | undefined;
  
  const walletAddress = isSolanaConnected 
    ? publicKey?.toBase58() 
    : (privySolanaWallet?.address || user?.wallet?.address);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (connected && walletAddress) {
      fetchHoldings(walletAddress);
    } else if (!connected && ready) {
      setEvents([]);
      setLoading(false);
    }
  }, [connected, walletAddress, ready]);

  const fetchHoldings = async (wallet: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bizswap/holdings?wallet=${wallet}`);
      const data = await res.json();
      if (res.ok) {
        // Transform holdings into calendar events
        const calendarEvents: CalendarEvent[] = data.data.map((h: Holding) => ({
          date: new Date(h.nextPayment),
          instrument: h.instrument,
          amount: h.investmentAmount * 0.05, // Mock 5% yield
          status: 'upcoming'
        }));
        
        // Sort chronologically
        calendarEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
        setEvents(calendarEvents);
      } else {
        toast.error('Failed to load calendar');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading calendar');
    } finally {
      setLoading(false);
    }
  };

  const getInstrumentColorClass = (name: string, type: 'bg' | 'text' | 'border') => {
    switch(name) {
      case 'BizYield': return type === 'bg' ? 'bg-[#FF6B6B]/10' : type === 'text' ? 'text-[#FF6B6B]' : 'border-[#FF6B6B]';
      case 'BizCredit': return type === 'bg' ? 'bg-[#3B82F6]/10' : type === 'text' ? 'text-[#3B82F6]' : 'border-[#3B82F6]';
      case 'BizBond': return type === 'bg' ? 'bg-[#81D7B4]/10' : type === 'text' ? 'text-[#81D7B4]' : 'border-[#81D7B4]';
      default: return type === 'bg' ? 'bg-gray-800' : type === 'text' ? 'text-gray-400' : 'border-gray-700';
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center py-32">
        <div className="w-24 h-24 rounded-full bg-[#1C2538]/30 flex items-center justify-center mb-6 border border-[#2C3E5D]/30 relative">
          <div className="absolute inset-0 bg-[#3B82F6]/10 rounded-full blur-xl"></div>
          <Calendar01Icon className="w-10 h-10 text-[#4B5A75] relative z-10" />
        </div>
        <h2 className="text-3xl font-black text-[#F9F9FB] mb-3 tracking-tight">Wallet Not Connected</h2>
        <p className="text-[#7B8B9A] mb-8 max-w-md text-lg">Please connect your wallet to view your scheduled yield distributions and payout calendar.</p>
      </div>
    );
  }

  const nextPayout = events.length > 0 ? events[0] : null;
  const totalExpected = events.reduce((acc, ev) => acc + ev.amount, 0);
  const thirtyDaySum = events.filter(ev => {
    const diffDays = (ev.date.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 30;
  }).reduce((acc, ev) => acc + ev.amount, 0);

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full max-w-[1200px] mx-auto space-y-8 min-w-0 pb-24 relative">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-[#3B82F6]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 -translate-x-1/3 z-0"></div>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 relative z-10 border-b border-[#1C2538]/50 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-full mb-4">
            <Calendar01Icon className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-widest">Schedule</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#F9F9FB] tracking-tight">Payment Calendar</h1>
          <p className="text-base text-[#7B8B9A] mt-2 max-w-md">Your scheduled yield distributions across all active BizSwap instruments.</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 bg-[#0A0F17]/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-[#1C2538] shadow-inner">
          <span className="flex items-center gap-2 text-[11px] font-bold text-[#7B8B9A] uppercase tracking-wider"><div className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] shadow-[0_0_10px_rgba(255,107,107,0.5)]"></div> BizYield</span>
          <span className="flex items-center gap-2 text-[11px] font-bold text-[#7B8B9A] uppercase tracking-wider"><div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div> BizCredit</span>
          <span className="flex items-center gap-2 text-[11px] font-bold text-[#7B8B9A] uppercase tracking-wider"><div className="w-2.5 h-2.5 rounded-full bg-[#81D7B4] shadow-[0_0_10px_rgba(129,215,180,0.5)]"></div> BizBond</span>
        </div>
      </div>

      {/* OVERVIEW METRICS */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 relative z-10">
          <div className="bg-gradient-to-br from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF6B6B]/5 rounded-full blur-[30px] group-hover:bg-[#FF6B6B]/10 transition-colors"></div>
            <p className="text-[10px] text-[#7B8B9A] font-bold uppercase tracking-widest mb-1 relative z-10">Next Payout</p>
            <div className="flex items-baseline gap-1 relative z-10">
              <p className="text-2xl font-black text-[#F9F9FB] tracking-tight">${nextPayout?.amount.toFixed(2)}</p>
            </div>
            <p className="text-xs text-[#FF6B6B] font-bold mt-2 relative z-10">{nextPayout?.date.toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</p>
          </div>
          
          <div className="bg-gradient-to-br from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B82F6]/5 rounded-full blur-[30px] group-hover:bg-[#3B82F6]/10 transition-colors"></div>
            <p className="text-[10px] text-[#7B8B9A] font-bold uppercase tracking-widest mb-1 relative z-10">30-Day Outlook</p>
            <div className="flex items-baseline gap-1 relative z-10">
              <p className="text-2xl font-black text-[#F9F9FB] tracking-tight">${thirtyDaySum.toFixed(2)}</p>
            </div>
            <p className="text-xs text-[#3B82F6] font-bold mt-2 relative z-10">Est. Total</p>
          </div>

          <div className="bg-gradient-to-br from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#81D7B4]/5 rounded-full blur-[30px] group-hover:bg-[#81D7B4]/10 transition-colors"></div>
            <p className="text-[10px] text-[#7B8B9A] font-bold uppercase tracking-widest mb-1 relative z-10">Total Scheduled</p>
            <div className="flex items-baseline gap-1 relative z-10">
              <p className="text-2xl font-black text-[#F9F9FB] tracking-tight">${totalExpected.toFixed(2)}</p>
            </div>
            <p className="text-xs text-[#81D7B4] font-bold mt-2 relative z-10">{events.length} Payments</p>
          </div>
        </div>
      )}

      {/* TIMELINE */}
      {loading ? (
        <div className="relative border-l-2 border-[#1C2538] ml-4 md:ml-8 space-y-8 pb-12 mt-8 z-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative pl-8 md:pl-12">
              <div className="absolute -left-[11px] top-6 w-5 h-5 rounded-full border-4 border-[#0A0F17] bg-[#1C2538]"></div>
              <div className="bg-[#0A0F17] border border-[#1C2538] p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-6 animate-pulse">
                <div className="w-16 h-16 rounded-xl bg-[#1C2538]"></div>
                <div className="flex-1 space-y-3 w-full">
                  <div className="h-4 bg-[#1C2538] rounded w-1/3"></div>
                  <div className="h-3 bg-[#1C2538]/50 rounded w-1/4"></div>
                </div>
                <div className="w-full md:w-32 space-y-3">
                  <div className="h-3 bg-[#1C2538] rounded w-1/2 ml-auto"></div>
                  <div className="h-6 bg-[#1C2538] rounded w-3/4 ml-auto"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="p-16 flex flex-col items-center justify-center text-center mt-8 bg-[#0A0F17]/50 border border-[#1C2538] rounded-3xl backdrop-blur-md relative z-10">
          <div className="w-20 h-20 rounded-full bg-[#1C2538]/30 flex items-center justify-center mb-4 border border-[#2C3E5D]/30">
            <Calendar01Icon className="w-8 h-8 text-[#4B5A75]" />
          </div>
          <h3 className="text-xl font-black text-[#F9F9FB] mb-2">No Scheduled Payments</h3>
          <p className="text-[#7B8B9A] max-w-sm mb-6">You don't have any upcoming yield distributions. Purchase BizShares to start earning.</p>
          <a href="/bizswap/buy" className="text-sm font-bold text-[#0A0F17] bg-gradient-to-r from-[#81D7B4] to-[#6BC4A0] px-6 py-3 rounded-xl hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(129,215,180,0.2)]">
            Explore Assets
          </a>
        </div>
      ) : (
        <div className="relative border-l-2 border-[#1C2538] ml-4 md:ml-8 space-y-8 pb-12 mt-8 z-10">
          {events.map((ev, i) => {
            const isFirst = i === 0;
            const cardBg = isFirst 
              ? `bg-gradient-to-r ${getInstrumentColorClass(ev.instrument, 'bg').replace('/10', '/5')} to-[#0A0F17]` 
              : 'bg-gradient-to-r from-[#121A27] to-[#0A0F17]';
            const cardBorder = isFirst 
              ? getInstrumentColorClass(ev.instrument, 'border') 
              : 'border-[#1C2538]';
            
            return (
              <div key={i} className="relative pl-8 md:pl-12 group">
                {/* Timeline Dot */}
                <div className={`absolute -left-[11px] top-6 w-5 h-5 rounded-full border-4 border-[#0A0F17] flex items-center justify-center bg-[#1C2538] transition-colors group-hover:bg-[#4B5A75]`}>
                  {isFirst && <div className={`w-2 h-2 rounded-full ${getInstrumentColorClass(ev.instrument, 'bg').replace('/10', '')} animate-pulse shadow-[0_0_10px_currentColor]`} />}
                </div>

                {/* Event Card */}
                <div className={`relative overflow-hidden ${cardBg} border ${cardBorder} ${isFirst ? 'shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl' : 'shadow-lg hover:border-[#2C3E5D] hover:shadow-xl hover:-translate-y-0.5'} p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-300`}>
                  
                  {isFirst && (
                    <div className={`absolute top-0 left-0 w-1 h-full ${getInstrumentColorClass(ev.instrument, 'bg').replace('/10', '')} shadow-[0_0_20px_currentColor]`} />
                  )}

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center w-14 sm:w-16 flex-shrink-0 bg-[#0A0F17]/80 backdrop-blur-sm py-2 sm:py-3 px-2 sm:px-3 rounded-xl border border-[#1C2538] shadow-inner">
                      <p className="text-[9px] sm:text-[10px] font-bold text-[#4B5A75] uppercase tracking-widest">{ev.date.toLocaleString('default', { month: 'short' })}</p>
                      <p className={`text-xl sm:text-2xl font-black ${isFirst ? 'text-[#F9F9FB]' : 'text-[#7B8B9A]'}`}>{ev.date.getDate()}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <p className={`text-sm sm:text-base font-black ${getInstrumentColorClass(ev.instrument, 'text')} tracking-wide`}>
                          {ev.instrument} 
                        </p>
                        {isFirst && (
                          <span className={`px-2 py-0.5 ${getInstrumentColorClass(ev.instrument, 'bg')} ${getInstrumentColorClass(ev.instrument, 'text')} text-[9px] font-bold rounded uppercase tracking-widest border ${getInstrumentColorClass(ev.instrument, 'border')} opacity-90 shadow-sm`}>
                            Up Next
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#7B8B9A] font-bold uppercase tracking-wider">Scheduled Yield Distribution</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t border-[#1C2538]/50 md:border-0 pt-4 md:pt-0 mt-2 md:mt-0">
                    <div className="text-left md:text-right">
                      <p className="text-[9px] sm:text-[10px] text-[#4B5A75] font-bold uppercase tracking-widest mb-1">Expected Payout</p>
                      <p className="text-xl sm:text-2xl font-black text-[#F9F9FB] tracking-tight">${ev.amount.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full px-3 py-1 ${isFirst ? 'text-[#81D7B4] bg-[#81D7B4]/10 border border-[#81D7B4]/20' : 'text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/20'}`}>
                        {isFirst ? <Tick01Icon className="w-3 h-3" /> : <Activity01Icon className="w-3 h-3" />} 
                        {isFirst ? 'Processing' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
