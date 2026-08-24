'use client';

import { 
  Alert01Icon, 
  Alert02Icon,
  Shield01Icon, 
  GlobeIcon, 
  Wallet01Icon, 
  FlashIcon, 
  Tick01Icon, 
  CloudServerIcon, 
  Cancel01Icon, 
  Search01Icon, 
  FilterIcon, 
  ArrowDown01Icon, 
  ArrowUp01Icon, 
  ArrowLeft01Icon, 
  ArrowRight01Icon,
  Copy01Icon,
  CheckmarkCircle01Icon,
  UserIcon,
  RefreshIcon
} from "hugeicons-react";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserInteraction } from '@/lib/interactionTracker';
import DashboardSkeleton from '@/components/DashboardSkeleton';

// Helper functions
const categorizeError = (error: string): string => {
  const lowerError = error.toLowerCase();
  if (lowerError.includes('gas') || lowerError.includes('fee')) return 'Gas/Fee';
  if (lowerError.includes('network') || lowerError.includes('connection') || lowerError.includes('rpc')) return 'Network';
  if (lowerError.includes('wallet') || lowerError.includes('metamask') || lowerError.includes('provider')) return 'Wallet';
  if (lowerError.includes('contract') || lowerError.includes('revert') || lowerError.includes('execution') || lowerError.includes('call_exception')) return 'Smart Contract';
  if (lowerError.includes('validation') || lowerError.includes('invalid')) return 'Validation';
  if (lowerError.includes('api') || lowerError.includes('server') || lowerError.includes('500')) return 'API/Server';
  return 'General';
};

const isCriticalError = (error: string): boolean => {
  const lowerError = error.toLowerCase();
  return lowerError.includes('revert') || lowerError.includes('call_exception') || lowerError.includes('rejected') || lowerError.includes('insufficient funds');
};

export default function ErrorAnalyticsPage() {
  const router = useRouter();
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 12;

  const fetchErrors = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const response = await fetch('/api/user-interactions?limit=1500');
      const data = await response.json();
      const rawList = Array.isArray(data) ? data : data.interactions || [];
      const errorData = rawList.filter((i: UserInteraction) => 
        i.type.includes('error') || (i.data as any)?.error
      );
      setInteractions(errorData);
    } catch (error) {
      console.error('Error fetching errors:', error);
    } finally {
      setLoading(false);
      if (manual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, []);

  const errorCategories = useMemo(() => {
    return interactions.reduce((acc, curr) => {
      const errorMsg = (curr.data as any)?.error || curr.type || 'Unknown Error';
      const category = categorizeError(errorMsg);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [interactions]);

  const filteredErrors = useMemo(() => {
    return interactions.filter(interaction => {
      const errorMsg = (interaction.data as any)?.error || interaction.type || 'Unknown Error';
      const category = categorizeError(errorMsg);
      const matchesFilter = filter === 'All' || category === filter;
      const matchesSearch = !searchTerm ||
        errorMsg.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (interaction.walletAddress || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [interactions, filter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredErrors.length / itemsPerPage));
  const paginatedErrors = filteredErrors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Smart Contract': return <Shield01Icon className="w-4 h-4" />;
      case 'Network': return <GlobeIcon className="w-4 h-4" />;
      case 'Wallet': return <Wallet01Icon className="w-4 h-4" />;
      case 'Gas/Fee': return <FlashIcon className="w-4 h-4" />;
      case 'Validation': return <Tick01Icon className="w-4 h-4" />;
      case 'API/Server': return <CloudServerIcon className="w-4 h-4" />;
      default: return <Alert01Icon className="w-4 h-4" />;
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="font-sans text-gray-900 dark:text-white space-y-8 pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-lg bg-red-500/15 text-red-500 border border-red-500/25 text-[10px] font-black uppercase tracking-wider">
              Error Telemetry
            </span>
            <span className="text-xs text-gray-400">Crash & Revert Diagnostics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white font-display">
            Error Logs & Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time exception tracking, EVM revert traces, and user failure analysis.
          </p>
        </div>

        <button
          onClick={() => fetchErrors(true)}
          disabled={isRefreshing}
          className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#0c121e] border border-gray-200/80 dark:border-white/10 hover:border-[#81D7B4] text-gray-700 dark:text-gray-200 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshIcon className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#81D7B4]' : ''}`} />
          <span>{isRefreshing ? 'Scanning...' : 'Scan Errors'}</span>
        </button>
      </div>

      {/* ── Category Breakdown Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          type="button"
          onClick={() => { setFilter('All'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === 'All'
              ? 'bg-[#81D7B4]/15 border-[#81D7B4] shadow-xs'
              : 'bg-white dark:bg-[#0c121e] border-gray-200/80 dark:border-white/10 hover:border-[#81D7B4]/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">All Errors</span>
            <Alert02Icon className="w-4 h-4 text-[#81D7B4]" />
          </div>
          <p className="text-xl font-black font-instrument text-gray-900 dark:text-white">
            {interactions.length}
          </p>
        </button>

        {Object.entries(errorCategories).map(([category, count]) => {
          const isSelected = filter === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => { setFilter(category); setCurrentPage(1); }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-red-500/15 border-red-500 shadow-xs'
                  : 'bg-white dark:bg-[#0c121e] border-gray-200/80 dark:border-white/10 hover:border-red-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{category}</span>
                <span className="text-red-500">{getCategoryIcon(category)}</span>
              </div>
              <p className="text-xl font-black font-instrument text-gray-900 dark:text-white">
                {count}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Error Log Table / Feed Container ── */}
      <div className="bg-white dark:bg-[#0c121e] rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xs overflow-hidden">
        {/* Filter / Search Bar */}
        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full sm:w-80">
            <Search01Icon className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search error msg, address, or revert code..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-white dark:bg-[#141d2d] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#81D7B4]"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-gray-400">
            <span>Showing <strong className="text-gray-900 dark:text-white font-bold">{filteredErrors.length}</strong> matching records</span>
          </div>
        </div>

        {/* List View */}
        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {paginatedErrors.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <Tick01Icon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-gray-900 dark:text-white font-display">No System Errors Reported</h3>
              <p className="text-xs text-gray-400 mt-1">All telemetry interactions and protocol contracts are functioning cleanly.</p>
            </div>
          ) : (
            paginatedErrors.map((item) => {
              const errorMsg = (item.data as any)?.error || item.type || 'Unknown Error';
              const category = categorizeError(errorMsg);
              const isCritical = isCriticalError(errorMsg);
              const isExpanded = expandedError === item.id;
              const wallet = item.walletAddress || 'Anonymous';

              return (
                <div key={item.id} className="group transition-colors">
                  <div
                    onClick={() => setExpandedError(isExpanded ? null : item.id)}
                    className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${
                      isExpanded ? 'bg-gray-50 dark:bg-white/[0.03]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                        isCritical ? 'bg-red-500/15 text-red-500' : 'bg-amber-500/15 text-amber-500'
                      }`}>
                        <Alert01Icon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-xl font-mono">
                            {errorMsg}
                          </h4>
                          {isCritical && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/15 text-red-500 border border-red-500/25">
                              Critical
                            </span>
                          )}
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-white/5 text-gray-500">
                            {category}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                          <span className="font-mono">{wallet !== 'Anonymous' ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : 'Guest'}</span>
                          <span>•</span>
                          <span>{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white transition-colors">
                      {isExpanded ? <ArrowUp01Icon className="w-4 h-4" /> : <ArrowDown01Icon className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded Detail Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-gray-50/80 dark:bg-black/20 border-t border-b border-gray-100 dark:border-white/5 p-5"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Raw Trace */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">
                                Raw Error Context JSON
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(JSON.stringify(item.data, null, 2), item.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#81D7B4] hover:underline cursor-pointer"
                              >
                                {copiedId === item.id ? (
                                  <>
                                    <CheckmarkCircle01Icon className="w-3.5 h-3.5" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy01Icon className="w-3.5 h-3.5" />
                                    <span>Copy JSON</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-4 rounded-2xl bg-gray-900 text-red-400 text-xs font-mono overflow-x-auto max-h-56 custom-scrollbar border border-white/10">
                              {JSON.stringify(item.data || {}, null, 2)}
                            </pre>
                          </div>

                          {/* Action Details */}
                          <div className="space-y-4">
                            <div>
                              <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                                Event Telemetry
                              </span>
                              <div className="p-4 rounded-2xl bg-white dark:bg-[#0c121e] border border-gray-200/70 dark:border-white/10 space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Wallet:</span>
                                  <span className="font-mono font-bold text-gray-900 dark:text-white">{wallet}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Operation:</span>
                                  <span className="font-bold text-gray-900 dark:text-white capitalize">{item.type}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Timestamp:</span>
                                  <span className="font-mono text-gray-700 dark:text-gray-300">{new Date(item.timestamp).toISOString()}</span>
                                </div>
                              </div>
                            </div>

                            {wallet !== 'Anonymous' && (
                              <button
                                type="button"
                                onClick={() => router.push(`/user-interactions/users?address=${wallet}`)}
                                className="w-full py-3 rounded-2xl bg-[#81D7B4]/15 hover:bg-[#81D7B4]/25 text-[#1c4b38] dark:text-[#81D7B4] font-bold text-xs flex items-center justify-center gap-2 border border-[#81D7B4]/30 transition-all cursor-pointer"
                              >
                                <UserIcon className="w-4 h-4" />
                                <span>Inspect Wallet Activity & History</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {filteredErrors.length > itemsPerPage && (
          <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex items-center justify-between text-xs">
            <span className="text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white dark:bg-[#141d2d] border border-gray-200 dark:border-white/10 disabled:opacity-40 cursor-pointer"
              >
                <ArrowLeft01Icon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white dark:bg-[#141d2d] border border-gray-200 dark:border-white/10 disabled:opacity-40 cursor-pointer"
              >
                <ArrowRight01Icon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
