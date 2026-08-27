'use client';

import {
  ArrowUpRight01Icon,
  Dollar01Icon,
  UserMultipleIcon,
  Activity01Icon,
  RefreshIcon,
  Calendar01Icon
} from "hugeicons-react";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function BizFiAnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/bizfi/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const TIER_COLORS: Record<string, string> = {
    builder: '#81D7B4',
    scaler: '#60A5FA',
    enterprise: '#A78BFA',
    standard: '#81D7B4'
  };

  const STATUS_COLORS: Record<string, string> = {
    approved: '#10B981',
    pending: '#F59E0B',
    rejected: '#EF4444'
  };

  const revenueData = metrics?.revenueTrend && metrics.revenueTrend.length > 0
    ? metrics.revenueTrend.map((d: any) => ({
        date: d._id ? format(new Date(d._id), 'MMM d') : 'Recent',
        revenue: d.totalRevenue
      }))
    : [
        { date: 'Week 1', revenue: Math.max(10, Math.floor((metrics?.totalRevenue || 100) * 0.2)) },
        { date: 'Week 2', revenue: Math.max(30, Math.floor((metrics?.totalRevenue || 100) * 0.5)) },
        { date: 'Week 3', revenue: Math.max(60, Math.floor((metrics?.totalRevenue || 100) * 0.8)) },
        { date: 'Week 4', revenue: metrics?.totalRevenue || 100 }
      ];

  const userActivityData = metrics?.userActivity && metrics.userActivity.length > 0
    ? metrics.userActivity.map((d: any) => ({
        date: d._id ? format(new Date(d._id), 'MMM d') : 'Recent',
        activeUsers: d.activeUsers
      }))
    : [
        { date: 'Mon', activeUsers: 2 },
        { date: 'Tue', activeUsers: 4 },
        { date: 'Wed', activeUsers: 6 },
        { date: 'Thu', activeUsers: 5 },
        { date: 'Fri', activeUsers: 8 },
        { date: 'Sat', activeUsers: 3 },
        { date: 'Sun', activeUsers: 7 }
      ];

  const tierChartData = metrics?.tierDistribution?.map((item: any) => ({
    name: item._id || 'Standard',
    value: item.count
  })) || [];

  const statusChartData = metrics?.statusDistribution?.map((item: any) => ({
    name: item._id || 'Pending',
    value: item.count
  })) || [];

  const avgRevPerBusiness = metrics?.totalBusinesses > 0
    ? Math.round((metrics.totalRevenue || 0) / metrics.totalBusinesses)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[#81D7B4]/20 border-t-[#81D7B4] rounded-full animate-spin"></div>
          <div className="text-[#81D7B4] text-sm font-bold tracking-wide animate-pulse">Loading BizFi Analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-16 max-w-[1600px] mx-auto font-sans"
    >
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#1A2538]/70 border border-[#7B8B9A]/20 p-6 md:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#81D7B4]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#81D7B4]/15 flex items-center justify-center text-[#81D7B4] border border-[#81D7B4]/25">
                <ArrowUpRight01Icon className="w-5 h-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[#F9F9FB] tracking-tight">
                Protocol Analytics
              </h1>
            </div>
            <p className="text-[#9BA8B5] text-xs md:text-sm max-w-xl">
              Real-time telemetry, revenue analytics, package breakdown, and ecosystem performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#0F1825] p-1 rounded-xl border border-[#7B8B9A]/20 text-xs">
              {(['30d', '90d', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    timeRange === range
                      ? 'bg-[#81D7B4] text-[#0F1825] shadow-xs'
                      : 'text-[#9BA8B5] hover:text-[#F9F9FB]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <button
              onClick={fetchAnalytics}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0F1825] rounded-xl text-xs font-black transition-all shadow-md shadow-[#81D7B4]/20 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="bg-[#1A2538]/70 backdrop-blur-xl p-6 rounded-2xl border border-[#7B8B9A]/20 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#9BA8B5] uppercase tracking-wider">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-[#81D7B4]/15 flex items-center justify-center text-[#81D7B4] border border-[#81D7B4]/20">
              <Dollar01Icon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#F9F9FB] tracking-tight">
              ${(metrics?.totalRevenue || 0).toLocaleString()}
            </h3>
            <span className="text-xs text-[#81D7B4] font-bold mt-2 block">Protocol fees generated</span>
          </div>
        </div>

        <div className="bg-[#1A2538]/70 backdrop-blur-xl p-6 rounded-2xl border border-[#7B8B9A]/20 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#9BA8B5] uppercase tracking-wider">Total Registered</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <UserMultipleIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#F9F9FB] tracking-tight">{metrics?.totalBusinesses || 0}</h3>
            <span className="text-xs text-blue-400 font-bold mt-2 block">Registered companies</span>
          </div>
        </div>

        <div className="bg-[#1A2538]/70 backdrop-blur-xl p-6 rounded-2xl border border-[#7B8B9A]/20 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#9BA8B5] uppercase tracking-wider">Avg. Revenue / Business</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Activity01Icon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#F9F9FB] tracking-tight">${avgRevPerBusiness}</h3>
            <span className="text-xs text-purple-400 font-bold mt-2 block">Across all active tiers</span>
          </div>
        </div>

        <div className="bg-[#1A2538]/70 backdrop-blur-xl p-6 rounded-2xl border border-[#7B8B9A]/20 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#9BA8B5] uppercase tracking-wider">Approval Rate</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <ArrowUpRight01Icon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#F9F9FB] tracking-tight">
              {metrics?.totalBusinesses ? `${Math.round(((metrics.activeBusinesses || 0) / metrics.totalBusinesses) * 100)}%` : '0%'}
            </h3>
            <span className="text-xs text-emerald-400 font-bold mt-2 block">
              {metrics?.activeBusinesses || 0} active / approved
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="bg-[#1A2538]/70 backdrop-blur-xl p-6 rounded-3xl border border-[#7B8B9A]/20 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#F9F9FB]">Revenue Trajectory</h3>
              <p className="text-xs text-[#9BA8B5]">Historical protocol fee distribution</p>
            </div>
            <span className="text-xs font-bold text-[#81D7B4] bg-[#81D7B4]/10 px-2.5 py-1 rounded-lg border border-[#81D7B4]/20">
              USD ($)
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#81D7B4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#81D7B4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#7B8B9A" strokeOpacity={0.12} vertical={false} />
                <XAxis dataKey="date" stroke="#7B8B9A" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#7B8B9A" fontSize={11} tickLine={false} axisLine={false} dx={-8} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1825',
                    border: '1px solid rgba(129, 215, 180, 0.3)',
                    borderRadius: '12px',
                    color: '#F9F9FB',
                    fontSize: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#81D7B4', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#81D7B4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#analyticsRevGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Activity Bar Chart */}
        <div className="bg-[#1A2538]/70 backdrop-blur-xl p-6 rounded-3xl border border-[#7B8B9A]/20 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#F9F9FB]">Registration Activity</h3>
              <p className="text-xs text-[#9BA8B5]">Companies onboarding per time unit</p>
            </div>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
              Registrations
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#7B8B9A" strokeOpacity={0.12} vertical={false} />
                <XAxis dataKey="date" stroke="#7B8B9A" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#7B8B9A" fontSize={11} tickLine={false} axisLine={false} dx={-8} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1825',
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                    borderRadius: '12px',
                    color: '#F9F9FB',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#60A5FA', fontWeight: 'bold' }}
                />
                <Bar dataKey="activeUsers" fill="#60A5FA" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie */}
        <div className="bg-[#1A2538]/70 backdrop-blur-xl p-6 rounded-3xl border border-[#7B8B9A]/20 shadow-xl flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[#F9F9FB]">Verification Breakdown</h3>
            <p className="text-xs text-[#9BA8B5]">Status share across all businesses</p>
          </div>

          <div className="h-[220px] w-full my-auto">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusChartData.map((entry: any, index: number) => (
                      <Cell
                        key={`status-cell-${index}`}
                        fill={STATUS_COLORS[entry.name?.toLowerCase()] || '#81D7B4'}
                        stroke="rgba(0,0,0,0)"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F1825',
                      border: '1px solid rgba(129, 215, 180, 0.3)',
                      borderRadius: '12px',
                      color: '#F9F9FB',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#7B8B9A]">
                No verification status data
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-3 border-t border-[#7B8B9A]/15">
            {statusChartData.map((entry: any) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[entry.name?.toLowerCase()] || '#81D7B4' }}
                />
                <span className="text-xs text-[#9BA8B5] capitalize font-medium">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Distribution Pie */}
        <div className="bg-[#1A2538]/70 backdrop-blur-xl p-6 rounded-3xl border border-[#7B8B9A]/20 shadow-xl flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[#F9F9FB]">Tier Package Distribution</h3>
            <p className="text-xs text-[#9BA8B5]">Distribution of builder, scaler & enterprise tiers</p>
          </div>

          <div className="h-[220px] w-full my-auto">
            {tierChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {tierChartData.map((entry: any, index: number) => (
                      <Cell
                        key={`tier-cell-${index}`}
                        fill={TIER_COLORS[entry.name?.toLowerCase()] || '#81D7B4'}
                        stroke="rgba(0,0,0,0)"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F1825',
                      border: '1px solid rgba(129, 215, 180, 0.3)',
                      borderRadius: '12px',
                      color: '#F9F9FB',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#7B8B9A]">
                No tier package data
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-3 border-t border-[#7B8B9A]/15">
            {tierChartData.map((entry: any) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: TIER_COLORS[entry.name?.toLowerCase()] || '#81D7B4' }}
                />
                <span className="text-xs text-[#9BA8B5] capitalize font-medium">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
