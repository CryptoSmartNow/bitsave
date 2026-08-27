'use client';

import {
  Search01Icon,
  FilterIcon,
  Download01Icon,
  Alert01Icon,
  Building04Icon,
  RefreshIcon,
  EyeIcon
} from "hugeicons-react";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

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

export default function BizFiBusinessesPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

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
        (b.metadata?.email && b.metadata.email.toLowerCase().includes(lowerTerm)) ||
        (b.metadata?.businessEmail && b.metadata.businessEmail.toLowerCase().includes(lowerTerm))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(b => b.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    if (tierFilter !== 'all') {
      result = result.filter(b => b.tier?.toLowerCase() === tierFilter.toLowerCase());
    }

    setFilteredBusinesses(result);
  }, [searchTerm, statusFilter, tierFilter, businesses]);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/bizfi/admin/analytics');
      if (!res.ok) throw new Error('Failed to fetch businesses');
      const data = await res.json();
      setBusinesses(data.recentBusinesses || []);
      setFilteredBusinesses(data.recentBusinesses || []);
      setError('');
    } catch (err) {
      setError('Could not load businesses directory. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    link.setAttribute('download', `bizfi_businesses_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      if (!res.ok) throw new Error('Failed to update status');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to update status');
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[#81D7B4]/20 border-t-[#81D7B4] rounded-full animate-spin"></div>
          <div className="text-[#81D7B4] text-sm font-bold tracking-wide animate-pulse">Loading Businesses Directory...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12 max-w-[1600px] mx-auto"
    >
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#1A2538]/70 border border-[#7B8B9A]/20 p-6 md:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#81D7B4]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#81D7B4]/15 flex items-center justify-center text-[#81D7B4] border border-[#81D7B4]/25">
                <Building04Icon className="w-5 h-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[#F9F9FB] tracking-tight">
                Businesses Directory
              </h1>
            </div>
            <p className="text-[#9BA8B5] text-xs md:text-sm max-w-xl">
              Inspect onchain company verification credentials, review tiers, and manage registration records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0F1825] hover:bg-[#1A2538] text-[#F9F9FB] rounded-xl text-xs font-bold transition-all border border-[#7B8B9A]/20 cursor-pointer active:scale-95 shadow-sm"
            >
              <Download01Icon className="w-4 h-4 text-[#81D7B4]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0F1825] rounded-xl text-xs font-black transition-all shadow-md shadow-[#81D7B4]/20 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-200 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <Alert01Icon className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-xs text-red-300 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-[#1A2538]/70 backdrop-blur-xl rounded-3xl border border-[#7B8B9A]/20 shadow-xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-[#7B8B9A]/20 flex flex-col lg:flex-row justify-between lg:items-center gap-4 bg-[#0F1825]/40">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search01Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8B9A]" />
            <input
              type="text"
              placeholder="Search by business name, wallet address, email, or transaction hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0F1825] border border-[#7B8B9A]/25 rounded-xl pl-10 pr-4 py-3 text-xs text-[#F9F9FB] placeholder-[#7B8B9A]/60 focus:outline-none focus:border-[#81D7B4] transition-all shadow-inner"
            />
          </div>

          {/* Filter Selects */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-44 appearance-none bg-[#0F1825] border border-[#7B8B9A]/25 rounded-xl pl-3.5 pr-9 py-3 text-xs font-medium text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] cursor-pointer shadow-inner"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Verified / Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <FilterIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7B8B9A] pointer-events-none" />
            </div>

            {/* Tier Filter */}
            <div className="relative">
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full sm:w-40 appearance-none bg-[#0F1825] border border-[#7B8B9A]/25 rounded-xl pl-3.5 pr-9 py-3 text-xs font-medium text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] cursor-pointer shadow-inner"
              >
                <option value="all">All Tiers</option>
                <option value="builder">Builder</option>
                <option value="scaler">Scaler</option>
                <option value="enterprise">Enterprise</option>
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
                <th className="px-6 py-4">Business Details</th>
                <th className="px-6 py-4">Owner Address</th>
                <th className="px-6 py-4">Tier</th>
                <th className="px-6 py-4">Verification Status</th>
                <th className="px-6 py-4">Registration Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7B8B9A]/10">
              {filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-[#7B8B9A]">
                    <div className="flex flex-col items-center gap-2">
                      <Search01Icon className="w-8 h-8 opacity-30 text-[#81D7B4]" />
                      <p className="text-sm font-bold text-[#F9F9FB]">No businesses match the search criteria</p>
                      <p className="text-xs text-[#7B8B9A]">Try adjusting your search terms or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((biz) => (
                  <tr
                    key={biz.transactionHash}
                    onClick={() => router.push(`/bizfi/admin/businesses/${biz.transactionHash}`)}
                    className="hover:bg-[#81D7B4]/5 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#81D7B4]/15 border border-[#81D7B4]/25 flex items-center justify-center text-[#81D7B4] font-black text-base group-hover:scale-105 transition-transform">
                          {(biz.businessName || 'B').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#F9F9FB] text-sm group-hover:text-[#81D7B4] transition-colors">
                            {biz.businessName}
                          </p>
                          <p className="text-[11px] text-[#7B8B9A] font-mono mt-0.5 truncate max-w-[200px]">
                            {biz.transactionHash}
                          </p>
                        </div>
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
                    <td className="px-6 py-4 text-xs text-[#9BA8B5] font-medium whitespace-nowrap">
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
                          title="View Business Profile"
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
      </div>
    </motion.div>
  );
}
