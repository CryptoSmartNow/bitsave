'use client';

import { 
  Search01Icon, 
  UserIcon, 
  Calendar01Icon, 
  Clock01Icon, 
  Activity01Icon, 
  ArrowRight01Icon, 
  Wallet01Icon, 
  LinkSquare01Icon, 
  Shield01Icon, 
  FilterIcon, 
  ArrowLeft01Icon,
  Copy01Icon,
  CheckmarkCircle01Icon,
  Download01Icon,
  Alert02Icon,
  Coins01Icon
} from "hugeicons-react";
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  'base': 'https://basescan.org',
  'celo': 'https://celoscan.io',
  'bsc': 'https://bscscan.com',
  'lisk': 'https://blockscout.lisk.com',
  'avalanche': 'https://snowtrace.io',
  'ethereum': 'https://etherscan.io',
};

const getExplorerUrl = (chain: string, address: string) => {
  const baseUrl = CHAIN_EXPLORERS[chain.toLowerCase()] || CHAIN_EXPLORERS['base'];
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const response = await fetch('/api/user-interactions?limit=2000');
        const raw = await response.json();
        const data: UserInteraction[] = Array.isArray(raw) ? raw : raw.interactions || [];
        
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
          
          let chain = (interaction.data as any)?.chain || (interaction.data as any)?.network;
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

        userMap.forEach(profile => {
          profile.interactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        });

        setProfiles(Array.from(userMap.values()));
      } catch (error) {
        console.error('Error fetching user profiles:', error);
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
        setSearchTerm(addressParam);
      }
    }
  }, [searchParams, profiles]);

  const toggleSort = () => {
    const types: ('recent' | 'active' | 'errors')[] = ['recent', 'active', 'errors'];
    const nextIndex = (types.indexOf(sortType) + 1) % types.length;
    setSortType(types[nextIndex]);
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!selectedUser) return;
    
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('BitSave User Activity Report', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Wallet Address: ${selectedUser.address}`, 14, 34);
    doc.text(`First Seen: ${new Date(selectedUser.firstSeen).toLocaleString()}`, 14, 42);
    doc.text(`Last Active: ${new Date(selectedUser.lastSeen).toLocaleString()}`, 14, 50);
    doc.text(`Total Operations: ${selectedUser.interactionCount}`, 14, 58);
    doc.text(`Errors Logged: ${selectedUser.errorCount}`, 14, 66);
    doc.text(`Chains Interacted: ${selectedUser.chains?.join(', ') || 'Base'}`, 14, 74);

    const tableData = selectedUser.interactions.map(i => [
      new Date(i.timestamp).toLocaleString(),
      i.type.replace(/_/g, ' '),
      ((i.data as any)?.chain || '-').toString(),
      JSON.stringify(i.data || {}).substring(0, 60)
    ]);

    autoTable(doc, {
      startY: 84,
      head: [['Timestamp', 'Action', 'Chain', 'Context']],
      body: tableData,
      headStyles: { fillColor: [129, 215, 180] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8 },
    });

    doc.save(`bitsave-profile-${selectedUser.address.slice(0, 8)}.pdf`);
  };

  const handleExternalLink = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const chains = selectedUser.chains?.length ? selectedUser.chains : ['base'];
    if (chains.length === 1) {
      window.open(getExplorerUrl(chains[0], selectedUser.address), '_blank');
    } else {
      setIsChainModalOpen(true);
    }
  };

  const filteredProfiles = useMemo(() => {
    return profiles
      .filter(p => p.address.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortType === 'active') return b.interactionCount - a.interactionCount;
        if (sortType === 'errors') return b.errorCount - a.errorCount;
        return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
      });
  }, [profiles, searchTerm, sortType]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="font-sans text-gray-900 dark:text-white space-y-6 pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/15 text-blue-500 border border-blue-500/25 text-[10px] font-black uppercase tracking-wider">
              Identity & Wallets
            </span>
            <span className="text-xs text-gray-400">User Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white font-display">
            User Management & Profiles
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Search wallet addresses, view lifetime transactions, and inspect individual telemetry history.
          </p>
        </div>
      </div>

      {/* ── Main Split View ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
        {/* Left Column: User List (5 cols) */}
        <div className={`lg:col-span-4 bg-white dark:bg-[#0c121e] rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xs flex flex-col overflow-hidden ${selectedUser ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 dark:border-white/5 space-y-3 bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="relative">
              <Search01Icon className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search wallet (0x...)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-white dark:bg-[#141d2d] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#81D7B4]"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span className="font-bold text-gray-700 dark:text-gray-300 font-mono text-[11px]">{filteredProfiles.length} Wallets</span>
              <button
                type="button"
                onClick={toggleSort}
                className="flex items-center gap-1 hover:text-[#81D7B4] text-[11px] font-bold cursor-pointer transition-colors"
              >
                <FilterIcon className="w-3 h-3" />
                <span>Sort: {sortType.toUpperCase()}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5 p-2 custom-scrollbar">
            {filteredProfiles.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">
                No wallet addresses found.
              </div>
            ) : (
              filteredProfiles.map((profile) => {
                const isSelected = selectedUser?.address === profile.address;
                const isAnon = profile.address === 'Anonymous';

                return (
                  <div
                    key={profile.address}
                    onClick={() => setSelectedUser(profile)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#81D7B4]/15 border border-[#81D7B4]/40 shadow-xs'
                        : 'hover:bg-gray-50 dark:hover:bg-white/[0.02] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-[#81D7B4]/20 text-[#1c4b38] dark:text-[#81D7B4] flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                          {isAnon ? 'GU' : profile.address.slice(2, 4)}
                        </div>
                        <span className="font-mono text-xs font-bold text-gray-900 dark:text-white truncate">
                          {isAnon ? 'Guest User' : `${profile.address.slice(0, 6)}...${profile.address.slice(-4)}`}
                        </span>
                      </div>
                      <ArrowRight01Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#81D7B4]' : 'text-gray-400'}`} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10.5px] mt-2">
                      <div className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-medium">
                        {profile.interactionCount} Events
                      </div>
                      <div className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-medium text-right">
                        {new Date(profile.lastSeen).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: User Profile Details (7 cols) */}
        <div className={`lg:col-span-8 bg-white dark:bg-[#0c121e] rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-xs overflow-hidden flex flex-col ${!selectedUser ? 'hidden lg:flex' : 'flex'}`}>
          {selectedUser ? (
            <div className="flex flex-col h-full">
              {/* Profile Header */}
              <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="lg:hidden mb-4 flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft01Icon className="w-3.5 h-3.5" />
                  <span>Back to User List</span>
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black font-mono text-gray-900 dark:text-white truncate">
                        {selectedUser.address}
                      </h2>
                      {selectedUser.address !== 'Anonymous' && (
                        <>
                          <button
                            type="button"
                            onClick={() => copyAddress(selectedUser.address)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#81D7B4] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            title="Copy Wallet Address"
                          >
                            {copied ? <CheckmarkCircle01Icon className="w-4 h-4 text-emerald-500" /> : <Copy01Icon className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={handleExternalLink}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#81D7B4] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            title="Open Explorer"
                          >
                            <LinkSquare01Icon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 font-medium">
                      BitSave Protocol Onchain User Profile
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExport}
                    className="px-4 py-2 rounded-2xl bg-white dark:bg-[#141d2d] border border-gray-200 dark:border-white/10 hover:border-[#81D7B4] text-xs font-bold text-gray-800 dark:text-gray-200 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
                  >
                    <Download01Icon className="w-3.5 h-3.5 text-[#81D7B4]" />
                    <span>Export PDF Report</span>
                  </button>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141d2d] border border-gray-200/70 dark:border-white/10">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">First Seen</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white font-mono">{new Date(selectedUser.firstSeen).toLocaleDateString()}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141d2d] border border-gray-200/70 dark:border-white/10">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Last Active</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white font-mono">{new Date(selectedUser.lastSeen).toLocaleDateString()}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141d2d] border border-gray-200/70 dark:border-white/10">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Lifetime Events</span>
                    <span className="text-base font-black font-instrument text-gray-900 dark:text-white">{selectedUser.interactionCount}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141d2d] border border-gray-200/70 dark:border-white/10">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Error Rate</span>
                    <span className={`text-base font-black font-instrument ${selectedUser.errorCount > 0 ? 'text-red-500' : 'text-[#81D7B4]'}`}>
                      {((selectedUser.errorCount / Math.max(1, selectedUser.interactionCount)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity01Icon className="w-3.5 h-3.5 text-[#81D7B4]" />
                  <span>Telemetry Timeline ({selectedUser.interactions.length})</span>
                </h3>

                <div className="space-y-4">
                  {selectedUser.interactions.map((interaction, idx) => {
                    const isError = interaction.type.includes('error') || (interaction.data as any)?.error;

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isError ? 'bg-red-500' : 'bg-[#81D7B4]'}`} />
                            <span>{interaction.type.replace(/_/g, ' ')}</span>
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {new Date(interaction.timestamp).toLocaleString()}
                          </span>
                        </div>

                        {interaction.data && Object.keys(interaction.data).length > 0 && (
                          <pre className="p-3 rounded-xl bg-white dark:bg-[#141d2d] border border-gray-200/70 dark:border-white/10 text-[11px] font-mono text-gray-700 dark:text-gray-300 overflow-x-auto custom-scrollbar">
                            {JSON.stringify(interaction.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
              <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-base font-black text-gray-900 dark:text-white font-display">Select a Wallet Address</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Choose a wallet from the left panel or use the search bar to inspect its lifetime telemetry and execution history.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chain Selector Modal */}
      <AnimatePresence>
        {isChainModalOpen && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
              onClick={() => setIsChainModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-white dark:bg-[#0c121e] rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-white/10 z-50"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-base font-black font-display text-gray-900 dark:text-white mb-1">
                View on Block Explorer
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Select which network explorer to view this wallet address on:
              </p>

              <div className="space-y-2">
                {(selectedUser.chains?.length ? selectedUser.chains : ['base', 'celo', 'lisk', 'bsc', 'avalanche']).map(chain => (
                  <a
                    key={chain}
                    href={getExplorerUrl(chain, selectedUser.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-[#81D7B4]/15 hover:text-[#81D7B4] transition-colors text-xs font-bold text-gray-900 dark:text-white"
                    onClick={() => setIsChainModalOpen(false)}
                  >
                    <span className="capitalize">{chain} Network</span>
                    <LinkSquare01Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
