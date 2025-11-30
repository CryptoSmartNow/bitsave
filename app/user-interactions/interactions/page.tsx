'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exo } from 'next/font/google';
import UserInteractionsSidebar, { SidebarState } from '../../../components/UserInteractionsSidebar';
import { UserInteraction } from '@/lib/interactionTracker';
import { 
  AlertTriangle, 
  Activity, 
  Wallet, 
  TrendingUp, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  ChevronDown, 
  Clock, 
  Zap, 
  CheckCircle, 
  Info, 
  Database, 
  Globe
} from 'lucide-react';

const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
});





const isCriticalError = (errorMessage: string): boolean => {
  return errorMessage.includes('revert') || errorMessage.includes('failed') || errorMessage.includes('error');
};

const parseErrorMessage = (errorMessage: string): string => {
  // Remove common prefixes and clean up the error message
  let cleaned = errorMessage
    .replace(/^Error:\s*/, '')
    .replace(/^TypeError:\s*/, '')
    .replace(/^ReferenceError:\s*/, '')
    .replace(/^SyntaxError:\s*/, '')
    .replace(/execution reverted:\s*/i, '')
    .replace(/MetaMask Tx Signature:\s*/i, '')
    .replace(/User denied transaction signature/i, 'User cancelled transaction')
    .replace(/insufficient funds for gas \* price \+ value/i, 'Insufficient funds for transaction')
    .replace(/gas required exceeds allowance/i, 'Gas limit exceeded')
    .replace(/nonce too low/i, 'Transaction nonce conflict')
    .replace(/replacement transaction underpriced/i, 'Gas price too low for replacement');
  
  // Truncate very long messages
  if (cleaned.length > 100) {
    cleaned = cleaned.substring(0, 97) + '...';
  }
  
  return cleaned;
};

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'type'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarState, setSidebarState] = useState<SidebarState>('open');
  const itemsPerPage = 10;

  const fetchInteractions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/interactions');
      if (response.ok) {
        const data = await response.json();
        setInteractions(data);
      }
    } catch (error) {
      console.error('Failed to fetch interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInteractions();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page_view': return <Eye className="w-6 h-6" />;
      case 'wallet_connect': return <Wallet className="w-6 h-6" />;
      case 'savings_created': return <TrendingUp className="w-6 h-6" />;
      case 'error': return <AlertTriangle className="w-6 h-6" />;
      case 'transaction': return <CheckCircle className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'page_view': return 'border-blue-500 text-blue-300';
      case 'wallet_connect': return 'border-purple-500 text-purple-300';
      case 'savings_created': return 'border-green-500 text-green-300';
      case 'error': return 'border-red-500 text-red-300';
      case 'transaction': return 'border-emerald-500 text-emerald-300';
      default: return 'border-gray-500 text-gray-300';
    }
  };

  // Filter and search logic
  const filteredInteractions = interactions.filter(interaction => {
    const matchesFilter = filter === 'all' || interaction.type === filter;
    const matchesSearch = searchTerm === '' || 
      JSON.stringify(interaction).toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(interaction.timestamp).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Sort interactions
  const sortedInteractions = [...filteredInteractions].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'timestamp') {
      comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    } else if (sortBy === 'type') {
      comparison = a.type.localeCompare(b.type);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedInteractions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInteractions = sortedInteractions.slice(startIndex, endIndex);
  const allFilteredInteractions = sortedInteractions;



  return (
    <div className={`${exo.className} min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900`}>
      <div className="flex">
        <UserInteractionsSidebar 
          sidebarState={sidebarState} 
          setSidebarState={setSidebarState} 
        />

        {/* Main Content */}
        <div className={`flex-1 p-8 transition-all duration-300 ${
          sidebarState === 'open' ? 'ml-80' : 
          sidebarState === 'collapsed' ? 'ml-24' : 
          'ml-0'
        }`}>
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] bg-clip-text text-transparent">
                  User Interactions
                </h1>
                <p className="text-gray-300 mt-2">Monitor and analyze user activity in real-time</p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-gray-700/30 shadow-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-300" />
                    <label className="block text-sm font-semibold text-white">Search</label>
                  </div>
                  <input
                    type="text"
                    placeholder="Search interactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-[#81D7B4] focus:border-transparent transition-all duration-200 font-medium shadow-sm hover:shadow-md text-white placeholder-gray-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-300" />
                    <label className="block text-sm font-semibold text-white">Filter by Type</label>
                  </div>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-[#81D7B4] focus:border-transparent transition-all duration-200 font-medium shadow-sm hover:shadow-md text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="page_view">Page Views</option>
                    <option value="wallet_connect">Wallet Connections</option>
                    <option value="savings_created">Savings Created</option>
                    <option value="error">Errors</option>
                    <option value="transaction">Transactions</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <ChevronDown className="w-4 h-4 text-gray-300" />
                    <label className="block text-sm font-semibold text-white">Sort By</label>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'type')}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-[#81D7B4] focus:border-transparent transition-all duration-200 font-medium shadow-sm hover:shadow-md text-white"
                  >
                    <option value="timestamp">Timestamp</option>
                    <option value="type">Type</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">🔄 Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-[#81D7B4] focus:border-transparent transition-all duration-200 font-medium shadow-sm hover:shadow-md text-white"
                  >
                    <option value="desc">⬇️ Newest First</option>
                    <option value="asc">⬆️ Oldest First</option>
                  </select>
                </div>
              </div>
              
              {/* Quick Filter Buttons */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-600">
                <span className="text-sm font-semibold text-white">Quick Filters:</span>
                {[
                  { label: 'Today', action: () => setSearchTerm(new Date().toDateString()) },
                  { label: 'Errors Only', action: () => setFilter('error') },
                  { label: 'Missing Tx Hash', action: () => {
                    setFilter('savings_created');
                    setSearchTerm('null');
                  }},
                  { label: 'Wallet Activity', action: () => setFilter('wallet_connect') },
                  { label: 'Clear All', action: () => { setFilter('all'); setSearchTerm(''); } }
                ].map((quickFilter, index) => (
                  <button
                    key={index}
                    onClick={quickFilter.action}
                    className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl hover:from-[#81D7B4] hover:to-[#66C4A3] hover:text-white transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    {quickFilter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Interactions List */}
            <div className="bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-gray-700/30 shadow-xl overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-700/30 bg-gradient-to-r from-[#81D7B4]/10 to-[#66C4A3]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] rounded-2xl flex items-center justify-center shadow-lg">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] bg-clip-text text-transparent">
                        Recent Interactions
                      </h2>
                      <div className="text-gray-300 mt-1 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Live activity feed • {paginatedInteractions.length} events</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="hidden sm:flex items-center space-x-2 bg-green-900/30 text-green-300 px-3 py-1.5 rounded-full text-xs font-medium border border-green-700">
                      <Zap className="w-3 h-3" />
                      <span>Real-time</span>
                    </div>
                    <button
                      onClick={fetchInteractions}
                      className="px-4 py-2 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] text-white rounded-xl hover:from-[#6bc4a1] hover:to-[#5bb394] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#81D7B4] border-t-transparent mb-4"></div>
                  <p className="text-white font-medium">Loading interactions...</p>
                </div>
              ) : (
                <div className="max-h-[800px] overflow-y-auto">
                  <AnimatePresence>
                    {paginatedInteractions.map((interaction, index) => (
                      <motion.div
                        key={interaction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.02 }}
                        className="p-6 border-b border-gray-700/50 hover:bg-gradient-to-r hover:from-[#81D7B4]/10 hover:to-[#66C4A3]/10 transition-all duration-300 group relative"
                      >
                        {/* Status indicator line */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#81D7B4] to-[#66C4A3] rounded-r-full"></div>
                        
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 border-2 border-gray-600">
                              {getTypeIcon(interaction.type)}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getTypeColor(interaction.type)} shadow-sm bg-gray-700/80 backdrop-blur-sm`}>
                                  {interaction.type.replace('_', ' ').toUpperCase()}
                                </span>
                                <div className="flex items-center space-x-2 text-sm text-gray-300 bg-gray-700/80 px-3 py-1.5 rounded-lg">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-medium">
                                    {new Date(interaction.timestamp).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${getTypeColor(interaction.type).includes('green') ? 'bg-green-500' : getTypeColor(interaction.type).includes('red') ? 'bg-red-500' : 'bg-blue-500'} animate-pulse`}></div>
                                <span className="text-xs text-gray-300 font-medium">#{interaction.id.slice(-6)}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                              {interaction.walletAddress && (
                                <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-xl p-4 border border-blue-700/50 hover:shadow-md transition-all duration-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] rounded-lg flex items-center justify-center">
                                      <Wallet className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-blue-300">Wallet Address</span>
                                  </div>
                                  <code className="text-xs font-mono bg-gray-700/80 px-3 py-2 rounded-lg border border-blue-600/30 block truncate shadow-sm text-blue-300">
                                    {interaction.walletAddress}
                                  </code>
                                </div>
                              )}
                              
                              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-700/50 hover:shadow-md transition-all duration-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-8 h-8 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] rounded-lg flex items-center justify-center">
                                    <Database className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="text-sm font-semibold text-purple-300">Session ID</span>
                                </div>
                                <code className="text-xs font-mono bg-gray-700/80 px-3 py-2 rounded-lg border border-purple-600/30 block truncate shadow-sm text-purple-300">
                                  {interaction.sessionId}
                                </code>
                              </div>
                              
                              {interaction.ip && (
                                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-700/50 hover:shadow-md transition-all duration-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] rounded-lg flex items-center justify-center">
                                      <Globe className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-green-300">IP Address</span>
                                  </div>
                                  <code className="text-xs font-mono bg-gray-700/80 px-3 py-2 rounded-lg border border-green-600/30 block shadow-sm text-green-300">
                                    {interaction.ip}
                                  </code>
                                </div>
                              )}
                            </div>
                            
                            {interaction.type === 'error' && (
                              <div className="mt-3 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="text-sm font-medium text-red-300 flex items-center space-x-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Error Details</span>
                                  </div>
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    isCriticalError(((interaction.data as Record<string, unknown>)?.error as string) || '') 
                                      ? 'bg-red-800/50 text-red-300' 
                                      : 'bg-yellow-800/50 text-yellow-300'
                                  }`}>
                                    {isCriticalError(((interaction.data as Record<string, unknown>)?.error as string) || '') ? 'CRITICAL' : 'WARNING'}
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="text-sm text-red-300">
                                    <strong>Message:</strong> {parseErrorMessage(((interaction.data as Record<string, unknown>)?.error as string) || 'Unknown error')}
                                  </div>
                                  
                                  {(interaction.data as Record<string, unknown>)?.context ? (
                                    <div className="text-xs text-red-400">
                                      <strong>Context:</strong> 
                                      {((interaction.data as Record<string, unknown>).context as Record<string, unknown>).planName ? (
                                        <span className="ml-1 px-2 py-1 bg-red-800/50 rounded">Plan: {String(((interaction.data as Record<string, unknown>).context as Record<string, unknown>).planName)}</span>
                                      ) : null}
                                      {((interaction.data as Record<string, unknown>).context as Record<string, unknown>).chain ? (
                                        <span className="ml-1 px-2 py-1 bg-red-800/50 rounded">Chain: {String(((interaction.data as Record<string, unknown>).context as Record<string, unknown>).chain)}</span>
                                      ) : null}
                                      {((interaction.data as Record<string, unknown>).context as Record<string, unknown>).amount ? (
                                        <span className="ml-1 px-2 py-1 bg-red-800/50 rounded">Amount: {String(((interaction.data as Record<string, unknown>).context as Record<string, unknown>).amount)}</span>
                                      ) : null}
                                    </div>
                                  ) : null}
                                  
                                  {/* Base Savings Specific Error Help */}
                                  {(((interaction.data as Record<string, unknown>)?.context as Record<string, unknown> | undefined)?.planName === 'house rent' || 
                                    ((interaction.data as Record<string, unknown>)?.context as Record<string, unknown> | undefined)?.chain === 'base' ||
                                    (((interaction.data as Record<string, unknown>)?.error as string) && ((interaction.data as Record<string, unknown>).error as string).includes('estimateGas'))) && (
                                    <div className="mt-2 p-2 bg-orange-900/30 border border-orange-700 rounded text-xs">
                                      <div className="font-medium text-orange-300 mb-1 flex items-center space-x-2">
                                        <Info className="w-4 h-4" />
                                        <span>Base Savings Issue Detected</span>
                                      </div>
                                      <div className="text-orange-400">
                                        This appears to be related to Base network savings. Common fixes:
                                        <ul className="mt-1 ml-4 list-disc">
                                          <li>Ensure wallet is connected to Base network</li>
                                          <li>Check ETH balance for gas fees</li>
                                          <li>Try refreshing and retrying the transaction</li>
                                        </ul>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Transaction Hash Display for Savings Plans */}
                            {(interaction.type === 'savings_created' || interaction.type === 'transaction') && (
                              <div className="mb-4 p-4 bg-green-900/30 border border-green-700 rounded-xl">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="text-sm font-medium text-green-300 flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Transaction Details</span>
                                  </div>
                                  <div className="px-2 py-1 bg-green-800/50 text-green-300 rounded-full text-xs font-medium">
                                    {(interaction.data as Record<string, unknown>)?.txHash ? 'CONFIRMED' : 'PENDING'}
                                  </div>
                                </div>
                                
                                {(interaction.data as Record<string, unknown>)?.txHash ? (
                                  <div className="space-y-2">
                                    <div className="text-sm text-green-300">
                                      <strong>Transaction Hash:</strong>
                                    </div>
                                    <div className="bg-gray-700 p-3 rounded-lg border border-green-600">
                                      <code className="text-xs font-mono text-green-300 break-all">
                                        {String((interaction.data as Record<string, unknown>).txHash)}
                                      </code>
                                      <button 
                                        onClick={() => navigator.clipboard.writeText((interaction.data as Record<string, unknown>).txHash as string)}
                                        className="ml-2 px-2 py-1 bg-green-800/50 hover:bg-green-700/50 text-green-300 rounded text-xs transition-colors"
                                      >
                                        Copy
                                      </button>
                                    </div>
                                    
                                    {/* Savings Plan Details */}
                                    {interaction.type === 'savings_created' ? (
                                      <div className="grid grid-cols-2 gap-3 mt-3">
                                        {(interaction.data as Record<string, unknown>)?.planName ? (
                                          <div className="text-xs">
                                            <span className="font-medium text-green-300">Plan:</span>
                                            <span className="ml-1 text-green-400">{String((interaction.data as Record<string, unknown>).planName)}</span>
                                          </div>
                                        ) : null}
                                        {(interaction.data as Record<string, unknown>)?.amount ? (
                                          <div className="text-xs">
                                            <span className="font-medium text-green-300">Amount:</span>
                                            <span className="ml-1 text-green-400">{String((interaction.data as Record<string, unknown>).amount)} {String((interaction.data as Record<string, unknown>)?.currency || 'USDC')}</span>
                                          </div>
                                        ) : null}
                                        {(interaction.data as Record<string, unknown>)?.chain ? (
                                          <div className="text-xs">
                                            <span className="font-medium text-green-300">Chain:</span>
                                            <span className="ml-1 text-green-400 capitalize">{String((interaction.data as Record<string, unknown>).chain)}</span>
                                          </div>
                                        ) : null}
                                        {(interaction.data as Record<string, unknown>)?.penalty ? (
                                          <div className="text-xs">
                                            <span className="font-medium text-green-300">Penalty:</span>
                                            <span className="ml-1 text-green-400">{String((interaction.data as Record<string, unknown>).penalty)}</span>
                                          </div>
                                        ) : null}
                                      </div>
                                    ) : null}
                                  </div>
                                ) : null}
                                
                                {!(interaction.data as Record<string, unknown>)?.txHash && (
                                  <div className="text-sm text-orange-300 bg-orange-900/30 p-3 rounded-lg">
                                    ⚠️ <strong>No Transaction Hash:</strong> This transaction may have failed or is still pending.
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <details className="group/details">
                              <summary className="cursor-pointer flex items-center space-x-2 text-sm text-[#81D7B4] hover:text-[#6bc4a1] font-semibold transition-colors duration-200 p-3 bg-gradient-to-r from-[#81D7B4]/10 to-[#66C4A3]/10 rounded-xl hover:from-[#81D7B4]/20 hover:to-[#66C4A3]/20">
                                <svg className="w-4 h-4 group-open/details:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span>View Raw Data</span>
                              </summary>
                              <div className="mt-3 p-4 bg-gray-700 rounded-xl border border-gray-600">
                                <pre className="text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">
                                  {JSON.stringify(interaction.data, null, 2)}
                                </pre>
                              </div>
                            </details>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700/30">
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <span>Page {currentPage} of {totalPages}</span>
                        <span>•</span>
                        <span>{allFilteredInteractions.length} total results</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-2 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] text-white rounded-lg hover:from-[#6bc4a1] hover:to-[#5bb394] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-1"
                        >
                          <ChevronDown className="w-4 h-4 rotate-90" />
                          <span>Previous</span>
                        </button>
                        
                        {/* Page numbers */}
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                            if (pageNum > totalPages) return null;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  pageNum === currentPage
                                    ? 'bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] text-white rounded-lg hover:from-[#6bc4a1] hover:to-[#5bb394] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-1"
                        >
                          <span>Next</span>
                          <ChevronDown className="w-4 h-4 -rotate-90" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {paginatedInteractions.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No interactions found</h3>
                      <p className="text-gray-300 max-w-md mx-auto">Try adjusting your filters or search terms to find the interactions you&apos;re looking for.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}