'use client';

import {
  Building04Icon,
  Search01Icon,
  FilterIcon,
  ArrowUpRight01Icon,
  Clock01Icon,
  TickDouble01Icon,
  Alert01Icon,
  Download01Icon,
  Dollar01Icon,
  RefreshIcon,
  EyeIcon
} from "hugeicons-react";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useRouter } from 'next/navigation';
import LoanAgreementEditor from './components/LoanAgreementEditor';

interface Business {
  transactionHash: string;
  owner: string;
  businessName: string;
  tier: string;
  status: string;
  createdAt: string;
  feePaid?: string;
  metadata?: any;
}

export default function BizFiAdminPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [metrics, setMetrics] = useState<{
    totalBusinesses: number;
    activeBusinesses: number;
    totalRevenue: number;
    statusDistribution: { _id: string; count: number }[];
    tierDistribution: { _id: string; count: number }[];
    growthData: any[];
    revenueTrend: any[];
    userActivity: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agreementBusiness, setAgreementBusiness] = useState<Business | null>(null);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);

  const TIER_COLORS: Record<string, string> = {
    builder: '#81D7B4',
    scaler: '#60A5FA',
    enterprise: '#A78BFA',
    standard: '#81D7B4'
  };

  const tierChartData = metrics?.tierDistribution?.map(item => ({
    name: item._id || 'Standard',
    value: item.count
  })) || [];

  const growthChartData = metrics?.growthData && metrics.growthData.length > 0
    ? metrics.growthData.map(d => ({
        date: d._id ? format(new Date(d._id), 'MMM d') : 'Recent',
        businesses: d.count
      }))
    : [
        { date: 'Day 1', businesses: 1 },
        { date: 'Day 5', businesses: Math.max(1, Math.floor((metrics?.totalBusinesses || 5) * 0.4)) },
        { date: 'Day 15', businesses: Math.max(2, Math.floor((metrics?.totalBusinesses || 5) * 0.7)) },
        { date: 'Today', businesses: metrics?.totalBusinesses || 1 }
      ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!businesses.length) {
      setFilteredBusinesses([]);
      return;
    }

    let result = [...businesses];

    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase().trim();
      result = result.filter(b =>
        b.businessName?.toLowerCase().includes(lowerTerm) ||
        b.owner?.toLowerCase().includes(lowerTerm) ||
        b.transactionHash?.toLowerCase().includes(lowerTerm) ||
        (b.metadata?.ownerName && b.metadata.ownerName.toLowerCase().includes(lowerTerm)) ||
        (b.metadata?.email && b.metadata.email.toLowerCase().includes(lowerTerm))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(b => b.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredBusinesses(result);
  }, [searchTerm, statusFilter, businesses]);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/bizfi/admin/analytics');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setMetrics(data.metrics);
      setBusinesses(data.recentBusinesses || []);
      setFilteredBusinesses(data.recentBusinesses || []);
      setError(null);
    } catch (err) {
      setError('Could not load dashboard data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (transactionHash: string, newStatus: string) => {
    try {
      setBusinesses(prev => prev.map(b =>
        b.transactionHash === transactionHash ? { ...b, status: newStatus } : b
      ));

      const res = await fetch('/api/bizfi/admin/business/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionHash, status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to update status');
      fetchData();
    }
  };

  const handleSaveAgreement = async (data: any) => {
    if (!agreementBusiness) return;

    try {
      const res = await fetch('/api/bizfi/admin/business/update-agreement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionHash: agreementBusiness.transactionHash,
          agreement: data
        }),
      });

      if (!res.ok) throw new Error('Failed to save agreement');
      setAgreementBusiness(null);
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to save agreement');
    }
  };

  const handleExport = () => {
    if (!filteredBusinesses.length) return;

    const headers = ['Business Name', 'Owner', 'Tier', 'Status', 'Date Joined', 'Transaction Hash'];
    const csvContent = [
      headers.join(','),
      ...filteredBusinesses.map(b => [
        `"${(b.businessName || '').replace(/"/g, '""')}"`,
        `"${b.owner || ''}"`,
        b.tier || 'builder',
        b.status || 'pending',
        b.createdAt ? format(new Date(b.createdAt), 'yyyy-MM-dd') : '',
        b.transactionHash || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bizfi_report_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[#81D7B4]/20 border-t-[#81D7B4] rounded-full animate-spin"></div>
          <div className="text-[#81D7B4] text-sm font-bold tracking-wide animate-pulse">Loading BizFi Overview...</div>
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  const approvedCount = metrics?.statusDistribution?.find(s => s._id?.toLowerCase() === 'approved' || s._id?.toLowerCase() === 'active')?.count || 0;
  const pendingCount = metrics?.statusDistribution?.find(s => s._id?.toLowerCase() === 'pending')?.count || 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12 max-w-[1600px] mx-auto"
    >
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-200 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <Alert01Icon className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs text-red-300 hover:underline">Dismiss</button>
        </div>
      )}

      <AnimatePresence>
        {agreementBusiness && (
          <LoanAgreementEditor
            business={agreementBusiness}
            onClose={() => setAgreementBusiness(null)}
            onSave={handleSaveAgreement}
          />
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#F9F9FB] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-[#9BA8B5] text-xs md:text-sm mt-1">
            Real-time business verification telemetry & protocol metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1A2538] hover:bg-[#253247] text-[#F9F9FB] rounded-xl text-xs font-bold transition-all border border-[#7B8B9A]/20 cursor-pointer active:scale-95 shadow-sm"
          >
            <Download01Icon className="w-4 h-4 text-[#81D7B4]" />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0F1825] rounded-xl text-xs font-black transition-all shadow-md shadow-[#81D7B4]/20 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
        {/* Total Businesses */}
        <motion.div variants={item} className="bg-[#1A2538]/70 backdrop-blur-xl p-6 rounded-2xl border border-[#7B8B9A]/20 hover:border-[#81D7B4]/40 transition-all flex flex-col justify-between relative overflow-hidden shadow-lg group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#9BA8B5] uppercase tracking-wider">Total Businesses</span>
            <div className="w-10 h-10 rounded-xl bg-[#81D7B4]/15 flex items-center justify-center text-[#81D7B4] border border-[#81D7B4]/20 group-hover:scale-105 transition-transform">
              <Building04Icon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#F9F9FB] tracking-tight">{metrics?.totalBusinesses || 0}</h3>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="text-[#81D7B4] font-bold flex items-center gap-0.5 bg-[#81D7B4]/10 px-2 py-0.5 rounded-md border border-[#81D7B4]/20">
                <ArrowUpRight01Icon className="w-3.5 h-3.5" />
                Live
              </span>
              <span className="text-[#7B8B9A]">Registered records</span>
            </div>
          </div>
        </motion.div>

        {/* Approved Businesses */}
        <motion.div variants={item} className="bg-[#1A2538]/70 backdrop-blur-xl p-6 rounded-2xl border border-[#7B8B9A]/20 hover:border-[#81D7B4]/40 transition-all flex flex-col justify-between relative overflow-hidden shadow-lg group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#9BA8B5] uppercase tracking-wider">Verified / Approved</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <TickDouble01Icon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#F9F9FB] tracking-tight">{approvedCount}</h3>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[#7B8B9A]">
                {metrics?.totalBusinesses ? `${Math.round((approvedCount / metrics.totalBusinesses) * 100)}% verified` : 'Ready onchain'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Pending Review */}
        <motion.div variants={item} className="bg-[#1A2538]/70 backdrop-blur-xl p-6 rounded-2xl border border-[#7B8B9A]/20 hover:border-amber-400/40 transition-all flex flex-col justify-between relative overflow-hidden shadow-lg group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#9BA8B5] uppercase tracking-wider">Pending Review</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
              <Clock01Icon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#F9F9FB] tracking-tight">{pendingCount}</h3>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-amber-400 font-bold">{pendingCount > 0 ? 'Requires attention' : 'All clear'}</span>
            </div>
          </div>
        </motion.div>

        {/* Total Revenue */}
        <motion.div variants={item} className="bg-[#1A2538]/70 backdrop-blur-xl p-6 rounded-2xl border border-[#7B8B9A]/20 hover:border-[#81D7B4]/40 transition-all flex flex-col justify-between relative overflow-hidden shadow-lg group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#9BA8B5] uppercase tracking-wider">Protocol Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-[#81D7B4]/15 flex items-center justify-center text-[#81D7B4] border border-[#81D7B4]/20 group-hover:scale-105 transition-transform">
              <Dollar01Icon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#F9F9FB] tracking-tight">
              ${(metrics?.totalRevenue || 0).toLocaleString()}
            </h3>
            <div className="flex items-center gap-2 mt-3 text-xs text-[#7B8B9A]">
              <span>Registration fees</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Trend */}
        <motion.div variants={item} className="lg:col-span-2 bg-[#1A2538]/70 backdrop-blur-xl p-6 rounded-3xl border border-[#7B8B9A]/20 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#F9F9FB]">Registration Trajectory</h3>
              <p className="text-xs text-[#9BA8B5]">Timeline of businesses listed on BizFi</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#0F1825] text-[#81D7B4] border border-[#7B8B9A]/20">
              Live Feed
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bizfiGrowthGrad" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="businesses"
                  stroke="#81D7B4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#bizfiGrowthGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Tier Breakdown */}
        <motion.div variants={item} className="bg-[#1A2538]/70 backdrop-blur-xl p-6 rounded-3xl border border-[#7B8B9A]/20 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#F9F9FB]">Tier Distribution</h3>
            <p className="text-xs text-[#9BA8B5]">Breakdown of tier packages</p>
          </div>

          <div className="h-[200px] w-full my-auto">
            {tierChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {tierChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
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
                No tier data available
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-3 border-t border-[#7B8B9A]/15">
            {tierChartData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: TIER_COLORS[entry.name?.toLowerCase()] || '#81D7B4' }}
                />
                <span className="text-xs text-[#9BA8B5] capitalize font-medium">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Businesses Section */}
      <motion.div variants={item} className="bg-[#1A2538]/70 backdrop-blur-xl rounded-3xl border border-[#7B8B9A]/20 shadow-2xl overflow-hidden">
        {/* Section Header with Controls */}
        <div className="p-5 md:p-6 border-b border-[#7B8B9A]/20 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[#0F1825]/40">
          <div>
            <h3 className="text-lg md:text-xl font-black text-[#F9F9FB]">Recent Businesses</h3>
            <p className="text-xs text-[#9BA8B5] mt-0.5">
              Showing {filteredBusinesses.length} of {businesses.length} total registrations
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search01Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8B9A]" />
              <input
                type="text"
                placeholder="Search business, owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0F1825] border border-[#7B8B9A]/25 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F9F9FB] placeholder-[#7B8B9A]/60 focus:outline-none focus:border-[#81D7B4] transition-all shadow-inner"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-[#0F1825] border border-[#7B8B9A]/25 rounded-xl pl-3.5 pr-9 py-2.5 text-xs font-medium text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] cursor-pointer shadow-inner"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <FilterIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7B8B9A] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F1825]/60 text-[#9BA8B5] text-[10px] font-black uppercase tracking-wider border-b border-[#7B8B9A]/15">
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Business Name</th>
                <th className="px-6 py-4">Owner Wallet</th>
                <th className="px-6 py-4">Tier</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7B8B9A]/10">
              {filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-[#7B8B9A]">
                    <div className="flex flex-col items-center gap-2">
                      <Search01Icon className="w-8 h-8 opacity-30 text-[#81D7B4]" />
                      <p className="text-sm font-bold text-[#F9F9FB]">No businesses match the search criteria</p>
                      <p className="text-xs text-[#7B8B9A]">Try clearing your search query or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((biz, idx) => (
                  <tr
                    key={biz.transactionHash || idx}
                    onClick={() => router.push(`/bizfi/admin/businesses/${biz.transactionHash}`)}
                    className="hover:bg-[#81D7B4]/5 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-xs font-mono text-[#7B8B9A]">
                      {(idx + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#81D7B4]/15 border border-[#81D7B4]/25 flex items-center justify-center text-[#81D7B4] font-black text-xs group-hover:scale-105 transition-transform">
                          {(biz.businessName || 'B').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-[#F9F9FB] text-sm group-hover:text-[#81D7B4] transition-colors">
                          {biz.businessName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#9BA8B5]">
                      <span className="bg-[#0F1825] px-2.5 py-1 rounded-lg border border-[#7B8B9A]/15 text-[11px]">
                        {biz.owner ? `${biz.owner.slice(0, 6)}...${biz.owner.slice(-4)}` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#0F1825] text-[#81D7B4] border border-[#81D7B4]/20">
                        {biz.tier || 'builder'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        biz.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : biz.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          biz.status === 'approved' ? 'bg-emerald-400 animate-pulse' :
                          biz.status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
                        }`} />
                        <span className="capitalize">{biz.status || 'pending'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#9BA8B5] font-medium">
                      {biz.createdAt ? format(new Date(biz.createdAt), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={biz.status || 'pending'}
                          onChange={(e) => handleStatusUpdate(biz.transactionHash, e.target.value)}
                          className="bg-[#0F1825] border border-[#7B8B9A]/20 rounded-lg text-xs text-[#F9F9FB] px-2.5 py-1.5 focus:outline-none focus:border-[#81D7B4] cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approve</option>
                          <option value="rejected">Reject</option>
                        </select>
                        <button
                          onClick={() => router.push(`/bizfi/admin/businesses/${biz.transactionHash}`)}
                          className="p-1.5 hover:bg-[#81D7B4]/10 rounded-lg text-[#9BA8B5] hover:text-[#81D7B4] transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-[#7B8B9A]/15">
          {filteredBusinesses.length === 0 ? (
            <div className="p-8 text-center text-[#7B8B9A]">
              <Search01Icon className="w-8 h-8 opacity-30 text-[#81D7B4] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#F9F9FB]">No businesses found</p>
            </div>
          ) : (
            filteredBusinesses.map((biz) => (
              <div
                key={biz.transactionHash}
                onClick={() => router.push(`/bizfi/admin/businesses/${biz.transactionHash}`)}
                className="p-4 space-y-3 hover:bg-[#81D7B4]/5 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#81D7B4]/15 border border-[#81D7B4]/25 flex items-center justify-center text-[#81D7B4] font-black">
                      {(biz.businessName || 'B').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#F9F9FB] text-sm">{biz.businessName}</h4>
                      <p className="text-[11px] font-mono text-[#7B8B9A] mt-0.5">
                        {biz.owner ? `${biz.owner.slice(0, 6)}...${biz.owner.slice(-4)}` : '-'}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#0F1825] text-[#81D7B4] border border-[#81D7B4]/20">
                    {biz.tier || 'builder'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    biz.status === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : biz.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      biz.status === 'approved' ? 'bg-emerald-400' :
                      biz.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'
                    }`} />
                    <span className="capitalize">{biz.status || 'pending'}</span>
                  </span>

                  <span className="text-[#7B8B9A] text-[11px]">
                    {biz.createdAt ? format(new Date(biz.createdAt), 'MMM d, yyyy') : '-'}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#7B8B9A]/10 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={biz.status || 'pending'}
                    onChange={(e) => handleStatusUpdate(biz.transactionHash, e.target.value)}
                    className="flex-1 bg-[#0F1825] border border-[#7B8B9A]/20 rounded-lg text-xs text-[#F9F9FB] px-3 py-2 focus:outline-none focus:border-[#81D7B4]"
                  >
                    <option value="pending">Status: Pending</option>
                    <option value="approved">Status: Approve</option>
                    <option value="rejected">Status: Reject</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
