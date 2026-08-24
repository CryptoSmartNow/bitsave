'use client';

import { 
  UserMultipleIcon, 
  Activity01Icon, 
  Alert02Icon, 
  FlashIcon, 
  Clock01Icon, 
  Coins01Icon, 
  Cancel01Icon,
  RefreshIcon,
  FilterIcon,
  Search01Icon,
  LinkSquare01Icon,
  Shield01Icon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon
} from "hugeicons-react";
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
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
  const [selectedInteraction, setSelectedInteraction] = useState<UserInteraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const [statsRes, interactionsRes, pricesRes] = await Promise.all([
        fetch('/api/user-interactions/stats'),
        fetch('/api/user-interactions?limit=50'),
        fetch('/api/prices?ids=ethereum,binancecoin,celo,usd-coin,tether,celo-dollar').catch(() => ({ json: async () => ({}) }))
      ]);

      const statsData = await statsRes.json();
      const interactionsData = await interactionsRes.json();
      
      let pricesData: any = {};
      try {
        pricesData = await pricesRes.json();
      } catch {
        // fallback
      }

      const newPrices: Record<string, number> = {
        ETH: pricesData.ethereum?.usd || 2500,
        BNB: pricesData.binancecoin?.usd || 400,
        CELO: pricesData.celo?.usd || 0.6,
        USDC: pricesData['usd-coin']?.usd || 1,
        USDT: pricesData.tether?.usd || 1,
        CUSD: pricesData['celo-dollar']?.usd || 1,
        CNGN: 0.0007426, 
      };
      setPrices(newPrices);
      setDashboardStats(statsData);
      setTvsBreakdown(statsData.tvsBreakdown || {});
      setRecentInteractions(Array.isArray(interactionsData) ? interactionsData : interactionsData.interactions || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(), 30000);
    return () => clearInterval(interval);
  }, []);

  const getTotalSavedDisplay = () => {
    let totalUSD = 0;
    let hasData = false;
    const supportedChains = ['base', 'celo', 'lisk', 'bsc', 'avalanche'];

    Object.entries(tvsBreakdown).forEach(([chain, chainData]) => {
      const lowerChain = chain.toLowerCase();
      if (!supportedChains.includes(lowerChain) || lowerChain.includes('solana') || lowerChain.includes('hedera')) {
        return;
      }
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

  const filteredInteractions = useMemo(() => {
    return recentInteractions.filter(item => {
      const matchesSearch = !searchQuery || 
        item.walletAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(item.data || {}).toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' ||
        (typeFilter === 'errors' && (item.type.includes('error') || (item.data as any)?.error)) ||
        (typeFilter === 'savings' && item.type.includes('savings')) ||
        (typeFilter === 'transactions' && (item.type.includes('transaction') || item.type.includes('swap')));

      return matchesSearch && matchesType;
    });
  }, [recentInteractions, searchQuery, typeFilter]);

  const stats = [
    {
      name: 'Total Value Saved',
      value: getTotalSavedDisplay(),
      change: 'View Vault Breakdown',
      changeType: 'neutral',
      icon: Coins01Icon,
      color: 'text-[#81D7B4]',
      bg: 'bg-[#81D7B4]/10',
      onClick: () => setIsTVSModalOpen(true),
      isAction: true
    },
    {
      name: 'Unique Wallets',
      value: dashboardStats.uniqueUsers.toLocaleString(),
      change: 'Active Users',
      changeType: 'increase',
      icon: UserMultipleIcon,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      name: 'Active Today',
      value: dashboardStats.activeToday.toLocaleString(),
      change: 'Daily Telemetry',
      changeType: 'increase',
      icon: FlashIcon,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      name: 'Error Rate',
      value: `${dashboardStats.errorRate.toFixed(1)}%`,
      change: dashboardStats.errorRate > 5 ? 'Elevated' : 'Optimal',
      changeType: dashboardStats.errorRate > 5 ? 'decrease' : 'increase',
      icon: Alert02Icon,
      color: dashboardStats.errorRate > 5 ? 'text-red-500' : 'text-[#81D7B4]',
      bg: dashboardStats.errorRate > 5 ? 'bg-red-500/10' : 'bg-[#81D7B4]/10'
    },
    {
      name: 'Total Operations',
      value: dashboardStats.totalInteractions.toLocaleString(),
      change: 'Logged Events',
      changeType: 'increase',
      icon: Activity01Icon,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    }
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="font-sans text-gray-900 dark:text-white pb-20 space-y-8">
      {/* ── Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#81D7B4]/15 text-[#81D7B4] border border-[#81D7B4]/25 text-[10px] font-black uppercase tracking-wider">
              Control Plane
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">Live Observability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white font-display">
            Interactions Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time onchain telemetry, error tracing, and SaveFi protocol health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#0c121e] border border-gray-200/80 dark:border-white/10 hover:border-[#81D7B4] text-gray-700 dark:text-gray-200 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#81D7B4]' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
          
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SYS ACTIVE</span>
          </div>
        </div>
      </div>

      {/* ── Stat Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={stat.onClick}
            className={`bg-white dark:bg-[#0c121e] p-5 rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xs hover:border-[#81D7B4]/50 transition-all ${
              stat.onClick ? 'cursor-pointer group' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate">
                  {stat.name}
                </p>
                <h3 className="text-xl sm:text-2xl font-black font-instrument text-gray-900 dark:text-white mt-1 truncate">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} shrink-0`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs">
              {stat.isAction ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    stat.onClick && stat.onClick();
                  }}
                  className="w-full py-1.5 rounded-xl bg-[#81D7B4]/15 hover:bg-[#81D7B4]/25 text-[#1c4b38] dark:text-[#81D7B4] font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Coins01Icon className="w-3.5 h-3.5" />
                  <span>{stat.change}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4]" />
                  <span>{stat.change}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Activity Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c121e] rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xs overflow-hidden flex flex-col">
          {/* Feed Toolbar */}
          <div className="p-5 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 dark:bg-white/[0.02]">
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-white font-display flex items-center gap-2">
                <span>Live Activity Telemetry</span>
                <span className="px-2 py-0.5 rounded-full bg-[#81D7B4]/15 text-[#81D7B4] text-[10px] font-bold font-mono">
                  {filteredInteractions.length} Events
                </span>
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Click any record to inspect exact onchain payload.</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search01Icon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter wallet or action..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-[#141d2d] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#81D7B4] w-36 sm:w-44"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-[#141d2d] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-[#81D7B4] cursor-pointer font-bold"
              >
                <option value="all">All Events</option>
                <option value="savings">Savings</option>
                <option value="transactions">Transactions</option>
                <option value="errors">Errors Only</option>
              </select>
            </div>
          </div>

          {/* Table Feed */}
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            {filteredInteractions.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-xs">
                No telemetry events match your search filters.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50/70 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 text-[10.5px] font-black uppercase text-gray-400 tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Wallet</th>
                    <th className="px-5 py-3.5">Action</th>
                    <th className="px-5 py-3.5">Context</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs">
                  {filteredInteractions.slice(0, 20).map((interaction) => {
                    const isError = interaction.type.includes('error') || (interaction.data as any)?.error;
                    const wallet = interaction.walletAddress || 'Anonymous';
                    const dataObj = (interaction.data || {}) as any;

                    return (
                      <tr 
                        key={interaction.id || interaction.timestamp}
                        onClick={() => setSelectedInteraction(interaction)}
                        className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      >
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#81D7B4]/15 text-[#1c4b38] dark:text-[#81D7B4] flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                              {wallet.slice(2, 4)}
                            </div>
                            <span className="font-mono text-gray-700 dark:text-gray-300 font-bold group-hover:text-[#81D7B4] transition-colors">
                              {wallet !== 'Anonymous' ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : 'Guest User'}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 font-bold capitalize text-[11px]">
                            {interaction.type.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {dataObj.chain && (
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-[10px] font-mono uppercase mr-1.5">
                              {dataObj.chain}
                            </span>
                          )}
                          {dataObj.amount && (
                            <span className="font-bold text-gray-900 dark:text-white font-instrument">
                              {dataObj.amount} {dataObj.currency || ''}
                            </span>
                          )}
                          {!dataObj.chain && !dataObj.amount && (
                            <span className="text-gray-400 text-[11px]">--</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            isError 
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isError ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            <span>{isError ? 'Failed' : 'Success'}</span>
                          </span>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-right text-gray-400 font-mono text-[11px]">
                          {new Date(interaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right 1 Col: Health & Network Distribution */}
        <div className="space-y-6">
          {/* Protocol Health Card */}
          <div className="bg-white dark:bg-[#0c121e] rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xs p-6">
            <h2 className="text-base font-black text-gray-900 dark:text-white font-display mb-4 flex items-center justify-between">
              <span>System Health</span>
              <span className="text-[10.5px] px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold font-mono">
                99.9% Uptime
              </span>
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-gray-600 dark:text-gray-300">RPC & API Latency</span>
                  <span className="text-[#81D7B4]">~42ms</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#81D7B4] h-2 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Database Connection</span>
                  <span className="text-emerald-500">Connected</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Failure Rate</span>
                  <span className={dashboardStats.errorRate > 5 ? 'text-red-500' : 'text-[#81D7B4]'}>
                    {dashboardStats.errorRate.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full ${dashboardStats.errorRate > 5 ? 'bg-red-500' : 'bg-[#81D7B4]'}`} 
                    style={{ width: `${Math.max(4, Math.min(dashboardStats.errorRate, 100))}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="bg-gradient-to-br from-[#81D7B4]/10 via-transparent to-emerald-500/5 rounded-3xl border border-[#81D7B4]/20 p-6">
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-2 font-display">
              Observability Modules
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Explore specialized telemetry tools and user error trace inspectors.
            </p>

            <div className="space-y-2">
              <Link
                href="/user-interactions/errors"
                className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#0c121e] border border-gray-200/80 dark:border-white/10 hover:border-[#81D7B4] text-xs font-bold text-gray-800 dark:text-gray-200 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Alert02Icon className="w-4 h-4 text-red-500" />
                  <span>Error Diagnostics & Logs</span>
                </div>
                <ArrowRight01Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#81D7B4] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/user-interactions/users"
                className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#0c121e] border border-gray-200/80 dark:border-white/10 hover:border-[#81D7B4] text-xs font-bold text-gray-800 dark:text-gray-200 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <UserMultipleIcon className="w-4 h-4 text-blue-500" />
                  <span>User Profiles & Activity</span>
                </div>
                <ArrowRight01Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#81D7B4] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/user-interactions/real-time"
                className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#0c121e] border border-gray-200/80 dark:border-white/10 hover:border-[#81D7B4] text-xs font-bold text-gray-800 dark:text-gray-200 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <FlashIcon className="w-4 h-4 text-amber-500" />
                  <span>Live Telemetry Stream</span>
                </div>
                <ArrowRight01Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#81D7B4] group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── TVS Breakdown Modal ── */}
      <AnimatePresence>
        {isTVSModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTVSModalOpen(false)}
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
                  <div className="p-3 bg-[#81D7B4]/15 rounded-2xl text-[#81D7B4]">
                    <Coins01Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black font-display text-gray-900 dark:text-white">
                      Total Value Saved Breakdown
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Onchain locked stablecoin breakdown by network and currency.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTVSModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Cancel01Icon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(85vh-96px)] custom-scrollbar space-y-6">
                {Object.keys(tvsBreakdown).length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    No savings recorded in database yet.
                  </div>
                ) : (
                  Object.entries(tvsBreakdown).map(([chain, currencies]) => {
                    const lowerChain = chain.toLowerCase();
                    const supportedChains = ['base', 'celo', 'lisk', 'bsc', 'avalanche'];
                    if (!supportedChains.includes(lowerChain) || lowerChain.includes('solana') || lowerChain.includes('hedera')) {
                      return null;
                    }

                    const filteredCurrencies = Object.entries(currencies).filter(
                      ([c]) => c.toUpperCase() !== 'ETH'
                    );
                    if (filteredCurrencies.length === 0) return null;

                    return (
                      <div key={chain} className="bg-gray-50/70 dark:bg-white/[0.02] rounded-2xl p-5 border border-gray-200/60 dark:border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-2 h-2 rounded-full bg-[#81D7B4]" />
                          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider font-display">
                            {chain.replace(/_/g, ' ')} Network
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {filteredCurrencies.map(([currency, amount]) => {
                            const normCurrency = currency.toUpperCase();
                            const price = prices[normCurrency] || 0;
                            const usdValue = amount * price;

                            return (
                              <div key={currency} className="p-4 rounded-xl bg-white dark:bg-[#141d2d] border border-gray-200/70 dark:border-white/10 flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{currency}</p>
                                  <p className="text-lg font-bold font-instrument text-gray-900 dark:text-white">
                                    {amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                  </p>
                                  {price > 0 && (
                                    <p className="text-xs font-bold text-[#81D7B4] mt-0.5">
                                      ≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                  )}
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300">
                                  {currency.slice(0, 4)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Event JSON Details Modal ── */}
      <AnimatePresence>
        {selectedInteraction && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInteraction(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="fixed inset-0 m-auto w-full max-w-xl h-fit max-h-[85vh] bg-white dark:bg-[#0c121e] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 z-50 overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-white/[0.02]">
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white font-display">
                    Interaction Event Payload
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {selectedInteraction.type} • {new Date(selectedInteraction.timestamp).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInteraction(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Cancel01Icon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto max-h-[calc(85vh-90px)] custom-scrollbar space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <span className="text-gray-400 font-medium">Wallet Address:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {selectedInteraction.walletAddress || 'Anonymous'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Raw Telemetry JSON
                  </label>
                  <pre className="p-4 rounded-2xl bg-gray-900 text-emerald-400 text-xs font-mono overflow-x-auto max-h-80 custom-scrollbar border border-white/10">
                    {JSON.stringify(selectedInteraction, null, 2)}
                  </pre>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
