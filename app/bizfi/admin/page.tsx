'use client';

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
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  Building2,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Download,
  FileText,
  Import
} from 'lucide-react';
import Link from 'next/link';
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
    statusDistribution: { _id: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agreementBusiness, setAgreementBusiness] = useState<Business | null>(null);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);

  const TIER_COLORS = {
    builder: '#81D7B4',
    scaler: '#60A5FA',
    enterprise: '#A78BFA'
  };

  // Derived Data
  const tierChartData = metrics?.statusDistribution?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  // Mock growth data if not available in metrics (since we only have total businesses in state metrics)
  // Or derive from businesses list if needed
  const growthChartData = [
    { date: 'Jan 1', businesses: 10 },
    { date: 'Jan 8', businesses: 15 },
    { date: 'Jan 15', businesses: 25 },
    { date: 'Jan 22', businesses: 30 },
    { date: 'Jan 29', businesses: 45 },
    { date: 'Feb 5', businesses: metrics?.totalBusinesses || 50 }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!businesses.length) return;

    let result = [...businesses];

    // Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(b =>
        b.businessName.toLowerCase().includes(lowerTerm) ||
        b.owner.toLowerCase().includes(lowerTerm)
      );
    }

    // Filter
    if (statusFilter !== 'all') {
      result = result.filter(b => b.status === statusFilter);
    }

    setFilteredBusinesses(result);
  }, [searchTerm, statusFilter, businesses]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/bizfi/admin/analytics');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setMetrics(data.metrics);
      setBusinesses(data.recentBusinesses);
      setFilteredBusinesses(data.recentBusinesses);
    } catch (err) {
      setError('Could not load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (transactionHash: string, newStatus: string) => {
    try {
      // Optimistic update
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
    } catch (err) {
      console.error(err);
      setError('Failed to update status');
      // Revert optimistic update (could be improved by refetching)
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
    } catch (err) {
      console.error(err);
      setError('Failed to save agreement');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#81D7B4] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-[#81D7B4] animate-pulse font-medium">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/10 border border-red-900/30 rounded-2xl text-red-200 flex items-center gap-3">
        <AlertCircle className="w-6 h-6" />
        {error}
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };



  const handleExport = () => {
    if (!filteredBusinesses.length) return;

    const headers = ['Business Name', 'Owner', 'Tier', 'Status', 'Date Joined', 'Transaction Hash'];
    const csvContent = [
      headers.join(','),
      ...filteredBusinesses.map(b => [
        `"${b.businessName}"`,
        `"${b.owner}"`,
        b.tier,
        b.status,
        b.createdAt ? format(new Date(b.createdAt), 'yyyy-MM-dd') : '',
        b.transactionHash
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bizfi_report_${format(new Date(), 'yyyyMMdd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      {error && (
        <div className="p-6 bg-red-900/10 border border-red-900/30 rounded-2xl text-red-200 flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          {error}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F9F9FB]">Overview</h1>
          <p className="text-[#9BA8B5] text-sm md:text-base">Real-time insights and performance metrics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-5 py-2.5 bg-[#1A2538] hover:bg-[#253247] text-[#F9F9FB] rounded-xl text-sm font-medium transition-all border border-[#7B8B9A]/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button
            onClick={fetchData}
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-5 py-2.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0F1825] rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#81D7B4]/10 active:scale-95"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <motion.div variants={item} className="relative bg-[#1A2538]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#7B8B9A]/10 hover:border-[#81D7B4]/30 transition-all group hover:shadow-lg hover:shadow-[#81D7B4]/5 flex flex-col justify-between overflow-hidden">
          <div className="relative z-10 pr-12">
            <p className="text-[#9BA8B5] text-sm font-medium mb-1">Total businesses</p>
            <h3 className="text-3xl font-bold text-[#F9F9FB] tracking-tight">{metrics?.totalBusinesses || 0}</h3>
          </div>
          <div className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-[#81D7B4]/5 border border-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-[#0F1825] transition-all">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="relative z-10 mt-4 flex items-center gap-2 text-xs">
            <span className="text-green-400 flex items-center gap-0.5 font-bold bg-green-400/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3" />
              12%
            </span>
            <span className="text-[#7B8B9A] font-medium whitespace-nowrap">vs last month</span>
          </div>
        </motion.div>

        <motion.div variants={item} className="relative bg-[#1A2538]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#7B8B9A]/10 hover:border-[#81D7B4]/30 transition-all group hover:shadow-lg hover:shadow-[#81D7B4]/5 flex flex-col justify-between overflow-hidden">
          <div className="relative z-10 pr-12">
            <p className="text-[#9BA8B5] text-sm font-medium mb-1">Approved</p>
            <h3 className="text-3xl font-bold text-[#F9F9FB] tracking-tight">
              {metrics?.statusDistribution.find(s => s._id === 'approved' || s._id === 'active')?.count || 0}
            </h3>
          </div>
          <div className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-[#81D7B4]/5 border border-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-[#0F1825] transition-all">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="relative z-10 mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></span>
            <p className="text-xs text-[#9BA8B5] font-medium whitespace-nowrap">Active businesses</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="relative bg-[#1A2538]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#7B8B9A]/10 hover:border-[#81D7B4]/30 transition-all group hover:shadow-lg hover:shadow-[#81D7B4]/5 flex flex-col justify-between overflow-hidden">
          <div className="relative z-10 pr-12">
            <p className="text-[#9BA8B5] text-sm font-medium mb-1">Pending review</p>
            <h3 className="text-3xl font-bold text-[#F9F9FB] tracking-tight">
              {metrics?.statusDistribution.find(s => s._id === 'pending')?.count || 0}
            </h3>
          </div>
          <div className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-[#81D7B4]/5 border border-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-[#0F1825] transition-all">
            <Clock className="w-5 h-5" />
          </div>
          <div className="relative z-10 mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
            <p className="text-xs text-[#9BA8B5] font-medium whitespace-nowrap">Requires attention</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="relative bg-[#1A2538]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#7B8B9A]/10 hover:border-[#81D7B4]/30 transition-all group hover:shadow-lg hover:shadow-[#81D7B4]/5 flex flex-col justify-between overflow-hidden">
          <div className="relative z-10 pr-12">
            <p className="text-[#9BA8B5] text-sm font-medium mb-1">Est. Revenue</p>
            <h3 className="text-3xl font-bold text-[#F9F9FB] tracking-tight">--</h3>
          </div>
          <div className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-[#81D7B4]/5 border border-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-[#0F1825] transition-all">
            <span className="text-lg font-bold group-hover:text-[#0F1825]">$</span>
          </div>
          <p className="relative z-10 mt-4 text-xs text-[#9BA8B5] font-medium whitespace-nowrap">Based on tier fees</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <motion.div variants={item} className="lg:col-span-2 bg-[#1A2538]/50 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-[#7B8B9A]/10">
          <h3 className="text-lg font-bold text-[#F9F9FB] mb-6">Business Growth</h3>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#81D7B4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#81D7B4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#7B8B9A" strokeOpacity={0.1} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#7B8B9A"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ dy: 10 }}
                />
                <YAxis
                  stroke="#7B8B9A"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ dx: -10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A2538',
                    border: '1px solid rgba(123, 139, 154, 0.2)',
                    borderRadius: '12px',
                    color: '#F9F9FB',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#81D7B4' }}
                />
                <Area
                  type="monotone"
                  dataKey="businesses"
                  stroke="#81D7B4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorGrowth)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-[#1A2538]/50 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-[#7B8B9A]/10 flex flex-col">
          <h3 className="text-lg font-bold text-[#F9F9FB] mb-6">Tier Distribution</h3>
          <div className="flex-1 min-h-[250px] md:min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tierChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(TIER_COLORS)[index % 3]} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A2538',
                    border: '1px solid rgba(123, 139, 154, 0.2)',
                    borderRadius: '12px',
                    color: '#F9F9FB',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#F9F9FB' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
            {tierChartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: Object.values(TIER_COLORS)[index % 3] }}
                />
                <span className="text-xs text-[#9BA8B5] capitalize font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <motion.div variants={item} className="bg-[#1A2538]/30 backdrop-blur-xl rounded-2xl border border-[#7B8B9A]/10 overflow-hidden shadow-xl">
        <div className="p-6 md:p-8 border-b border-[#7B8B9A]/10 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#F9F9FB]">Recent Businesses</h3>
            <p className="text-sm text-[#9BA8B5]">Latest registrations and status updates</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8B9A]" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1A2538]/50 border border-[#7B8B9A]/20 rounded-xl pl-11 pr-4 py-2.5 text-sm text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4]/50 focus:ring-1 focus:ring-[#81D7B4]/50 transition-all shadow-sm"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-[#1A2538]/50 border border-[#7B8B9A]/20 rounded-xl pl-4 pr-10 py-2.5 text-sm text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4]/50 focus:ring-1 focus:ring-[#81D7B4]/50 transition-all cursor-pointer shadow-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8B9A] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A2538]/40 text-[#9BA8B5] text-[10px] font-bold uppercase tracking-widest border-b border-[#7B8B9A]/10">
                <th className="px-6 py-5 font-bold">No.</th>
                <th className="px-6 py-5 font-bold">Business Name</th>
                <th className="px-6 py-5 font-bold">Owner</th>
                <th className="px-6 py-5 font-bold">Tier</th>
                <th className="px-6 py-5 font-bold">Status</th>
                <th className="hidden lg:table-cell px-6 py-5 font-bold">Date Joined</th>
                <th className="px-6 py-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7B8B9A]/5">
              {filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-[#9BA8B5]">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <Search className="w-8 h-8 opacity-40" />
                      <p className="text-sm font-medium">No businesses found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((biz, index) => (
                  <tr
                    key={biz.transactionHash}
                    className="hover:bg-[#81D7B4]/5 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/bizfi/admin/businesses/${biz.transactionHash}`)}
                  >
                    <td className="px-6 py-5 text-sm text-[#9BA8B5] font-mono opacity-60">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#81D7B4]/20 to-[#81D7B4]/5 flex items-center justify-center text-[#81D7B4] font-bold text-sm border border-[#81D7B4]/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
                          {biz.businessName.charAt(0)}
                        </div>
                        <span className="font-bold text-[#F9F9FB] text-sm">{biz.businessName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-[#9BA8B5]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-[#0F1825]/50 px-2 py-1 rounded-md border border-[#7B8B9A]/10 text-xs">
                          {biz.owner.substring(0, 6)}...{biz.owner.substring(biz.owner.length - 4)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#1A2538]/50 text-[#9BA8B5] border border-[#7B8B9A]/20 uppercase tracking-wide`}>
                        {biz.tier || 'Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${biz.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/10' :
                        biz.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/10' :
                          'bg-red-500/10 text-red-400 border-red-500/10'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${biz.status === 'approved' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' :
                          biz.status === 'pending' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' :
                            'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
                          }`}></span>
                        <span className="capitalize tracking-wide">{biz.status || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-5 text-sm text-[#9BA8B5] font-medium">
                      {biz.createdAt ? format(new Date(biz.createdAt), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block group/action">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) handleStatusUpdate(biz.transactionHash, e.target.value);
                          }}
                          className="appearance-none bg-transparent text-transparent w-full absolute inset-0 cursor-pointer z-10"
                        >
                          <option value="" disabled>Change Status</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <button className="p-2 rounded-lg hover:bg-[#1A2538] text-[#7B8B9A] group-hover/action:text-[#81D7B4] group-hover/action:bg-[#81D7B4]/10 transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-[#7B8B9A]/10">
          {filteredBusinesses.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#9BA8B5]">
              <div className="flex flex-col items-center gap-3">
                <Search className="w-8 h-8 opacity-20" />
                <p>No businesses found</p>
              </div>
            </div>
          ) : (
            filteredBusinesses.map((biz) => (
              <div
                key={biz.transactionHash}
                className="p-4 space-y-4 bg-[#1A2538]/20 cursor-pointer hover:bg-[#81D7B4]/5 transition-colors border-l-2 border-transparent hover:border-l-[#81D7B4]"
                onClick={() => router.push(`/bizfi/admin/businesses/${biz.transactionHash}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#81D7B4]/20 to-[#81D7B4]/5 flex items-center justify-center text-[#81D7B4] font-bold text-sm border border-[#81D7B4]/20 shadow-inner">
                      {biz.businessName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#F9F9FB] text-base leading-tight">{biz.businessName}</h4>
                      <p className="text-xs text-[#7B8B9A] font-mono mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7B8B9A]/50"></span>
                        {biz.owner.substring(0, 6)}...{biz.owner.substring(biz.owner.length - 4)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-[#1A2538] text-[#9BA8B5] border border-[#7B8B9A]/20`}>
                    {biz.tier || 'Standard'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${biz.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/10' :
                    biz.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/10' :
                      'bg-red-500/10 text-red-400 border-red-500/10'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${biz.status === 'approved' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' :
                      biz.status === 'pending' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' :
                        'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
                      }`}></span>
                    <span className="capitalize">{biz.status || 'Unknown'}</span>
                  </div>
                  <span className="text-xs text-[#7B8B9A] font-medium">
                    {biz.createdAt ? format(new Date(biz.createdAt), 'MMM d, yyyy') : '-'}
                  </span>
                </div>

                <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) handleStatusUpdate(biz.transactionHash, e.target.value);
                      }}
                      className="w-full appearance-none bg-[#0F1825]/50 border border-[#7B8B9A]/20 text-[#81D7B4] py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer focus:outline-none focus:border-[#81D7B4]/50 focus:bg-[#0F1825] transition-all"
                    >
                      <option value="" disabled>Update Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#81D7B4]">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#7B8B9A]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9BA8B5]">
          <span>Showing {filteredBusinesses.length} of {businesses.length} entries</span>
          <div className="flex gap-2 w-full sm:w-auto">
            <button disabled className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[#0F1825] border border-[#7B8B9A]/20 opacity-50 cursor-not-allowed font-medium hover:bg-[#1A2538] transition-colors">Previous</button>
            <button disabled className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[#0F1825] border border-[#7B8B9A]/20 opacity-50 cursor-not-allowed font-medium hover:bg-[#1A2538] transition-colors">Next</button>
          </div>
        </div>
      </motion.div>
    </motion.div >
  );
}
