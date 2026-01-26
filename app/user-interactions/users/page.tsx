'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Search, 
  User, 
  Calendar, 
  Clock, 
  Activity, 
  ChevronRight, 
  Wallet,
  ExternalLink,
  Shield,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { UserInteraction } from '@/lib/interactionTracker';
import DashboardSkeleton from '@/components/DashboardSkeleton';

interface UserProfile {
  address: string;
  firstSeen: string;
  lastSeen: string;
  interactionCount: number;
  errorCount: number;
  lastAction: string;
  interactions: UserInteraction[];
  chains: string[];
}

const CHAIN_EXPLORERS: Record<string, string> = {
  'ethereum': 'https://etherscan.io',
  'sepolia': 'https://sepolia.etherscan.io',
  'base': 'https://basescan.org',
  'celo': 'https://celoscan.io',
  'bsc': 'https://bscscan.com',
  'lisk': 'https://blockscout.lisk.com',
  'avalanche': 'https://snowtrace.io',
  'optimism': 'https://optimistic.etherscan.io',
  'arbitrum': 'https://arbiscan.io',
  'polygon': 'https://polygonscan.com',
};

const getExplorerUrl = (chain: string, address: string) => {
  const baseUrl = CHAIN_EXPLORERS[chain.toLowerCase()] || CHAIN_EXPLORERS['ethereum'];
  return `${baseUrl}/address/${address}`;
};

export default function UserManagementPage() {
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [sortType, setSortType] = useState<'recent' | 'active' | 'errors'>('recent');
  const [isChainModalOpen, setIsChainModalOpen] = useState(false);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const response = await fetch('/api/user-interactions?limit=1000');
        const data: UserInteraction[] = await response.json();
        
        // Aggregate data into user profiles
        const userMap = new Map<string, UserProfile>();
        
        data.forEach(interaction => {
          const address = interaction.walletAddress || 'Anonymous';
          if (!userMap.has(address)) {
            userMap.set(address, {
              address,
              firstSeen: interaction.timestamp,
              lastSeen: interaction.timestamp,
              interactionCount: 0,
              errorCount: 0,
              lastAction: interaction.type,
              interactions: [],
              chains: []
            });
          }
          
          const profile = userMap.get(address)!;
          
          // Track chains
          let chain = (interaction.data as any).chain || (interaction.data as any).network;
          if (chain) {
            chain = chain.toLowerCase();
            if (!profile.chains.includes(chain)) {
              profile.chains.push(chain);
            }
          }

          profile.interactionCount++;
          if (new Date(interaction.timestamp) > new Date(profile.lastSeen)) {
            profile.lastSeen = interaction.timestamp;
            profile.lastAction = interaction.type;
          }
          if (new Date(interaction.timestamp) < new Date(profile.firstSeen)) {
            profile.firstSeen = interaction.timestamp;
          }
          if (interaction.type.includes('error') || (interaction.data as any)?.error) {
            profile.errorCount++;
          }
          profile.interactions.push(interaction);
        });

        // Sort interactions for each user
        userMap.forEach(profile => {
          profile.interactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        });

        setProfiles(Array.from(userMap.values()));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, []);

  // Handle URL query parameters for user selection
  useEffect(() => {
    const addressParam = searchParams.get('address');
    if (addressParam && profiles.length > 0) {
      const user = profiles.find(p => p.address.toLowerCase() === addressParam.toLowerCase());
      if (user) {
        setSelectedUser(user);
        // Also update search term to make it easier to find in the list
        setSearchTerm(addressParam);
      }
    }
  }, [searchParams, profiles]);

  const toggleSort = () => {
    const types: ('recent' | 'active' | 'errors')[] = ['recent', 'active', 'errors'];
    const nextIndex = (types.indexOf(sortType) + 1) % types.length;
    setSortType(types[nextIndex]);
  };

  const handleExport = () => {
    if (!selectedUser) return;
    
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.text('Bitsave User Profile Report', 14, 22);
    
    // User Details Section
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('User Details', 14, 40);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Wallet Address:`, 14, 50);
    doc.setTextColor(0, 0, 0);
    doc.text(selectedUser.address, 50, 50);
    
    doc.setTextColor(100, 100, 100);
    doc.text(`First Seen:`, 14, 58);
    doc.setTextColor(0, 0, 0);
    doc.text(new Date(selectedUser.firstSeen).toLocaleString(), 50, 58);
    
    doc.setTextColor(100, 100, 100);
    doc.text(`Last Active:`, 14, 66);
    doc.setTextColor(0, 0, 0);
    doc.text(new Date(selectedUser.lastSeen).toLocaleString(), 50, 66);
    
    doc.setTextColor(100, 100, 100);
    doc.text(`Total Interactions:`, 14, 74);
    doc.setTextColor(0, 0, 0);
    doc.text(selectedUser.interactionCount.toString(), 50, 74);
    
    doc.setTextColor(100, 100, 100);
    doc.text(`Error Rate:`, 14, 82);
    const errorRate = ((selectedUser.errorCount / selectedUser.interactionCount) * 100).toFixed(1);
    if (parseFloat(errorRate) > 0) {
      doc.setTextColor(220, 53, 69); // Red
    } else {
      doc.setTextColor(40, 167, 69); // Green
    }
    doc.text(`${errorRate}%`, 50, 82);
    
    doc.setTextColor(100, 100, 100);
    doc.text(`Chains Used:`, 14, 90);
    doc.setTextColor(0, 0, 0);
    doc.text(selectedUser.chains?.join(', ') || 'N/A', 50, 90);

    // Interaction Table
    const tableData = selectedUser.interactions.map(i => [
      new Date(i.timestamp).toLocaleString(),
      i.type.replace(/_/g, ' '),
      ((i.data as any).chain || (i.data as any).network || '-').toString(),
      JSON.stringify(i.data).length > 50 
        ? JSON.stringify(i.data).substring(0, 50) + '...' 
        : JSON.stringify(i.data)
    ]);

    autoTable(doc, {
      startY: 100,
      head: [['Timestamp', 'Type', 'Chain', 'Details']],
      body: tableData,
      headStyles: { fillColor: [129, 215, 180] }, // #81D7B4
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 9 },
    });

    doc.save(`user-report-${selectedUser.address.slice(0, 8)}.pdf`);
  };

  const handleExternalLink = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const chains = selectedUser.chains?.length ? selectedUser.chains : ['ethereum'];
    
    if (chains.length === 1) {
      window.open(getExplorerUrl(chains[0], selectedUser.address), '_blank');
    } else {
      setIsChainModalOpen(true);
    }
  };

  const filteredProfiles = profiles
    .filter(p => p.address.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortType === 'active') return b.interactionCount - a.interactionCount;
      if (sortType === 'errors') return b.errorCount - a.errorCount;
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime(); // recent
    });

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-500 mt-1">Search and view detailed user profiles and history.</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* User List Panel */}
        <div className={`w-full lg:w-1/3 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden ${selectedUser ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Search wallet address..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#81D7B4]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 px-1">
              <span>{filteredProfiles.length} Users Found</span>
              <button 
                className="flex items-center hover:text-slate-900"
                onClick={toggleSort}
              >
                <Filter className="w-3 h-3 mr-1" /> 
                Sort: {sortType.charAt(0).toUpperCase() + sortType.slice(1)}
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 p-2">
            {filteredProfiles.map(profile => (
              <div 
                key={profile.address}
                onClick={() => setSelectedUser(profile)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  selectedUser?.address === profile.address 
                    ? 'bg-[#81D7B4]/10 border-[#81D7B4]/20 ring-1 ring-[#81D7B4]/20' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4]">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-sm text-slate-700 font-medium">
                      {profile.address.slice(0, 6)}...{profile.address.slice(-4)}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-400 ${selectedUser?.address === profile.address ? 'text-[#81D7B4]' : ''}`} />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-xs text-slate-500 bg-gray-50 px-2 py-1 rounded-lg">
                    {profile.interactionCount} Actions
                  </div>
                  <div className="text-xs text-slate-500 bg-gray-50 px-2 py-1 rounded-lg text-right">
                    {new Date(profile.lastSeen).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className={`flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ${!selectedUser ? 'hidden lg:flex' : 'flex'}`}>
          {selectedUser ? (
            <div className="flex flex-col h-full">
              {/* Detail Header */}
              <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <button 
                      onClick={() => setSelectedUser(null)}
                      className="lg:hidden mb-4 flex items-center text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back to List
                    </button>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-mono truncate" title={selectedUser.address}>
                        {selectedUser.address.length > 20 
                          ? `${selectedUser.address.slice(0, 8)}...${selectedUser.address.slice(-6)}`
                          : selectedUser.address}
                      </h2>
                      <button onClick={handleExternalLink} className="flex-shrink-0 text-gray-400 hover:text-[#81D7B4]">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Bitsave User Profile</p>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button 
                      onClick={handleExport}
                      className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <span>Export Data</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">First Seen</div>
                    <div className="font-medium text-slate-900">{new Date(selectedUser.firstSeen).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Last Active</div>
                    <div className="font-medium text-slate-900">{new Date(selectedUser.lastSeen).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Total Interactions</div>
                    <div className="font-medium text-slate-900">{selectedUser.interactionCount}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Error Rate</div>
                    <div className={`font-medium ${selectedUser.errorCount > 0 ? 'text-red-600' : 'text-[#81D7B4]'}`}>
                      {((selectedUser.errorCount / selectedUser.interactionCount) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Activity History
                </h3>
                <div className="relative pl-6 border-l-2 border-gray-100 space-y-8">
                  {selectedUser.interactions.map((interaction, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-white ${
                        interaction.type.includes('error') ? 'bg-red-500' : 'bg-[#81D7B4]'
                      }`}></div>
                      <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-slate-900">{interaction.type.replace(/_/g, ' ')}</span>
                          <span className="text-xs text-gray-500">{new Date(interaction.timestamp).toLocaleString()}</span>
                        </div>
                        {interaction.data && Object.keys(interaction.data).length > 0 && (
                          <pre className="text-xs bg-white p-2 rounded-lg border border-gray-200 text-gray-600 overflow-x-auto">
                            {JSON.stringify(interaction.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-gray-300" />
              </div>
              <p>Select a user to view detailed profile</p>
            </div>
          )}
        </div>
      </div>
      {/* Chain Selection Modal */}
      <AnimatePresence>
        {isChainModalOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsChainModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4">View on Explorer</h3>
              <p className="text-sm text-gray-500 mb-4">
                This user has interacted with multiple chains. Select which chain explorer you want to view.
              </p>
              <div className="space-y-2">
                {selectedUser.chains?.map(chain => (
                  <a
                    key={chain}
                    href={getExplorerUrl(chain, selectedUser.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full p-3 rounded-xl bg-gray-50 hover:bg-[#81D7B4]/10 hover:text-[#81D7B4] transition-colors"
                    onClick={() => setIsChainModalOpen(false)}
                  >
                    <span className="capitalize font-medium">{chain}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ))}
              </div>
              <button
                onClick={() => setIsChainModalOpen(false)}
                className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-slate-900"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
