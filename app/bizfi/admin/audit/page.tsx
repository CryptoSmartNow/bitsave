'use client';

import {
  Activity01Icon,
  Search01Icon,
  Download01Icon,
  RefreshIcon,
  FilterIcon,
  UserIcon,
  Shield01Icon,
  Clock01Icon
} from "hugeicons-react";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

interface AuditLog {
  _id: string;
  action: string;
  user: string;
  details: string;
  metadata?: any;
  timestamp: string;
}

export default function BizFiAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/bizfi/admin/audit');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setFilteredLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let result = [...logs];

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase().trim();
      result = result.filter(log =>
        log.details?.toLowerCase().includes(lower) ||
        log.action?.toLowerCase().includes(lower) ||
        log.user?.toLowerCase().includes(lower)
      );
    }

    if (actionFilter !== 'all') {
      result = result.filter(log => log.action?.toLowerCase() === actionFilter.toLowerCase());
    }

    setFilteredLogs(result);
  }, [searchTerm, actionFilter, logs]);

  const handleExport = () => {
    if (!filteredLogs.length) return;

    const headers = ['Action', 'User', 'Details', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(l => [
        `"${(l.action || '').replace(/"/g, '""')}"`,
        `"${(l.user || '').replace(/"/g, '""')}"`,
        `"${(l.details || '').replace(/"/g, '""')}"`,
        l.timestamp ? format(new Date(l.timestamp), 'yyyy-MM-dd HH:mm:ss') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bizfi_audit_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeColor = (action: string) => {
    const act = action?.toLowerCase() || '';
    if (act.includes('status') || act.includes('approve')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (act.includes('reject') || act.includes('delete')) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (act.includes('agreement') || act.includes('update')) return 'text-[#81D7B4] bg-[#81D7B4]/10 border-[#81D7B4]/20';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[#81D7B4]/20 border-t-[#81D7B4] rounded-full animate-spin"></div>
          <div className="text-[#81D7B4] text-sm font-bold tracking-wide animate-pulse">Loading Security Audit Trail...</div>
        </div>
      </div>
    );
  }

  const uniqueActions = Array.from(new Set(logs.map(l => l.action).filter(Boolean)));

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
                <Activity01Icon className="w-5 h-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[#F9F9FB] tracking-tight">
                Security & Audit Trail
              </h1>
            </div>
            <p className="text-[#9BA8B5] text-xs md:text-sm max-w-xl">
              Chronological immutable records of administrative status changes, agreement modifications, and system events.
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
              onClick={fetchLogs}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0F1825] rounded-xl text-xs font-black transition-all shadow-md shadow-[#81D7B4]/20 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="bg-[#1A2538]/70 backdrop-blur-xl rounded-3xl border border-[#7B8B9A]/20 shadow-xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-[#7B8B9A]/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#0F1825]/40">
          <div className="relative flex-1">
            <Search01Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8B9A]" />
            <input
              type="text"
              placeholder="Search audit details, actor, action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0F1825] border border-[#7B8B9A]/25 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F9F9FB] placeholder-[#7B8B9A]/60 focus:outline-none focus:border-[#81D7B4] transition-all shadow-inner"
            />
          </div>

          <div className="relative">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full sm:w-48 appearance-none bg-[#0F1825] border border-[#7B8B9A]/25 rounded-xl pl-3.5 pr-9 py-2.5 text-xs font-medium text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] cursor-pointer shadow-inner"
            >
              <option value="all">All Action Types</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            <FilterIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7B8B9A] pointer-events-none" />
          </div>
        </div>

        {/* Audit Log Entries */}
        <div className="divide-y divide-[#7B8B9A]/10">
          {filteredLogs.length === 0 ? (
            <div className="p-16 text-center text-[#7B8B9A]">
              <Shield01Icon className="w-8 h-8 opacity-30 text-[#81D7B4] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#F9F9FB]">No audit logs match criteria</p>
              <p className="text-xs text-[#7B8B9A] mt-1">Actions performed by admins will be recorded here automatically.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log._id}
                className="p-4 sm:p-5 hover:bg-[#81D7B4]/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-[#0F1825] border border-[#7B8B9A]/20 flex items-center justify-center text-[#81D7B4] shrink-0 mt-0.5">
                    <Shield01Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getActionBadgeColor(log.action)}`}>
                        {log.action || 'System Event'}
                      </span>
                      <span className="text-xs font-bold text-[#F9F9FB]">
                        by {log.user || 'Admin'}
                      </span>
                    </div>

                    <p className="text-xs text-[#9BA8B5] leading-relaxed break-words">
                      {log.details}
                    </p>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2 text-[11px] font-mono text-[#7B8B9A] bg-[#0F1825] p-2 rounded-lg border border-[#7B8B9A]/10 max-w-xl">
                        {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs text-[#7B8B9A] shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#7B8B9A]/10">
                  <span className="font-medium text-[#F9F9FB]">
                    {log.timestamp ? format(new Date(log.timestamp), 'MMM d, yyyy HH:mm') : '-'}
                  </span>
                  <span className="text-[11px] text-[#7B8B9A] flex items-center gap-1">
                    <Clock01Icon className="w-3 h-3" />
                    {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : ''}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
