'use client';

import { 
  Briefcase01Icon, 
  Wallet01Icon, 
  Calendar01Icon, 
  Search01Icon, 
  Cancel01Icon, 
  Activity01Icon, 
  ArrowRight01Icon,
  Coins01Icon,
  FlashIcon,
  RefreshIcon
} from "hugeicons-react";
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSkeleton from '@/components/DashboardSkeleton';

export default function BizSwapAnalytics() {
  const [bizSwapData, setBizSwapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBizSwapData = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/bizswap/analytics');
      const result = await res.json();
      if (result?.data) {
        setBizSwapData(result.data);
      }
    } catch (error) {
      console.error('Error fetching bizswap data:', error);
    } finally {
      setLoading(false);
      if (manual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBizSwapData();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!bizSwapData?.users) return [];
    return bizSwapData.users.filter((user: any) => 
      user.wallet.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bizSwapData, searchQuery]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!bizSwapData) {
    return (
      <div className="p-12 text-center text-gray-400 text-xs font-mono">
        Failed to load BizSwap Analytics. Please ensure database connection is active.
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-900 dark:text-white space-y-8 pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 text-[10px] font-black uppercase tracking-wider">
              RWA & Pools
            </span>
            <span className="text-xs text-gray-400">BizSwap Yield Markets</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white font-display">
            BizSwap Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive metrics on Real World Asset tokenization, instrument allocations, and liquidity pools.
          </p>
        </div>

        <button
          onClick={() => fetchBizSwapData(true)}
          disabled={isRefreshing}
          className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#0c121e] border border-gray-200/80 dark:border-white/10 hover:border-[#81D7B4] text-gray-700 dark:text-gray-200 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshIcon className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#81D7B4]' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Pools'}</span>
        </button>
      </div>

      {/* ── Main Stat Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Capital Deployed */}
        <div className="bg-gradient-to-br from-[#0c121e] to-[#141d2d] text-white p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#81D7B4]/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div>
            <span className="text-[11px] font-black text-[#81D7B4] uppercase tracking-widest block mb-2">
              Total Capital Deployed
            </span>
            <h3 className="text-4xl sm:text-5xl font-black font-instrument tracking-tight text-white">
              ${bizSwapData.globalStats.totalInvested.toLocaleString()}
            </h3>
          </div>

          <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between z-10 text-xs">
            <div className="flex items-center gap-2 text-gray-300 font-bold bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Wallet01Icon className="w-4 h-4 text-[#81D7B4]" /> 
              <span>{bizSwapData.globalStats.uniqueInvestors} Active Investors</span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">Real World Assets</span>
          </div>
        </div>

        {/* Instrument Breakdown */}
        <div className="bg-white dark:bg-[#0c121e] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-gray-900 dark:text-white font-display">
              Instrument Capital Allocation
            </h3>
            <span className="text-xs text-gray-400 font-mono">3 Active Instruments</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {Object.entries(bizSwapData.globalStats.instrumentBreakdown || {}).map(([name, amount]: [string, any]) => {
              let color = 'text-[#81D7B4]';
              let bg = 'bg-[#81D7B4]/10';
              if (name === 'BizYield') { color = 'text-rose-500'; bg = 'bg-rose-500/10'; }
              if (name === 'BizCredit') { color = 'text-blue-500'; bg = 'bg-blue-500/10'; }
              if (name === 'BizBond') { color = 'text-[#81D7B4]'; bg = 'bg-[#81D7B4]/10'; }

              return (
                <div key={name} className="p-4 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] flex flex-col justify-between hover:border-[#81D7B4]/40 transition-colors">
                  <div>
                    <div className={`w-8 h-8 rounded-xl ${bg} ${color} flex items-center justify-center mb-3`}>
                      <Briefcase01Icon className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-gray-400 mb-0.5">{name}</p>
                    <p className="text-xl font-black font-instrument text-gray-900 dark:text-white">
                      ${amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Investor Directory ── */}
      <div className="bg-white dark:bg-[#0c121e] rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xs overflow-hidden flex flex-col">
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-white/[0.02]">
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white font-display">
              Investor Directory & Holdings
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Breakdown of all {bizSwapData.globalStats.uniqueInvestors} BizSwap participants and pool certificate balances.
            </p>
          </div>
          
          <div className="relative w-full sm:w-80">
            <Search01Icon className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search investor wallet (0x...)..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-white dark:bg-[#141d2d] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#81D7B4]"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-gray-50/70 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 text-[10.5px] font-black uppercase text-gray-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Investor Wallet</th>
                <th className="px-6 py-4">Total Invested</th>
                <th className="px-6 py-4">Certificates</th>
                <th className="px-6 py-4">Portfolio Allocation</th>
                <th className="px-6 py-4 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs">
              {filteredUsers.map((user: any, idx: number) => (
                <tr 
                  key={user.wallet} 
                  onClick={() => setSelectedUser(user)}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#81D7B4]/15 text-[#1c4b38] dark:text-[#81D7B4] flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                        {idx + 1}
                      </div>
                      <span className="font-mono font-bold text-gray-900 dark:text-white group-hover:text-[#81D7B4] transition-colors">
                        {user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-black font-instrument text-base text-[#81D7B4]">
                      ${user.totalInvested.toLocaleString()}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold text-[11px]">
                      {user.holdingsCount} assets
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {Object.entries(user.instruments || {}).map(([inst, val]: [string, any]) => {
                        let badgeColor = 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5';
                        if (inst === 'BizYield') badgeColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
                        if (inst === 'BizCredit') badgeColor = 'text-blue-500 bg-blue-500/10 border-blue-500/20';
                        if (inst === 'BizBond') badgeColor = 'text-[#81D7B4] bg-[#81D7B4]/10 border-[#81D7B4]/20';
                        
                        return (
                          <span key={inst} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                            {inst.replace('Biz', '')}: ${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-400 font-mono text-[11px]">
                    {new Date(user.latestPurchase).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-xs text-gray-400">
              No matching BizSwap investors found.
            </div>
          )}
        </div>
      </div>

      {/* ── Investor Detail Modal ── */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[85vh] bg-white dark:bg-[#0c121e] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 z-50 overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/80 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#81D7B4]/15 text-[#81D7B4] rounded-2xl">
                    <Wallet01Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black font-display text-gray-900 dark:text-white">
                      Investor Profile Details
                    </h3>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">
                      {selectedUser.wallet}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Cancel01Icon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(85vh-90px)] custom-scrollbar space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Capital Invested</span>
                    <span className="text-xl font-black font-instrument text-[#81D7B4]">${selectedUser.totalInvested.toLocaleString()}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Certificates</span>
                    <span className="text-xl font-black font-instrument text-gray-900 dark:text-white">{selectedUser.holdingsCount}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Latest Trade</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white font-mono mt-1 block">
                      {new Date(selectedUser.latestPurchase).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                    Portfolio Allocation
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(selectedUser.instruments || {}).map(([inst, val]: [string, any]) => (
                      <div key={inst} className="p-3.5 rounded-xl bg-white dark:bg-[#141d2d] border border-gray-200/70 dark:border-white/10">
                        <span className="text-xs font-bold text-gray-400 block mb-0.5">{inst}</span>
                        <span className="text-base font-black font-instrument text-gray-900 dark:text-white">${val.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
