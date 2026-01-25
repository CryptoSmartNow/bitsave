'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  Globe, 
  Wallet, 
  Zap, 
  CheckCircle, 
  Server, 
  AlertCircle,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { UserInteraction } from '@/lib/interactionTracker';
import DashboardSkeleton from '@/components/DashboardSkeleton';

// Helper functions
const categorizeError = (error: string): string => {
  const lowerError = error.toLowerCase();
  if (lowerError.includes('gas') || lowerError.includes('fee')) return 'Gas/Fee';
  if (lowerError.includes('network') || lowerError.includes('connection') || lowerError.includes('rpc')) return 'Network';
  if (lowerError.includes('wallet') || lowerError.includes('metamask') || lowerError.includes('provider')) return 'Wallet';
  if (lowerError.includes('contract') || lowerError.includes('revert') || lowerError.includes('execution')) return 'Smart Contract';
  if (lowerError.includes('validation') || lowerError.includes('invalid')) return 'Validation';
  if (lowerError.includes('api') || lowerError.includes('server') || lowerError.includes('500')) return 'API/Server';
  return 'Unknown';
};

const isCriticalError = (error: string): boolean => {
  const lowerError = error.toLowerCase();
  return lowerError.includes('revert') || lowerError.includes('failed') || lowerError.includes('rejected') || lowerError.includes('insufficient funds');
};

export default function ErrorAnalyticsPage() {
  const router = useRouter();
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const response = await fetch('/api/user-interactions?limit=1000');
        const data = await response.json();
        // Filter only interactions with errors
        const errorData = data.filter((i: UserInteraction) => 
          i.type.includes('error') || (i.data as any)?.error
        );
        setInteractions(errorData);
      } catch (error) {
        console.error('Error fetching interactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, []);

  const filteredErrors = interactions.filter(interaction => {
    const errorMsg = (interaction.data as any)?.error || 'Unknown Error';
    const category = categorizeError(errorMsg);
    const matchesFilter = filter === 'All' || category === filter;
    const matchesSearch = errorMsg.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (interaction.walletAddress || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredErrors.length / itemsPerPage);
  const paginatedErrors = filteredErrors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const errorCategories = interactions.reduce((acc, curr) => {
    const errorMsg = (curr.data as any)?.error || 'Unknown Error';
    const category = categorizeError(errorMsg);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Smart Contract': return <Shield className="w-5 h-5" />;
      case 'Network': return <Globe className="w-5 h-5" />;
      case 'Wallet': return <Wallet className="w-5 h-5" />;
      case 'Gas/Fee': return <Zap className="w-5 h-5" />;
      case 'Validation': return <CheckCircle className="w-5 h-5" />;
      case 'API/Server': return <Server className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    return 'bg-[#81D7B4]/10 text-[#81D7B4]';
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Error Analytics</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">Diagnose and resolve system issues.</p>
      </div>

      {/* Error Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(errorCategories).map(([category, count]) => (
          <div key={category} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                {getCategoryIcon(category)}
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-700">{category}</h3>
                <p className="text-xs text-slate-500">Errors</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-slate-900">{count}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Controls */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search by error message or wallet address..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#81D7B4]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              className="bg-gray-50 border border-gray-200 text-slate-700 text-sm rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {Object.keys(errorCategories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error List */}
        <div className="divide-y divide-gray-100">
          {filteredErrors.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No Errors Found</h3>
              <p className="text-slate-500">Great job! The system is running smoothly.</p>
            </div>
          ) : (
            <>
              {paginatedErrors.map((error) => {
                const errorMsg = (error.data as any)?.error || 'Unknown Error';
                const isCritical = isCriticalError(errorMsg);
                const isExpanded = expandedError === error.id;

                return (
                  <div key={error.id} className="group">
                    <div 
                      className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between ${isExpanded ? 'bg-gray-50' : ''}`}
                      onClick={() => setExpandedError(isExpanded ? null : error.id)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className={`p-2 rounded-full ${isCritical ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-slate-900 truncate">{errorMsg}</h4>
                            {isCritical && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide">
                                Critical
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>{new Date(error.timestamp).toLocaleString()}</span>
                            <span>•</span>
                            <span className="font-mono">{(error.walletAddress || 'Anonymous').slice(0, 6)}...{(error.walletAddress || 'Anonymous').slice(-4)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="ml-4">
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                    
                    {/* Expanded Detail View */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-gray-50 border-b border-gray-100"
                        >
                          <div className="p-4 sm:pl-16 pl-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Error Context</h5>
                              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                                {JSON.stringify(error.data, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">User Details</h5>
                              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Wallet:</span>
                                  <span className="font-mono text-slate-700">{error.walletAddress || 'Anonymous'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Action:</span>
                                  <span className="font-medium text-slate-700">{error.type}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Timestamp:</span>
                                  <span className="text-slate-700">{new Date(error.timestamp).toISOString()}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  if (error.walletAddress && error.walletAddress !== 'undefined') {
                                    router.push(`/user-interactions/users?address=${error.walletAddress}`);
                                  }
                                }}
                                disabled={!error.walletAddress || error.walletAddress === 'undefined'}
                                className={`mt-4 w-full py-2 border rounded-lg text-sm font-medium transition-colors ${
                                  error.walletAddress && error.walletAddress !== 'undefined'
                                    ? 'bg-white border-gray-300 text-slate-700 hover:bg-gray-50' 
                                    : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                {error.walletAddress && error.walletAddress !== 'undefined' ? 'View Full User Profile' : 'User Profile Not Available'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Pagination Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500 text-center sm:text-left">
                  Showing <span className="font-medium">{Math.min(filteredErrors.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span className="font-medium">{Math.min(filteredErrors.length, currentPage * itemsPerPage)}</span> of <span className="font-medium">{filteredErrors.length}</span> errors
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-slate-700 min-w-[100px] text-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
