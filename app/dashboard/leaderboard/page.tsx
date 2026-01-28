'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exo } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '@/utils/networkLogos';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Users, 
  Sparkles,
  Target,
  Gift,
  Calculator,
  ArrowUpRight
} from 'lucide-react';

// Initialize the Exo font
const exo = Exo({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-exo'
})

// Helper to ensure safe image URLs for Next.js Image
const ensureImageUrl = (url?: string): string => {
  if (!url) return '/default-network.png';
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return url;
  return `/${url.replace(/^\//, '')}`;
};

// Define the leaderboard user interface
interface LeaderboardUser {
  useraddress: string;
  totalamount: number;
  chain: string;
  id: string;
  rank?: number; // Added during processing
  points?: number; // Calculated points based on total amount
}

export default function LeaderboardPage() {
  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});
  
  useEffect(() => {
    fetchMultipleNetworkLogos(['base', 'celo', 'lisk', 'avalanche', 'bsc'])
      .then(setNetworkLogos)
      .catch(() => {});
  }, []);

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [currentUserAddress, setCurrentUserAddress] = useState<string>('')
  const [currentUserPosition, setCurrentUserPosition] = useState<LeaderboardUser | null>(null)
  
  useEffect(() => {
    // Get current user's wallet address using ethers
    const getUserWalletAddress = async () => {
      try {
        // Check if window.ethereum is available (MetaMask or other wallet)
        if (typeof window !== 'undefined' && window.ethereum) {
          // Request account access if needed
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
          // Get the first account
          const address = accounts[0];
          setCurrentUserAddress(address);
        } else {
          // Set a fallback for development/testing
          setCurrentUserAddress('0x0000000000000000000000000000000000000000');
        }
      } catch (error) {
        console.error('Error connecting to wallet:', error);
        setCurrentUserAddress('0x0000000000000000000000000000000000000000');
      }
    };
    
    getUserWalletAddress();
  }, []);
  
  useEffect(() => {
    // Fetch real data from API
    const fetchLeaderboardData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/leaderboard', {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data')
        }
        
        const data: LeaderboardUser[] = await response.json()
        
        // Filter users with savings > 0, calculate points, sort by points, limit to top 20, and add rank
        const rankedData = data
          .filter(user => (typeof user.totalamount === 'number' ? user.totalamount : parseFloat(user.totalamount)) > 0) // Show all positive savings
          .map(user => {
            const amount = typeof user.totalamount === 'number' ? user.totalamount : parseFloat(user.totalamount);
            return {
              ...user,
              totalamount: amount,
              points: Math.floor(amount * 0.005 * 1000) // Calculate points based on total amount
            };
          })
          .sort((a, b) => b.points - a.points) // Sort by points instead of amount
          .slice(0, 20) // Limit to top 20 users
          .map((user, index) => ({
            ...user,
            rank: index + 1
          }))
        
        setLeaderboardData(rankedData)
        
        // Find current user's position in the leaderboard
        if (currentUserAddress) {
          const userPosition = rankedData.find(user => 
            user.useraddress.toLowerCase() === currentUserAddress.toLowerCase()
          );
          setCurrentUserPosition(userPosition || null);
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchLeaderboardData()
  }, [currentUserAddress])
  
  const openUserDetails = (user: LeaderboardUser) => {
    setSelectedUser(user)
    setIsDetailsOpen(true)
  }

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };
  
  return (
    <div className={`min-h-screen bg-gray-50/50 pb-20 ${exo.variable} font-sans`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="p-2.5 bg-[#81D7B4]/10 rounded-xl">
                <Trophy className="w-6 h-6 text-[#81D7B4]" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leaderboard</h1>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 max-w-xl text-sm sm:text-base"
            >
              Top 20 savers on BitSave ranked by points. Save more to climb the ranks and earn exclusive rewards.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-gray-600">Live Updates</span>
          </motion.div>
        </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Main Content - Left Side */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            
            {/* Top 3 Podium (Desktop & Mobile optimized) */}
            {!isLoading && leaderboardData.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-3 sm:gap-6 items-end mb-8 sm:mb-12"
              >
                {/* 2nd Place */}
                {leaderboardData[1] && (
                  <div className="flex flex-col items-center group cursor-pointer" onClick={() => openUserDetails(leaderboardData[1])}>
                    <div className="relative mb-3 transition-transform group-hover:-translate-y-2 duration-300">
                      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white border-4 border-gray-100 p-1 shadow-lg">
                        <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center text-gray-400 font-bold text-xl sm:text-2xl">
                          {leaderboardData[1].useraddress.slice(0, 2)}
                        </div>
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white">
                        #2
                      </div>
                    </div>
                    <div className="text-center mb-3">
                      <p className="font-bold text-gray-900 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px]">
                        {leaderboardData[1].useraddress.slice(0, 6)}...{leaderboardData[1].useraddress.slice(-4)}
                      </p>
                      <p className="text-[#81D7B4] font-bold text-xs">{leaderboardData[1].points} pts</p>
                    </div>
                    <div className="w-full bg-gradient-to-t from-gray-100 to-white rounded-t-2xl border-x border-t border-gray-200 h-28 sm:h-40 flex items-end justify-center pb-4 shadow-sm relative overflow-hidden group-hover:shadow-md transition-shadow">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50"></div>
                      <Medal className="w-8 h-8 text-gray-300 opacity-20 absolute top-4" />
                      <span className="text-2xl sm:text-4xl font-bold text-gray-300/50">2</span>
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {leaderboardData[0] && (
                  <div className="flex flex-col items-center z-10 group cursor-pointer" onClick={() => openUserDetails(leaderboardData[0])}>
                    <div className="relative mb-3 transition-transform group-hover:-translate-y-2 duration-300">
                      <Crown className="w-8 h-8 text-yellow-400 absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-sm" />
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-4 border-yellow-100 p-1 shadow-xl ring-4 ring-yellow-50/50">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center text-yellow-600 font-bold text-2xl sm:text-3xl">
                          {leaderboardData[0].useraddress.slice(0, 2)}
                        </div>
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-3 py-0.5 rounded-full border-2 border-white shadow-sm">
                        #1
                      </div>
                    </div>
                    <div className="text-center mb-3">
                      <p className="font-bold text-gray-900 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[140px]">
                        {leaderboardData[0].useraddress.slice(0, 6)}...{leaderboardData[0].useraddress.slice(-4)}
                      </p>
                      <p className="text-yellow-500 font-bold text-xs">{leaderboardData[0].points} pts</p>
                    </div>
                    <div className="w-full bg-gradient-to-t from-yellow-50/50 to-white rounded-t-2xl border-x border-t border-yellow-200 h-36 sm:h-52 flex items-end justify-center pb-4 shadow-lg shadow-yellow-100/50 relative overflow-hidden group-hover:shadow-xl transition-shadow">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-yellow-50/30"></div>
                      <Trophy className="w-10 h-10 text-yellow-300 opacity-30 absolute top-6" />
                      <span className="text-3xl sm:text-5xl font-bold text-yellow-400/30">1</span>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {leaderboardData[2] && (
                  <div className="flex flex-col items-center group cursor-pointer" onClick={() => openUserDetails(leaderboardData[2])}>
                    <div className="relative mb-3 transition-transform group-hover:-translate-y-2 duration-300">
                      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white border-4 border-orange-100 p-1 shadow-lg">
                        <div className="w-full h-full rounded-full bg-orange-50 flex items-center justify-center text-orange-400 font-bold text-xl sm:text-2xl">
                          {leaderboardData[2].useraddress.slice(0, 2)}
                        </div>
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white">
                        #3
                      </div>
                    </div>
                    <div className="text-center mb-3">
                      <p className="font-bold text-gray-900 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px]">
                        {leaderboardData[2].useraddress.slice(0, 6)}...{leaderboardData[2].useraddress.slice(-4)}
                      </p>
                      <p className="text-[#81D7B4] font-bold text-xs">{leaderboardData[2].points} pts</p>
                    </div>
                    <div className="w-full bg-gradient-to-t from-orange-50/30 to-white rounded-t-2xl border-x border-t border-orange-100 h-20 sm:h-32 flex items-end justify-center pb-4 shadow-sm relative overflow-hidden group-hover:shadow-md transition-shadow">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-orange-50/20"></div>
                      <Award className="w-8 h-8 text-orange-300 opacity-20 absolute top-4" />
                      <span className="text-2xl sm:text-4xl font-bold text-orange-300/50">3</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* List View */}
            <motion.div 
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden"
            >
              {/* Table Header */}
              <div className="relative z-20 grid grid-cols-12 gap-4 p-5 border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
                <div className="col-span-6 sm:col-span-5">User</div>
                <div className="col-span-4 sm:col-span-3 text-right">Points</div>
                <div className="hidden sm:block col-span-3 text-right">Total Saved</div>
              </div>

              {isLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse px-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                      <div className="flex-1 h-10 bg-gray-50 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : leaderboardData.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No Data Available</h3>
                  <p className="text-gray-500">Be the first to join the leaderboard!</p>
                </div>
              ) : (
                <motion.div 
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-gray-50"
                >
                  {leaderboardData.map((user, index) => (
                    <motion.div 
                      key={user.id}
                      variants={itemVariants}
                      className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50/80 transition-all duration-200 cursor-pointer group ${
                        user.useraddress.toLowerCase() === currentUserAddress.toLowerCase() ? 'bg-[#81D7B4]/5' : ''
                      }`}
                      onClick={() => openUserDetails(user)}
                    >
                      {/* Rank */}
                      <div className="col-span-2 sm:col-span-1 flex justify-center">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                          index === 1 ? 'bg-gray-100 text-gray-700' : 
                          index === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                      </div>

                      {/* User */}
                      <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          index === 0 ? 'bg-yellow-50 text-yellow-600' :
                          index === 1 ? 'bg-gray-100 text-gray-600' :
                          index === 2 ? 'bg-orange-50 text-orange-600' : 'bg-[#81D7B4]/10 text-[#81D7B4]'
                        }`}>
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm group-hover:text-[#2D5A4A] transition-colors flex items-center gap-2">
                            {user.useraddress.slice(0, 6)}...{user.useraddress.slice(-4)}
                            {user.useraddress.toLowerCase() === currentUserAddress.toLowerCase() && (
                              <span className="text-[10px] bg-[#81D7B4] text-white px-1.5 py-0.5 rounded-full">YOU</span>
                            )}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Image
                              src={ensureImageUrl(
                                networkLogos[user.chain?.toLowerCase()]?.logoUrl ||
                                networkLogos[user.chain?.toLowerCase()]?.fallbackUrl ||
                                `/${user.chain.toLowerCase()}.svg`
                              )}
                              alt={user.chain}
                              width={14}
                              height={14}
                              className="rounded-full"
                            />
                            <span className="text-xs text-gray-400 capitalize">{user.chain}</span>
                          </div>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="col-span-4 sm:col-span-3 text-right">
                        <div className="font-bold text-[#2D5A4A]">{user.points}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-medium">Points</div>
                      </div>

                      {/* Total Saved (Hidden on mobile) */}
                      <div className="hidden sm:block col-span-3 text-right">
                        <div className="font-bold text-gray-900">${user.totalamount.toFixed(2)}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-medium">Saved</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Current User Stats Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-[#81D7B4]/10 p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#81D7B4]/20 to-transparent rounded-bl-full -mr-10 -mt-10"></div>
              
              <h3 className="font-bold text-gray-900 mb-6 relative z-10 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#81D7B4]" />
                Your Performance
              </h3>
              
              {currentUserPosition ? (
                <div className="space-y-5 relative z-10">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">Current Rank</span>
                      <span className="font-bold text-3xl text-[#2D5A4A]">#{currentUserPosition.rank}</span>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#81D7B4] shadow-sm">
                      <Trophy className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <span className="text-gray-400 text-xs font-bold uppercase block mb-1">Points</span>
                      <span className="font-bold text-lg text-gray-900">{currentUserPosition.points}</span>
                    </div>
                    <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <span className="text-gray-400 text-xs font-bold uppercase block mb-1">Saved</span>
                      <span className="font-bold text-lg text-gray-900">${currentUserPosition.totalamount.toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-500 text-sm font-medium">$BTS Earned</span>
                      <span className="font-bold text-[#81D7B4] text-lg">{(currentUserPosition.points || 0).toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#81D7B4] h-full rounded-full w-3/4"></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-right">Keep saving to earn more!</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 relative z-10">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-bold mb-1">Not Ranked Yet</p>
                  <p className="text-sm text-gray-500 mb-6 max-w-[200px] mx-auto">Start saving at least $10 to join the leaderboard and earn rewards.</p>
                  <Link 
                    href="/dashboard/create-savings"
                    className="block w-full py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#81D7B4]/20 hover:shadow-xl hover:shadow-[#81D7B4]/30"
                  >
                    Start Saving Now
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#81D7B4]/10 rounded-xl shrink-0 text-[#81D7B4]">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">How Scoring Works</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Earn <span className="font-bold text-gray-700">5 points</span> for every $1 you save. Points are calculated in real-time based on your total savings balance.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100 p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-xl shrink-0 text-orange-500">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Weekly Rewards</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Top 3 savers earn exclusive badges and bonus $BTS tokens distributed every Monday.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
      
      {/* User Details Modal */}
      <AnimatePresence>
        {isDetailsOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsDetailsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Background */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#81D7B4]/20 to-transparent"></div>
              
              <div className="relative p-6">
                <div className="flex justify-end mb-4">
                  <button 
                    onClick={() => setIsDetailsOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="flex flex-col items-center mb-8">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg ${
                    selectedUser.rank === 1 ? 'bg-yellow-50 text-yellow-600' :
                    selectedUser.rank === 2 ? 'bg-gray-100 text-gray-600' :
                    selectedUser.rank === 3 ? 'bg-orange-50 text-orange-600' : 'bg-[#81D7B4]/10 text-[#81D7B4]'
                  }`}>
                    <Users className="w-10 h-10" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      selectedUser.rank === 1 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      selectedUser.rank === 2 ? 'bg-gray-100 text-gray-700 border-gray-200' :
                      selectedUser.rank === 3 ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-600 border-gray-100'
                    }`}>
                      Rank #{selectedUser.rank}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-2xl text-gray-900 truncate max-w-[280px] text-center">
                    {selectedUser.useraddress}
                  </h3>
                  <p className="text-gray-400 text-sm">Saver Profile</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total Points</p>
                    <p className="font-bold text-xl text-[#2D5A4A]">{selectedUser.points}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total Saved</p>
                    <p className="font-bold text-xl text-gray-900">${selectedUser.totalamount.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Network</p>
                    <div className="flex items-center gap-2">
                      <Image
                        src={ensureImageUrl(
                          networkLogos[selectedUser.chain?.toLowerCase()]?.logoUrl ||
                          networkLogos[selectedUser.chain?.toLowerCase()]?.fallbackUrl ||
                          `/${selectedUser.chain.toLowerCase()}.svg`
                        )}
                        alt={selectedUser.chain}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      <span className="font-bold text-gray-900 capitalize">{selectedUser.chain}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">$BTS Earned</p>
                    <p className="font-bold text-xl text-[#81D7B4]">{(selectedUser.points || 0).toFixed(2)}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => window.open(`https://etherscan.io/address/${selectedUser.useraddress}`, '_blank')}
                  className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
                >
                  View on Explorer
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
