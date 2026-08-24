'use client';

import { 
  Activity01Icon, 
  BarChartIcon, 
  PieChartIcon, 
  ArrowUpRight01Icon,
  FlashIcon,
  Clock01Icon,
  GlobeIcon,
  RefreshIcon
} from "hugeicons-react";
import { useState, useEffect, useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { UserInteraction } from '@/lib/interactionTracker';
import DashboardSkeleton from '@/components/DashboardSkeleton';

export default function AnalyticsPage() {
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchInteractions = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const response = await fetch('/api/user-interactions?limit=2000');
      const data = await response.json();
      setInteractions(Array.isArray(data) ? data : data.interactions || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
      if (manual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInteractions();
  }, []);

  // Process timeline data
  const timelineData = useMemo(() => {
    const grouped = interactions.reduce((acc, curr) => {
      const date = new Date(curr.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
  }, [interactions]);

  // Process action distribution
  const actionData = useMemo(() => {
    const grouped = interactions.reduce((acc, curr) => {
      const action = curr.type.replace(/_/g, ' ');
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [interactions]);

  // Process chain distribution
  const chainData = useMemo(() => {
    const grouped = interactions.reduce((acc, curr) => {
      const chain = (curr.data as any)?.chain || 'Base';
      const normChain = chain.charAt(0).toUpperCase() + chain.slice(1).toLowerCase();
      acc[normChain] = (acc[normChain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [interactions]);

  // Process hourly heatmap
  const hourlyData = useMemo(() => {
    const hours = Array(24).fill(0);
    interactions.forEach(i => {
      const hour = new Date(i.timestamp).getHours();
      hours[hour]++;
    });

    return hours.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      count
    }));
  }, [interactions]);

  // Key performance highlights
  const peakHour = useMemo(() => {
    let max = 0;
    let maxHour = '12:00';
    hourlyData.forEach(h => {
      if (h.count > max) {
        max = h.count;
        maxHour = h.hour;
      }
    });
    return maxHour;
  }, [hourlyData]);

  const topAction = actionData[0]?.name || 'Savings Created';

  const COLORS = ['#81D7B4', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981'];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="font-sans text-gray-900 dark:text-white space-y-8 pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#81D7B4]/15 text-[#81D7B4] border border-[#81D7B4]/25 text-[10px] font-black uppercase tracking-wider">
              Telemetry Analytics
            </span>
            <span className="text-xs text-gray-400">Behavioral Insights</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white font-display">
            User Analytics & Insights
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Deep dive into user activity velocity, network distributions, and platform trends.
          </p>
        </div>

        <button
          onClick={() => fetchInteractions(true)}
          disabled={isRefreshing}
          className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#0c121e] border border-gray-200/80 dark:border-white/10 hover:border-[#81D7B4] text-gray-700 dark:text-gray-200 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshIcon className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#81D7B4]' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* ── Metric Summary Tiles ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0c121e] p-5 rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Analyzed Events</span>
            <div className="p-2 rounded-xl bg-[#81D7B4]/15 text-[#81D7B4]">
              <Activity01Icon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-instrument text-gray-900 dark:text-white">
            {interactions.length.toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Total interactions in dataset</p>
        </div>

        <div className="bg-white dark:bg-[#0c121e] p-5 rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Peak Traffic Time</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
              <Clock01Icon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-instrument text-gray-900 dark:text-white">
            {peakHour} UTC
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Highest user activity hour</p>
        </div>

        <div className="bg-white dark:bg-[#0c121e] p-5 rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Top Primary Action</span>
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500">
              <FlashIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black font-display text-gray-900 dark:text-white truncate capitalize">
            {topAction}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Most frequent protocol trigger</p>
        </div>

        <div className="bg-white dark:bg-[#0c121e] p-5 rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Supported Networks</span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-500">
              <GlobeIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-instrument text-gray-900 dark:text-white">
            5 Chains
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Base, Celo, Lisk, BSC, Avax</p>
        </div>
      </div>

      {/* ── 30-Day Activity Velocity Chart ── */}
      <div className="bg-white dark:bg-[#0c121e] p-6 rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-white font-display flex items-center gap-2">
              <ArrowUpRight01Icon className="w-4 h-4 text-[#81D7B4]" />
              <span>30-Day Activity Velocity</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Daily volume of user interactions across BitSave</p>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-[#81D7B4]/15 text-[#81D7B4] text-xs font-bold">
            Daily Timeline
          </span>
        </div>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#81D7B4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#81D7B4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.1)" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#94a3b8' }} 
                axisLine={false} 
                tickLine={false} 
                minTickGap={25}
              />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0c121e', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Area type="monotone" dataKey="count" stroke="#81D7B4" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Distribution Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Type Distribution */}
        <div className="bg-white dark:bg-[#0c121e] p-6 rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-gray-900 dark:text-white font-display flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[#81D7B4]" />
              <span>Action Type Distribution</span>
            </h3>
            <span className="text-xs text-gray-400 font-mono">Top 6 Triggers</span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actionData}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={4}
                  dataKey="value"
                >
                  {actionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0c121e', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24-Hour Heatmap */}
        <div className="bg-white dark:bg-[#0c121e] p-6 rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-gray-900 dark:text-white font-display flex items-center gap-2">
              <Clock01Icon className="w-4 h-4 text-[#81D7B4]" />
              <span>Hourly Activity (24h UTC)</span>
            </h3>
            <span className="text-xs text-gray-400 font-mono">Traffic Heatmap</span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.1)" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  axisLine={false} 
                  tickLine={false}
                  minTickGap={10}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(129, 215, 180, 0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#0c121e', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#81D7B4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
