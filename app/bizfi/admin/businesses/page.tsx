'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  MoreVertical,
  Download,
  AlertCircle
} from 'lucide-react';

interface Business {
  transactionHash: string;
  owner: string;
  businessName: string;
  tier: string;
  status: string;
  createdAt: string;
  feePaid?: string;
}

export default function BizFiBusinessesPage() {
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
          <div className="text-[#81D7B4] animate-pulse font-medium">Loading Businesses...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F9F9FB]">Businesses</h1>
          <p className="text-[#9BA8B5] text-sm md:text-base">Manage registered businesses and registrations</p>
        </div>
        <button
          onClick={handleExport}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2.5 bg-[#1A2538] hover:bg-[#253247] text-[#F9F9FB] rounded-xl text-sm font-medium transition-all border border-[#7B8B9A]/20 active:scale-95"
        >
          <Download className="w-4 h-4" />
          Export List
        </button>
      </div>

      {error && (
        <div className="p-6 bg-red-900/10 border border-red-900/30 rounded-2xl text-red-200 flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-[#1A2538]/50 backdrop-blur-sm rounded-2xl border border-[#7B8B9A]/10 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-[#7B8B9A]/10 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:ml-auto">
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
            <div className="relative w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-[#0F1825] border border-[#7B8B9A]/20 rounded-xl pl-4 pr-10 py-2.5 text-sm text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] transition-all cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
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
                filteredBusinesses.map((biz) => (
                  <tr key={biz.transactionHash} className="hover:bg-[#81D7B4]/5 transition-colors group">
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize flex w-fit items-center gap-1.5 ${biz.status === 'active' ? 'bg-[#81D7B4]/10 text-[#81D7B4] border border-[#81D7B4]/20' :
                          biz.status === 'pending' ? 'bg-[#81D7B4]/10 text-[#81D7B4CC] border border-[#81D7B4]/20' :
                            biz.status === 'hold' ? 'bg-[#81D7B4]/10 text-[#81D7B480] border border-[#81D7B4]/20' :
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${biz.status === 'active' ? 'bg-[#81D7B4]' :
                            biz.status === 'pending' ? 'bg-[#81D7B4CC]' :
                              biz.status === 'hold' ? 'bg-[#81D7B480]' :
                                'bg-red-400'
                          }`}></span>
                        {biz.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 text-sm text-[#9BA8B5]">
                      {biz.createdAt ? format(new Date(biz.createdAt), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) handleStatusUpdate(biz.transactionHash, e.target.value);
                          }}
                          className="appearance-none bg-[#1A2538] border border-[#7B8B9A]/20 hover:border-[#81D7B4] text-[#9BA8B5] hover:text-[#81D7B4] py-2 pl-3 pr-8 rounded-lg text-xs font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#81D7B4] transition-colors"
                        >
                          <option value="" disabled>Change Status</option>
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="hold">Hold</option>
                          <option value="rejected">Rejected</option>
                          <option value="inactive">Inactive</option>
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
              <div key={biz.transactionHash} className="p-4 space-y-4 bg-[#1A2538]/20">
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

                <div className="pt-2">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleStatusUpdate(biz.transactionHash, e.target.value);
                    }}
                    className="w-full appearance-none bg-[#0F1825] border border-[#7B8B9A]/20 text-[#81D7B4] py-3 px-4 rounded-xl text-sm font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#81D7B4] transition-all"
                  >
                    <option value="" disabled>Update Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="hold">Hold</option>
                    <option value="rejected">Rejected</option>
                    <option value="inactive">Inactive</option>
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
      </div>
    </motion.div>
  );
}