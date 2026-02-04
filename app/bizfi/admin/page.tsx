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
  FileText
} from 'lucide-react';
import LoanAgreementEditor from './components/LoanAgreementEditor';
import BusinessDetailsModal from './components/BusinessDetailsModal';

interface Metrics {
  totalBusinesses: number;
  statusDistribution: { _id: string; count: number }[];
  tierDistribution: { _id: string; count: number }[];
  growthData: { _id: string; count: number }[];
}

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

const TIER_COLORS = {
  'standard': '#81D7B480',
  'premium': '#81D7B4CC',
  'enterprise': '#81D7B4'
};

const STATUS_COLORS = {
  'approved': '#81D7B4',
  'pending': '#81D7B4CC',
  'rejected': '#EF4444'
};

export default function BizFiAdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [agreementBusiness, setAgreementBusiness] = useState<Business | null>(null);

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

  // Prepare chart data
  const growthChartData = metrics?.growthData.map(d => ({
    date: format(new Date(d._id), 'MMM dd'),
    businesses: d.count
  })) || [];

  const tierChartData = metrics?.tierDistribution.map(d => ({
    name: d._id || 'Standard',
    value: d.count
  })) || [];

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
        {selectedBusiness && (
          <BusinessDetailsModal
            business={selectedBusiness}
            onClose={() => setSelectedBusiness(null)}
            onOpenAgreement={() => {
              setAgreementBusiness(selectedBusiness);
              setSelectedBusiness(null);
            }}
          />
        )}
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
            <p className="text-[#9BA8B5] text-sm font-medium mb-1">Active (Approved)</p>
            <h3 className="text-3xl font-bold text-[#F9F9FB] tracking-tight">
              {metrics?.statusDistribution.find(s => s._id === 'approved' || s._id === 'active')?.count || 0}
            </h3>
          </div>
          <div className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-[#81D7B4]/5 border border-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-[#0F1825] transition-all">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="relative z-10 mt-4 w-full bg-[#0F1825] h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-[#81D7B4] w-[85%] rounded-full"></div>
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
      <motion.div variants={item} className="bg-[#1A2538]/50 backdrop-blur-sm rounded-2xl border border-[#7B8B9A]/10 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-[#7B8B9A]/10 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <h3 className="text-lg font-bold text-[#F9F9FB]">Recent Businesses</h3>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8B9A]" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0F1825] border border-[#7B8B9A]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] transition-all"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-[#0F1825] border border-[#7B8B9A]/20 rounded-xl pl-4 pr-10 py-2.5 text-sm text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] transition-all cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8B9A] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F1825]/50 text-[#9BA8B5] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">No.</th>
                <th className="px-6 py-4 font-medium">Business Name</th>
                <th className="px-6 py-4 font-medium">Owner</th>
                <th className="px-6 py-4 font-medium">Tier</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="hidden lg:table-cell px-6 py-4 font-medium">Date Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7B8B9A]/10">
              {filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#9BA8B5]">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="w-8 h-8 opacity-20" />
                      <p>No businesses found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((biz, index) => (
                  <tr 
                    key={biz.transactionHash} 
                    className="hover:bg-[#81D7B4]/5 transition-colors group cursor-pointer"
                    onClick={() => setSelectedBusiness(biz)}
                  >
                    <td className="px-6 py-4 text-sm text-[#9BA8B5] font-mono">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-[#F9F9FB]">{biz.businessName}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#9BA8B5]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-[#0F1825] px-2 py-1 rounded border border-[#7B8B9A]/10 text-xs">
                          {biz.owner.substring(0, 6)}...{biz.owner.substring(biz.owner.length - 4)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-[#1A2538] text-[#9BA8B5] border border-[#7B8B9A]/20 capitalize`}>
                        {biz.tier || 'Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize flex w-fit items-center gap-1.5 ${
                          biz.status === 'approved' ? 'bg-[#81D7B4]/10 text-[#81D7B4] border border-[#81D7B4]/20' :
                          biz.status === 'pending' ? 'bg-[#81D7B4]/10 text-[#81D7B4CC] border border-[#81D7B4]/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          biz.status === 'approved' ? 'bg-[#81D7B4]' :
                          biz.status === 'pending' ? 'bg-[#81D7B4CC]' :
                          'bg-red-400'
                        }`}></span>
                        {biz.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 text-sm text-[#9BA8B5]">
                      {biz.createdAt ? format(new Date(biz.createdAt), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) handleStatusUpdate(biz.transactionHash, e.target.value);
                          }}
                          className="appearance-none bg-[#1A2538] border border-[#7B8B9A]/20 hover:border-[#81D7B4] text-[#9BA8B5] hover:text-[#81D7B4] py-2 pl-3 pr-8 rounded-lg text-xs font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#81D7B4] transition-colors"
                        >
                          <option value="" disabled>Change Status</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#7B8B9A]">
                          <MoreVertical className="h-4 w-4" />
                        </div>
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
                className="p-4 space-y-4 bg-[#1A2538]/20 cursor-pointer hover:bg-[#1A2538]/40 transition-colors"
                onClick={() => setSelectedBusiness(biz)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-[#F9F9FB] text-lg">{biz.businessName}</h4>
                    <p className="text-xs text-[#7B8B9A] font-mono mt-1">
                      {biz.owner.substring(0, 8)}...{biz.owner.substring(biz.owner.length - 6)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1A2538] text-[#9BA8B5] border border-[#7B8B9A]/20`}>
                    {biz.tier || 'Standard'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1.5 ${biz.status === 'active' ? 'bg-[#81D7B4]/10 text-[#81D7B4] border border-[#81D7B4]/20' :
                    biz.status === 'pending' ? 'bg-[#81D7B4]/10 text-[#81D7B4CC] border border-[#81D7B4]/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${biz.status === 'active' ? 'bg-[#81D7B4]' :
                      biz.status === 'pending' ? 'bg-[#81D7B4CC]' :
                        'bg-red-400'
                      }`}></span>
                    {biz.status || 'Unknown'}
                  </span>
                  <span className="text-xs text-[#7B8B9A]">
                    {biz.createdAt ? format(new Date(biz.createdAt), 'MMM d, yyyy') : '-'}
                  </span>
                </div>

                <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleStatusUpdate(biz.transactionHash, e.target.value);
                    }}
                    className="w-full appearance-none bg-[#0F1825] border border-[#7B8B9A]/20 text-[#81D7B4] py-3 px-4 rounded-xl text-sm font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#81D7B4] transition-all"
                  >
                    <option value="" disabled>Update Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#7B8B9A]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9BA8B5]">
          <span>Showing {filteredBusinesses.length} of {businesses.length} entries</span>
          <div className="flex gap-2 w-full sm:w-auto">
            <button disabled className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[#0F1825] border border-[#7B8B9A]/20 opacity-50 cursor-not-allowed font-medium">Previous</button>
            <button disabled className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[#0F1825] border border-[#7B8B9A]/20 opacity-50 cursor-not-allowed font-medium">Next</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
