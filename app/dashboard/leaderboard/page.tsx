'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Space_Grotesk } from 'next/font/google';
import Link from 'next/link';

// Initialize the Space Grotesk font
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
})

// Define the leaderboard user interface
interface LeaderboardUser {
  useraddress: string;
  totalamount: number;
  chain: string;
  id: string;
  rank?: number; // Added during processing
}

export default function LeaderboardPage() {
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
        
        // Filter users with savings >= $10, sort by total amount, limit to top 20, and add rank
        const rankedData = data
          .filter(user => user.totalamount >= 10) // Exclude savings below $10
          .sort((a, b) => b.totalamount - a.totalamount)
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
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-300 rounded-full blur-sm opacity-70"></div>
            <div className="relative w-8 h-8 flex items-center justify-center font-bold text-amber-800 bg-gradient-to-br from-amber-300 to-amber-100 rounded-full border border-amber-400/50 shadow-[0_2px_10px_-3px_rgba(245,158,11,0.6)]">
              1
            </div>
          </div>
        )
      case 2:
        return (
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-400 to-gray-300 rounded-full blur-sm opacity-60"></div>
            <div className="relative w-8 h-8 flex items-center justify-center font-bold text-gray-700 bg-gradient-to-br from-gray-300 to-gray-100 rounded-full border border-gray-400/50 shadow-[0_2px_8px_-3px_rgba(156,163,175,0.6)]">
              2
            </div>
          </div>
        )
      case 3:
        return (
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-700 to-amber-600 rounded-full blur-sm opacity-60"></div>
            <div className="relative w-8 h-8 flex items-center justify-center font-bold text-amber-800 bg-gradient-to-br from-amber-600 to-amber-400 rounded-full border border-amber-700/50 shadow-[0_2px_8px_-3px_rgba(180,83,9,0.6)]">
              3
            </div>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 flex items-center justify-center font-bold text-sm bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200/80">
            {rank}
          </div>
        )
    }
  }
  
  // User icon component
  const UserIcon = ({ rank }: { rank: number }) => {
    const bgColor = rank === 1 ? 'bg-amber-100' : 
                    rank === 2 ? 'bg-gray-100' : 
                    rank === 3 ? 'bg-amber-50' : 'bg-blue-50';
    const textColor = rank === 1 ? 'text-amber-600' : 
                      rank === 2 ? 'text-gray-600' : 
                      rank === 3 ? 'text-amber-700' : 'text-blue-600';
                      
    return (
      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center ${textColor} border-2 border-white shadow-md`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
    );
  };
  
  return (
    <div className={`${spaceGrotesk.className} p-4 sm:p-6 md:p-8 bg-[#f2f2f2] text-gray-800 relative min-h-screen pb-8 overflow-x-hidden`}>
      {/* Grain overlay */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none bg-[url('/noise.jpg')] mix-blend-overlay"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 md:right-20 w-40 md:w-64 h-40 md:h-64 bg-[#81D7B4]/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-20 left-10 md:left-20 w-40 md:w-80 h-40 md:h-80 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-1/3 left-1/4 w-40 md:w-60 h-40 md:h-60 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>
      
      {/* Header - Removed timeframe selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight mb-2">Leaderboard</h1>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl">
            Top savers on BitSave. Earn rewards and climb the ranks by saving more.
          </p>
        </div>
      </div>
      
      {/* Top 3 Winners Podium - Desktop Only */}
      {leaderboardData.length > 0 && (
        <div className="hidden md:flex justify-center items-end mb-12 relative z-10">
          {leaderboardData.slice(0, Math.min(3, leaderboardData.length)).map((user, index) => {
            const position = index === 0 ? 1 : index === 1 ? 0 : 2; // Reorder for podium (2nd, 1st, 3rd)
            // Remove unused heights array
            const user2 = leaderboardData[position < leaderboardData.length ? position : 0];
            
            // Fix: Assign correct heights based on rank
            const podiumHeight = position === 0 ? "h-36" : // 1st place (tallest)
                               position === 1 ? "h-28" : // 2nd place (medium)
                               "h-20"; // 3rd place (shortest)
            
            return (
              <motion.div 
                key={user2.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: position * 0.2 }}
                className={`relative mx-4 ${position === 0 ? 'z-20' : 'z-10'}`}
              >
                <div className="flex flex-col items-center">
                  {/* User Icon */}
                  <div className={`relative mb-3 ${position === 0 ? 'scale-125' : ''}`}>
                    <div className={`absolute -inset-1 rounded-full blur-md opacity-70 ${
                      position === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-300' : 
                      position === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-300' : 
                      'bg-gradient-to-r from-amber-700 to-amber-600'
                    }`}></div>
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg flex items-center justify-center bg-white">
                      <UserIcon rank={user2.rank || position + 1} />
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      {getRankBadge(user2.rank || position + 1)}
                    </div>
                  </div>
                  
                  {/* User info */}
                  <div className="text-center mb-3">
                    <p className="font-bold text-gray-800 truncate max-w-[120px]">
                      {user2.useraddress.slice(0, 6)}...{user2.useraddress.slice(-4)}
                    </p>
                    <p className="text-[#81D7B4] font-bold">${user2.totalamount.toFixed(2)}</p>
                  </div>
                  
                  {/* Podium - Use the correct height variable */}
                  <div className={`${podiumHeight} w-28 bg-gradient-to-t from-white/90 to-white/70 backdrop-blur-md rounded-t-lg border border-white/60 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.2)] flex items-center justify-center`}>
                    <span className="font-bold text-xl text-gray-800">{user2.rank === 1 ? '🏆' : user2.rank === 2 ? '🥈' : '🥉'}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
      
      {/* Leaderboard Table */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] overflow-hidden relative z-10">
        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
        
        {/* Table Header */}
        <div className="bg-white/80 backdrop-blur-sm p-4 border-b border-gray-200/50 hidden md:grid md:grid-cols-7 text-sm font-medium text-gray-500">
          <div className="col-span-1">Rank</div>
          <div className="col-span-2">User</div>
          <div className="col-span-1">Total Saved</div>
          <div className="col-span-1">Points</div>
          <div className="col-span-1">$BTS</div>
          <div className="col-span-1">Actions</div>
        </div>
        
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center p-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No leaderboard data available
          </div>
        ) : (
          <div className="divide-y divide-gray-200/50">
            {leaderboardData.map((user, index) => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 md:grid md:grid-cols-7 flex flex-wrap items-center hover:bg-white/50 transition-colors duration-200"
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center mb-2 md:mb-0">
                  {getRankBadge(user.rank || index + 1)}
                </div>
                
                {/* User */}
                <div className="col-span-2 flex items-center mb-2 md:mb-0">
                  <UserIcon rank={user.rank || index + 1} />
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">
                      {user.useraddress.slice(0, 6)}...{user.useraddress.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-500">Chain: {user.chain}</p>
                  </div>
                </div>
                
                {/* Total Saved */}
                <div className="col-span-1 mb-2 md:mb-0 w-1/2 md:w-auto">
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-bold text-gray-800">${user.totalamount.toFixed(2)}</p>
                </div>
                
                {/* Points */}
                <div className="col-span-1 mb-2 md:mb-0">
                  <p className="text-xs text-gray-500 md:hidden">Points</p>
                  <p className="font-bold text-gray-800">{Math.floor(user.totalamount * 0.005 * 1000)}</p>
                </div>
                
                {/* $BTS */}
                <div className="col-span-1 mb-2 md:mb-0">
                  <p className="text-xs text-gray-500 md:hidden">$BTS</p>
                  <p className="font-bold text-gray-800">{(user.totalamount * 0.005 * 1000).toFixed(2)}</p>
                </div>
                
                {/* Details Button */}
                <div className="col-span-1 flex justify-end w-full md:w-auto">
                  <button 
                    onClick={() => openUserDetails(user)}
                    className="bg-white/80 backdrop-blur-sm text-gray-700 font-medium py-1.5 px-3 rounded-lg border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 text-sm flex items-center"
                  >
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 ml-1">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Your Position Card */}
      <div className="mt-8 bg-gradient-to-r from-[#81D7B4]/20 to-blue-500/10 backdrop-blur-xl rounded-2xl border border-[#81D7B4]/30 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] p-6 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#81D7B4]/20 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Your Position</h3>
            <p className="text-gray-600 text-sm">
              {currentUserPosition 
                ? `You're ranked #${currentUserPosition.rank} on the leaderboard!` 
                : "Start saving to appear on the leaderboard!"}
            </p>
          </div>
          
          <div className="flex items-center">
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
                  ? Math.floor(currentUserPosition.totalamount * 0.005 * 1000)
                  : "0"}
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/60 shadow-sm mr-4">
              <p className="text-xs text-gray-500 mb-1">$BTS</p>
              <p className="font-bold text-2xl text-gray-800">
                {currentUserPosition 
                  ? (currentUserPosition.totalamount * 0.005 * 1000).toFixed(2)
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
                <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
                
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <div className={`absolute -inset-1 rounded-full blur-md opacity-70 ${
                      selectedUser.rank === 1 ? 'bg-gradient-to-r from-amber-400 to-amber-300' : 
                      selectedUser.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-300' : 
                      selectedUser.rank === 3 ? 'bg-gradient-to-r from-amber-700 to-amber-600' : 
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
                      <img src={`/${selectedUser.chain.toLowerCase()}.svg`} alt={selectedUser.chain} className="w-5 h-5 mr-2" />
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
      <div className="mt-8 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] p-6 relative z-10">
        <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
            <p className="font-medium text-gray-800 mb-1">How is the leaderboard calculated?</p>
            <p className="text-sm text-gray-600">The leaderboard ranks users based on their total savings amount across all plans. The more you save, the higher your rank!</p>
          </div>
          
         
          
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
            <p className="font-medium text-gray-800 mb-1">How often is the leaderboard updated?</p>
            <p className="text-sm text-gray-600">The leaderboard is updated in real-time as users make deposits and withdrawals to their savings plans.</p>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="mt-12 mb-8 text-center">
        <Link 
          href="/dashboard/create-savings" 
          className="inline-flex items-center bg-gradient-to-r from-[#81D7B4]/90 to-[#81D7B4]/80 text-white font-medium py-3 px-6 rounded-xl shadow-[0_4px_14px_rgba(129,215,180,0.4)] hover:shadow-[0_6px_20px_rgba(129,215,180,0.6)] transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Start Saving to Climb the Ranks
        </Link>
        <p className="mt-3 text-sm text-gray-500">Create a new savings plan and start climbing the leaderboard today!</p>
      </div>
    </div>
  )
}