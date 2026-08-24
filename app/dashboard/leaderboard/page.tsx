'use client';

import { 
  Award01Icon, 
  CrownIcon, 
  Target01Icon, 
  ArrowUpRight01Icon,
  Calendar01Icon,
  UserMultipleIcon,
  RefreshIcon
} from "hugeicons-react";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exo, Instrument_Sans } from 'next/font/google';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '@/utils/networkLogos';

const exo = Exo({ subsets: ['latin'], display: 'swap', variable: '--font-exo' });
const instrument = Instrument_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-instrument' });

const ensureImageUrl = (url?: string): string => {
  if (!url) return '/base-logo.png';
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return url;
  return `/${url.replace(/^\//, '')}`;
};

interface LeaderboardUser {
  useraddress: string;
  savvyName?: string | null;
  totalamount: number;
  chain: string;
  id: string;
  rank?: number;
  points?: number;
}

const REWARDS = [
  { rank: 1, suffix: 'st', amount: 250, style: 'bg-[#81D7B4]/15 border-[#81D7B4]/40 text-gray-900 dark:text-[#81D7B4]' },
  { rank: 2, suffix: 'nd', amount: 200, style: 'bg-gray-100/80 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-200' },
  { rank: 3, suffix: 'rd', amount: 150, style: 'bg-gray-100/80 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-300' },
  { rank: 4, suffix: 'th', amount: 100 },
  { rank: 5, suffix: 'th', amount: 75 },
  { rank: 6, suffix: 'th', amount: 60 },
  { rank: 7, suffix: 'th', amount: 50 },
  { rank: 8, suffix: 'th', amount: 40 },
  { rank: 9, suffix: 'th', amount: 30 },
  { rank: 10, suffix: 'th', amount: 25 },
];

export default function LeaderboardPage() {
  const { address } = useAccount();

  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});
  
  useEffect(() => {
    fetchMultipleNetworkLogos(['base', 'celo', 'lisk', 'avalanche', 'bsc'])
      .then(setNetworkLogos)
      .catch(() => {});
  }, []);

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentUserPosition, setCurrentUserPosition] = useState<LeaderboardUser | null>(null);
  const [timeFilter, setTimeFilter] = useState<'Monthly' | 'All Time'>('Monthly');

  const fetchLeaderboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/leaderboard', { headers: { 'accept': 'application/json' }});
      if (!response.ok) {
        setLeaderboardData([]);
        return;
      }
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        setLeaderboardData([]);
        return;
      }
      
      const rankedData: LeaderboardUser[] = data
        .filter((user: any) => {
          const amt = typeof user.totalamount === 'number' ? user.totalamount : parseFloat(user.totalamount || 0);
          return !isNaN(amt) && amt > 0;
        })
        .map((user: any) => {
          const amount = typeof user.totalamount === 'number' ? user.totalamount : parseFloat(user.totalamount);
          return {
            ...user,
            totalamount: Number(amount.toFixed(2)),
            points: Math.floor(amount * 10) // 10 points per 1 USD saved
          };
        })
        .sort((a, b) => b.totalamount - a.totalamount)
        .slice(0, 10)
        .map((user, index) => ({ ...user, rank: index + 1 }));
      
      setLeaderboardData(rankedData);
      
      if (address) {
        const userPosition = rankedData.find(user => user.useraddress?.toLowerCase() === address.toLowerCase());
        setCurrentUserPosition(userPosition || null);
      }
    } catch {
      setLeaderboardData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, [address]);

  const openUserDetails = (user: LeaderboardUser) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const getAvatarColor = (addr: string) => {
    const colors = [
      'bg-[#FFB7B2]', 'bg-[#E2F0CB]', 'bg-[#B5EAD7]', 'bg-[#E5E7EB]', 
      'bg-[#F3B0C3]', 'bg-[#FFDAC1]', 'bg-[#81D7B4]', 'bg-[#F4F4F5]'
    ];
    if (!addr) return colors[0];
    const charCode = addr.charCodeAt(addr.length - 1);
    return colors[charCode % colors.length];
  };

  const getChainLogo = (chain?: string) => {
    const c = (chain || 'base').toLowerCase();
    if (c === 'celo') return '/celo.png';
    if (c === 'lisk') return '/lisk.png';
    if (c === 'avalanche' || c === 'avax') return '/avalanche-logo.svg';
    if (c === 'bsc' || c === 'bnb') return '/bsc.png';
    return '/base-logo.png';
  };

  const getExplorerUrl = (addr: string, chain?: string) => {
    const c = (chain || 'base').toLowerCase();
    if (c === 'celo') return `https://celoscan.io/address/${addr}`;
    if (c === 'bsc' || c === 'bnb') return `https://bscscan.com/address/${addr}`;
    if (c === 'lisk') return `https://blockscout.lisk.com/address/${addr}`;
    if (c === 'avalanche' || c === 'avax') return `https://snowtrace.io/address/${addr}`;
    return `https://basescan.org/address/${addr}`;
  };

  const getPodiumData = (index: number) => {
    return leaderboardData[index] || null;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className={`w-full ${exo.variable} ${instrument.variable} font-sans transition-colors duration-500 relative py-4 sm:py-6`}>
      
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[45vw] h-[45vw] bg-[#81D7B4]/10 dark:bg-[#81D7B4]/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-instrument font-bold text-gray-900 dark:text-white tracking-tight">
              Savers Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
              Top savers across BitSave and monthly reward pool standings
            </p>
          </div>
          
          <button 
            onClick={fetchLeaderboardData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[#81D7B4] transition-all cursor-pointer shadow-xs"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#81D7B4]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Pane (8 Cols) - Podium & Leaderboard Table */}
          <div className="xl:col-span-8 flex flex-col">
            
            {/* Podium (Top 3 Savers) */}
            {leaderboardData.length > 0 && (
              <div className="flex items-end justify-center h-[260px] sm:h-[300px] mb-8 relative px-2">
                
                {/* 2nd Place */}
                {getPodiumData(1) && (
                  <div className="flex flex-col items-center justify-end h-full w-[30%] max-w-[160px] cursor-pointer group z-10" onClick={() => openUserDetails(getPodiumData(1)!)}>
                    <div className="flex flex-col items-center mb-3 transition-transform group-hover:-translate-y-1.5 duration-300">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${getAvatarColor(getPodiumData(1)!.useraddress)} border-2 border-white dark:border-[#121212] shadow-md flex items-center justify-center font-bold text-gray-900 mb-2`}>
                        {getPodiumData(1)!.savvyName ? getPodiumData(1)!.savvyName!.slice(0, 2).toUpperCase() : getPodiumData(1)!.useraddress.slice(2, 4)}
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[90px] text-center mb-1">
                        {getPodiumData(1)!.savvyName ? `@${getPodiumData(1)!.savvyName}` : `${getPodiumData(1)!.useraddress.slice(0, 6)}...`}
                      </span>
                      <div className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-xs">
                        {formatCurrency(getPodiumData(1)!.totalamount)}
                      </div>
                    </div>
                    {/* Podium Pillar */}
                    <div className="w-full h-[120px] sm:h-[140px] bg-gray-50/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md rounded-t-2xl relative flex justify-center shadow-sm border-t border-x border-gray-200 dark:border-white/10 group-hover:brightness-105 transition-all overflow-hidden">
                      <div className="absolute top-3 text-5xl sm:text-6xl font-black text-gray-300 dark:text-white/10 font-instrument">2</div>
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {getPodiumData(0) && (
                  <div className="flex flex-col items-center justify-end h-full w-[35%] max-w-[180px] cursor-pointer group z-20 -mx-2 sm:mx-1" onClick={() => openUserDetails(getPodiumData(0)!)}>
                    <div className="flex flex-col items-center mb-3 transition-transform group-hover:-translate-y-2 duration-300 relative">
                      <CrownIcon className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 absolute -top-8 sm:-top-9 animate-bounce drop-shadow-sm" />
                      <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl ${getAvatarColor(getPodiumData(0)!.useraddress)} border-2 border-white dark:border-[#121212] shadow-lg flex items-center justify-center font-bold text-gray-900 mb-2 relative`}>
                        {getPodiumData(0)!.savvyName ? getPodiumData(0)!.savvyName!.slice(0, 2).toUpperCase() : getPodiumData(0)!.useraddress.slice(2, 4)}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-[100px] text-center mb-1">
                        {getPodiumData(0)!.savvyName ? `@${getPodiumData(0)!.savvyName}` : `${getPodiumData(0)!.useraddress.slice(0, 6)}...`}
                      </span>
                      <div className="bg-[#81D7B4]/20 border border-[#81D7B4]/40 text-[#2D5A4A] dark:text-[#81D7B4] text-xs sm:text-sm font-bold px-3 py-0.5 rounded-full whitespace-nowrap shadow-xs">
                        {formatCurrency(getPodiumData(0)!.totalamount)}
                      </div>
                    </div>
                    {/* Podium Pillar */}
                    <div className="w-full h-[160px] sm:h-[185px] bg-[#81D7B4]/10 dark:bg-[#81D7B4]/10 backdrop-blur-md rounded-t-2xl relative flex justify-center shadow-sm border-t border-x border-[#81D7B4]/30 group-hover:brightness-105 transition-all overflow-hidden">
                      <div className="absolute top-4 text-6xl sm:text-7xl font-black text-[#81D7B4]/40 font-instrument">1</div>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {getPodiumData(2) && (
                  <div className="flex flex-col items-center justify-end h-full w-[30%] max-w-[160px] cursor-pointer group z-10" onClick={() => openUserDetails(getPodiumData(2)!)}>
                    <div className="flex flex-col items-center mb-3 transition-transform group-hover:-translate-y-1.5 duration-300">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${getAvatarColor(getPodiumData(2)!.useraddress)} border-2 border-white dark:border-[#121212] shadow-md flex items-center justify-center font-bold text-gray-900 mb-2`}>
                        {getPodiumData(2)!.savvyName ? getPodiumData(2)!.savvyName!.slice(0, 2).toUpperCase() : getPodiumData(2)!.useraddress.slice(2, 4)}
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[90px] text-center mb-1">
                        {getPodiumData(2)!.savvyName ? `@${getPodiumData(2)!.savvyName}` : `${getPodiumData(2)!.useraddress.slice(0, 6)}...`}
                      </span>
                      <div className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-xs">
                        {formatCurrency(getPodiumData(2)!.totalamount)}
                      </div>
                    </div>
                    {/* Podium Pillar */}
                    <div className="w-full h-[95px] sm:h-[110px] bg-gray-50/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md rounded-t-2xl relative flex justify-center shadow-sm border-t border-x border-gray-200 dark:border-white/10 group-hover:brightness-105 transition-all overflow-hidden">
                      <div className="absolute top-2 text-4xl sm:text-5xl font-black text-gray-300 dark:text-white/10 font-instrument">3</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Leaderboard Table Card */}
            <div className="bg-white dark:bg-[#121212] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm p-4 sm:p-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <Calendar01Icon className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white font-instrument tracking-wide">
                    {timeFilter === 'Monthly' ? 'Monthly Leaderboard' : 'All-Time Leaderboard'}
                  </h2>
                </div>
                
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200/60 dark:border-white/5 w-full sm:w-auto">
                  <button 
                    onClick={() => setTimeFilter('Monthly')}
                    className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      timeFilter === 'Monthly' 
                        ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-xs' 
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button 
                    onClick={() => setTimeFilter('All Time')}
                    className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      timeFilter === 'All Time' 
                        ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-xs' 
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    All Time
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-2.5">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex items-center gap-4 animate-pulse p-3 rounded-2xl bg-gray-50 dark:bg-white/5">
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-white/10" />
                      <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-gray-200 dark:bg-white/10 rounded w-1/3" />
                        <div className="h-2.5 bg-gray-200 dark:bg-white/10 rounded w-1/4" />
                      </div>
                      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : leaderboardData.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-gray-100 dark:border-white/10">
                    <UserMultipleIcon className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No Active Savers Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Create your first savings plan to lead the leaderboard!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {leaderboardData.map((user, idx) => {
                    const isCurrentUser = address && user.useraddress?.toLowerCase() === address.toLowerCase();
                    return (
                      <div 
                        key={user.id || user.useraddress} 
                        onClick={() => openUserDetails(user)}
                        className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl transition-all cursor-pointer border ${
                          isCurrentUser 
                            ? 'bg-[#81D7B4]/10 border-[#81D7B4]/30 shadow-xs' 
                            : 'bg-gray-50/50 dark:bg-[#161616] hover:bg-gray-100/70 dark:hover:bg-white/5 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            idx === 0 ? 'bg-[#81D7B4] text-white' : 
                            idx === 1 ? 'bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-white' :
                            idx === 2 ? 'bg-amber-600/30 text-amber-700 dark:text-amber-300' :
                            'text-gray-400 dark:text-gray-500'
                          }`}>
                            {idx + 1}
                          </div>
                          
                          <div className={`w-10 h-10 rounded-xl ${getAvatarColor(user.useraddress)} flex items-center justify-center text-gray-900 font-bold text-xs shrink-0`}>
                            {user.savvyName ? user.savvyName.slice(0, 2).toUpperCase() : user.useraddress.slice(2, 4)}
                          </div>
                          
                          <div className="min-w-0 truncate">
                            <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2 truncate">
                              <span className="truncate">{user.savvyName ? `@${user.savvyName}` : `${user.useraddress.slice(0, 6)}...${user.useraddress.slice(-4)}`}</span>
                              {isCurrentUser && (
                                <span className="text-[9px] bg-[#81D7B4] text-white px-1.5 py-0.5 rounded-md font-bold uppercase shrink-0">You</span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                              <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0">
                                <Image src={getChainLogo(user.chain)} alt={user.chain || 'chain'} width={14} height={14} className="w-full h-full object-cover" />
                              </div>
                              <span className="capitalize">{user.chain || 'Base'}</span>
                              <span>&middot;</span>
                              <span className="text-[#81D7B4] font-bold">{user.points || 0} pts</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0 pl-2">
                          <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                            {formatCurrency(user.totalamount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Current User Mobile Rank Card */}
            {currentUserPosition && (
              <div className="xl:hidden mt-6 bg-white dark:bg-[#121212] rounded-3xl border border-gray-100 dark:border-white/10 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Target01Icon className="w-4 h-4 text-[#81D7B4]" />
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">Your Standing</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-white/5 text-center">
                    <span className="text-gray-400 text-[10px] font-bold uppercase block mb-0.5">Rank</span>
                    <span className="font-bold text-base text-gray-900 dark:text-white">#{currentUserPosition.rank}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-white/5 text-center">
                    <span className="text-gray-400 text-[10px] font-bold uppercase block mb-0.5">Points</span>
                    <span className="font-bold text-base text-[#81D7B4]">{currentUserPosition.points}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-white/5 text-center">
                    <span className="text-gray-400 text-[10px] font-bold uppercase block mb-0.5">Saved</span>
                    <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate block">{formatCurrency(currentUserPosition.totalamount)}</span>
                  </div>
                </div>
              </div>
            )}
            
          </div>
          
          {/* Right Pane (4 Cols) - Rewards Pool & Status */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Desktop User Position Card */}
            {currentUserPosition && (
              <div className="hidden xl:block bg-white dark:bg-[#121212] rounded-3xl border border-gray-100 dark:border-white/10 p-5 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Your Position</h3>
                    <div className="text-2xl font-black text-gray-900 dark:text-white font-instrument">
                      Rank #{currentUserPosition.rank}
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Points</h3>
                    <div className="text-lg font-bold text-[#81D7B4]">{currentUserPosition.points} pts</div>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Rewards Pool Card */}
            <div className="bg-white dark:bg-[#121212] rounded-3xl p-6 border border-gray-100 dark:border-white/10 shadow-sm sticky top-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-[#81D7B4]/15 text-[#81D7B4]">
                  <Award01Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Monthly Pool</h3>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white font-instrument">Rewards</h2>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                At the end of each calendar month, the top 10 ranked savers receive $USDC rewards directly in their wallet based on their rank.
              </p>
              
              <div className="space-y-2">
                {REWARDS.map((reward) => (
                  <div 
                    key={reward.rank} 
                    className={`flex justify-between items-center p-3 rounded-xl border ${reward.style || 'bg-gray-50 dark:bg-[#1a1a1a] border-gray-200/60 dark:border-white/5'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black font-instrument ${reward.rank <= 3 ? '' : 'text-gray-900 dark:text-gray-200'}`}>{reward.rank}</span>
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{reward.suffix} Place</span>
                    </div>
                    <div className="text-sm font-black text-[#81D7B4]">
                      ${reward.amount} USDC
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Saver Profile Modal */}
      <AnimatePresence>
        {isDetailsOpen && selectedUser && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
              onClick={() => setIsDetailsOpen(false)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative z-10 bg-white dark:bg-[#161616] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-white/10 p-6"
            >
              <div className="flex justify-end mb-2">
                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer text-xs font-bold"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex flex-col items-center mb-6">
                <div className={`w-20 h-20 rounded-2xl ${getAvatarColor(selectedUser.useraddress)} flex items-center justify-center mb-3 text-gray-900 font-bold text-2xl shadow-md`}>
                  {selectedUser.savvyName ? selectedUser.savvyName.slice(0, 2).toUpperCase() : selectedUser.useraddress.slice(2, 4)}
                </div>
                
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-[#81D7B4]/15 text-[#2D5A4A] dark:text-[#81D7B4]">
                    Rank #{selectedUser.rank}
                  </span>
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0">
                      <Image src={getChainLogo(selectedUser.chain)} alt={selectedUser.chain || 'chain'} width={14} height={14} className="w-full h-full object-cover" />
                    </div>
                    <span className="capitalize">{selectedUser.chain || 'Base'}</span>
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate max-w-[240px] text-center">
                  {selectedUser.savvyName ? `@${selectedUser.savvyName}` : `${selectedUser.useraddress.slice(0, 6)}...${selectedUser.useraddress.slice(-4)}`}
                </h3>
                <p className="text-gray-400 text-xs font-mono">{selectedUser.useraddress.slice(0, 10)}...{selectedUser.useraddress.slice(-6)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                <div className="p-3.5 bg-gray-50 dark:bg-[#1f1f1f] rounded-xl border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Points</p>
                  <p className="font-bold text-base text-[#81D7B4]">{selectedUser.points}</p>
                </div>
                <div className="p-3.5 bg-gray-50 dark:bg-[#1f1f1f] rounded-xl border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Total Saved</p>
                  <p className="font-bold text-base text-gray-900 dark:text-white">{formatCurrency(selectedUser.totalamount)}</p>
                </div>
              </div>
              
              <button
                onClick={() => window.open(getExplorerUrl(selectedUser.useraddress, selectedUser.chain), '_blank')}
                className="w-full py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View on Explorer</span>
                <ArrowUpRight01Icon className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

