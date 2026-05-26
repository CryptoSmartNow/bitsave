'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  HiOutlineClock,
  HiOutlineArrowDownTray,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineFunnel,
  HiOutlineChartBar,
  HiOutlineCurrencyDollar,
  HiOutlineShieldCheck
} from 'react-icons/hi2';

// Mock data since we don't have a payout history API yet
const MOCK_HISTORY = [
  { id: 'tx1', date: '2026-05-15T10:30:00Z', instrument: 'BizYield', amount: 12.50, currency: 'USDC', txHash: '5K3y...9xP2', status: 'Completed' },
  { id: 'tx2', date: '2026-05-08T14:15:00Z', instrument: 'BizCredit', amount: 8.00, currency: 'USDC', txHash: '3aBf...2cL1', status: 'Completed' },
  { id: 'tx3', date: '2026-05-01T09:00:00Z', instrument: 'BizCredit', amount: 8.00, currency: 'USDC', txHash: '9mNp...4zR7', status: 'Completed' },
  { id: 'tx4', date: '2026-04-15T11:45:00Z', instrument: 'BizYield', amount: 15.20, currency: 'USDC', txHash: '7vXq...1bM5', status: 'Completed' },
  { id: 'tx5', date: '2026-04-01T10:00:00Z', instrument: 'BizBond', amount: 25.00, currency: 'USDC', txHash: '2cKw...8jH3', status: 'Completed' },
];

export default function HistoryPage() {
  const { connected } = useWallet();
  const [filter, setFilter] = useState('All');

  const filteredHistory = filter === 'All' ? MOCK_HISTORY : MOCK_HISTORY.filter(h => h.instrument === filter);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getInstrumentIcon = (name: string) => {
    switch(name) {
      case 'BizYield': return <HiOutlineChartBar className="w-4 h-4 text-[#FF6B6B]" />;
      case 'BizCredit': return <HiOutlineCurrencyDollar className="w-4 h-4 text-[#3B82F6]" />;
      case 'BizBond': return <HiOutlineShieldCheck className="w-4 h-4 text-[#81D7B4]" />;
      default: return null;
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <HiOutlineClock className="w-16 h-16 text-[#2C3E5D] mb-6" />
        <h2 className="text-2xl font-black text-[#F9F9FB] mb-2">Wallet Not Connected</h2>
        <p className="text-[#7B8B9A] mb-8 max-w-sm">Please connect your Solana wallet to view your payout history.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-[1600px] mx-auto space-y-6 md:space-y-8 min-w-0">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#1C2538] pb-6">
        <div>
          <h1 className="text-2xl font-black text-[#F9F9FB]">Payment History</h1>
          <p className="text-sm text-[#7B8B9A] mt-1">A complete ledger of all your received yield distributions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#121A27] border border-[#1C2538] rounded-lg px-3 py-2 flex items-center gap-2">
            <HiOutlineFunnel className="w-4 h-4 text-[#7B8B9A]" />
            <select 
              className="bg-transparent text-sm font-bold text-[#F9F9FB] outline-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Instruments</option>
              <option value="BizYield">BizYield</option>
              <option value="BizCredit">BizCredit</option>
              <option value="BizBond">BizBond</option>
            </select>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-[#F9F9FB] hover:text-[#81D7B4] border border-[#1C2538] bg-[#0A0F17] px-4 py-2 rounded-lg transition-colors">
            <HiOutlineArrowDownTray className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-[#121A27] border border-[#1C2538] rounded-2xl overflow-hidden min-w-0">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0A0F17]">
              <tr>
                <th className="px-5 py-4 text-xs font-bold text-[#4B5A75] uppercase tracking-widest">Date & Time</th>
                <th className="px-5 py-4 text-xs font-bold text-[#4B5A75] uppercase tracking-widest">Instrument</th>
                <th className="px-5 py-4 text-xs font-bold text-[#4B5A75] uppercase tracking-widest">Amount Received</th>
                <th className="px-5 py-4 text-xs font-bold text-[#4B5A75] uppercase tracking-widest">Status</th>
                <th className="px-5 py-4 text-xs font-bold text-[#4B5A75] uppercase tracking-widest">Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2538]">
              {filteredHistory.map((h) => (
                <tr key={h.id} className="hover:bg-[#1C2538]/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#F9F9FB]">{formatDate(h.date)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 font-bold text-[#F9F9FB]">
                      {getInstrumentIcon(h.instrument)}
                      {h.instrument}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-black text-[#81D7B4]">+ {h.amount.toFixed(2)} {h.currency}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest bg-[#059669]/20 text-[#059669] border border-[#059669]/30">
                      {h.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="flex items-center gap-2 text-xs font-mono text-[#7B8B9A] hover:text-[#81D7B4] transition-colors">
                      {h.txHash} <HiOutlineArrowTopRightOnSquare className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[#7B8B9A]">
                    No payment history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
