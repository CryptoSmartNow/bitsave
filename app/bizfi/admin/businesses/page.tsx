'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  MoreVertical,
  Download,
  AlertCircle,
  FileText
} from 'lucide-react';

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
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
      // Re-using the analytics endpoint for now as it returns recent businesses
      // In a real app, this should be a dedicated paginated endpoint
      const res = await fetch('/api/bizfi/admin/analytics');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setBusinesses(data.recentBusinesses);
      setFilteredBusinesses(data.recentBusinesses);
    } catch (err) {
      setError('Could not load businesses');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
      link.setAttribute('download', `bizfi_businesses_${format(new Date(), 'yyyyMMdd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#81D7B4] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-[#81D7B4] animate-pulse font-medium tracking-wide">Loading Businesses...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12 max-w-[1600px] mx-auto"
    >
      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A2538]/80 to-[#0F1825]/90 border border-[#7B8B9A]/10 p-8 md:p-12 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#81D7B4]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-[#F9F9FB] tracking-tight">Businesses</h1>
            <p className="text-[#9BA8B5] text-base md:text-lg max-w-xl leading-relaxed">
              Manage registered businesses, monitor verification status, and oversee platform activity.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0F1825] rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#81D7B4]/20 hover:shadow-[#81D7B4]/30 active:scale-95 group"
          >
            <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Controls & Data */}
      <div className="space-y-6">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7B8B9A]" />
            <input
              type="text"
              placeholder="Search by name, owner, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1A2538]/30 backdrop-blur-md border border-[#7B8B9A]/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4]/50 focus:ring-1 focus:ring-[#81D7B4]/50 transition-all placeholder:text-[#7B8B9A]/50 shadow-sm"
            />
          </div>
          <div className="relative w-full md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-[#1A2538]/30 backdrop-blur-md border border-[#7B8B9A]/10 rounded-xl pl-4 pr-10 py-3.5 text-sm text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4]/50 focus:ring-1 focus:ring-[#81D7B4]/50 transition-all cursor-pointer shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8B9A] pointer-events-none" />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-2xl border border-[#7B8B9A]/10 overflow-hidden bg-[#1A2538]/20 backdrop-blur-xl shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A2538]/40 text-[#9BA8B5] text-[10px] font-bold uppercase tracking-widest border-b border-[#7B8B9A]/10">
                <th className="px-6 py-5">Business Details</th>
                <th className="px-6 py-5">Owner</th>
                <th className="px-6 py-5">Tier</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Joined</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7B8B9A]/5">
              {filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-[#9BA8B5]">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <div className="w-16 h-16 rounded-full bg-[#1A2538] flex items-center justify-center">
                        <Search className="w-8 h-8 opacity-40" />
                      </div>
                      <p className="text-lg font-medium text-[#F9F9FB]">No businesses found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((biz) => (
                  <tr
                    key={biz.transactionHash}
                    className="hover:bg-[#81D7B4]/5 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/bizfi/admin/businesses/${biz.transactionHash}`)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#81D7B4]/20 to-[#81D7B4]/5 flex items-center justify-center text-[#81D7B4] font-bold text-lg border border-[#81D7B4]/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                          {biz.businessName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#F9F9FB] text-base">{biz.businessName}</p>
                          <p className="text-xs text-[#9BA8B5] font-mono opacity-60 truncate max-w-[140px] mt-0.5">
                            {biz.transactionHash}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#9BA8B5] bg-[#0F1825]/50 px-2 py-1 rounded-md border border-[#7B8B9A]/10">
                          {biz.owner.substring(0, 6)}...{biz.owner.substring(biz.owner.length - 4)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#1A2538]/50 text-[#9BA8B5] border border-[#7B8B9A]/20 uppercase tracking-wide">
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
                    <td className="hidden lg:table-cell px-6 py-5 text-sm text-[#9BA8B5] font-medium whitespace-nowrap">
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
        <div className="md:hidden grid grid-cols-1 gap-4">
          {filteredBusinesses.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#9BA8B5] bg-[#1A2538]/30 rounded-2xl border border-[#7B8B9A]/10">
              <p>No businesses found</p>
            </div>
          ) : (
            filteredBusinesses.map((biz) => (
              <div
                key={biz.transactionHash}
                className="group relative overflow-hidden bg-[#1A2538]/40 backdrop-blur-md rounded-2xl border border-[#7B8B9A]/10 p-5 active:scale-[0.98] transition-all"
                onClick={() => router.push(`/bizfi/admin/businesses/${biz.transactionHash}`)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/0 to-[#81D7B4]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#1A2538] border border-[#7B8B9A]/10 flex items-center justify-center text-[#81D7B4] font-bold text-xl shadow-inner">
                        {biz.businessName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#F9F9FB] text-lg leading-tight">{biz.businessName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-[#9BA8B5] bg-[#0F1825] px-1.5 py-0.5 rounded border border-[#7B8B9A]/10">
                            {biz.owner.substring(0, 6)}...
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-[#1A2538] text-[#9BA8B5] border border-[#7B8B9A]/20 uppercase">
                      {biz.tier || 'STD'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#7B8B9A]/5">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${biz.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      biz.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${biz.status === 'approved' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' :
                        biz.status === 'pending' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' :
                          'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
                        }`}></span>
                      <span className="capitalize">{biz.status || 'Unknown'}</span>
                    </div>
                    <span className="text-xs text-[#7B8B9A] font-medium whitespace-nowrap">
                      {biz.createdAt ? format(new Date(biz.createdAt), 'MMM d, yyyy') : '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9BA8B5] pt-4 border-t border-[#7B8B9A]/10">
          <span className="font-medium">Showing {filteredBusinesses.length} of {businesses.length} entries</span>
          <div className="flex gap-2 w-full sm:w-auto">
            <button disabled className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[#1A2538] border border-[#7B8B9A]/10 hover:bg-[#1A2538]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium">Previous</button>
            <button disabled className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[#1A2538] border border-[#7B8B9A]/10 hover:bg-[#1A2538]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium">Next</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}