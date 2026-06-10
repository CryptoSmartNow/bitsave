'use client';

import { UserMultipleIcon, Activity01Icon, Alert02Icon, FlashIcon, Clock01Icon, Coins01Icon, Cancel01Icon } from "hugeicons-react";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserInteraction } from '@/lib/interactionTracker';
import DashboardSkeleton from '@/components/DashboardSkeleton';

export default function DashboardOverview() {
  const [recentInteractions, setRecentInteractions] = useState<UserInteraction[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalInteractions: 0,
    uniqueUsers: 0,
    errorRate: 0,
    activeToday: 0
  });
  const [tvsBreakdown, setTvsBreakdown] = useState<Record<string, Record<string, number>>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isTVSModalOpen, setIsTVSModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Parallel fetch for performance
        const [statsRes, interactionsRes, pricesRes] = await Promise.all([
          fetch('/api/user-interactions/stats'),
          fetch('/api/user-interactions?limit=20'),
          fetch('/api/prices?ids=ethereum,binancecoin,celo,usd-coin,tether,celo-dollar').catch(() => ({ json: async () => ({}) }))
        ]);

        const statsData = await statsRes.json();
        const interactionsData = await interactionsRes.json();
        
        let pricesData: any = {};
        try {
          pricesData = await pricesRes.json();
        } catch (e) {
          console.error('Failed to parse prices');
        }

        const newPrices: Record<string, number> = {
          ETH: pricesData.ethereum?.usd || 2500,
          BNB: pricesData.binancecoin?.usd || 400,
          CELO: pricesData.celo?.usd || 0.6,
          USDC: pricesData['usd-coin']?.usd || 1,
          USDT: pricesData.tether?.usd || 1,
          CUSD: pricesData['celo-dollar']?.usd || 1,
          CNGN: 0.0006, 
        };
        setPrices(newPrices);
        setDashboardStats(statsData);
        setTvsBreakdown(statsData.tvsBreakdown || {});
        setRecentInteractions(interactionsData);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getTotalSavedDisplay = () => {
    let totalUSD = 0;
    let hasData = false;

    Object.values(tvsBreakdown).forEach(chainData => {
      Object.entries(chainData).forEach(([currency, amount]) => {
        const normCurrency = currency.toUpperCase();
        if (normCurrency === 'ETH') return; 
        hasData = true;
        const price = prices[normCurrency] || 0;
        totalUSD += amount * price;
      });
    });

    if (!hasData) return '$0.00';
    return `$${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const stats = [
    {
      name: 'Total Value Saved',
      value: getTotalSavedDisplay(),
      change: 'View Breakdown',
      changeType: 'neutral',
      icon: Coins01Icon,
      color: 'text-[#81D7B4]',
      bg: 'bg-[#81D7B4]/10',
      onClick: () => setIsTVSModalOpen(true),
      isAction: true
    },
    {
      name: 'Unique Users',
      value: dashboardStats.uniqueUsers,
      change: '+12%',
      changeType: 'increase',
      icon: UserMultipleIcon,
      color: 'text-[#81D7B4]',
      bg: 'bg-[#81D7B4]/10'
    },
    {
      name: 'Active Today',
      value: dashboardStats.activeToday,
      change: '+5%',
      changeType: 'increase',
      icon: FlashIcon,
      color: 'text-[#81D7B4]',
      bg: 'bg-[#81D7B4]/10'
    },
    {
      name: 'Error Rate',
      value: `${dashboardStats.errorRate.toFixed(1)}%`,
      change: '-2%',
      changeType: 'decrease',
      icon: Alert02Icon,
      color: 'text-[#81D7B4]',
      bg: 'bg-[#81D7B4]/10'
    },
    {
      name: 'Total Interactions',
      value: dashboardStats.totalInteractions,
      change: '+24%',
      changeType: 'increase',
      icon: Activity01Icon,
      color: 'text-[#81D7B4]',
      bg: 'bg-[#81D7B4]/10'
    }
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div style={{ zoom: 0.8 }} className="font-sans text-slate-900 pb-20">
      <div className="space-y-12">
        
        {/* SaveFi Platform interactions */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-4xl font-black font-display text-slate-900 tracking-tight">Platform Overview</h1>
              <p className="text-slate-500 mt-2 text-lg">Real-time insights into user behavior and SaveFi health.</p>
            </div>
            <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
              <span className="flex items-center gap-2 px-4 py-2 bg-[#81D7B4]/10 text-[#81D7B4] rounded-lg text-sm font-bold tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-[#81D7B4] animate-pulse"></span>
                LIVE STATUS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {stats.map((stat) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={stat.onClick}
                className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${stat.onClick ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider truncate">{stat.name}</p>
                    <h3 className="text-2xl xl:text-3xl font-black font-display text-slate-900 mt-2 truncate">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 w-full">
                  {(stat as any).isAction ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        stat.onClick && stat.onClick();
                      }}
                      className="w-full px-4 py-2.5 bg-[#81D7B4]/10 text-[#81D7B4] rounded-xl text-sm font-bold hover:bg-[#81D7B4]/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Coins01Icon className="w-4 h-4" />
                      {stat.change}
                    </button>
                  ) : (
                    <>
                      <span className={`text-sm font-bold ${stat.changeType === 'increase' ? 'text-[#81D7B4]' : stat.changeType === 'decrease' ? 'text-[#81D7B4]' : 'text-slate-400'}`}>
                        {stat.change}
                      </span>
                      {stat.changeType !== 'neutral' && <span className="text-sm font-medium text-slate-400">vs last month</span>}
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-black font-display text-slate-900">Recent Activity</h2>
                <button className="text-sm font-bold text-[#81D7B4] hover:text-[#81D7B4]/80 transition-colors px-4 py-2 rounded-lg hover:bg-[#81D7B4]/10">
                  View All Feed
                </button>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full">
                  <thead className="bg-white border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentInteractions.map((interaction) => (
                      <tr key={interaction.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shadow-sm transition-all">
                              {interaction.walletAddress?.slice(0, 2) || 'An'}
                            </div>
                            <span className="text-sm font-bold text-slate-700">
                              {interaction.walletAddress ? `${interaction.walletAddress.slice(0, 6)}...${interaction.walletAddress.slice(-4)}` : 'Anonymous'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-600 capitalize bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            {interaction.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${interaction.type.includes('error')
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : 'bg-[#81D7B4]/10 text-[#81D7B4] border border-[#81D7B4]/20'
                            }`}>
                            {interaction.type.includes('error') ? 'Failed' : 'Success'}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 font-medium">
                          <div className="flex items-center gap-2">
                            <Clock01Icon className="w-4 h-4 text-slate-400" />
                            {new Date(interaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col self-start">
              <h2 className="text-xl font-black font-display text-slate-900 mb-6">System Health</h2>
              <div className="space-y-6 flex-1">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-600">API Latency</span>
                    <span className="text-xs font-black text-[#81D7B4] bg-[#81D7B4]/10 px-3 py-1 rounded-lg uppercase tracking-wide">Good</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#81D7B4] h-2.5 rounded-full" style={{ width: '24%' }}></div>
                  </div>
                  <p className="text-xs font-medium text-slate-400 mt-3">45ms average response time</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-600">Database Load</span>
                    <span className="text-xs font-black text-[#81D7B4] bg-[#81D7B4]/10 px-3 py-1 rounded-lg uppercase tracking-wide">Optimal</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#81D7B4] h-2.5 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                  <p className="text-xs font-medium text-slate-400 mt-3">12% capacity used</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-600">Error Rate</span>
                    <span className={`text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wide ${dashboardStats.errorRate > 5 ? 'text-red-600 bg-red-50' : 'text-[#81D7B4] bg-[#81D7B4]/10'}`}>
                      {dashboardStats.errorRate > 5 ? 'High' : 'Normal'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-2.5 rounded-full ${dashboardStats.errorRate > 5 ? 'bg-red-500' : 'bg-[#81D7B4]'}`} style={{ width: `${Math.min(dashboardStats.errorRate, 100)}%` }}></div>
                  </div>
                  <p className="text-xs font-medium text-slate-400 mt-3">{dashboardStats.errorRate.toFixed(2)}% of requests failing</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      <AnimatePresence>
        {isTVSModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTVSModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[85vh] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white border border-slate-100 shadow-sm rounded-2xl">
                    <Coins01Icon className="w-6 h-6 text-[#81D7B4]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight">Total Value Saved</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">Breakdown by Chain and Currency</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTVSModalOpen(false)}
                  className="p-2.5 hover:bg-slate-200/50 bg-white border border-slate-200 rounded-xl transition-all active:scale-95"
                >
                  <Cancel01Icon className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(85vh-96px)] custom-scrollbar">
                {Object.keys(tvsBreakdown).length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                      <Coins01Icon className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black font-display text-slate-900">No Savings Data Yet</h3>
                    <p className="text-slate-500 font-medium mt-2">Start tracking savings to see the breakdown here.</p>
                  </div>
                ) : (
                  <div className="grid gap-8">
                    {Object.entries(tvsBreakdown).map(([chain, currencies]) => {
                      const filteredCurrencies = Object.entries(currencies).filter(
                        ([c]) => c.toUpperCase() !== 'ETH'
                      );

                      if (filteredCurrencies.length === 0) return null;

                      return (
                        <div key={chain} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-2.5 h-8 bg-[#81D7B4] rounded-full"></div>
                            <h3 className="text-xl font-black font-display text-slate-900 capitalize">{chain.replace(/_/g, ' ')}</h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredCurrencies.map(([currency, amount]) => {
                              const normCurrency = currency.toUpperCase();
                              const price = prices[normCurrency] || 0;
                              const usdValue = amount * price;

                              return (
                                <div key={currency} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-[#81D7B4]/30 transition-all">
                                  <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{currency}</p>
                                    <p className="text-2xl font-black font-display text-slate-900">
                                      {amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                    </p>
                                    {price > 0 && (
                                      <p className="text-sm font-bold text-[#81D7B4] mt-1">
                                        ≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </p>
                                    )}
                                  </div>
                                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:bg-[#81D7B4]/10 group-hover:border-[#81D7B4]/20 transition-colors">
                                    <span className="text-slate-900 group-hover:text-[#81D7B4] font-black text-xs transition-colors">{currency.slice(0, 3)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
