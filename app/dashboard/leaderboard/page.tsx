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
  Star, 
  TrendingUp, 
  Users, 
  Coins, 
  Eye,
  ChevronRight,
  Sparkles,
  Target,
  Zap,
  Gift
} from 'lucide-react';

// Initialize the Space Grotesk font
const exo = Exo({ 
  subsets: ['latin'],
  display: 'swap',
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
    fetchMultipleNetworkLogos(['base', 'celo', 'lisk', 'avalanche'])
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
        const response = await fetch('https://bitsaveapi.vercel.app/leaderboard', {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || ''
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data')
        }
        
        const data: LeaderboardUser[] = await response.json()
        
        // Filter users with savings >= $10, calculate points, sort by points, limit to top 20, and add rank
        const rankedData = data
          .filter(user => user.totalamount >= 10) // Exclude savings below $10
          .map(user => ({
            ...user,
            points: Math.floor(user.totalamount * 0.005 * 1000) // Calculate points based on total amount
          }))
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
  
  const getRankBadge = (rank: number) => {
    switch(rank) {
      case 1:
        return (
          <motion.div 
            className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#81D7B4] via-[#81D7B4] to-[#6BC4A0] rounded-2xl text-white font-bold text-sm shadow-2xl backdrop-blur-sm border border-[#81D7B4]/30"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Crown className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#81D7B4]/80 rounded-full flex items-center justify-center">
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div 
            className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#81D7B4]/80 via-[#81D7B4] to-[#6BC4A0] rounded-2xl text-white font-bold text-sm shadow-2xl backdrop-blur-sm border border-[#81D7B4]/30"
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Medal className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#81D7B4]/60 rounded-full flex items-center justify-center">
            </div>
          </motion.div>
        )
      case 3:
        return (
          <motion.div 
            className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#6BC4A0] via-[#81D7B4] to-[#4A9B7A] rounded-2xl text-white font-bold text-sm shadow-2xl backdrop-blur-sm border border-[#81D7B4]/30"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Award className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#81D7B4]/70 rounded-full flex items-center justify-center">
            </div>
          </motion.div>
        )
      default:
        return (
          <motion.div 
            className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#81D7B4] via-[#6BC4A0] to-[#4A9B7A] rounded-2xl text-white font-bold text-lg shadow-2xl backdrop-blur-sm border border-[#81D7B4]/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {rank}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#81D7B4] rounded-full flex items-center justify-center">
              <Target className="w-2.5 h-2.5 text-[#4A9B7A]" />
            </div>
          </motion.div>
        )
    }
  }
  
  // User icon component
    const UserIcon = ({ rank }: { rank: number }) => {
      const bgColor = rank === 1 ? 'bg-[#81D7B4]/20' : 
                      rank === 2 ? 'bg-[#81D7B4]/15' : 
                      rank === 3 ? 'bg-[#81D7B4]/10' : 'bg-[#81D7B4]/10';
      const textColor = rank === 1 ? 'text-[#4A9B7A]' : 
                        rank === 2 ? 'text-[#4A9B7A]' : 
                        rank === 3 ? 'text-[#4A9B7A]' : 'text-[#4A9B7A]';
                      
    return (
      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center ${textColor} border-2 border-white shadow-md`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
    );
  };
  
  return (
    <div className={`min-h-screen relative overflow-hidden ${exo.className}`} style={{ backgroundColor: '#f2f2f2' }}>
      {/* Enhanced background decorative elements with brand color accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#81D7B4]/15 to-[#6BC4A0]/15 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-br from-[#81D7B4]/10 to-[#6BC4A0]/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-[#81D7B4]/20 to-[#6BC4A0]/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#81D7B4]/8 to-[#6BC4A0]/8 rounded-full blur-3xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
      
      {/* Main content container with glassmorphism */}
      <div className="relative z-10 p-4 sm:p-6 md:p-8">
      
      {/* Header with glassmorphism */}
      <motion.div 
        className="relative mb-6 md:mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 md:mb-0 w-full">
              <motion.div 
                className="p-3 md:p-4 bg-gradient-to-br from-[#81D7B4]/20 to-[#6BC4A0]/20 rounded-xl md:rounded-2xl backdrop-blur-sm border border-[#81D7B4]/30 self-start sm:self-auto"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-[#81D7B4]" />
              </motion.div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-1 md:mb-2 bg-gradient-to-r from-gray-800 to-[#4A9B7A] bg-clip-text text-transparent leading-tight">
                  Leaderboard
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl leading-relaxed">
                  Top 20 savers on BitSave ranked by points. Earn rewards and climb the ranks by saving more.
                </p>
              </div>
            </div>
           
          </div>
        </div>
      </motion.div>
      
      {/* Top 3 Winners Podium */}
      {leaderboardData.length > 0 && (
        <>
          {/* Mobile Top 3 Winners */}
          <motion.div 
            className="md:hidden mb-6 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center flex items-center justify-center space-x-2">
                <Trophy className="w-5 h-5 text-[#81D7B4]" />
                <span>Top 3 Savers</span>
              </h3>
              <div className="space-y-3">
                {leaderboardData.slice(0, Math.min(3, leaderboardData.length)).map((user, index) => (
                  <motion.div 
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
                    className="bg-white/40 backdrop-blur-sm rounded-xl p-3 border border-[#81D7B4]/30 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      {getRankBadge(index + 1)}
                      <UserIcon rank={index + 1} />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {user.useraddress.slice(0, 6)}...{user.useraddress.slice(-4)}
                        </p>
                        <p className="text-xs text-gray-600">{user.points || 0} points</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#4A9B7A] text-sm">${user.totalamount.toFixed(2)}</p>
                      <p className="text-xs text-[#6BC4A0]">{(user.points || 0).toFixed(2)} $BTS</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Desktop Top 3 Winners Podium */}
          <motion.div 
            className="hidden md:flex justify-center items-end mb-12 relative z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
          {leaderboardData.slice(0, Math.min(3, leaderboardData.length)).map((user, index) => {
            const position = index === 0 ? 1 : index === 1 ? 0 : 2; // Reorder for podium (2nd, 1st, 3rd)
            const user2 = leaderboardData[position < leaderboardData.length ? position : 0];
            
            const podiumHeight = position === 0 ? "h-40" : position === 1 ? "h-32" : "h-24";
            const glowColor = position === 0 ? "from-[#81D7B4]/30 to-[#6BC4A0]/30" : 
                              position === 1 ? "from-[#81D7B4]/25 to-[#6BC4A0]/25" : 
                              "from-[#6BC4A0]/30 to-[#4A9B7A]/30";
            
            return (
              <motion.div 
                key={user2.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: position * 0.2 + 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                className={`relative mx-6 ${position === 0 ? 'z-20' : 'z-10'}`}
                whileHover={{ y: -5 }}
              >
                <div className="flex flex-col items-center">
                  {/* Floating crown for 1st place */}
                  {position === 0 && (
                    <motion.div
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                      animate={{ 
                        y: [0, -5, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Crown className="w-8 h-8 text-[#81D7B4] drop-shadow-lg" />
                    </motion.div>
                  )}
                  
                  {/* User Avatar with enhanced glow */}
                  <motion.div 
                    className={`relative mb-4 ${position === 0 ? 'scale-125' : ''}`}
                    whileHover={{ scale: position === 0 ? 1.35 : 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className={`absolute -inset-2 rounded-full blur-xl opacity-60 bg-gradient-to-r ${glowColor}`}></div>
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-white/50 shadow-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
                      <UserIcon rank={user2.rank || position + 1} />
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      {getRankBadge(user2.rank || position + 1)}
                    </div>
                  </motion.div>
                  
                  {/* User info with glassmorphism */}
                  <motion.div 
                    className="text-center mb-4 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <p className="font-bold text-white truncate max-w-[140px] text-sm">
                      {user2.useraddress.slice(0, 6)}...{user2.useraddress.slice(-4)}
                    </p>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                       <Coins className="w-4 h-4 text-[#81D7B4]" />
                       <p className="text-[#81D7B4] font-bold text-lg">${user2.totalamount.toFixed(2)}</p>
                     </div>
                  </motion.div>
                  
                  {/* Enhanced Podium */}
                  <motion.div 
                    className={`${podiumHeight} w-32 bg-gradient-to-t from-white/20 to-white/10 backdrop-blur-xl rounded-t-3xl border border-white/30 shadow-2xl flex items-center justify-center relative overflow-hidden`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-t ${glowColor} opacity-50`}></div>
                    <div className="relative z-10 flex flex-col items-center">
                      {position === 0 && <Trophy className="w-8 h-8 text-[#81D7B4] mb-1" />}
                       {position === 1 && <Medal className="w-7 h-7 text-[#81D7B4] mb-1" />}
                       {position === 2 && <Award className="w-7 h-7 text-[#6BC4A0] mb-1" />}
                      <span className="font-bold text-2xl text-white">#{user2.rank}</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
          </motion.div>
        </>
      )}
      
      {/* Enhanced Leaderboard Table */}
      <motion.div 
        className="bg-white/50 backdrop-blur-2xl rounded-3xl border border-[#81D7B4]/30 shadow-2xl overflow-hidden relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
        
        {/* Table Header with glassmorphism */}
        <div className="bg-white/60 backdrop-blur-sm p-6 border-b border-[#81D7B4]/30 hidden md:grid md:grid-cols-7 text-sm font-semibold text-gray-700">
          <div className="col-span-1 flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-[#4A9B7A]" />
            <span>Rank</span>
          </div>
          <div className="col-span-2 flex items-center space-x-2">
            <Users className="w-4 h-4 text-[#4A9B7A]" />
            <span>User</span>
          </div>
          <div className="col-span-1 flex items-center space-x-2">
            <Coins className="w-4 h-4 text-[#4A9B7A]" />
            <span>Total Saved</span>
          </div>
          <div className="col-span-1 flex items-center space-x-2">
            <Star className="w-4 h-4 text-[#4A9B7A]" />
            <span>Points</span>
          </div>
          <div className="col-span-1 flex items-center space-x-2">
            <Gift className="w-4 h-4 text-[#4A9B7A]" />
            <span>$BTS</span>
          </div>
          <div className="col-span-1 flex items-center space-x-2">
            <Eye className="w-4 h-4 text-[#4A9B7A]" />
            <span>Actions</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div 
                key={i} 
                className="animate-pulse flex items-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/20 rounded-xl w-3/4 mb-2"></div>
                  <div className="h-3 bg-white/15 rounded-lg w-1/2"></div>
                </div>
                <div className="w-24 h-6 bg-white/20 rounded-lg"></div>
              </motion.div>
            ))}
          </div>
        ) : leaderboardData.length === 0 ? (
          <motion.div 
            className="p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-[#81D7B4]/30">
          <Users className="w-16 h-16 text-[#4A9B7A] mx-auto mb-4" />
              <p className="text-gray-700 text-lg">No leaderboard data available</p>
              <p className="text-gray-600 text-sm mt-2">Be the first to start saving!</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3 md:space-y-0 md:divide-y md:divide-[#81D7B4]/20">
            {leaderboardData.map((user, index) => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="md:p-6 md:grid md:grid-cols-7 md:items-center md:hover:bg-white/30 transition-all duration-300 group cursor-pointer"
                whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.5)" }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Mobile Card Layout */}
                <div className="md:hidden bg-white/40 backdrop-blur-sm rounded-2xl border border-[#81D7B4]/30 p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getRankBadge(user.rank || index + 1)}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <UserIcon rank={user.rank || index + 1} />
                      </motion.div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {user.useraddress.slice(0, 6)}...{user.useraddress.slice(-4)}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="w-2 h-2 bg-[#81D7B4] rounded-full"></div>
                          <p className="text-xs text-gray-600">{user.chain}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white/50 rounded-xl p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Coins className="w-4 h-4 text-[#4A9B7A]" />
                        <span className="text-xs text-gray-600">Saved</span>
                      </div>
                      <p className="font-bold text-[#4A9B7A] text-sm">${user.totalamount.toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-white/50 rounded-xl p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Star className="w-4 h-4 text-[#81D7B4]" />
                        <span className="text-xs text-gray-600">Points</span>
                      </div>
                      <p className="font-bold text-[#81D7B4] text-sm">{user.points || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-[#81D7B4]/30">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-[#6BC4A0]" />
                      <span className="text-sm text-gray-700 font-medium">{(user.points || 0).toFixed(2)} $BTS</span>
                    </div>
                    <motion.button 
                      onClick={() => openUserDetails(user)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#81D7B4] hover:bg-[#6BC4A0] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </motion.button>
                  </div>
                </div>

                {/* Desktop Grid Layout */}
                <div className="hidden md:contents">
                  {/* Rank */}
                  <div className="col-span-1 flex items-center">
                    {getRankBadge(user.rank || index + 1)}
                  </div>
                  
                  {/* User */}
                  <div className="col-span-2 flex items-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <UserIcon rank={user.rank || index + 1} />
                    </motion.div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-800 group-hover:text-[#4A9B7A] transition-colors">
                        {user.useraddress.slice(0, 6)}...{user.useraddress.slice(-4)}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="w-2 h-2 bg-[#81D7B4] rounded-full"></div>
                        <p className="text-xs text-gray-600">Chain: {user.chain}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Total Saved */}
                  <div className="col-span-1">
                    <div className="flex items-center space-x-2">
                      <Coins className="w-4 h-4 text-[#4A9B7A]" />
                      <p className="font-bold text-[#4A9B7A] text-lg">${user.totalamount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Points */}
                  <div className="col-span-1">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-[#81D7B4]" />
                      <p className="font-bold text-[#81D7B4]">{user.points || 0}</p>
                    </div>
                  </div>
                  
                  {/* $BTS */}
                  <div className="col-span-1">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-[#6BC4A0]" />
                      <p className="font-bold text-[#6BC4A0]">{(user.points || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Details Button */}
                  <div className="col-span-1 flex justify-end">
                    <motion.button
                      onClick={() => openUserDetails(user)}
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="bg-white/60 backdrop-blur-md text-gray-700 font-medium py-2 px-4 rounded-xl border border-[#81D7B4]/50 shadow-lg hover:shadow-xl transition-all duration-300 text-sm flex items-center group"
                    >
                      <Eye className="w-4 h-4 mr-2 text-[#4A9B7A] group-hover:text-[#4A9B7A] transition-colors" />
                      View Details
                      <ChevronRight className="w-4 h-4 ml-2 text-gray-500 group-hover:text-gray-700 group-hover:translate-x-1 transition-all duration-200" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      
      {/* Your Position Card */}
      <div className="mt-6 md:mt-8 bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC4A0]/20 backdrop-blur-xl rounded-2xl border border-[#81D7B4]/40 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] p-4 sm:p-6 relative z-10 overflow-hidden">
  {/* Noise background removed per redesign spec */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#81D7B4]/20 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center justify-between">
          <div className="text-center md:text-left">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">Your Position</h3>
            <p className="text-gray-600 text-sm">
              {currentUserPosition 
                ? `You're ranked #${currentUserPosition.rank} on the leaderboard!` 
                : "Start saving to appear on the leaderboard!"}
            </p>
          </div>
          
          {/* Mobile Layout */}
          <div className="md:hidden grid grid-cols-2 gap-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/60 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Current Rank</p>
              <p className="font-bold text-xl text-gray-800 flex items-center justify-center">
                {currentUserPosition ? `#${currentUserPosition.rank}` : "-"}
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/60 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Points</p>
              <p className="font-bold text-xl text-gray-800 text-center">
                {currentUserPosition 
                  ? currentUserPosition.points || 0
                  : "0"}
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/60 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">$BTS</p>
              <p className="font-bold text-xl text-gray-800 text-center">
                {currentUserPosition 
                  ? (currentUserPosition.points || 0).toFixed(2)
                  : "0.00"}
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/60 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Total Saved</p>
              <p className="font-bold text-xl text-gray-800 text-center">
                {currentUserPosition 
                  ? `$${currentUserPosition.totalamount.toFixed(2)}` 
                  : "$0.00"}
              </p>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/60 shadow-sm mr-4">
              <p className="text-xs text-gray-500 mb-1">Current Rank</p>
              <p className="font-bold text-2xl text-gray-800 flex items-center">
                {currentUserPosition ? `#${currentUserPosition.rank}` : "-"}
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/60 shadow-sm mr-4">
              <p className="text-xs text-gray-500 mb-1">Points</p>
              <p className="font-bold text-2xl text-gray-800">
                {currentUserPosition 
                  ? currentUserPosition.points || 0
                  : "0"}
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/60 shadow-sm mr-4">
              <p className="text-xs text-gray-500 mb-1">$BTS</p>
              <p className="font-bold text-2xl text-gray-800">
                {currentUserPosition 
                  ? (currentUserPosition.points || 0).toFixed(2)
                  : "0.00"}
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/60 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Total Saved</p>
              <p className="font-bold text-2xl text-gray-800">
                {currentUserPosition 
                  ? `$${currentUserPosition.totalamount.toFixed(2)}` 
                  : "$0.00"}
              </p>
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsDetailsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(_e) => _e.stopPropagation()}
            >
              {/* Header with user info */}
              <div className="p-6 border-b border-gray-200/50 relative">
  {/* Noise background removed per redesign spec */}
                
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <div className={`absolute -inset-1 rounded-full blur-md opacity-70 ${
                      selectedUser.rank === 1 ? 'bg-gradient-to-r from-[#81D7B4] to-[#6BC4A0]' :
                selectedUser.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-300' :
                selectedUser.rank === 3 ? 'bg-gradient-to-r from-[#6BC4A0] to-[#4A9B7A]' : 
                      'bg-gradient-to-r from-[#81D7B4]/50 to-[#81D7B4]/30'
                    }`}></div>
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg flex items-center justify-center bg-white">
                      <UserIcon rank={selectedUser.rank || 1} />
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      {getRankBadge(selectedUser.rank || 1)}
                    </div>
                  </div>
                  

                  
                  <button 
                    onClick={() => setIsDetailsOpen(false)}
                    className="ml-auto bg-gray-100 hover:bg-gray-200 rounded-full p-2 text-gray-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Total Saved</p>
                    <p className="font-bold text-2xl text-gray-800">${selectedUser.totalamount.toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Network</p>
                    <div className="flex items-center">
                      <Image
                        src={ensureImageUrl(
                          networkLogos[selectedUser.chain?.toLowerCase()]?.logoUrl ||
                          networkLogos[selectedUser.chain?.toLowerCase()]?.fallbackUrl ||
                          `/${selectedUser.chain.toLowerCase()}.svg`
                        )}
                        alt={selectedUser.chain}
                        width={20}
                        height={20}
                        className="w-5 h-5 mr-2"
                      />
                      <span className="font-medium text-gray-800">{selectedUser.chain}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Rank</p>
                    <p className="font-medium text-gray-800">#{selectedUser.rank || '-'}</p>
                  </div>
                  
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">User ID</p>
                    <p className="font-medium text-gray-800 truncate">
                      {selectedUser.useraddress.slice(0, 6)}...{selectedUser.useraddress.slice(-4)}
                    </p>
                  </div>
                </div>
                
                {/* Removed wallet address with copy button section */}
              </div>
              
              {/* Footer with action buttons */}
              <div className="p-6 border-t border-gray-200/50 flex justify-end space-x-3">
                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Removed Tips Section */}
      
      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-8 bg-white/50 backdrop-blur-xl rounded-3xl border border-[#81D7B4]/30 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] p-8 relative z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
  {/* Noise background removed per redesign spec */}
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-[#81D7B4]/20 to-[#6BC4A0]/20 rounded-xl backdrop-blur-sm border border-[#81D7B4]/30">
              <Target className="w-6 h-6 text-[#4A9B7A]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h3>
          </div>
          
          <div className="space-y-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-[#81D7B4]/20 hover:border-[#81D7B4]/40 transition-all duration-300"
            >
              <p className="font-semibold text-gray-800 mb-2 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-[#4A9B7A]" />
                How is the leaderboard calculated?
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">The leaderboard ranks users based on points calculated from their total savings amount. Points are earned at a rate of 5 points per $1 saved. Only users with $10+ in savings are eligible for the leaderboard.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-[#81D7B4]/20 hover:border-[#81D7B4]/40 transition-all duration-300"
            >
              <p className="font-semibold text-gray-800 mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-[#4A9B7A]" />
                How often is the leaderboard updated?
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">The leaderboard is updated in real-time as users make deposits and withdrawals to their savings plans.</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Call to Action */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="mt-12 mb-8 text-center"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Link 
            href="/dashboard/create-savings" 
            className="inline-flex items-center bg-gradient-to-r from-[#81D7B4] via-[#81D7B4] to-[#6BC4A0] text-white font-semibold py-4 px-8 rounded-2xl shadow-[0_8px_32px_rgba(129,215,180,0.4)] hover:shadow-[0_12px_40px_rgba(129,215,180,0.6)] transition-all duration-300 backdrop-blur-sm border border-white/20"
          >
            <div className="p-1 bg-white/20 rounded-lg mr-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            Start Saving to Climb the Ranks
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </motion.div>
        <p className="mt-4 text-sm text-gray-600">Create a new savings plan and start climbing the leaderboard today!</p>
      </motion.div>
      </div>
    </div>
  )
}