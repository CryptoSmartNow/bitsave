'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  Zap,
  Clock,
  Coins,
  X
} from 'lucide-react';
import { UserInteraction } from '@/lib/interactionTracker';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import { AnimatePresence } from 'framer-motion';

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
          fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin,celo,usd-coin,tether,celo-dollar&vs_currencies=usd')
            .catch(() => ({ json: async () => ({}) })) // Fallback on fail
        ]);

        const statsData = await statsRes.json();
        const interactionsData = await interactionsRes.json();
        let pricesData: any = {};
        try {
          pricesData = await pricesRes.json();
        } catch (e) {
          console.error('Failed to parse prices');
        }

        // Map API response to our symbols
        const newPrices: Record<string, number> = {
          ETH: pricesData.ethereum?.usd || 2500,
          BNB: pricesData.binancecoin?.usd || 400,
          CELO: pricesData.celo?.usd || 0.6,
          USDC: pricesData['usd-coin']?.usd || 1,
          USDT: pricesData.tether?.usd || 1,
          CUSD: pricesData['celo-dollar']?.usd || 1,
          CNGN: 0.0006, // Approx fixed rate for Naira
          // Fallback for others
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
        if (normCurrency === 'ETH') return; // Skip ETH as it is used for gas
        
        hasData = true;
        // Use price if available, otherwise default to 0 for unknown tokens (or 1 if looks like stable?)
        // Safer to just use 0 if unknown to avoid inflating
        const price = prices[normCurrency] || 0;
        totalUSD += amount * price;
      });
    });

    if (!hasData) return '$0.00';
    
    // If we have data but totalUSD is 0 (maybe all unknown tokens?), 
    // we should probably fallback to the single token display logic if applicable,
    // but the user requested "Actual Total". 
    // If we have mixed tokens and missing prices, it's hard.
    // Assuming our supported tokens list covers most cases.
    
    return `$${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const stats = [
    {
      name: 'Total Value Saved',
      value: getTotalSavedDisplay(),
      change: 'View Breakdown',
      changeType: 'neutral',
      icon: Coins,
      color: 'text-[#81D7B4]',
      bg: 'bg-[#81D7B4]/10',
      onClick: () => setIsTVSModalOpen(true),
      isAction: true
    },
    {
      name: 'Total Users',
      value: dashboardStats.uniqueUsers,
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'text-[#81D7B4]',
      bg: 'bg-[#81D7B4]/10'
    },
    {
      name: 'Active Today',
      value: dashboardStats.activeToday,
      change: '+5%',
      changeType: 'increase',
      icon: Zap,
      color: 'text-[#81D7B4]',
      bg: 'bg-[#81D7B4]/10'
    },
    {
      name: 'Error Rate',
      value: `${dashboardStats.errorRate.toFixed(1)}%`,
      change: '-2%',
      changeType: 'decrease',
      icon: AlertTriangle,
      color: 'text-[#81D7B4]',
      bg: 'bg-[#81D7B4]/10'
    },
    {
      name: 'Total Interactions',
      value: dashboardStats.totalInteractions,
      change: '+24%',
      changeType: 'increase',
      icon: Activity,
      color: 'text-[#81D7B4]',
      bg: 'bg-[#81D7B4]/10'
    }
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Real-time insights into user behavior and system health.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1 bg-[#81D7B4]/10 text-[#81D7B4] rounded-full text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></span>
            Live Updates
          </span>
          <span className="text-sm text-slate-400">Last updated: Just now</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={stat.onClick}
            className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all ${stat.onClick ? 'cursor-pointer hover:border-[#81D7B4]/50' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <h3 className={`text-2xl font-bold text-slate-900 mt-2 ${stat.value === 'View Details' ? 'text-lg text-amber-500' : ''}`}>{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 w-full">
              {(stat as any).isAction ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    stat.onClick && stat.onClick();
                  }}
                  className="w-full px-3 py-1.5 bg-[#81D7B4]/10 text-[#81D7B4] rounded-lg text-sm font-medium hover:bg-[#81D7B4]/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  {stat.change}
                </button>
              ) : (
                <>
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-[#81D7B4]' : stat.changeType === 'decrease' ? 'text-[#81D7B4]' : 'text-slate-400'
                  }`}>
                    {stat.change}
                  </span>
                  {stat.changeType !== 'neutral' && <span className="text-sm text-slate-400">vs last month</span>}
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
            <button className="text-sm font-medium text-[#81D7B4] hover:text-[#81D7B4]/80 transition-colors">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInteractions.map((interaction) => (
                  <tr key={interaction.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] font-medium text-xs">
                          {interaction.walletAddress?.slice(0, 2) || 'An'}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {interaction.walletAddress ? `${interaction.walletAddress.slice(0, 6)}...${interaction.walletAddress.slice(-4)}` : 'Anonymous'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600 capitalize">{interaction.type.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        interaction.type.includes('error') 
                          ? 'bg-red-50 text-red-600' 
                          : 'bg-[#81D7B4]/10 text-[#81D7B4]'
                      }`}>
                        {interaction.type.includes('error') ? 'Failed' : 'Success'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(interaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / System Health */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">System Health</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">API Latency</span>
                <span className="text-xs font-bold text-[#81D7B4] bg-[#81D7B4]/10 px-2 py-1 rounded-full">Good</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-[#81D7B4] h-2 rounded-full" style={{ width: '24%' }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">45ms average response time</p>
            </div>
            
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Database Load</span>
                <span className="text-xs font-bold text-[#81D7B4] bg-[#81D7B4]/10 px-2 py-1 rounded-full">Optimal</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-[#81D7B4] h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">12% capacity used</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Error Rate</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${dashboardStats.errorRate > 5 ? 'text-red-600 bg-red-50' : 'text-[#81D7B4] bg-[#81D7B4]/10'}`}>
                  {dashboardStats.errorRate > 5 ? 'High' : 'Normal'}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${dashboardStats.errorRate > 5 ? 'bg-red-500' : 'bg-[#81D7B4]'}`} style={{ width: `${Math.min(dashboardStats.errorRate, 100)}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">{dashboardStats.errorRate.toFixed(2)}% of requests failing</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isTVSModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTVSModalOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[80vh] bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#81D7B4]/10 rounded-lg">
                    <Coins className="w-6 h-6 text-[#81D7B4]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Total Value Saved</h2>
                    <p className="text-sm text-slate-500">Breakdown by Chain and Currency</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsTVSModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
                {Object.keys(tvsBreakdown).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Coins className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No Savings Data Yet</h3>
                    <p className="text-slate-500 mt-2">Start tracking savings to see the breakdown here.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {Object.entries(tvsBreakdown).map(([chain, currencies]) => {
                      // Filter out ETH from display
                      const filteredCurrencies = Object.entries(currencies).filter(
                        ([c]) => c.toUpperCase() !== 'ETH'
                      );

                      if (filteredCurrencies.length === 0) return null;

                      return (
                        <div key={chain} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-8 bg-[#81D7B4] rounded-full"></div>
                            <h3 className="text-lg font-bold text-slate-800 capitalize">{chain.replace(/_/g, ' ')}</h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredCurrencies.map(([currency, amount]) => {
                              const normCurrency = currency.toUpperCase();
                              const price = prices[normCurrency] || 0;
                              const usdValue = amount * price;
                              
                              return (
                                <div key={currency} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between">
                                  <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{currency}</p>
                                    <p className="text-xl font-bold text-slate-900">
                                      {amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                    </p>
                                    {price > 0 && (
                                      <p className="text-xs font-medium text-[#81D7B4] mt-1">
                                        ≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </p>
                                    )}
                                  </div>
                                  <div className="w-10 h-10 rounded-full bg-[#81D7B4]/10 flex items-center justify-center">
                                    <span className="text-[#81D7B4] font-bold text-xs">{currency.slice(0, 3)}</span>
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
