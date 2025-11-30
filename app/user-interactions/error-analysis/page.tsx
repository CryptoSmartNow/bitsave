'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Exo } from 'next/font/google';
import { UserInteraction } from '@/lib/interactionTracker';
import UserInteractionsSidebar, { SidebarState } from '../../../components/UserInteractionsSidebar';
import { 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  ChevronDown, 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  Info, 
  Layers, 
  Wrench,
  Bug,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
});

// Enhanced Dynamic Error Analysis Component
const ErrorAnalysisCard = ({ errors, onDismiss, markErrorAsFixed, analyzeError }: { errors: UserInteraction[], onDismiss: () => void, markErrorAsFixed: (errorId: string) => void, analyzeError: (errorData: UserInteraction) => void }) => {
  const [expandedError, setExpandedError] = useState<string | null>(null);
  
  const errorCategories = errors.reduce((acc, error) => {
    const errorData = error.data as Record<string, unknown>;
    const errorType = (errorData?.error as string) || 'Unknown Error';
    const category = categorizeError(errorType);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Generate fixing suggestions for each error
  const generateFixingSuggestions = (errorMessage: string) => {
    const suggestions = [];
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('gas')) {
      suggestions.push('Increase gas limit or gas price');
      suggestions.push('Check network congestion and retry later');
      suggestions.push('Use gas estimation tools before transaction');
    }
    
    if (lowerError.includes('insufficient')) {
      suggestions.push('Check wallet balance');
      suggestions.push('Ensure sufficient token allowance');
      suggestions.push('Verify network fees are covered');
    }
    
    if (lowerError.includes('network') || lowerError.includes('rpc')) {
      suggestions.push('Switch to a different RPC endpoint');
      suggestions.push('Check internet connection');
      suggestions.push('Try again after network stabilizes');
    }
    
    if (lowerError.includes('contract') || lowerError.includes('revert')) {
      suggestions.push('Verify contract parameters');
      suggestions.push('Check contract state and conditions');
      suggestions.push('Review transaction data and inputs');
    }
    
    if (lowerError.includes('wallet') || lowerError.includes('metamask')) {
      suggestions.push('Reconnect wallet');
      suggestions.push('Update wallet extension');
      suggestions.push('Clear wallet cache and retry');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('Check error logs for more details');
      suggestions.push('Contact support if issue persists');
      suggestions.push('Try refreshing the page');
    }
    
    return suggestions;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="px-8 py-6 border-b border-gray-700/30 bg-gradient-to-r from-[#81D7B4]/10 to-[#66C4A3]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] rounded-2xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] bg-clip-text text-transparent">
                Error Analysis Report
              </h2>
              <p className="text-gray-400 text-sm">
                {errors.length} error{errors.length !== 1 ? 's' : ''} detected • Real-time monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] text-white rounded-xl hover:from-[#6bc4a1] hover:to-[#5bb394] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark All Fixed</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Error Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(errorCategories).map(([category, count]) => (
            <div key={category} className="p-6 border-b border-gray-700/50 hover:bg-gradient-to-r hover:from-[#81D7B4]/10 hover:to-[#66C4A3]/10 transition-all duration-300 group relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#81D7B4] to-[#66C4A3] rounded-r-full"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 border-2 border-gray-600">
                    <Bug className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{category}</h3>
                    <p className="text-gray-400 text-sm">Error Category</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-xs text-gray-400">occurrences</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Individual Error Details */}
        <div className="space-y-4">
          {errors.map((error, index) => {
            const errorData = error.data as Record<string, unknown>;
            const errorMessage = (errorData?.error as string) || 'Unknown Error';
            const suggestions = generateFixingSuggestions(errorMessage);
            const isExpanded = expandedError === error.id;

            return (
              <motion.div
                key={error.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-700/50 rounded-xl border border-gray-600/50 overflow-hidden hover:border-[#81D7B4]/50 transition-all duration-300"
              >
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedError(isExpanded ? null : error.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{parseErrorMessage(errorMessage)}</h4>
                        <p className="text-gray-400 text-sm">
                          {new Date(error.timestamp).toLocaleString()} • {(error.data as { page?: string; url?: string }).page || (error.data as { page?: string; url?: string }).url || 'Unknown page'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isCriticalError(errorMessage) 
                          ? 'bg-red-900/50 text-red-300 border border-red-700' 
                          : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                      }`}>
                        {isCriticalError(errorMessage) ? 'Critical' : 'Warning'}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-600/50 bg-gray-800/50"
                    >
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h5 className="text-white font-medium mb-3 flex items-center space-x-2">
                              <Info className="w-4 h-4 text-[#81D7B4]" />
                              <span>Error Details</span>
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Type:</span>
                                <span className="text-white">{categorizeError(errorMessage)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Wallet:</span>
                                <span className="text-white">{error.walletAddress || 'Anonymous'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Session:</span>
                                <span className="text-white">{error.sessionId?.slice(0, 8)}...</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="text-white font-medium mb-3 flex items-center space-x-2">
                              <Wrench className="w-4 h-4 text-[#81D7B4]" />
                              <span>Suggested Fixes</span>
                            </h5>
                            <ul className="space-y-2 text-sm">
                              {suggestions.map((suggestion, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <div className="w-1.5 h-1.5 bg-[#81D7B4] rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-300">{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-6 flex items-center space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markErrorAsFixed(error.id);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] text-white rounded-lg hover:from-[#6bc4a1] hover:to-[#5bb394] transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Mark as Fixed</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              analyzeError(error);
                            }}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 text-sm font-medium flex items-center space-x-2"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Analyze</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

const SimpleChart = ({ data, title }: { data: Array<{label: string, value: number}>, title: string }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        <BarChart3 className="w-5 h-5 text-[#81D7B4]" />
        <span>{title}</span>
      </h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">{item.label}</span>
            <div className="flex items-center space-x-3 flex-1 ml-4">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / maxValue) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="h-2 rounded-full bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] shadow-lg"
                />
              </div>
              <span className="text-white font-medium text-sm w-8 text-right">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ data, title, icon: IconComponent }: { data: Array<{label: string, value: number}>, title: string, icon: React.ComponentType<{ className?: string }> }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
        <IconComponent className="w-5 h-5 text-[#81D7B4]" />
        <span>{title}</span>
      </h3>
      <div className="flex items-end space-x-2 h-32">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / maxValue) * 100}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className="bg-gradient-to-t from-[#81D7B4] to-[#66C4A3] rounded-t-lg min-h-[2px] flex-1 relative group shadow-lg"
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {item.value}
              </div>
            </motion.div>
            <span className="text-gray-400 text-xs mt-2 text-center">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActivityChart = ({ interactions }: { interactions: UserInteraction[] }) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const activityData = last7Days.map(date => ({
    label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    value: interactions.filter(interaction => 
      interaction.timestamp.startsWith(date)
    ).length
  }));

  return <BarChart data={activityData} title="Error Activity (Last 7 Days)" icon={Activity} />;
};

const categorizeError = (errorMessage: string): string => {
  const lowerError = errorMessage.toLowerCase();
  if (lowerError.includes('gas') || lowerError.includes('fee')) return 'Gas/Fee Issues';
  if (lowerError.includes('network') || lowerError.includes('rpc')) return 'Network Issues';
  if (lowerError.includes('wallet') || lowerError.includes('metamask')) return 'Wallet Issues';
  return 'Contract Issues';
};

const isCriticalError = (errorMessage: string): boolean => {
  return errorMessage.toLowerCase().includes('critical') || errorMessage.toLowerCase().includes('fatal');
};

const parseErrorMessage = (errorMessage: string): string => {
  // Clean up common error prefixes and make more readable
  return errorMessage
    .replace(/^Error:\s*/i, '')
    .replace(/^MetaMask\s*/i, '')
    .replace(/^Web3\s*/i, '')
    .replace(/execution reverted:?\s*/i, '')
    .replace(/^VM Exception while processing transaction:\s*/i, '')
    .replace(/^Transaction failed:\s*/i, '')
    .trim();
};



export default function ErrorAnalysisPage() {
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showErrorAnalysis, setShowErrorAnalysis] = useState(false);
  const [sidebarState, setSidebarState] = useState<SidebarState>('open');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);



  useEffect(() => {
    fetchInteractions();
  }, []);

  const fetchInteractions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user-interactions');
      if (!response.ok) {
        throw new Error('Failed to fetch interactions');
      }
      const data = await response.json();
      setInteractions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const markErrorAsFixed = (errorId: string) => {
    setInteractions(prev => prev.filter(interaction => interaction.id !== errorId));
  };

  const analyzeError = (errorData: UserInteraction) => {
    console.log('Analyzing error:', errorData);
    // Implement detailed error analysis logic here
  };

  // Filter interactions to only show errors
  const errorInteractions = interactions.filter(interaction => {
    const data = interaction.data as Record<string, unknown>;
    return data?.error || data?.type === 'error';
  });

  // Apply search and filter
  const filteredErrors = errorInteractions.filter(interaction => {
    const data = interaction.data as Record<string, unknown>;
    const errorMessage = (data?.error as string) || '';
    const matchesSearch = errorMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ((interaction.data as { page?: string; url?: string }).page || (interaction.data as { page?: string; url?: string }).url || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    
    const category = categorizeError(errorMessage);
    return matchesSearch && category.toLowerCase().includes(filterType.toLowerCase());
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredErrors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedErrors = filteredErrors.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className={`${exo.className} min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Loading Error Analysis</h2>
            <p className="text-gray-400">Analyzing system errors...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${exo.className} min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Data</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchInteractions}
              className="w-full py-3 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] text-white font-semibold rounded-xl hover:from-[#6bc4a1] hover:to-[#5bb394] transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${exo.className} min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900`}>
      <div className="flex">
        <UserInteractionsSidebar 
          sidebarState={sidebarState} 
          setSidebarState={setSidebarState} 
        />

        {/* Main Content */}
        <div className={`flex-1 overflow-hidden transition-all duration-300 ${
          sidebarState === 'open' ? 'ml-80' : 
          sidebarState === 'collapsed' ? 'ml-24' : 
          'ml-0'
        }`}>
          {/* Header */}
          <div className="p-4 lg:p-6">
            <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl">
              <div className="px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] rounded-2xl flex items-center justify-center shadow-lg">
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] bg-clip-text text-transparent">
                        Error Analysis Center
                      </h1>
                      <div className="text-gray-300 font-medium flex items-center space-x-2">
                        <Bug className="w-4 h-4" />
                        <span>Real-time error monitoring • BitSave Platform</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="hidden sm:flex items-center space-x-2 bg-red-900/50 text-red-300 px-4 py-2 rounded-full text-sm font-medium border border-red-700">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      <span>Monitoring</span>
                    </div>
                    <button
                      onClick={fetchInteractions}
                      className="px-6 py-2 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] text-white rounded-xl hover:from-[#6BC49A] hover:to-[#5bb394] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Refresh Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Errors</p>
                <p className="text-3xl font-bold text-white">{filteredErrors.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-[#81D7B4] to-[#66C4A3] rounded-2xl shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <span className="bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                Active Issues
              </span>
            </div>
          </div>

          <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Critical Errors</p>
                <p className="text-3xl font-bold text-white">
                  {filteredErrors.filter(e => {
                    const data = e.data as Record<string, unknown>;
                    return isCriticalError((data?.error as string) || '');
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Error Categories</p>
                <p className="text-3xl font-bold text-white">
                  {new Set(filteredErrors.map(e => {
                    const data = e.data as Record<string, unknown>;
                    return categorizeError((data?.error as string) || '');
                  })).size}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-[#81D7B4] to-[#66C4A3] rounded-2xl shadow-lg">
                <Layers className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Resolution Rate</p>
                <p className="text-3xl font-bold text-white">
                  {filteredErrors.length > 0 ? Math.round((1 - filteredErrors.length / interactions.length) * 100) : 100}%
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-[#81D7B4] to-[#66C4A3] rounded-2xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search errors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#81D7B4] focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#81D7B4] focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="gas">Gas/Fee Issues</option>
                <option value="network">Network Issues</option>
                <option value="wallet">Wallet Issues</option>
                <option value="contract">Contract Issues</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
            <button
              onClick={() => setShowErrorAnalysis(!showErrorAnalysis)}
              className="px-6 py-3 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] text-white rounded-xl hover:from-[#6bc4a1] hover:to-[#5bb394] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analysis</span>
            </button>
          </div>
        </div>

        {/* Charts */}
        {showErrorAnalysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ActivityChart interactions={filteredErrors} />
            <SimpleChart 
              data={Object.entries(
                filteredErrors.reduce((acc, error) => {
                  const data = error.data as Record<string, unknown>;
                  const category = categorizeError((data?.error as string) || '');
                  acc[category] = (acc[category] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([label, value]) => ({ label, value }))}
              title="Error Distribution by Category"
            />
          </div>
        )}

        {/* Error Analysis */}
        {filteredErrors.length > 0 ? (
          <>
            <ErrorAnalysisCard
              errors={paginatedErrors}
              onDismiss={() => setInteractions(prev => prev.filter(i => {
                const data = i.data as Record<string, unknown>;
                return !data?.error && data?.type !== 'error';
              }))}
              markErrorAsFixed={markErrorAsFixed}
              analyzeError={analyzeError}
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="text-gray-400 text-sm">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredErrors.length)} of {filteredErrors.length} errors
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-300" />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] text-white'
                              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Errors Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Great news! No errors match your current filters. Your system is running smoothly.
            </p>
          </div>
        )}
        </div>
        </div>
      </div>
    </div>
  );
}