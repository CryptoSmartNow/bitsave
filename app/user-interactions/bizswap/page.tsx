'use client';

import { Briefcase01Icon, Wallet01Icon, Calendar01Icon, Search01Icon, Cancel01Icon, Activity01Icon, TextIcon } from "hugeicons-react";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSkeleton from '@/components/DashboardSkeleton';

export default function BizSwapAnalytics() {
  const [bizSwapData, setBizSwapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const fetchBizSwapData = async () => {
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
      }
    };

    fetchBizSwapData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!bizSwapData) {
    return <div className="p-8 text-center text-slate-500">Failed to load BizSwap Analytics.</div>;
  }

  const filteredUsers = bizSwapData.users.filter((user: any) => 
    user.wallet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ zoom: 0.8 }} className="font-sans text-slate-900 pb-20">
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-4xl font-black font-display text-slate-900 tracking-tight">
              BizSwap Analytics
            </h1>
            <p className="text-slate-500 mt-2 text-lg">Comprehensive metrics on Real World Asset tokenization and yield pools.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Improved Card Design */}
          <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#81D7B4]/20 to-transparent blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-700 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Total Capital Deployed</p>
              <h3 className="text-6xl font-black font-display tracking-tight text-white drop-shadow-sm">
                ${bizSwapData.globalStats.totalInvested.toLocaleString()}
              </h3>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 text-sm text-slate-300 font-bold bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <Wallet01Icon className="w-4 h-4 text-[#81D7B4]" /> 
                <span>{bizSwapData.globalStats.uniqueInvestors} Active Investors</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm col-span-1 md:col-span-2">
            <h3 className="text-lg font-black font-display text-slate-900 mb-6">Instrument Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(bizSwapData.globalStats.instrumentBreakdown).map(([name, amount]: [string, any]) => {
                let color = 'text-[#7B8B9A]';
                let bg = 'bg-slate-100';
                let barColor = 'bg-slate-400';
                if (name === 'BizYield') { color = 'text-[#FF6B6B]'; bg = 'bg-[#FF6B6B]/10'; barColor = 'bg-[#FF6B6B]'; }
                if (name === 'BizCredit') { color = 'text-[#3B82F6]'; bg = 'bg-[#3B82F6]/10'; barColor = 'bg-[#3B82F6]'; }
                if (name === 'BizBond') { color = 'text-[#81D7B4]'; bg = 'bg-[#81D7B4]/10'; barColor = 'bg-[#81D7B4]'; }

                return (
                  <div key={name} className="p-5 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col justify-between hover:bg-white transition-colors hover:shadow-sm">
                    <div>
                      <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center mb-4`}>
                        <Briefcase01Icon className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-slate-500 mb-1">{name}</p>
                      <p className="text-2xl font-black text-slate-900">${amount.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black font-display text-slate-900">Investor Directory</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Detailed breakdown of all {bizSwapData.globalStats.uniqueInvestors} BizSwap participants.</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search01Icon className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by wallet address..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#81D7B4] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Investor Wallet</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Total Invested</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Certificates</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Portfolio Breakdown</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user: any, idx: number) => (
                  <tr 
                    key={user.wallet} 
                    onClick={() => setSelectedUser(user)}
                    className="hover:bg-[#81D7B4]/5 transition-colors cursor-pointer group"
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-black text-sm shadow-sm transition-all">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-bold text-slate-900 font-mono bg-slate-50 group-hover:bg-white border border-transparent group-hover:border-slate-200 px-3 py-1.5 rounded-lg transition-all">
                          {user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="text-lg font-black text-[#81D7B4]">
                        ${user.totalInvested.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-600 bg-slate-50 group-hover:bg-white border border-slate-100 px-3 py-1.5 rounded-lg transition-all">
                        {user.holdingsCount} assets
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {Object.entries(user.instruments).map(([inst, val]: [string, any]) => {
                          let instColor = 'text-slate-500 bg-slate-50 border-slate-100 group-hover:bg-white';
                          if (inst === 'BizYield') instColor = 'text-[#FF6B6B] bg-[#FF6B6B]/5 border-[#FF6B6B]/20 group-hover:bg-[#FF6B6B]/10';
                          if (inst === 'BizCredit') instColor = 'text-[#3B82F6] bg-[#3B82F6]/5 border-[#3B82F6]/20 group-hover:bg-[#3B82F6]/10';
                          if (inst === 'BizBond') instColor = 'text-[#81D7B4] bg-[#81D7B4]/5 border-[#81D7B4]/20 group-hover:bg-[#81D7B4]/10';
                          
                          return (
                            <span key={inst} className={`text-xs font-bold px-2.5 py-1.5 rounded-md border ${instColor} transition-all`} title={`$${val.toLocaleString()}`}>
                              {inst.replace('Biz', '')}: ${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar01Icon className="w-4 h-4 text-slate-400 group-hover:text-[#81D7B4] transition-colors" />
                        {new Date(user.latestPurchase).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Search01Icon className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-900">No Investors Found</h3>
                <p className="text-slate-500 mt-1">Try adjusting your search query.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-4xl h-fit max-h-[90vh] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 bg-slate-50/80 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-white border border-slate-200 shadow-sm rounded-2xl text-slate-700">
                    <Wallet01Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight">Investor Profile</h2>
                    <p className="text-sm font-mono font-bold text-slate-500 mt-1 bg-slate-200/50 px-2 py-0.5 rounded inline-block">
                      {selectedUser.wallet}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-3 hover:bg-slate-200/50 bg-white border border-slate-200 rounded-xl transition-all active:scale-95"
                >
                  <Cancel01Icon className="w-6 h-6 text-slate-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-110px)] custom-scrollbar space-y-8 bg-white">
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Capital Deployed</p>
                    <p className="text-4xl font-black font-display text-[#81D7B4]">${selectedUser.totalInvested.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Certificates Held</p>
                    <p className="text-4xl font-black font-display text-slate-900">{selectedUser.holdingsCount}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Last Active</p>
                    <p className="text-2xl font-black font-display text-slate-900 mt-2">
                      {new Date(selectedUser.latestPurchase).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Portfolio Breakdown */}
                <div>
                  <h3 className="text-lg font-black font-display text-slate-900 mb-4 flex items-center gap-2">
                    <Briefcase01Icon className="w-5 h-5 text-[#81D7B4]" /> Portfolio Distribution
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Object.entries(selectedUser.instruments).map(([inst, val]: [string, any]) => {
                      let instColor = 'text-slate-500 bg-slate-50 border-slate-100';
                      let barColor = 'bg-slate-400';
                      if (inst === 'BizYield') { instColor = 'text-[#FF6B6B] bg-[#FF6B6B]/5 border-[#FF6B6B]/20'; barColor = 'bg-[#FF6B6B]'; }
                      if (inst === 'BizCredit') { instColor = 'text-[#3B82F6] bg-[#3B82F6]/5 border-[#3B82F6]/20'; barColor = 'bg-[#3B82F6]'; }
                      if (inst === 'BizBond') { instColor = 'text-[#81D7B4] bg-[#81D7B4]/5 border-[#81D7B4]/20'; barColor = 'bg-[#81D7B4]'; }

                      return (
                        <div key={inst} className={`p-5 rounded-2xl border ${instColor}`}>
                          <p className="text-sm font-bold text-slate-600 mb-1">{inst}</p>
                          <p className="text-2xl font-black text-slate-900">${val.toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Activity Feed */}
                <div>
                  <h3 className="text-lg font-black font-display text-slate-900 mb-4 flex items-center gap-2">
                    <Activity01Icon className="w-5 h-5 text-[#81D7B4]" /> Transaction History
                  </h3>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Instrument</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedUser.actions.map((action: any, i: number) => {
                          let dotColor = 'bg-slate-400';
                          if (action.instrument === 'BizYield') dotColor = 'bg-[#FF6B6B]';
                          if (action.instrument === 'BizCredit') dotColor = 'bg-[#3B82F6]';
                          if (action.instrument === 'BizBond') dotColor = 'bg-[#81D7B4]';

                          return (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">
                                {action.action}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                                  <span className="text-sm font-bold text-slate-600">{action.instrument}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-black text-slate-900">${action.amount.toLocaleString()}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                {new Date(action.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#81D7B4]/10 text-[#81D7B4] border border-[#81D7B4]/20">
                                  {action.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
