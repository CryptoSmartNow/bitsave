'use client'
// React hooks for state management and lifecycle
import { useState, useEffect, useCallback, useMemo } from 'react';
// Wagmi hooks for wallet connection and network switching
import { useAccount } from 'wagmi';
// Next.js navigation utilities
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
// Google Fonts integration
import { Exo } from 'next/font/google';
// Custom modal components for savings operations
import TopUpModal from '../../components/TopUpModal';
import WithdrawModal from '../../components/WithdrawModal';
import PlanDetailsModal from '../../components/PlanDetailsModal';
import NetworkDetection from '../../components/NetworkDetection';
import NetworkSelectionModal from '../../components/NetworkSelectionModal';
// Animation library for smooth UI transitions
import { motion, AnimatePresence } from 'framer-motion';
// Custom error handling for contract operations
import { handleContractError } from '../../lib/contractErrorHandler';
// Custom hook for savings data with caching
import { useSavingsData } from '../../hooks/useSavingsData';
import { ShimmerList } from '../../components/ShimmerLoading';
// Network synchronization hook for automatic wallet-UI sync
import { useNetworkSync } from '../../hooks/useNetworkSync';
// Cache initialization utility
import { initializeSavingsCache } from '../../utils/savingsCache';
// ENS data hook for identity resolution
import { useENSData } from '../../hooks/useENSData';
// Date utility functions for formatting timestamps
import { formatTimestamp } from '../../utils/dateUtils';
import { HiOutlineArrowRight, HiOutlineCheckCircle, HiOutlineArrowDown, HiOutlineBell, HiOutlineChevronDown, HiOutlineCheck, HiOutlineClipboardDocumentList, HiOutlineCurrencyDollar, HiOutlinePlus, HiOutlineXMark, HiOutlineEye, HiOutlineBanknotes } from 'react-icons/hi2';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '../../utils/networkLogos';

// Helper function to ensure image URLs are properly formatted for Next.js Image
const ensureImageUrl = (url: string | undefined): string => {
  if (!url) return '/default-network.png'
  // If it's a relative path starting with /, it's fine
  if (url.startsWith('/')) return url
  // If it starts with // (protocol-relative), convert to https
  if (url.startsWith('//')) return `https:${url}`
  // If it doesn't start with http/https and doesn't start with /, add /
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `/${url}`
  }
  return url
}

// Configure Space Grotesk font with optimal loading settings
const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
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
    isAvalancheNetwork,
    refetch: refetchSavingsData
  } = useSavingsData();

  // Network synchronization hook for automatic wallet-UI sync
  const {
    syncToWalletNetwork,
    switchToNetwork: syncSwitchToNetwork,
    isNetworkSynced,
    currentNetworkName,
    isNetworkSwitching: hookNetworkSwitching
  } = useNetworkSync();

  // ENS data hook for identity resolution
  const { ensName, getDisplayName, hasENS } = useENSData();

  // UI state management
  const [activeTab, setActiveTab] = useState('current'); // Toggle between current/completed savings
  const [activeMode, setActiveMode] = useState<'savefi' | 'bizfi'>('savefi'); // Toggle between SaveFi and BizFi

  // Modal state for top-up operations
  const [topUpModal, setTopUpModal] = useState({
    isOpen: false,
    planName: '',
    planId: '',
    isEth: false,
    isGToken: false,
    tokenName: ''
  });

  // Modal state for plan details
  const [planDetailsModal, setPlanDetailsModal] = useState({
    isOpen: false,
    plan: null as any,
    isEth: false,
    tokenName: ''
  });

  // User interface state
  const [displayName, setDisplayName] = useState(''); // User's display name (Twitter or wallet)
  const [showNotifications, setShowNotifications] = useState(false); // Notification panel visibility
  const [showUpdateModal, setShowUpdateModal] = useState(false); // Update modal visibility
  const [selectedUpdate, setSelectedUpdate] = useState<{ title: string, content: string, date: string } | null>(null); // Selected update for modal
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false); // Network dropdown visibility
  const [showNetworkModal, setShowNetworkModal] = useState(false); // Network modal visibility (for mobile)
  const [isMobile, setIsMobile] = useState(false); // Detect mobile device


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

  // Network logos state
  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});
  const [isLoadingLogos, setIsLoadingLogos] = useState(true);

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
  }, [mounted, address, fetchAllUpdates]);

  // Fetch GoodDollar price on component mount
  useEffect(() => {
    if (mounted) {
      fetchGoodDollarPrice().then(setGoodDollarPrice);
    }
  }, [mounted]);

  // Fetch network logos from CoinGecko
  useEffect(() => {
    const loadNetworkLogos = async () => {
      try {
        setIsLoadingLogos(true);
        const logos = await fetchMultipleNetworkLogos(['base', 'celo', 'lisk', 'avalanche', 'solana']);
        setNetworkLogos(logos);
      } catch (error) {
        console.error('Error loading network logos:', error);
      } finally {
        setIsLoadingLogos(false);
      }
    };

    if (mounted) {
      loadNetworkLogos();
    }
  }, [mounted]);

  // Close update modal
  const closeUpdateModal = useCallback(() => {
    setShowUpdateModal(false);
  }, []);

  // Handle clicking outside dropdowns to close them
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const notificationButton = document.getElementById('notification-button');
      const notificationDropdown = document.getElementById('notification-dropdown');
      const networkButton = document.getElementById('network-button');
      const networkDropdown = document.getElementById('network-dropdown');

      // Close notification dropdown if click is outside both button and dropdown
      if (
        showNotifications &&
        notificationButton &&
        notificationDropdown &&
        !notificationButton.contains(event.target as Node) &&
        !notificationDropdown.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }

      // Close network dropdown if click is outside both button and dropdown (desktop only)
      if (
        !isMobile &&
        showNetworkDropdown &&
        networkButton &&
        networkDropdown &&
        !networkButton.contains(event.target as Node) &&
        !networkDropdown.contains(event.target as Node)
      ) {
        setShowNetworkDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showNetworkDropdown, isMobile]);

  // Set component as mounted for client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Function to get signer





  // Enhanced network switching with automatic verification and syncing
  const switchToNetwork = async (networkName: string) => {
    // Use the synchronized switching function from the hook
    // The hook handles all loading states, validation, and error handling
    console.log(`Enhanced network switch: Attempting to switch to ${networkName} network...`);
    const success = await syncSwitchToNetwork(networkName);

    if (success) {
      console.log(`Successfully switched to ${networkName}`);
    }
  };

  // Handle network selection (used by both modal and dropdown)
  const handleNetworkSelect = async (network: { name: string; isActive: boolean }) => {
    if (network.isActive && isNetworkSynced) {
      await refetchSavingsData();
    } else if (network.isActive && !isNetworkSynced) {
      await syncToWalletNetwork();
    } else {
      await switchToNetwork(network.name);
    }
  };

  // Network options with dynamic logos (CoinGecko first, then local fallback)
  const networkOptions = useMemo(() => [
    { name: 'Base', desc: 'Ethereum L2', icon: networkLogos['base']?.logoUrl || networkLogos['base']?.fallbackUrl || '/base.svg', isActive: isBaseNetwork },
    { name: 'Celo', desc: 'Mobile-First', icon: networkLogos['celo']?.logoUrl || networkLogos['celo']?.fallbackUrl || '/celo.png', isActive: isCeloNetwork },
    { name: 'Lisk', desc: 'Ethereum L2', icon: networkLogos['lisk']?.logoUrl || networkLogos['lisk']?.fallbackUrl || '/lisk-logo.png', isActive: isLiskNetwork },
    { name: 'Avalanche', desc: 'EVM Mainnet', icon: networkLogos['avalanche']?.logoUrl || networkLogos['avalanche']?.fallbackUrl || '/eth.png', isActive: isAvalancheNetwork },
    { name: 'Solana', desc: 'High-Performance Blockchain', icon: networkLogos['solana']?.logoUrl || networkLogos['solana']?.fallbackUrl || '/solana.png', isActive: false, isComingSoon: true }
  ], [networkLogos, isBaseNetwork, isCeloNetwork, isLiskNetwork, isAvalancheNetwork]);


  // Initialize cache system on component mount
  useEffect(() => {
    initializeSavingsCache();
  }, []);

  // Network state tracking
  useEffect(() => {
    // Network state monitoring
  }, [isBaseNetwork, isCeloNetwork, isLiskNetwork, hookNetworkSwitching]);


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





  // Fetch user savings data when component is mounted and wallet is connected
  useEffect(() => {
    if (mounted && address) {
      // Add a small delay to prevent immediate heavy loading
      const timer = setTimeout(() => {
        refetchSavingsData(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mounted, address, refetchSavingsData]);

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
    if (tokenName === 'USDC') return '/usdclogo.png';
    return `/${tokenName.toLowerCase()}.png`;
  }, []);

  // Memoize filtered new updates for performance
  const newUpdatesCount = useMemo(() => {
    return updates.filter(update => update.isNew).length;
  }, [updates]);



  // Prevent hydration mismatch by showing consistent loading state
  if (!mounted) {
    return (
      <div className={`${exo.variable} font-sans p-4 sm:p-6 md:p-8 bg-[#F7FCFA] text-gray-800 relative min-h-screen pb-8 overflow-x-hidden`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
        </div>
      </div>
    );
  }

  // Component displayed when user has no active savings plans
  const EmptyCurrentSavings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-white/20 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-[0_20px_60px_rgba(129,215,180,0.1),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.05)] p-10 text-center overflow-hidden"
    >
      {/* Glassmorphism background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-[#81D7B4]/5 via-transparent to-[#81D7B4]/10 opacity-80"></div>

      {/* Floating orbs for depth */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#81D7B4]/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[#81D7B4]/15 rounded-full blur-2xl animate-pulse delay-1000"></div>

      <div className="relative z-10">
        {/* Neomorphic icon container */}
        <div className="mx-auto w-28 h-28 bg-white/40 backdrop-blur-xl rounded-full flex items-center justify-center mb-8 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.1),0_8px_32px_rgba(129,215,180,0.2)] border border-white/50 group-hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.05),0_12px_40px_rgba(129,215,180,0.3)] transition-all duration-500">
          <HiOutlinePlus className="w-14 h-14 text-[#81D7B4] drop-shadow-sm" />
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight">No Savings Plans Yet</h3>
        <p className="text-gray-600/80 mb-8 max-w-sm mx-auto leading-relaxed font-medium">Begin your wealth-building journey with your first strategic savings plan.</p>

        {/* Liquid glass button */}
        <Link href="/dashboard/create-savings" className="group/btn inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#81D7B4] via-[#81D7B4] to-[#81D7B4]/90 text-white font-semibold rounded-2xl shadow-[0_8px_32px_rgba(129,215,180,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_12px_40px_rgba(129,215,180,0.5),inset_0_1px_0_rgba(255,255,255,0.4)] transition-all duration-500 transform hover:translate-y-[-3px] hover:scale-105 backdrop-blur-sm border border-[#81D7B4]/30">
          <span className="relative z-10">Create Your First Plan</span>
          <HiOutlineArrowRight className="h-5 w-5 ml-3 transition-transform duration-300 group-hover/btn:translate-x-1" />
          {/* Button shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
        </Link>
      </div>
    </motion.div>
  );

  // Component displayed when user has no completed savings plans
  const EmptyCompletedSavings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="group relative bg-white/20 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-[0_20px_60px_rgba(129,215,180,0.1),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.05)] p-10 text-center overflow-hidden"
    >
      {/* Glassmorphism background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-[#81D7B4]/5 via-transparent to-[#81D7B4]/10 opacity-80"></div>

      {/* Floating orbs for depth */}
      <div className="absolute -top-8 -right-8 w-28 h-28 bg-[#81D7B4]/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-[#81D7B4]/20 rounded-full blur-2xl animate-pulse delay-1500"></div>

      <div className="relative z-10">
        {/* Neomorphic icon container */}
        <div className="mx-auto w-28 h-28 bg-white/40 backdrop-blur-xl rounded-full flex items-center justify-center mb-8 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.1),0_8px_32px_rgba(129,215,180,0.2)] border border-white/50 group-hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.05),0_12px_40px_rgba(129,215,180,0.3)] transition-all duration-500">
          <HiOutlineCheckCircle className="w-14 h-14 text-[#81D7B4] drop-shadow-sm" />
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight">No Completed Plans Yet</h3>
        <p className="text-gray-600/80 mb-8 max-w-sm mx-auto leading-relaxed font-medium">Your completed savings plans will appear here. Continue building wealth to achieve your financial goals!</p>

        {/* Liquid glass status indicator */}
        <div className="group/indicator inline-flex items-center justify-center px-8 py-4 bg-white/30 backdrop-blur-xl text-gray-700 font-semibold rounded-2xl border border-white/40 shadow-[0_8px_32px_rgba(129,215,180,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] hover:shadow-[0_12px_40px_rgba(129,215,180,0.15),inset_0_1px_0_rgba(255,255,255,0.7)] transition-all duration-500 transform hover:scale-105">
          <HiOutlineArrowDown className="h-6 w-6 mr-3 text-[#81D7B4] transition-transform duration-300 group-hover/indicator:rotate-12" />
          <span className="relative z-10">Keep Building Wealth</span>
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/indicator:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
        </div>
      </div>
    </motion.div>
  );



  return (
    <div className={`${exo.variable} font-sans p-4 sm:p-6 md:p-8 bg-[#F7FCFA] text-gray-800 relative min-h-screen pb-8 overflow-x-hidden`}>

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
        networkLogos={networkLogos}
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
        networkLogos={networkLogos}
      />

      {/* Plan Details Modal */}
      <PlanDetailsModal
        isOpen={planDetailsModal.isOpen}
        onClose={() => setPlanDetailsModal({ ...planDetailsModal, isOpen: false })}
        plan={planDetailsModal.plan}
        isEth={planDetailsModal.isEth}
        tokenName={planDetailsModal.tokenName}
        goodDollarPrice={goodDollarPrice}
      />

      {/* Network Selection Modal (Mobile) */}
      <NetworkSelectionModal
        isOpen={showNetworkModal}
        onClose={() => {
          setShowNetworkModal(false);
        }}
        networks={networkOptions}
        onSelectNetwork={async (network) => {
          await handleNetworkSelect(network);
          setShowNetworkModal(false);
        }}
        isNetworkSwitching={hookNetworkSwitching}
        isLoadingLogos={isLoadingLogos}
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
                  <HiOutlineXMark className="w-5 h-5" />
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
      {/* Noise background removed per redesign spec */}

      {/* Decorative elements - adjusted for mobile */}
      <div className="absolute top-20 right-10 md:right-20 w-40 md:w-64 h-40 md:h-64 bg-[#81D7B4]/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-20 left-10 md:left-20 w-40 md:w-80 h-40 md:h-80 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>


      {/* Header - responsive adjustments */}
      <div className="mb-4 sm:mb-6 md:mb-8 overflow-x-hidden">
        {/* Welcome back and Notification on same line */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></span>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight truncate">
              {(() => {
                const hour = new Date().getHours();
                if (hour < 12) return 'Good morning';
                if (hour < 18) return 'Good afternoon';
                return 'Good evening';
              })()}
            </h1>
          </div>
          {/* Notification bell - far right on same line */}
          <div className="flex items-center justify-end flex-shrink-0">
            <button
              id="notification-button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="bg-white/80 backdrop-blur-sm p-2.5 rounded-full shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 relative"
            >
              <HiOutlineBell className="w-5 h-5 text-gray-600" />
              {newUpdatesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#81D7B4] rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="ml-3 sm:ml-4 text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 font-medium break-words">
              {displayName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'User')}
              {hasENS && ensName && (
                <span className="ml-2 inline-flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                  <span className="mr-1">⟠</span>
                  ENS: {ensName}
                </span>
              )}
            </p>

            {/* SaveFi / BizFi Pill Tabs */}
            <div className="mt-3 sm:mt-4">
              <div className="inline-flex items-center bg-gray-50 border border-gray-200 rounded-full p-1.5 sm:p-2 gap-2 sm:gap-3 md:gap-4">
                <button
                  onClick={() => setActiveMode('savefi')}
                  className={`px-4 sm:px-5 md:px-6 lg:px-7 py-1.5 sm:py-2 md:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-semibold transition-colors duration-200 hover:bg-gray-100 ${activeMode === 'savefi' ? 'bg-white text-[#4A9B7A]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  SaveFi
                </button>
                <button
                  onClick={() => {
                    setActiveMode('bizfi');
                    // Add a small delay for the animation to play before navigation
                    setTimeout(() => {
                      try {
                        router.push('/bizfi');
                      } catch (e) {
                        console.error('Navigation error:', e);
                        alert('Failed to navigate to BizFi page. Please try again.');
                      }
                    }, 300);
                  }}
                  className={`px-4 sm:px-5 md:px-6 lg:px-7 py-1.5 sm:py-2 md:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-semibold transition-colors duration-200 hover:bg-gray-100 ${activeMode === 'bizfi' ? 'bg-white text-[#4A9B7A]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  BizFi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {/* BizFi inline overlay removed; navigation goes to /bizfi */}

      {/* Modern Network & Balance Section with Glassmorphism */}
      <AnimatePresence mode="wait">
        {activeMode === 'savefi' && (
          <motion.div
            key="savefi-network"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="relative">
              {/* Floating decorative elements */}
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-[#81D7B4]/20 via-[#229ED9]/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-[#229ED9]/15 via-[#81D7B4]/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

              {/* Main Balance & Network Container */}
              <div className="relative bg-white/20 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/30 shadow-[0_20px_60px_-15px_rgba(129,215,180,0.3),0_8px_32px_-8px_rgba(34,158,217,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] p-4 sm:p-6 md:p-8 lg:p-12 overflow-hidden group hover:shadow-[0_25px_80px_-15px_rgba(129,215,180,0.4),0_12px_40px_-8px_rgba(34,158,217,0.3)] transition-all duration-700">
                {/* Noise texture overlay */}
                {/* Noise background removed per redesign spec */}

                {/* Animated gradient orbs */}
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-gradient-to-br from-[#81D7B4]/30 to-[#229ED9]/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-tr from-[#229ED9]/25 to-[#81D7B4]/15 rounded-full blur-3xl group-hover:scale-105 transition-transform duration-1000" style={{ animationDelay: '500ms' }}></div>

                {/* Enhanced Balance Display with Integrated Network Dropdown */}
                <div className="relative">
                  {/* Balance header with dropdown on right */}
                  <div className="flex flex-row items-start justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                    <div className="relative flex-1 min-w-0">
                      <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-0.5 sm:w-1 h-12 sm:h-16 bg-gradient-to-b from-[#81D7B4] to-[#81D7B4] rounded-full shadow-[0_0_20px_rgba(129,215,180,0.6)]"></div>
                      <div className="pl-4 sm:pl-6">
                        <span className="block text-gray-600/80 text-xs sm:text-sm font-medium tracking-wide uppercase mb-1 sm:mb-2">Portfolio Value</span>
                        <div className="flex items-baseline space-x-2 sm:space-x-3 flex-wrap">
                          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text tracking-tight break-words">
                            ${parseFloat(savingsData.totalLocked).toFixed(2)}
                          </h2>
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-bold text-gray-500 tracking-wider">USD</span>
                            <div className="flex items-center mt-0.5 sm:mt-1">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#81D7B4] rounded-full mr-1 sm:mr-2 animate-pulse"></div>
                              <span className="text-[10px] sm:text-xs text-[#81D7B4] font-medium">Real-time</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Compact Network Dropdown/Modal Button */}
                    <div className="relative flex-shrink-0">
                      {/* Dropdown/Modal Button - Responsive size */}
                      <button
                        id="network-button"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowNetworkModal(true);
                        }}
                        disabled={hookNetworkSwitching}
                        className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-xl transition-all duration-300 bg-white/40 backdrop-blur-sm border border-white/50 hover:bg-white/50 hover:border-white/60 hover:shadow-[0_4px_16px_rgba(255,255,255,0.2)] ${hookNetworkSwitching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                      >
                        {/* Current Network Icon - Responsive size */}
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full blur-md bg-[#81D7B4]/30 scale-110"></div>
                          <div className="relative rounded-full w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm border-2 border-[#81D7B4]/40 shadow-[0_2px_10px_rgba(129,215,180,0.3)]">
                            <Image
                              src={ensureImageUrl(
                                isBaseNetwork
                                  ? (networkLogos['base']?.logoUrl || networkLogos['base']?.fallbackUrl || '/base.svg')
                                  : isCeloNetwork
                                    ? (networkLogos['celo']?.logoUrl || networkLogos['celo']?.fallbackUrl || '/celo.png')
                                    : isLiskNetwork
                                      ? (networkLogos['lisk']?.logoUrl || networkLogos['lisk']?.fallbackUrl || '/lisk-logo.png')
                                      : isAvalancheNetwork
                                        ? (networkLogos['avalanche']?.logoUrl || networkLogos['avalanche']?.fallbackUrl || '/eth.png')
                                        : (networkLogos['base']?.logoUrl || networkLogos['base']?.fallbackUrl || '/base.svg')
                              )}
                              alt={currentNetworkName || 'Network'}
                              width={20}
                              height={20}
                              className="object-contain w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5"
                            />
                          </div>
                        </div>

                        {/* Network Name - Responsive, hidden on very small screens */}
                        <span className="hidden xs:inline text-xs sm:text-sm font-medium text-gray-900">
                          {currentNetworkName || 'Network'}
                        </span>

                        {/* Sync Status & Arrow */}
                        <div className="flex items-center space-x-1">
                          {isNetworkSynced ? (
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#81D7B4] flex items-center justify-center">
                              <HiOutlineCheck className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                            </div>
                          ) : (
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-400 animate-pulse"></div>
                          )}
                          {!isMobile && (
                            <HiOutlineChevronDown
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 transition-transform duration-200 ${showNetworkDropdown ? 'rotate-180' : ''
                                }`}
                            />
                          )}
                        </div>
                      </button>

                      {/* Dropdown Menu - Desktop only */}
                      {!isMobile && (
                        <AnimatePresence>
                          {showNetworkDropdown && (
                            <motion.div
                              id="network-dropdown"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-full mt-2 right-0 w-[280px] md:w-[320px] bg-white/90 backdrop-blur-xl rounded-xl border border-white/60 shadow-[0_10px_40px_rgba(129,215,180,0.2)] overflow-hidden z-50"
                            >
                              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 p-2">
                                {networkOptions.map((network, index) => (
                                  <motion.button
                                    key={`${network.name}-${network.isActive}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.2 }}
                                    onClick={async () => {
                                      setShowNetworkDropdown(false);
                                      await handleNetworkSelect(network);
                                    }}
                                    disabled={hookNetworkSwitching || network.isActive || network.isComingSoon}
                                    className={`w-full flex flex-col items-center justify-center p-2 sm:p-3 transition-all duration-200 text-center space-y-1 sm:space-y-2 rounded-lg ${network.isActive
                                      ? 'bg-[#81D7B4]/20 cursor-default'
                                      : network.isComingSoon
                                        ? 'bg-gray-100/40 cursor-not-allowed opacity-75'
                                        : 'hover:bg-white/60 cursor-pointer'
                                      }`}
                                  >
                                    {/* Network Icon - Grid Layout */}
                                    <div className="relative flex-shrink-0">
                                      <div className={`absolute inset-0 rounded-full blur-md transition-all duration-300 ${network.isActive ? 'bg-[#81D7B4]/40 scale-110' : 'bg-gray-400/20'
                                        }`}></div>
                                      <div className={`relative rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-300 ${network.isActive
                                        ? 'bg-white/90 border-2 border-[#81D7B4]/40 shadow-[0_2px_10px_rgba(129,215,180,0.3)]'
                                        : network.isComingSoon
                                          ? 'bg-gray-200/50 border border-gray-300/50 opacity-60'
                                          : 'bg-white/70 border border-white/60'
                                        }`}>
                                        <Image
                                          src={ensureImageUrl(network.icon)}
                                          alt={network.name}
                                          width={20}
                                          height={20}
                                          className="object-contain w-5 h-5 sm:w-6 sm:h-6"
                                        />
                                      </div>
                                    </div>

                                    {/* Network Info - Grid Layout */}
                                    <div className="flex-1 min-w-0 text-center">
                                      <div className="flex items-center justify-center gap-1 mb-1">
                                        <h4 className={`font-semibold text-xs flex-1 min-w-0 truncate transition-all duration-300 ${network.isActive ? 'text-gray-900' : network.isComingSoon ? 'text-gray-500' : 'text-gray-700'
                                          }`}>
                                          {network.name}
                                        </h4>
                                        {network.isComingSoon && (
                                          <span className="px-2 py-0.5 sm:px-2.5 sm:py-0.5 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full shadow-md whitespace-nowrap flex-shrink-0">
                                            Soon
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Active Indicator */}
                                    {network.isActive && (
                                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#81D7B4] flex items-center justify-center">
                                        <HiOutlineCheck className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                  </motion.button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Balance Display */}
                <div className="relative">
                  {/* Balance header */}


                  {/* Enhanced Stats Grid */}
                  <div className="w-full">
                    {/* Rewards Card - Full Width Optimized */}
                    <div className="group/card relative bg-white/30 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-white/40 shadow-[0_8px_32px_rgba(129,215,180,0.15),inset_0_1px_0_rgba(255,255,255,0.5)] hover:shadow-[0_12px_40px_rgba(129,215,180,0.2)] transition-all duration-500 overflow-hidden">
                      {/* Card background effects */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/10 via-transparent to-[#81D7B4]/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#81D7B4]/20 rounded-full blur-3xl group-hover/card:bg-[#81D7B4]/30 transition-all duration-500"></div>

                      <div className="relative flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#81D7B4]/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#81D7B4]/30">
                              <HiOutlineCurrencyDollar className="w-4 h-4 sm:w-5 sm:h-5 text-[#81D7B4]" />
                            </div>
                            <span className="text-sm font-medium text-gray-600 tracking-wide">$BTS Earned</span>
                          </div>
                          <div className="text-xs text-gray-500 font-medium">Total loyalty rewards earned</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-baseline justify-end space-x-2">
                            <span className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-900">{savingsData.rewards}</span>
                            <span className="text-sm sm:text-base font-bold text-[#81D7B4]">$BTS</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Savings Button - responsive padding */}
      <AnimatePresence mode="wait">
        {activeMode === 'savefi' && (
          <motion.div
            key="savefi-add"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-3 sm:mt-4 md:mt-6 bg-white/70 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-white/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.2)] transition-all duration-500 relative overflow-hidden group"
          >
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#81D7B4]/10 rounded-full blur-3xl group-hover:bg-[#81D7B4]/20 transition-all duration-700"></div>

            <Link href="/dashboard/create-savings" className="flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all duration-300">
              <div className="bg-[#81D7B4] rounded-full p-2.5 sm:p-3 md:p-3.5 mr-3 sm:mr-4 md:mr-5 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110">
                <HiOutlinePlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-base sm:text-lg md:text-xl font-medium text-gray-800 group-hover:text-gray-900 transition-all duration-300">Create Savings</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Savings Plans - responsive spacing */}
      <AnimatePresence mode="wait">
        {activeMode === 'savefi' && (
          <motion.div
            key="savefi-plans"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-6 md:mt-8 mb-8"
          >

            {/* Enhanced Modern Tabs */}
            <div className="relative mb-4 sm:mb-6 md:mb-8">
              {/* Tab container with glassmorphism */}
              <div className="relative bg-white/30 backdrop-blur-xl rounded-xl sm:rounded-2xl p-1 sm:p-1.5 border border-white/40 shadow-[0_8px_32px_rgba(129,215,180,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/5 via-transparent to-[#81D7B4]/5 opacity-50"></div>

                {/* Tab buttons container */}
                <div className="relative flex">
                  {/* Active tab indicator */}
                  <motion.div
                    className="absolute top-0 bottom-0 bg-[#81D7B4] rounded-lg sm:rounded-xl shadow-sm"
                    initial={false}
                    animate={{
                      x: activeTab === 'current' ? 0 : '100%',
                      width: '50%'
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                  />

                  {/* Current Tab */}
                  <button
                    className={`relative z-10 flex-1 px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 rounded-lg sm:rounded-xl group ${activeTab === 'current'
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
                      }`}
                    onClick={() => setActiveTab('current')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="tracking-wide">Active Plans</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">{savingsData.currentPlans.length}</span>
                    </div>
                  </button>

                  {/* Completed Tab */}
                  <button
                    className={`relative z-10 flex-1 px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 rounded-lg sm:rounded-xl group ${activeTab === 'completed'
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
                      }`}
                    onClick={() => setActiveTab('completed')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="tracking-wide">Completed</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">{savingsData.completedPlans.length}</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Tab content indicator */}
              <div className="flex justify-center mt-2 sm:mt-3 md:mt-4">
                <div className="flex space-x-2">
                  <motion.div
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${activeTab === 'current' ? 'bg-[#81D7B4] scale-125' : 'bg-gray-300'
                      }`}
                    animate={{ scale: activeTab === 'current' ? 1.25 : 1 }}
                  />
                  <motion.div
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${activeTab === 'completed' ? 'bg-[#81D7B4] scale-125' : 'bg-gray-300'
                      }`}
                    animate={{ scale: activeTab === 'completed' ? 1.25 : 1 }}
                  />
                </div>
              </div>
            </div>

            {/* Savings plan cards with empty states */}
            {activeTab === 'current' && (
              <div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
                {isLoading ? (
                  <ShimmerList count={3} />
                ) : savingsData.currentPlans.length > 0 ? (
                  <>
                    {savingsData.currentPlans.slice(0, 3).map((plan) => (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="relative bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group"
                      >
                        {/* Header: Icon, Title/Date, Top Up */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl border border-gray-100 bg-white flex items-center justify-center shadow-sm">
                              <Image
                                src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')}
                                alt={plan.isEth ? 'ETH' : (plan.tokenName || 'Token')}
                                width={32}
                                height={32}
                                className="w-8 h-8 object-contain"
                              />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                                {plan.name}
                              </h3>
                              <p className="text-sm font-medium text-gray-400">
                                Created {new Date(Number(plan.startTime) * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => openTopUpModal(plan.name, plan.id, plan.isEth, plan.tokenName)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:border-[#81D7B4] hover:text-[#81D7B4] transition-colors bg-white hover:bg-[#81D7B4]/5"
                          >
                            <HiOutlinePlus className="w-4 h-4" />
                            Top Up
                          </motion.button>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-gray-100 mb-6"></div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className="font-bold text-gray-900 text-lg">
                            {plan.isEth ? (
                              <>{parseFloat(plan.currentAmount).toFixed(4)} ETH Saved</>
                            ) : plan.tokenName === 'Gooddollar' ? (
                              <>{parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $G Saved</>
                            ) : (
                              <>${parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Saved</>
                            )}
                          </div>
                          <div className="w-px h-4 bg-gray-300"></div>
                          <div className="font-bold text-[#81D7B4] text-lg">
                            +{plan.tokenName === 'Gooddollar' ? ((parseFloat(plan.currentAmount) * goodDollarPrice) * 0.005 * 1000).toFixed(0) : (parseFloat(plan.currentAmount) * 0.005 * 1000).toFixed(0)} $BTS Reward
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden mb-2">
                          <motion.div
                            className="h-full bg-[#81D7B4] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${plan.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>

                        {/* Footer Info */}
                        <div className="flex justify-between items-center text-sm font-medium text-gray-400 mb-6">
                          <span>{Math.round(plan.progress)}%</span>
                          <span>
                            {(() => {
                              const now = Math.floor(Date.now() / 1000);
                              const end = Number(plan.maturityTime || 0);
                              const diff = end - now;
                              if (diff <= 0) return "Completed";
                              const days = Math.ceil(diff / (60 * 60 * 24));
                              if (days > 30) {
                                const months = Math.floor(days / 30);
                                const remainingDays = days % 30;
                                return `${months} Months & ${remainingDays} Days Remaining`;
                              }
                              return `${days} Days Remaining`;
                            })()}
                          </span>
                        </div>

                        {/* Action Buttons: Plan Details & Outline Withdraw */}
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setPlanDetailsModal({ isOpen: true, plan, isEth: plan.isEth, tokenName: plan.tokenName || '' })}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#81D7B4] text-[#81D7B4] font-medium text-sm hover:bg-[#81D7B4]/5 transition-all"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                            Plan Details
                          </button>
                          <button
                            onClick={() => {
                              const currentDate = new Date();
                              const maturityTimestamp = Number(plan.maturityTime || 0);
                              const maturityDate = new Date(maturityTimestamp * 1000);
                              const isCompleted = currentDate >= maturityDate;
                              openWithdrawModal(plan.id, plan.name, plan.isEth, plan.penaltyPercentage, plan.tokenName, isCompleted);
                            }}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#81D7B4] text-[#81D7B4] font-medium text-sm hover:bg-red-50 hover:border-red-500 hover:text-red-500 transition-all group/withdraw"
                          >
                            <HiOutlineBanknotes className="w-4 h-4 group-hover/withdraw:text-red-500" />
                            Withdraw
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </>
                ) : (
                  <EmptyCurrentSavings />
                )}
              </div>
            )
            }

            {
              activeTab === 'completed' && (
                <div className="flex flex-col gap-4 md:gap-6">
                  {isLoading ? (
                    <ShimmerList count={3} />
                  ) : savingsData.completedPlans.length > 0 ? (
                    <>
                      {savingsData.completedPlans.slice(0, 3).map((plan) => (
                        <motion.div
                          key={plan.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -4, transition: { duration: 0.2 } }}
                          className="relative bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group"
                        >
                          {/* Header: Icon, Title/Date (No Top Up) */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl border border-gray-100 bg-white flex items-center justify-center shadow-sm">
                                <Image
                                  src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')}
                                  alt={plan.isEth ? 'ETH' : (plan.tokenName || 'Token')}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 object-contain"
                                />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                                  {plan.name}
                                </h3>
                                <p className="text-sm font-medium text-gray-400">
                                  Created {new Date(Number(plan.startTime) * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                </p>
                              </div>
                            </div>
                            {/* Completed Badge instead of Top Up */}
                            <div className="px-4 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-600 font-semibold text-sm">
                              Completed
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="h-px w-full bg-gray-100 mb-6"></div>

                          {/* Stats Row */}
                          <div className="flex items-center gap-4 mb-3">
                            <div className="font-bold text-gray-900 text-lg">
                              {plan.isEth ? (
                                <>{parseFloat(plan.currentAmount).toFixed(4)} ETH Saved</>
                              ) : plan.tokenName === 'Gooddollar' ? (
                                <>{parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $G Saved</>
                              ) : (
                                <>${parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Saved</>
                              )}
                            </div>
                            <div className="w-px h-4 bg-gray-300"></div>
                            <div className="font-bold text-[#81D7B4] text-lg">
                              +{plan.tokenName === 'Gooddollar' ? ((parseFloat(plan.currentAmount) * goodDollarPrice) * 0.005 * 1000).toFixed(0) : (parseFloat(plan.currentAmount) * 0.005 * 1000).toFixed(0)} $BTS Reward
                            </div>
                          </div>

                          {/* Progress Bar (Full) */}
                          <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden mb-2">
                            <motion.div
                              className="h-full bg-[#81D7B4] rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>

                          {/* Footer Info */}
                          <div className="flex justify-between items-center text-sm font-medium text-gray-400 mb-6">
                            <span>100%</span>
                            <span>Goal Reached</span>
                          </div>

                          {/* Action Buttons: Plan Details & Outline Withdraw */}
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={() => setPlanDetailsModal({ isOpen: true, plan, isEth: plan.isEth, tokenName: plan.tokenName || '' })}
                              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#81D7B4] text-[#81D7B4] font-medium text-sm hover:bg-[#81D7B4]/5 transition-all"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                              Plan Details
                            </button>
                            <button
                              onClick={() => {
                                const currentDate = new Date();
                                const maturityTimestamp = Number(plan.maturityTime || 0);
                                const maturityDate = new Date(maturityTimestamp * 1000);
                                const isCompleted = currentDate >= maturityDate;
                                openWithdrawModal(plan.id, plan.name, plan.isEth, plan.penaltyPercentage, plan.tokenName, isCompleted);
                              }}
                              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#81D7B4] text-[#81D7B4] font-medium text-sm hover:bg-[#81D7B4] hover:text-white transition-all shadow-sm hover:shadow-md"
                            >
                              <HiOutlineBanknotes className="w-4 h-4" />
                              Withdraw Funds
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </>
                  ) : (
                    <EmptyCompletedSavings />
                  )}
                </div>
              )
            }
          </motion.div >
        )}
      </AnimatePresence >
    </div >
  );
}


