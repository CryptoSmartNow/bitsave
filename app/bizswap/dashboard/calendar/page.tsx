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
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <Calendar01Icon className="w-16 h-16 text-[#2C3E5D] mb-6" />
        <h2 className="text-2xl font-black text-[#F9F9FB] mb-2">Wallet Not Connected</h2>
        <p className="text-[#7B8B9A] mb-8 max-w-sm">Please connect your Solana wallet to view your payout calendar.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-[1000px] mx-auto space-y-6 md:space-y-8 min-w-0">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#1C2538] pb-6">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Payment Calendar</h1>
          <p className="text-sm text-[#7B8B9A] mt-1">Your upcoming scheduled yield distributions.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-[#7B8B9A]"><div className="w-2 h-2 rounded-full bg-[#FF6B6B]"></div> BizYield</span>
          <span className="flex items-center gap-1.5 text-xs text-[#7B8B9A]"><div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div> BizCredit</span>
          <span className="flex items-center gap-1.5 text-xs text-[#7B8B9A]"><div className="w-2 h-2 rounded-full bg-[#81D7B4]"></div> BizBond</span>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#7B8B9A]">Loading calendar...</div>
      ) : events.length === 0 ? (
        <div className="py-12 text-center text-[#7B8B9A]">No upcoming payments scheduled. Purchase BizShares to start earning yield.</div>
      ) : (
        <div className="relative border-l-2 border-[#1C2538] ml-4 md:ml-6 space-y-8 pb-12">
          {events.map((ev, i) => {
            const isFirst = i === 0;
            return (
              <div key={i} className="relative pl-8 md:pl-12">
                {/* Timeline Dot */}
                <div className={`absolute -left-[11px] top-4 w-5 h-5 rounded-full border-4 border-[#0A0F17] flex items-center justify-center bg-[#1C2538]`}>
                  {isFirst && <div className={`w-2 h-2 rounded-full ${getInstrumentColorClass(ev.instrument, 'bg').replace('/10', '')} animate-pulse`} />}
                </div>

                {/* Event Card */}
                <div className={`relative overflow-hidden bg-gradient-to-r ${isFirst ? getInstrumentColorClass(ev.instrument, 'bg').replace('/10', '/5') + ' to-[#121A27]' : 'from-[#121A27] to-[#0A0F17]'} border ${isFirst ? getInstrumentColorClass(ev.instrument, 'border') + ' shadow-[0_0_30px_rgba(0,0,0,0.3)] backdrop-blur-md z-10 scale-[1.02]' : 'border-[#1C2538]'} p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${!isFirst && 'hover:border-[#3A4F73]'}`}>
                  
                  {isFirst && (
                    <div className={`absolute top-0 left-0 w-1 h-full ${getInstrumentColorClass(ev.instrument, 'bg').replace('/10', '')}`} />
                  )}

                  <div className="flex items-center gap-6">
                    <div className="text-center w-14 flex-shrink-0 bg-[#0A0F17] py-2 px-3 rounded-xl border border-[#1C2538] shadow-inner">
                      <p className="text-[10px] font-bold text-[#4B5A75] uppercase tracking-widest">{ev.date.toLocaleString('default', { month: 'short' })}</p>
                      <p className={`text-2xl font-black ${isFirst ? 'text-[#F9F9FB]' : 'text-[#7B8B9A]'}`}>{ev.date.getDate()}</p>
                    </div>
                    <div>
                      <p className={`text-base font-bold ${getInstrumentColorClass(ev.instrument, 'text')} flex items-center gap-2 mb-1`}>
                        {ev.instrument} 
                        {isFirst && <span className={`px-2 py-0.5 ${getInstrumentColorClass(ev.instrument, 'bg')} ${getInstrumentColorClass(ev.instrument, 'text')} text-[9px] rounded uppercase tracking-widest border ${getInstrumentColorClass(ev.instrument, 'border')} opacity-80`}>Next Payment</span>}
                      </p>
                      <p className="text-xs text-[#7B8B9A] font-medium">Estimated yield distribution</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t border-[#1C2538] md:border-0 pt-4 md:pt-0 mt-2 md:mt-0">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-[#4B5A75] uppercase tracking-widest mb-1">Expected Payout</p>
                      <p className="text-lg font-black text-[#F9F9FB]">${ev.amount.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#F5A623] bg-[#F5A623]/10 px-2 py-1 rounded">
                        <Activity01Icon className="w-3 h-3" /> Upcoming
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
