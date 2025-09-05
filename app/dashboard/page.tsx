'use client'
// React hooks for state management and lifecycle
import { useState, useEffect, useCallback, useMemo } from 'react';
// Wagmi hook for wallet connection status
import { useAccount } from 'wagmi';
// Next.js navigation utilities
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Google Fonts integration
import { Space_Grotesk } from 'next/font/google';
// Custom modal components for savings operations
import TopUpModal from '../../components/TopUpModal';
import WithdrawModal from '../../components/WithdrawModal';
import NetworkDetection from '../../components/NetworkDetection';
// Animation library for smooth UI transitions
import { motion } from 'framer-motion';
// Custom error handling for contract operations
import { handleContractError } from '../../lib/contractErrorHandler';
// Custom hook for savings data with caching
import { useSavingsData } from '../../hooks/useSavingsData';
// Cache initialization utility
import { initializeSavingsCache } from '../../utils/savingsCache';
// ENS data hook for identity resolution
import { useENSData } from '../../hooks/useENSData';

// Configure Space Grotesk font with optimal loading settings
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap', // Improves font loading performance
  variable: '--font-space-grotesk'
});



// Main Dashboard component - displays user's savings plans and account overview
export default function Dashboard() {
  // Component lifecycle state
  const [mounted, setMounted] = useState(false); // Prevents hydration issues
  
  // Wallet connection hooks from wagmi
  const { address, isConnected } = useAccount();
  const router = useRouter();
  
  // Custom hook for savings data with caching
  const {
    savingsData,
    isLoading,
    isBaseNetwork,
    isCeloNetwork,
    isLiskNetwork,
    refetch: refetchSavingsData
  } = useSavingsData();
  
  // ENS data hook for identity resolution
  const { ensName, getDisplayName, hasENS } = useENSData();
  
  // UI state management
  const [activeTab, setActiveTab] = useState('current'); // Toggle between current/completed savings
  
  // Modal state for top-up operations
  const [topUpModal, setTopUpModal] = useState({
    isOpen: false,
    planName: '',
    planId: '',
    isEth: false,
    isGToken: false,
    tokenName: ''
  });
  
  // User interface state
  const [displayName, setDisplayName] = useState(''); // User's display name (Twitter or wallet)
  const [showNotifications, setShowNotifications] = useState(false); // Notification panel visibility
  const [showUpdateModal, setShowUpdateModal] = useState(false); // Update modal visibility
  const [selectedUpdate, setSelectedUpdate] = useState<{ title: string, content: string, date: string } | null>(null); // Selected update for modal


  // Platform updates state - stores announcements and news
  const [updates, setUpdates] = useState<Array<{
    id: string;
    title: string;
    content: string;
    date: string;
    isNew: boolean;
  }>>([]);

  // Effect hook to set user display name based on connected accounts
  useEffect(() => {
    if (mounted && address) {
      // Use ENS hook's getDisplayName which prioritizes ENS > Twitter > saved name > truncated address
      setDisplayName(getDisplayName());
    }
  }, [mounted, address, getDisplayName]);

  // TypeScript interfaces for type safety
  
  // Leaderboard entry structure for ranking display
  interface LeaderboardEntry {
    useraddress: string;
    totalamount: number;
    chain: string;
    datetime?: string;
    rank?: number;
  }

  // Platform update structure for announcements
  interface Update {
    id: string;
    title: string;
    content: string;
    date: string;
    isNew: boolean;
  }

  // User's read status for updates
  interface ReadUpdate {
    id: string;
    isNew: boolean;
  }

  // Fetch platform updates from API with timeout protection
  const fetchAllUpdates = useCallback(async () => {
    try {
      // Implement request timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 second timeout
      
      // Make API request to fetch all platform updates
      const response = await fetch('https://bitsaveapi.vercel.app/updates/', {
        method: 'GET',
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '' // API authentication
        },
        signal: controller.signal // Enable request cancellation
      });
      
      clearTimeout(timeoutId); // Clear timeout if request completes

      // Check if the API request was successful
      if (!response.ok) {
        throw new Error('Failed to fetch updates');
      }

      // Parse the updates data from the response
      const allUpdates = await response.json();

      // If user is connected, fetch their read status for personalized experience
      if (address) {
        try {
          // Set up timeout for user-specific request (shorter timeout)
          const userController = new AbortController();
          const userTimeoutId = setTimeout(() => userController.abort(), 4000); // 4 second timeout
          
          // Fetch user's read status for updates
          const userResponse = await fetch(`https://bitsaveapi.vercel.app/updates/user/${address}`, {
            method: 'GET',
            headers: {
              'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || ''
            },
            signal: userController.signal
          });
          
          clearTimeout(userTimeoutId);

          if (userResponse.ok) {
            const userReadUpdates = await userResponse.json() as ReadUpdate[];

            // Cross-reference updates with user's read status
            const processedUpdates = allUpdates.map((update: Update) => {
              const isRead = userReadUpdates.some((readUpdate: ReadUpdate) =>
                readUpdate.id === update.id && !readUpdate.isNew
              );
              return {
                ...update,
                isNew: !isRead // Mark as new if not read by user
              };
            });

            setUpdates(processedUpdates);
          } else {
            // Fallback: if user endpoint fails, assume all updates are new
            setUpdates(allUpdates.map((update: Update) => ({ ...update, isNew: true })));
          }
        } catch {
          // Handle user-specific fetch errors gracefully
          // User updates fetch failed, using default state
          setUpdates(allUpdates.map((update: Update) => ({ ...update, isNew: true })));
        }
      } else {
        // No user connected: all updates appear as new
        setUpdates(allUpdates.map((update: Update) => ({ ...update, isNew: true })));
      }
    } catch (error) {
      // Handle different types of errors appropriately
      if (error instanceof Error && error.name === 'AbortError') {
        // Updates fetch was aborted due to timeout
      } else {
        console.error('Error fetching updates:', handleContractError(error));
      }
      // Set empty state on error
      setUpdates([]);
    }
  }, [address]);

  // Mark a specific update as read by the current user
  const markUpdateAsRead = useCallback(async (updateId: string) => {
    // Only proceed if user is connected
    if (!address) return;

    try {
      // Send PUT request to mark update as read
      const response = await fetch(`https://bitsaveapi.vercel.app/updates/${updateId}/read`, {
        method: 'PUT',
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          useraddress: address // Associate read status with user's wallet
        })
      });

      if (response.ok) {
        // Update local state to reflect the change immediately
        setUpdates(prevUpdates =>
          prevUpdates.map(update =>
            update.id === updateId ? { ...update, isNew: false } : update
          )
        );
      }
    } catch (error) {
      console.error('Error marking update as read:', handleContractError(error));
    }
  }, [address]);




  // GoodDollar token price state (for Celo network calculations)
  const [goodDollarPrice, setGoodDollarPrice] = useState<number>(0.00009189); // Default fallback price

  // Withdrawal modal state
  const [withdrawModal, setWithdrawModal] = useState({
    isOpen: false,
    planId: '',
    planName: '',
    isEth: false,
    penaltyPercentage: 0,
    tokenName: '',
    isCompleted: false
  });

  // Leaderboard state
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);

  // Fetch current GoodDollar price from CoinGecko API
  const fetchGoodDollarPrice = async () => {
    try {
      // Request current USD price for GoodDollar token
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=gooddollar&vs_currencies=usd');
      const data = await response.json();
      const price = data.gooddollar?.usd; // Extract USD price from response
      if (price && price > 0) {
        return price;
      } else {
        return 0.00009189; // Fallback price if API returns invalid data
      }
    } catch (error) {
      console.error('Error fetching GoodDollar price:', handleContractError(error));
      return 0.00009189; // Fallback price on network/API errors
    }
  };

  // Open update modal and mark update as read
  const openUpdateModal = useCallback((update: Update) => {
    setSelectedUpdate(update);
    setShowUpdateModal(true);

    // Automatically mark as read when user opens the update
    if (update.isNew) {
      markUpdateAsRead(update.id);
    }
  }, [markUpdateAsRead]);


  // Fetch updates when component mounts or wallet address changes
  useEffect(() => {
    if (mounted) {
      // Load user-specific updates from API
      fetchAllUpdates();
    }
  }, [mounted, address]);

  // Fetch GoodDollar price on component mount
  useEffect(() => {
    if (mounted) {
      fetchGoodDollarPrice().then(setGoodDollarPrice);
    }
  }, [mounted]);

  // Close update modal
  const closeUpdateModal = useCallback(() => {
    setShowUpdateModal(false);
  }, []);

  // Handle clicking outside notifications dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const notificationButton = document.getElementById('notification-button');
      const notificationDropdown = document.getElementById('notification-dropdown');

      // Close dropdown if click is outside both button and dropdown
      if (
        showNotifications &&
        notificationButton &&
        notificationDropdown &&
        !notificationButton.contains(event.target as Node) &&
        !notificationDropdown.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Set component as mounted for client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to get signer



  // Switch wallet to specified network (Base, Celo, or Lisk)
  const switchToNetwork = async (networkName: string) => {
    if (!window.ethereum) return;


    try {
      if (networkName === 'Base') {
        // Request switch to Base network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }], // Base chainId in hex (8453)
        });

        // Refresh savings data after successful switch
        refetchSavingsData();
        // Network switched to Base successfully
      } else if (networkName === 'Celo') {
        // Request switch to Celo network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xA4EC' }], // Celo chainId in hex (42220)
        });

        // Refresh savings data after successful switch
        refetchSavingsData();
      } else if (networkName === 'Lisk') {
        // Request switch to Lisk network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x46F' }], // Lisk chainId in hex (1135)
        });

        // Refresh savings data after successful switch
        refetchSavingsData();
      }
    } catch (error: unknown) {
      // Handle case where network is not added to wallet (error code 4902)
      if (error && typeof error === 'object' && 'code' in error && error.code === 4902) {
        try {
          // Add network to wallet if it doesn't exist
          if (networkName === 'Base') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x2105', // Base chainId in hex
                  chainName: 'Base',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://mainnet.base.org'],
                  blockExplorerUrls: ['https://basescan.org'],
                },
              ],
            });
          } else if (networkName === 'Celo') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0xA4EC', // Celo chainId in hex
                  chainName: 'Celo',
                  nativeCurrency: {
                    name: 'CELO',
                    symbol: 'CELO',
                    decimals: 18,
                  },
                  rpcUrls: ['https://forno.celo.org'],
                  blockExplorerUrls: ['https://explorer.celo.org'],
                },
              ],
            });
          } else if (networkName === 'Lisk') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x46F', // Lisk chainId in hex
                  chainName: 'Lisk',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://rpc.api.lisk.com'],
                  blockExplorerUrls: ['https://blockscout.lisk.com'],
                },
              ],
            });
          }

          // Attempt to switch to the newly added network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: networkName === 'Base' ? '0x2105' : networkName === 'Celo' ? '0xA4EC' : '0x46F' }],
          });

          refetchSavingsData();
        } catch (addError) {
          console.error(`Error adding ${networkName} network:`, addError);
        }
      } else {
        console.error(`Error switching to ${networkName} network:`, error);
      }
    } finally {
  
    }
  };


  // Initialize cache system on component mount
  useEffect(() => {
    initializeSavingsCache();
  }, []);
  

  // Opens the top-up modal with plan details and token information
  const openTopUpModal = (planName: string, planId: string, isEth: boolean, tokenName: string = '') => {
    setTopUpModal({ 
      isOpen: true, 
      planName, 
      planId, 
      isEth,
      isGToken: tokenName === '$G',
      tokenName
    });
  };

  // Closes the top-up modal and resets all modal state
  const closeTopUpModal = () => {
    setTopUpModal({ isOpen: false, planName: '', planId: '', isEth: false, isGToken: false, tokenName: '' });
  };

  // Opens the withdrawal modal with plan details, penalty information, and completion status
  const openWithdrawModal = (planId: string, planName: string, isEth: boolean, penaltyPercentage: number = 5, tokenName: string = '', isCompleted: boolean = false) => {
    setWithdrawModal({
      isOpen: true,
      planId,
      planName,
      isEth,
      penaltyPercentage,
      tokenName,
      isCompleted
    });
  };

  // Closes the withdrawal modal and resets all modal state
  const closeWithdrawModal = () => {
    setWithdrawModal({ isOpen: false, planId: '', planName: '', isEth: false, penaltyPercentage: 0, tokenName: '', isCompleted: false });
  };

  // Fetches leaderboard data from the BitSave API and processes it for display
  const fetchLeaderboardData = async () => {
    setIsLeaderboardLoading(true);
    try {
      // Set up request timeout to prevent hanging (8 second limit)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      // Fetch leaderboard data from BitSave API with authentication
      const response = await fetch('https://bitsaveapi.vercel.app/leaderboard', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || ''
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }

      const data = await response.json() as LeaderboardEntry[];

      // Filter users with savings >= $10, sort by total amount, take top 4 users, and add ranking information
      const rankedData = data
        .filter((user: LeaderboardEntry) => user.totalamount >= 10) // Exclude savings below $10
        .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.totalamount - a.totalamount)
        .slice(0, 4)
        .map((user: LeaderboardEntry, index: number) => ({
          ...user,
          rank: index + 1,
          datetime: new Date().toISOString().split('T')[0]
        }));

      setLeaderboardData(rankedData);
    } catch (error) {
      // Handle timeout and other errors gracefully
      if (error instanceof Error && error.name === 'AbortError') {
        // Leaderboard fetch was aborted due to timeout
      } else {
        console.error('Error fetching leaderboard data:', handleContractError(error));
      }
      setLeaderboardData([]);
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  // Fetch leaderboard data once the component is mounted
  useEffect(() => {
    if (mounted) {
      // Fetch leaderboard data in parallel
      fetchLeaderboardData();
    }
  }, [mounted]);



  // Fetch user savings data when component is mounted and wallet is connected
  useEffect(() => {
    if (mounted && address) {
      // Add a small delay to prevent immediate heavy loading
      const timer = setTimeout(() => {
        refetchSavingsData();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mounted, address]);

  // Redirect to landing page if wallet is disconnected
  useEffect(() => {
    if (mounted && !isConnected) {
      router.push('/');
    }
  }, [isConnected, mounted, router]);

  // Helper function to get the appropriate logo path for different tokens
  // Returns custom logo if provided, otherwise maps token names to their logo files
  const getTokenLogo = useCallback((tokenName: string, tokenLogo?: string) => {
    if (tokenLogo) return tokenLogo;
    if (tokenName === 'cUSD') return '/cusd.png';
    if (tokenName === 'USDGLO') return '/usdglo.png';
    if (tokenName === '$G' || tokenName === 'Gooddollar') return '/$g.png';
    if (tokenName === 'USDC') return '/usdc.png';
    return `/${tokenName.toLowerCase()}.png`;
  }, []);

  // Memoize filtered new updates for performance
  const newUpdatesCount = useMemo(() => {
    return updates.filter(update => update.isNew).length;
  }, [updates]);



  // Prevent hydration mismatch by showing consistent loading state
  if (!mounted) {
    return (
      <div className={`${spaceGrotesk.variable} font-sans p-4 sm:p-6 md:p-8 bg-[#f2f2f2] text-gray-800 relative min-h-screen pb-8 overflow-x-hidden`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
        </div>
      </div>
    );
  }

  // Component displayed when user has no active savings plans
  const EmptyCurrentSavings = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm p-8 text-center"
    >
      <div className="mx-auto w-24 h-24 bg-[#81D7B4]/10 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-[#81D7B4]">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-8-6h16" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">No Savings Plans Yet</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">Start your savings journey by creating your first savings plan.</p>
      <Link href="/dashboard/create-savings" className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/90 text-white font-medium rounded-xl shadow-[0_4px_10px_rgba(129,215,180,0.3)] hover:shadow-[0_6px_15px_rgba(129,215,180,0.4)] transition-all duration-300 transform hover:translate-y-[-2px]">
        Create Your First Plan
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </Link>
    </motion.div>
  );

  // Component displayed when user has no completed savings plans
  const EmptyCompletedSavings = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm p-8 text-center"
    >
      <div className="mx-auto w-24 h-24 bg-green-100/50 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-green-500/70">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">No Completed Plans Yet</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">Your completed savings plans will appear here. Keep saving to reach your goals!</p>
      <div className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl border border-gray-200/50 transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 00-1 1v3a1 1 0 002 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
        Keep Saving
      </div>
    </motion.div>
  );



  return (
    <div className={`${spaceGrotesk.variable} font-sans p-4 sm:p-6 md:p-8 bg-[#f2f2f2] text-gray-800 relative min-h-screen pb-8 overflow-x-hidden`}>
      {/* Network Detection Component */}
      <NetworkDetection />

      {/* Top Up Modal */}
      <TopUpModal
        isOpen={topUpModal.isOpen}
        onClose={closeTopUpModal}
        planName={topUpModal.planName}
        planId={topUpModal.planId}
        isEth={topUpModal.isEth}
        tokenName={topUpModal.tokenName}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={withdrawModal.isOpen}
        onClose={closeWithdrawModal}
        planName={withdrawModal.planName}
        isEth={withdrawModal.isEth}
        penaltyPercentage={withdrawModal.penaltyPercentage}
        tokenName={withdrawModal.tokenName}
        isCompleted={withdrawModal.isCompleted}
      />

      {/* Update Modal */}
      {showUpdateModal && selectedUpdate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-0">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-md mx-auto overflow-hidden border border-white/60">
            <div className="p-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">{selectedUpdate.title}</h3>
                <button
                  onClick={closeUpdateModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                {new Date(selectedUpdate.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>

              <div className="text-gray-700 mb-6">
                {selectedUpdate.content}
              </div>

              <button
                onClick={closeUpdateModal}
                className="w-full py-3 text-center text-sm font-medium text-white bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/90 rounded-xl shadow-[0_4px_12px_rgba(129,215,180,0.4)] hover:shadow-[0_8px_20px_rgba(129,215,180,0.5)] transition-all duration-300"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grain overlay */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none bg-[url('/noise.jpg')] mix-blend-overlay" ></div>

      {/* Decorative elements - adjusted for mobile */}
      <div className="absolute top-20 right-10 md:right-20 w-40 md:w-64 h-40 md:h-64 bg-[#81D7B4]/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-20 left-10 md:left-20 w-40 md:w-80 h-40 md:h-80 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>


      {/* Header - responsive adjustments */}
      <div className="flex justify-between items-center mb-6 md:mb-8 overflow-x-hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-500 flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Welcome back, {displayName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'User')}
            {hasENS && ensName && (
              <span className="ml-2 inline-flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                <span className="mr-1">⟠</span>
                ENS: {ensName}
              </span>
            )}
          </p>
        </div>
        {/* Notification bell with responsive positioning - aligned with menu bar */}
        <div className="flex items-center space-x-3 relative mr-12 md:mr-0 mb-10 px-3 py-3">
          <button
            id="notification-button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="bg-white/80 backdrop-blur-sm p-2.5 rounded-full shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {newUpdatesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#81D7B4] rounded-full border-2 border-white"></span>
            )}
          </button>


          {/* Notifications dropdown - improved positioning for mobile */}
          {showNotifications && (
            <div className="fixed right-4 md:right-4 top-20 w-[calc(100vw-2rem)] md:w-80 max-w-sm bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/60 z-[9999] overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Updates</h3>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {updates.length > 0 ? (
                  updates.map(update => (
                    <button
                      key={update.id}
                      onClick={() => openUpdateModal(update)}
                      className="w-full text-left p-4 hover:bg-[#81D7B4]/5 border-b border-gray-100 last:border-b-0 transition-colors relative"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">{update.title}</h4>
                          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{update.content}</p>
                          <span className="text-gray-400 text-xs mt-2 block">
                            {new Date(update.date).toLocaleDateString()}
                          </span>
                        </div>
                        {update.isNew && (
                          <span className="bg-[#81D7B4] text-white text-xs px-2 py-0.5 rounded-full">New</span>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No new updates
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-50/80 border-t border-gray-100">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-full py-2 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Total Value Card - responsive padding */}
        <div className="md:col-span-2 bg-white/80 backdrop-blur-md rounded-2xl p-5 md:p-8 border border-white/50 shadow-[0_10px_25px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_-15px_rgba(0,0,0,0.2)] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#81D7B4]/10 rounded-full blur-2xl group-hover:bg-[#81D7B4]/20 transition-all duration-500"></div>

                   {/* Card header with token selector */}
                   <div className="flex items-center mb-6 md:mb-8">
            <div className="relative">
              <button
                onClick={() => document.getElementById('chain-dropdown')?.classList.toggle('hidden')}
                className="flex items-center bg-gray-100/80 backdrop-blur-sm rounded-lg px-3 py-2 md:px-4 md:py-2.5 border border-gray-200/50 hover:bg-gray-100 transition-all duration-300"
              >
                <div className="bg-gray-100 rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center mr-2 shadow-sm overflow-hidden">
                  <img
                    src={`/${isBaseNetwork ? 'base.svg' : isLiskNetwork ? 'lisk-logo.png' : 'celo.png'}`}
                    alt={isBaseNetwork ? 'Base' : isLiskNetwork ? 'Lisk' : 'Celo'}
                    className="w-5 h-5 md:w-6 md:h-6 object-contain"
                  />
                </div>
                <span className="text-gray-700 font-medium text-sm md:text-base">{isBaseNetwork ? 'Base' : isLiskNetwork ? 'Lisk' : 'Celo'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 ml-2 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              <div id="chain-dropdown" className="absolute left-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 z-10 hidden">
                {['Base', 'Celo', 'Lisk'].map((chain) => (
                  <button
                    key={chain}
                    onClick={() => {
                      if (chain === 'Base' || chain === 'Celo' || chain === 'Lisk') {
                        document.getElementById('chain-dropdown')?.classList.add('hidden');
                        // Switch network when chain is selected
                        switchToNetwork(chain);
                      }
                    }}
                    className={`flex items-center w-full px-4 py-2 hover:bg-gray-100/80 text-left text-sm ${(chain === 'Base' && isBaseNetwork) || (chain === 'Celo' && isCeloNetwork) || (chain === 'Lisk' && isLiskNetwork) ? 'bg-gray-100/80' : ''}`}
                  >
                    <div className="bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center mr-2 overflow-hidden">
                      <img
                        src={`/${chain === 'Lisk' ? 'lisk-logo.png' : chain.toLowerCase()}${chain === 'Arbitrum' || chain === 'Celo' ? '.png' : chain === 'Lisk' ? '' : '.svg'}`}
                        alt={chain}
                        className="w-4 h-4 object-contain"
                      />
                    </div>
                    <div className="flex items-center">
                      {chain}
                      
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main value display - responsive text sizes */}
          <div className="relative mb-6 md:mb-8">
            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 h-10 md:h-12 bg-gradient-to-b from-[#81D7B4] to-green-400 rounded-full"></div>
            <div className="pl-4">
              <span className="block text-gray-500 text-xs md:text-sm mb-1">Total Value Saved</span>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-800 tracking-tight flex items-baseline">
                ${parseFloat(savingsData.totalLocked).toFixed(2)}
                <span className="text-xs md:text-sm font-medium text-gray-500 ml-2">USD</span>
              </h2>
            </div>
          </div>

          {/* Card footer with stats - updated to use real data */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="bg-gray-100/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-200/50 flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Total Savings Plan</span>
              <span className="text-base md:text-lg font-semibold text-gray-800">{savingsData.deposits}</span>
            </div>

            <div className="bg-gray-100/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-200/50 flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Rewards</span>
              <span className="text-base md:text-lg font-semibold text-gray-800">{savingsData.rewards} $BTS</span>
            </div>
          </div>
        </div>

        {/* Leaderboard - responsive adjustments */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/50 shadow-[0_10px_25px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_-15px_rgba(0,0,0,0.2)] transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#81D7B4]/10 rounded-full blur-2xl"></div>
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#81D7B4]/5 rounded-full blur-3xl"></div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Leaderboard</h2>
            <Link href="/dashboard/leaderboard" className="text-xs font-medium text-[#81D7B4] bg-[#81D7B4]/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#81D7B4]/20 hover:bg-[#81D7B4]/20 transition-all duration-300 flex items-center">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3 ml-1">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="space-y-4">
            {isLeaderboardLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
              </div>
            ) : leaderboardData.length > 0 ? (
              leaderboardData.map((item) => (
                <div key={item.rank} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#81D7B4]/5 transition-all duration-300 border border-transparent hover:border-[#81D7B4]/20">
                  <div className="flex items-center">
                    <div className="w-7 h-7 flex items-center justify-center font-bold text-sm bg-[#81D7B4]/10 rounded-full mr-3 text-[#81D7B4] border border-[#81D7B4]/30">
                      {item.rank}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-700 font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[180px]">
                        {item.useraddress.slice(0, 6)}...{item.useraddress.slice(-4)}
                      </span>
                      <span className="text-xs text-gray-500">{item.chain}</span>
                    </div>
                  </div>
                  <span className="font-medium text-[#81D7B4] bg-[#81D7B4]/10 px-2.5 py-1 rounded-full text-sm shadow-sm">${item.totalamount.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No leaderboard data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Savings Button - responsive padding */}
      <div className="mt-4 md:mt-6 bg-white/70 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.2)] transition-all duration-500 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.04] mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gradient-to-tl from-[#81D7B4]/20 to-blue-300/10 rounded-full blur-3xl group-hover:bg-[#81D7B4]/30 transition-all duration-700"></div>
        <div className="absolute -left-20 -top-20 w-60 h-60 bg-gradient-to-br from-purple-300/10 to-transparent rounded-full blur-3xl opacity-70"></div>

        <Link href="/dashboard/create-savings" className="flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all duration-300">
          <div className="bg-gradient-to-br from-[#81D7B4] to-[#81D7B4]/90 rounded-full p-3.5 mr-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_10px_rgba(129,215,180,0.4),0_1px_2px_rgba(0,0,0,0.3)] group-hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_6px_15px_rgba(129,215,180,0.5),0_1px_2px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-6 h-6 drop-shadow-sm">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xl font-medium bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300">Create Savings</span>
        </Link>
      </div>

      {/* Savings Plans - responsive spacing */}
      <div className="mt-6 md:mt-8 mb-8">

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4 md:mb-6">
          <button
            className={`px-3 md:px-4 py-2 font-medium text-xs md:text-sm ${activeTab === 'current' ? 'text-[#81D7B4] border-b-2 border-[#81D7B4]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('current')}
          >
            Current
          </button>
          <button
            className={`px-3 md:px-4 py-2 font-medium text-xs md:text-sm ${activeTab === 'completed' ? 'text-[#81D7B4] border-b-2 border-[#81D7B4]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>

        {/* Savings plan cards with empty states */}
        {activeTab === 'current' && (
          <div className="flex flex-col gap-4 md:gap-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
              </div>
            ) : savingsData.currentPlans.length > 0 ? (
              <>
                {/* Show only first 3 plans on dashboard */}
                {savingsData.currentPlans.slice(0, 3).map((plan) => (
                  <div key={plan.id} className="relative bg-white/70 backdrop-blur-2xl rounded-3xl border border-[#81D7B4]/30 shadow-[0_8px_32px_rgba(129,215,180,0.18),0_1.5px_8px_rgba(34,158,217,0.10)] p-7 md:p-8 hover:shadow-[0_16px_48px_rgba(129,215,180,0.22)] transition-all duration-300 group overflow-hidden flex flex-col gap-6 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/60 before:to-[#81D7B4]/10 before:opacity-80 before:pointer-events-none after:absolute after:inset-0 after:rounded-3xl after:shadow-[inset_0_2px_16px_rgba(129,215,180,0.10),inset_0_1.5px_8px_rgba(34,158,217,0.08)] after:pointer-events-none">
                    {/* Decorative gradients */}
                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-[#81D7B4]/30 to-[#229ED9]/20 rounded-full blur-3xl z-0"></div>
                    <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-tr from-[#229ED9]/20 to-[#81D7B4]/30 rounded-full blur-3xl z-0"></div>
                    <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.05] mix-blend-overlay pointer-events-none z-0"></div>

                    {/* Header Row */}
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#81D7B4]/20 p-2 rounded-xl border border-[#81D7B4]/30 shadow-sm">
                          <img src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')} alt={plan.isEth ? 'ETH' : plan.tokenName} className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight mb-0.5 truncate max-w-[180px] sm:max-w-[220px] md:max-w-[300px]">{plan.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/20 text-[#163239] text-xs font-medium shadow-sm">
                              <img src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')} alt={plan.isEth ? 'ETH' : plan.tokenName} className="w-4 h-4 mr-1" />
                              {plan.isEth ? 'ETH' : plan.tokenName}
                              <span className="mx-1 text-gray-300">|</span>
                              <img src={isBaseNetwork ? '/base.svg' : '/celo.png'} alt={isBaseNetwork ? 'Base' : 'Celo'} className="w-4 h-4 mr-1" />
                              {isBaseNetwork ? 'Base' : 'Celo'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => openTopUpModal(plan.name, plan.id, plan.isEth, plan.tokenName)}
                        className="bg-[#81D7B4] text-white text-xs font-semibold px-4 py-2 rounded-full border border-[#81D7B4]/20 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        Top Up
                      </button>
                    </div>

                    {/* Progress Bars Row */}
                    <div className="flex flex-col md:flex-row md:items-end md:space-x-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_2px_12px_rgba(129,215,180,0.08)] px-4 py-4 gap-4 md:gap-0">
                      {/* Progress to Completion */}
                      <div className="flex-1">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-gray-700 font-semibold flex items-center gap-1">
                            Progress
                            <span className="ml-1 text-gray-400" title="How close you are to your savings goal">(to completion)</span>
                          </span>
                          <span className="font-bold text-gray-900">{Math.round(plan.progress)}%</span>
                      </div>
                        <div className="w-full h-2.5 bg-gray-100/80 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-gradient-to-r from-[#81D7B4] to-green-400 rounded-full shadow-[0_0_12px_rgba(129,215,180,0.6)]" style={{ width: `${plan.progress}%` }}></div>
                      </div>
                      </div>
                      {/* $BTS Rewards */}
                      <div className="flex-1">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-gray-700 font-semibold flex items-center gap-1">
                            $BTS Rewards
                            <span className="ml-1 text-gray-400" title="Earned only when you complete your savings">(on completion)</span>
                          </span>
                          <span className="font-bold text-gray-900">{plan.tokenName === 'Gooddollar' ? ((parseFloat(plan.currentAmount) * goodDollarPrice) * 0.005 * 1000).toFixed(2) : (parseFloat(plan.currentAmount) * 0.005 * 1000).toFixed(2)} $BTS</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100/80 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-gradient-to-r from-[#229ED9] to-[#81D7B4] rounded-full shadow-[0_0_12px_rgba(34,158,217,0.3)]" style={{ width: `${plan.progress}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Info Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">Current Amount:</span>
                        <span className="text-base font-bold text-gray-900">
                          {plan.isEth ? (
                            <>{parseFloat(plan.currentAmount).toFixed(4)} <span className="text-xs font-medium text-gray-500 ml-1">ETH</span></>
                          ) : plan.tokenName === 'Gooddollar' ? (
                            <>{parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} <span className="text-xs font-medium text-gray-500 ml-1">$G</span> <span className="text-xs text-gray-400 ml-2">(${(parseFloat(plan.currentAmount) * goodDollarPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)</span></>
                          ) : plan.tokenName === 'USDGLO' ? (
                            <>${parseFloat(plan.currentAmount).toFixed(2)} <span className="text-xs font-medium text-gray-500 ml-1">USDGLO</span></>
                          ) : plan.tokenName === 'cUSD' ? (
                            <>${parseFloat(plan.currentAmount).toFixed(2)} <span className="text-xs font-medium text-gray-500 ml-1">cUSD</span></>
                          ) : (
                            <>{parseFloat(plan.currentAmount).toFixed(2)} <span className="text-xs font-medium text-gray-500 ml-1">{plan.tokenName}</span></>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">Time Left:</span>
                        <span className="text-sm font-semibold text-gray-800">
                          {(() => {
                            const currentDate = new Date();
                            const maturityTimestamp = Number(plan.maturityTime || 0);
                            const maturityDate = new Date(maturityTimestamp * 1000);
                            if (isNaN(maturityDate.getTime())) return '';
                            const remainingTime = maturityDate.getTime() - currentDate.getTime();
                            const remainingDays = Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60 * 24)));
                            if (remainingDays === 0) return 'Completed';
                            if (remainingDays === 1) return '1 day';
                            if (remainingDays < 30) return `${remainingDays} days`;
                            const remainingMonths = Math.ceil(remainingDays / 30);
                            if (remainingMonths === 1) return '1 month';
                            if (remainingMonths > 1) return `${remainingMonths} months`;
                            return '';
                          })()}
                        </span>
                      </div>
                    </div>

                    {/* Info Icon and Label */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#229ED9]/10 border border-[#229ED9]/30 text-[#229ED9] text-xs font-bold cursor-pointer group relative" tabIndex={0}>
                        i
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 w-64 bg-white/90 text-[#163239] text-xs rounded-lg shadow-lg border border-[#81D7B4]/20 px-4 py-2 z-20 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 pointer-events-none">
                          Withdrawing before the set completion date will forfeit your $BTS rewards and incur a penalty on your savings.
                        </span>
                      </span>
                      <span className="text-xs text-gray-500 font-medium">Early withdrawal results in loss of rewards and a penalty fee.</span>
                    </div>

                    {/* Withdraw Button */}
                    <button
                      onClick={() => {
                        const currentDate = new Date();
                        const maturityTimestamp = Number(plan.maturityTime || 0);
                        const maturityDate = new Date(maturityTimestamp * 1000);
                        const isCompleted = currentDate >= maturityDate;
                        openWithdrawModal(plan.id, plan.name, plan.isEth, plan.penaltyPercentage, plan.tokenName, isCompleted);
                      }}
                      className="w-full py-3 text-center text-sm font-bold text-white bg-[#81D7B4] rounded-xl shadow-[0_4px_12px_rgba(129,215,180,0.15)] hover:shadow-[0_8px_20px_rgba(129,215,180,0.18)] transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group mt-2"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Withdraw
                      </span>
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <EmptyCurrentSavings />
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="flex flex-col gap-4 md:gap-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
              </div>
            ) : savingsData.completedPlans.length > 0 ? (
              <>
                {/* Show only first 3 completed plans on dashboard */}
                {savingsData.completedPlans.slice(0, 3).map((plan) => (
                  <div key={plan.id} className="relative bg-white/70 backdrop-blur-2xl rounded-3xl border border-[#81D7B4]/30 shadow-[0_8px_32px_rgba(129,215,180,0.18),0_1.5px_8px_rgba(34,158,217,0.10)] p-7 md:p-8 hover:shadow-[0_16px_48px_rgba(129,215,180,0.22)] transition-all duration-300 group overflow-hidden flex flex-col gap-6 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/60 before:to-[#81D7B4]/10 before:opacity-80 before:pointer-events-none after:absolute after:inset-0 after:rounded-3xl after:shadow-[inset_0_2px_16px_rgba(129,215,180,0.10),inset_0_1.5px_8px_rgba(34,158,217,0.08)] after:pointer-events-none">
                    {/* Decorative gradients */}
                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-[#81D7B4]/30 to-[#229ED9]/20 rounded-full blur-3xl z-0"></div>
                    <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-tr from-[#229ED9]/20 to-[#81D7B4]/30 rounded-full blur-3xl z-0"></div>
                    <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.05] mix-blend-overlay pointer-events-none z-0"></div>

                    {/* Header Row */}
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#81D7B4]/20 p-2 rounded-xl border border-[#81D7B4]/30 shadow-sm">
                          <img src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')} alt={plan.isEth ? 'ETH' : plan.tokenName} className="w-6 h-6" />
                        </div>
                      <div>
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight mb-0.5 truncate max-w-[180px] sm:max-w-[220px] md:max-w-[300px]">{plan.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/20 text-[#163239] text-xs font-medium shadow-sm">
                              <img src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')} alt={plan.isEth ? 'ETH' : plan.tokenName} className="w-4 h-4 mr-1" />
                              {plan.isEth ? 'ETH' : plan.tokenName}
                              <span className="mx-1 text-gray-300">|</span>
                              <img src={isBaseNetwork ? '/base.svg' : '/celo.png'} alt={isBaseNetwork ? 'Base' : 'Celo'} className="w-4 h-4 mr-1" />
                              {isBaseNetwork ? 'Base' : 'Celo'}
                          </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => openTopUpModal(plan.name, plan.id, plan.isEth, plan.tokenName)}
                        className="bg-[#81D7B4] text-white text-xs font-semibold px-4 py-2 rounded-full border border-[#81D7B4]/20 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        Top Up
                      </button>
                    </div>

                    {/* Progress Bars Row */}
                    <div className="flex flex-col md:flex-row md:items-end md:space-x-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_2px_12px_rgba(129,215,180,0.08)] px-4 py-4 gap-4 md:gap-0">
                      {/* Progress to Completion */}
                      <div className="flex-1">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-gray-700 font-semibold flex items-center gap-1">
                            Progress
                            <span className="ml-1 text-gray-400" title="How close you are to your savings goal">(to completion)</span>
                          </span>
                          <span className="font-bold text-gray-900">{Math.round(plan.progress)}%</span>
                      </div>
                        <div className="w-full h-2.5 bg-gray-100/80 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-gradient-to-r from-[#81D7B4] to-green-400 rounded-full shadow-[0_0_12px_rgba(129,215,180,0.6)]" style={{ width: `${plan.progress}%` }}></div>
                        </div>
                      </div>
                      {/* $BTS Rewards */}
                      <div className="flex-1">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-gray-700 font-semibold flex items-center gap-1">
                            $BTS Rewards
                            <span className="ml-1 text-gray-400" title="Earned only when you complete your savings">(on completion)</span>
                          </span>
                          <span className="font-bold text-gray-900">{plan.tokenName === 'Gooddollar' ? ((parseFloat(plan.currentAmount) * goodDollarPrice) * 0.005 * 1000).toFixed(2) : (parseFloat(plan.currentAmount) * 0.005 * 1000).toFixed(2)} $BTS</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100/80 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-gradient-to-r from-[#229ED9] to-[#81D7B4] rounded-full shadow-[0_0_12px_rgba(34,158,217,0.3)]" style={{ width: `${plan.progress}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Info Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">Current Amount:</span>
                        <span className="text-base font-bold text-gray-900">
                          {plan.isEth ? (
                            <>{parseFloat(plan.currentAmount).toFixed(4)} <span className="text-xs font-medium text-gray-500 ml-1">ETH</span></>
                          ) : plan.tokenName === 'Gooddollar' ? (
                            <>{parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} <span className="text-xs font-medium text-gray-500 ml-1">$G</span> <span className="text-xs text-gray-400 ml-2">(${(parseFloat(plan.currentAmount) * goodDollarPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)</span></>
                          ) : plan.tokenName === 'USDGLO' ? (
                            <>${parseFloat(plan.currentAmount).toFixed(2)} <span className="text-xs font-medium text-gray-500 ml-1">USDGLO</span></>
                          ) : plan.tokenName === 'cUSD' ? (
                            <>${parseFloat(plan.currentAmount).toFixed(2)} <span className="text-xs font-medium text-gray-500 ml-1">cUSD</span></>
                          ) : (
                            <>{parseFloat(plan.currentAmount).toFixed(2)} <span className="text-xs font-medium text-gray-500 ml-1">{plan.tokenName}</span></>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">Time Left:</span>
                        <span className="text-sm font-semibold text-gray-800">
                          {(() => {
                            const currentDate = new Date();
                            const maturityTimestamp = Number(plan.maturityTime || 0);
                            const maturityDate = new Date(maturityTimestamp * 1000);
                            if (isNaN(maturityDate.getTime())) return '';
                            const remainingTime = maturityDate.getTime() - currentDate.getTime();
                            const remainingDays = Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60 * 24)));
                            if (remainingDays === 0) return 'Completed';
                            if (remainingDays === 1) return '1 day';
                            if (remainingDays < 30) return `${remainingDays} days`;
                            const remainingMonths = Math.ceil(remainingDays / 30);
                            if (remainingMonths === 1) return '1 month';
                            if (remainingMonths > 1) return `${remainingMonths} months`;
                            return '';
                          })()}
                        </span>
                      </div>
                    </div>

                    {/* Info Icon and Label */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#229ED9]/10 border border-[#229ED9]/30 text-[#229ED9] text-xs font-bold cursor-pointer group relative" tabIndex={0}>
                        i
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 w-64 bg-white/90 text-[#163239] text-xs rounded-lg shadow-lg border border-[#81D7B4]/20 px-4 py-2 z-20 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 pointer-events-none">
                          Withdrawing before the set completion date will forfeit your $BTS rewards and incur a penalty on your savings.
                        </span>
                      </span>
                      <span className="text-xs text-gray-500 font-medium">Early withdrawal results in loss of rewards and a penalty fee.</span>
                    </div>

                    {/* Withdraw Button */}
                    <button
                      onClick={() => {
                        const currentDate = new Date();
                        const maturityTimestamp = Number(plan.maturityTime || 0);
                        const maturityDate = new Date(maturityTimestamp * 1000);
                        const isCompleted = currentDate >= maturityDate;
                        openWithdrawModal(plan.id, plan.name, plan.isEth, plan.penaltyPercentage, plan.tokenName, isCompleted);
                      }}
                      className="w-full py-3 text-center text-sm font-bold text-white bg-[#81D7B4] rounded-xl shadow-[0_4px_12px_rgba(129,215,180,0.15)] hover:shadow-[0_8px_20px_rgba(129,215,180,0.18)] transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group mt-2"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Withdraw
                      </span>
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <EmptyCompletedSavings />
            )}
          </div>
        )}
      </div>
    </div>
  );
}



