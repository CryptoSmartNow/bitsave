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
import { HiOutlineArrowRight, HiOutlineCheckCircle, HiOutlineArrowDown, HiOutlineBell, HiOutlineChevronDown, HiOutlineCheck, HiOutlineClipboardDocumentList, HiOutlineCurrencyDollar, HiOutlinePlus, HiOutlineXMark, HiOutlineEye, HiOutlineBanknotes, HiOutlineGift } from 'react-icons/hi2';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '../../utils/networkLogos';


const ensureImageUrl = (url: string | undefined): string => {
  if (!url) return '/default-network.png'
  if (url.startsWith('/')) return url
  if (url.startsWith('//')) return `https:${url}`
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
    isBSCNetwork,
    isAvalancheNetwork,
    ethPrice,
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
      const response = await fetch('/api/updates', {
        method: 'GET',
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
          const userResponse = await fetch(`/api/updates/user/${address}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
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
      const response = await fetch(`/api/updates/${updateId}/read`, {
        method: 'PUT',
        headers: {
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
        const logos = await fetchMultipleNetworkLogos(['base', 'celo', 'lisk', 'avalanche', 'solana', 'bsc']);
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
    { name: 'Base', desc: 'Ethereum L2', icon: networkLogos['base']?.logoUrl || networkLogos['base']?.fallbackUrl || '/base.png', isActive: isBaseNetwork },
    { name: 'Celo', desc: 'Mobile-First', icon: networkLogos['celo']?.logoUrl || networkLogos['celo']?.fallbackUrl || '/celo.png', isActive: isCeloNetwork },
    { name: 'Lisk', desc: 'Ethereum L2', icon: networkLogos['lisk']?.logoUrl || networkLogos['lisk']?.fallbackUrl || '/lisk-logo.png', isActive: isLiskNetwork },
    { name: 'Binance Smart Chain', desc: 'EVM Mainnet', icon: networkLogos['bsc']?.logoUrl || networkLogos['bsc']?.fallbackUrl || '/bsc.png', isActive: isBSCNetwork },
    { name: 'Avalanche', desc: 'EVM Mainnet', icon: networkLogos['avalanche']?.logoUrl || networkLogos['avalanche']?.fallbackUrl || '/avalanche-logo.svg', isActive: isAvalancheNetwork },
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


  // Helper function to get the appropriate logo path for different tokens
  // Returns custom logo if provided, otherwise maps token names to their logo files
  const getTokenLogo = useCallback((tokenName: string, tokenLogo?: string) => {
    if (tokenLogo) return tokenLogo;
    if (tokenName === 'cUSD') return '/cusd.png';
    if (tokenName === 'cNGN') return '/cngn.png';
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
  return (
    <div className={`${exo.variable} font-sans p-4 sm:p-6 md:p-8 bg-[#F8FAF9] text-gray-800 relative min-h-screen pb-12`}>
      <NetworkDetection />
      <TopUpModal isOpen={topUpModal.isOpen} onClose={closeTopUpModal} planName={topUpModal.planName} planId={topUpModal.planId} isEth={topUpModal.isEth} tokenName={topUpModal.tokenName} networkLogos={networkLogos} />
      <WithdrawModal isOpen={withdrawModal.isOpen} onClose={closeWithdrawModal} planName={withdrawModal.planName} isEth={withdrawModal.isEth} penaltyPercentage={withdrawModal.penaltyPercentage} tokenName={withdrawModal.tokenName} isCompleted={withdrawModal.isCompleted} networkLogos={networkLogos} />
      <PlanDetailsModal isOpen={planDetailsModal.isOpen} onClose={() => setPlanDetailsModal({ ...planDetailsModal, isOpen: false })} plan={planDetailsModal.plan} isEth={planDetailsModal.isEth} tokenName={planDetailsModal.tokenName} goodDollarPrice={0.0001086} networkLogos={networkLogos} />
      <NetworkSelectionModal isOpen={showNetworkModal} onClose={() => setShowNetworkModal(false)} networks={networkOptions} onSelectNetwork={async (network) => { await handleNetworkSelect(network); setShowNetworkModal(false); }} isNetworkSwitching={hookNetworkSwitching} isLoadingLogos={isLoadingLogos} />

      {/* Update Modal */}
      {showUpdateModal && selectedUpdate && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] w-full max-w-md mx-auto overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{selectedUpdate.title}</h3>
                <button onClick={closeUpdateModal} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"><HiOutlineXMark className="w-5 h-5" /></button>
              </div>
              <div className="inline-block px-3 py-1 bg-[#81D7B4]/20 text-[#81D7B4] rounded-full text-xs font-bold uppercase tracking-wider mb-6">{new Date(selectedUpdate.date).toLocaleDateString(('en-US'), { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div className="text-gray-600 leading-relaxed mb-8">{selectedUpdate.content}</div>
              <button onClick={closeUpdateModal} className="w-full py-3.5 text-center text-sm font-bold text-white bg-[#81D7B4] hover:bg-opacity-90 rounded-xl shadow-[0_4px_15px_rgba(129,215,180,0.3)] transition-all">Got it</button>
            </div>
          </div>
        </div>
      )}

      {/* Header View */}
      <div className="max-w-[1400px] w-full mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              {(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; })()}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gray-500 font-medium break-all">
                {displayName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'User')}
              </span>
              {hasENS && ensName && <span className="inline-flex items-center bg-[#81D7B4]/10 text-[#81D7B4] px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap">⟠ ENS: {ensName}</span>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-100 p-1.5 rounded-2xl flex items-center shadow-sm">
              <button onClick={() => setActiveMode('savefi')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeMode === 'savefi' ? 'bg-[#81D7B4] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>SaveFi</button>
              <button onClick={() => { setActiveMode('bizfi'); setTimeout(() => router.push('/bizfi/dashboard'), 300); }} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeMode === 'bizfi' ? 'bg-[#81D7B4] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>BizFi</button>
            </div>
            <div className="relative">
              <button id="notification-button" onClick={() => setShowNotifications(!showNotifications)} className="p-3 bg-white rounded-2xl border border-gray-100 hover:border-[#81D7B4]/50 shadow-sm relative group transition-all">
                <HiOutlineBell className="w-5 h-5 text-gray-500 group-hover:text-[#81D7B4] transition-colors" />
                {newUpdatesCount > 0 && <span className="absolute tops-2 right-2 w-2.5 h-2.5 bg-[#81D7B4] rounded-full border-2 border-white"></span>}
              </button>
              {showNotifications && (
                <div id="notification-dropdown" className="absolute right-0 mt-3 w-[calc(100vw-2rem)] md:w-80 max-w-sm bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100 z-50 overflow-hidden">
                  <div className="p-5 border-b border-gray-50 flex justify-between bg-white">
                    <h3 className="font-bold text-gray-900">Updates</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {updates.length > 0 ? updates.map(update => (
                      <button key={update.id} onClick={() => openUpdateModal(update)} className="w-full text-left p-4 hover:bg-[#81D7B4]/5 rounded-2xl transition-all mb-1 border border-transparent hover:border-[#81D7B4]/20 group">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm transition-colors">{update.title}</h4>
                            <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">{update.content}</p>
                            <span className="text-gray-400 text-xs mt-3 block font-medium">{new Date(update.date).toLocaleDateString()}</span>
                          </div>
                          {update.isNew && <span className="bg-[#81D7B4]/10 text-[#81D7B4] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">New</span>}
                        </div>
                      </button>
                    )) : <div className="p-8 text-center text-gray-400 font-medium text-sm">No new updates</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeMode === 'savefi' && (
            <motion.div key="savefi" initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                {/* Main Portfolio Balance Card - White, Black text, faint wallet image, green accent edge */}
                <div className="lg:col-span-2 bg-gradient-to-br from-white to-[#F0FDF8] rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden group">
                  {/* Subtle blur moved to top-left to avoid clashing with the image */}
                  <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#81D7B4]/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
                  {/* Real wallet image cutout cleanly pinned to bottom right using translate to bleed perfectly without padding gaps */}
                  <div className="absolute right-0 bottom-0 translate-x-[15%] translate-y-[15%] md:translate-x-[20%] md:translate-y-[20%] opacity-20 group-hover:opacity-30 transition-all duration-700 pointer-events-none z-0">
                    <Image src="/wallet.png" alt="Wallet Icon" width={800} height={800} className="w-[350px] h-[350px] md:w-[650px] md:h-[650px] object-contain object-right-bottom mix-blend-multiply" />
                  </div>

                  <div className="relative z-10 flex justify-between items-start mb-8 sm:mb-12">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#81D7B4] shadow-[0_0_10px_rgba(129,215,180,0.8)]"></div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-none">Total Portfolio</p>
                    </div>

                    <div className="relative z-20">
                      <button id="network-button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowNetworkModal(true); }} disabled={hookNetworkSwitching} className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-xl border border-[#81D7B4]/30 transition-all shadow-sm">
                        <Image priority src={ensureImageUrl(isBaseNetwork ? (networkLogos['base']?.logoUrl || networkLogos['base']?.fallbackUrl || '/base.svg') : isCeloNetwork ? (networkLogos['celo']?.logoUrl || networkLogos['celo']?.fallbackUrl || '/celo.png') : isLiskNetwork ? (networkLogos['lisk']?.logoUrl || networkLogos['lisk']?.fallbackUrl || '/lisk-logo.png') : isAvalancheNetwork ? (networkLogos['avalanche']?.logoUrl || networkLogos['avalanche']?.fallbackUrl || '/eth.png') : (networkLogos['base']?.logoUrl || networkLogos['base']?.fallbackUrl || '/base.svg'))} alt={currentNetworkName || 'Network'} width={18} height={18} className="w-4.5 h-4.5 object-contain" />
                        <span className="text-sm font-bold text-black hidden sm:inline">{currentNetworkName || 'Network'}</span>
                        <div className={`w-2 h-2 rounded-full shadow-sm ml-1 ${isNetworkSynced ? 'bg-[#81D7B4]' : 'bg-orange-400 animate-pulse'}`}></div>
                        {!isMobile && <HiOutlineChevronDown className="w-4 h-4 text-gray-400 ml-1" />}
                      </button>

                      {/* Network Dropdown Desktop */}
                      {!isMobile && showNetworkDropdown && (
                        <div id="network-dropdown" className="absolute top-full mt-3 right-0 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 z-[60] p-2 grid grid-cols-1 gap-1">
                          {networkOptions.map((net) => (
                            <button key={net.name} onClick={async () => { setShowNetworkDropdown(false); await handleNetworkSelect(net); }} disabled={hookNetworkSwitching || net.isActive || net.isComingSoon} className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${net.isActive ? 'bg-[#81D7B4]/15 text-[#81D7B4] pointer-events-none' : net.isComingSoon ? 'opacity-40 cursor-not-allowed text-gray-400' : 'hover:bg-gray-50 text-gray-700 hover:text-black'}`}>
                              <Image src={ensureImageUrl(net.icon)} alt={net.name} width={20} height={20} className="w-5 h-5 object-contain" />
                              <span className="flex-1 text-left">{net.name}</span>
                              {net.isComingSoon && <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">Soon</span>}
                              {net.isActive && <HiOutlineCheck className="w-5 h-5 text-[#81D7B4]" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10 flex items-baseline gap-3 mb-12">
                    <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-black">${parseFloat(savingsData.totalLocked).toFixed(2)}</h2>
                    <span className="text-xl font-bold text-gray-400">USD</span>
                  </div>

                  {/* Buttons with flex-nowrap to prevent wrapping on mobile, overflow-visible allows shadows to breathe */}
                  <div className="relative z-10 pt-8 pb-4 border-t border-[#81D7B4]/10 flex gap-2 sm:gap-4 flex-nowrap">
                    <Link href="/dashboard/create-savings" className="flex-1 sm:flex-none whitespace-nowrap inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-8 py-3.5 bg-[#81D7B4] hover:bg-opacity-90 text-white text-[13px] sm:text-sm font-bold rounded-2xl transition-all shadow-[0_4px_15px_rgba(129,215,180,0.3)] transform hover:-translate-y-0.5">
                      <HiOutlinePlus className="w-4 h-4 sm:w-5 sm:h-5 font-bold" /> New Plan
                    </Link>
                    <Link href="/dashboard/plans" className="flex-1 sm:flex-none whitespace-nowrap inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-8 py-3.5 bg-white/80 hover:bg-white backdrop-blur-sm text-[#81D7B4] border border-[#81D7B4]/20 text-[13px] sm:text-sm font-bold rounded-2xl transition-all shadow-sm hover:shadow-[0_4px_15px_rgba(129,215,180,0.1)]">
                      <HiOutlineClipboardDocumentList className="w-4 h-4 sm:w-5 sm:h-5" /> View Plans
                    </Link>
                  </div>
                </div>

                {/* Rewards Mini Card - White, Black text, faint coin image, dark green accent */}
                <div className="bg-gradient-to-br from-white to-[#F0FDF8] rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden group">
                  {/* Subtle blur moved to top-left to avoid clashing */}
                  <div className="absolute -left-16 -top-16 w-80 h-80 bg-[#81D7B4]/5 rounded-full blur-3xl z-0 pointer-events-none"></div>
                  {/* Stack of Coins image background firmly at bottom right using translate bleed */}
                  <div className="absolute right-0 bottom-0 translate-x-[15%] translate-y-[15%] opacity-[0.25] group-hover:opacity-[0.35] transition-all duration-700 pointer-events-none z-0 transform group-hover:scale-105 group-hover:-rotate-3">
                    <Image src="/coin.png" alt="Stack of Coins" width={600} height={600} className="w-[280px] h-[280px] md:w-[480px] md:h-[480px] object-contain object-right-bottom drop-shadow-[0_0_12px_rgba(45,90,74,0.4)] filter mix-blend-multiply" />
                  </div>

                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white text-[#81D7B4] flex items-center justify-center border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.05)] group-hover:scale-105 transition-transform duration-300">
                      <HiOutlineGift className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-black tracking-tight">Loyalty Rewards</h3>
                      <p className="text-xs text-[#81D7B4] font-bold uppercase tracking-wider mt-0.5">Total Earned</p>
                    </div>
                  </div>
                  <div className="relative mt-auto z-10">
                    <div className="flex items-baseline gap-2">
                      {/* Fallback to '0' if rewards not properly loaded yet */}
                      <span className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-black">{savingsData.rewards || "0"}</span>
                      <span className="text-lg font-bold text-[#81D7B4]">$BTS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Section - Brand Colors Only */}
              <div className="mb-8 flex gap-3 border-b border-gray-200">
                <button onClick={() => setActiveTab('current')} className={`relative px-4 py-3 text-sm font-bold transition-all ${activeTab === 'current' ? 'text-black' : 'text-gray-400 hover:text-gray-900'}`}>
                  Active Plans
                  <span className={`ml-2 py-1 px-2.5 rounded-lg text-xs transition-all tracking-wide ${activeTab === 'current' ? 'bg-[#81D7B4] text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>{savingsData.currentPlans.length}</span>
                  {activeTab === 'current' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-1.5 rounded-t-full bg-[#81D7B4]" />}
                </button>
                <button onClick={() => setActiveTab('completed')} className={`relative px-4 py-3 text-sm font-bold transition-all ${activeTab === 'completed' ? 'text-black' : 'text-gray-400 hover:text-gray-900'}`}>
                  Completed
                  <span className={`ml-2 py-1 px-2.5 rounded-lg text-xs transition-all tracking-wide ${activeTab === 'completed' ? 'bg-[#81D7B4] text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>{savingsData.completedPlans.length}</span>
                  {activeTab === 'completed' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-1.5 rounded-t-full bg-[#81D7B4]" />}
                </button>
              </div>

              {/* Savings Grid -> Now Full Width Stack */}
              <div className="flex flex-col gap-5">
                {isLoading ? <ShimmerList count={3} /> : (activeTab === 'current' ? savingsData.currentPlans : savingsData.completedPlans).length > 0 ? (
                  (activeTab === 'current' ? savingsData.currentPlans : savingsData.completedPlans).map((plan) => {
                    const amount = parseFloat(plan.currentAmount);
                    const safeAmount = !isNaN(amount) ? amount : 0;
                    let usdVal = safeAmount;
                    if (plan.isEth || plan.tokenName === 'ETH' || plan.tokenName === 'HBAR') usdVal = safeAmount * (ethPrice || 3500);
                    if (plan.tokenName === 'Gooddollar') usdVal = safeAmount * 0.0001086;
                    const reward = (usdVal * 0.005 * 1000).toFixed(0);

                    const isCompleted = activeTab === 'completed' || (Number(plan.maturityTime || 0) * 1000 <= Date.now());

                    let timeRemaining = "Completed";
                    if (!isCompleted) {
                      const diff = Number(plan.maturityTime || 0) - Math.floor(Date.now() / 1000);
                      if (diff <= 0) { timeRemaining = "Completed"; } else {
                        const days = Math.ceil(diff / 86400);
                        timeRemaining = days > 30 ? `${Math.floor(days / 30)}mo ${days % 30}d` : `${days} days`;
                      }
                    }

                    return (
                      <div key={plan.id} className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 sm:p-6 lg:p-8 hover:shadow-[0_10px_40px_rgba(129,215,180,0.15)] hover:border-[#81D7B4] transition-all duration-300 group flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-20">
                        {/* Left: Icon & Name */}
                        <div className="flex justify-between items-center md:justify-start w-full md:w-auto md:min-w-[240px]">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#F8FAF9] rounded-2xl flex border border-[#81D7B4]/10 items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                              <Image src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')} alt={plan.name} width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                            </div>
                            <div>
                              <h3 className="font-bold text-black text-base sm:text-lg tracking-tight truncate max-w-[140px] sm:max-w-[200px]">{plan.name}</h3>
                              <span className="text-[10px] sm:text-[11px] text-[#81D7B4] font-bold uppercase tracking-widest mt-1 block">
                                {Number(plan.startTime) > 0 ? new Date(Number(plan.startTime) * 1000).toLocaleDateString() : 'Pending'}
                              </span>
                            </div>
                          </div>
                          {/* Mobile Top Up / Completion Tag */}
                          <div className="md:hidden flex items-center">
                            {!isCompleted && (
                              <button onClick={() => openTopUpModal(plan.name, plan.id, plan.isEth, plan.tokenName)} className="p-2 sm:p-3 bg-[#81D7B4]/10 text-black hover:bg-[#81D7B4] hover:text-white rounded-xl transition-colors shadow-sm" title="Top Up">
                                <HiOutlinePlus className="w-4 h-4 sm:w-5 sm:h-5 font-bold" />
                              </button>
                            )}
                            {isCompleted && (
                              <span className="bg-[#81D7B4] text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">100%</span>
                            )}
                          </div>
                        </div>

                        {/* Middle: Stats Grid & Progress */}
                        <div className="flex-1 flex flex-col lg:flex-row items-start lg:items-center gap-6 w-full lg:px-6">
                          <div className="grid grid-cols-2 gap-4 p-4 sm:p-5 bg-[#F8FAF9] rounded-[1.5rem] border border-[#81D7B4]/10 w-full lg:w-auto min-w-[240px] flex-none">
                            <div>
                              <p className="text-[10px] text-[#81D7B4] font-bold mb-1.5 uppercase tracking-widest">Saved</p>
                              <p className="font-bold text-black text-base sm:text-lg flex items-baseline gap-1">
                                {plan.isEth ? safeAmount.toFixed(4) : safeAmount.toLocaleString()}
                                <span className="text-xs font-bold text-gray-500">{plan.isEth ? 'ETH' : plan.tokenName}</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#81D7B4] font-bold mb-1.5 uppercase tracking-widest">Reward</p>
                              <p className="font-bold text-[#81D7B4] text-base sm:text-lg">+{reward} <span className="text-[10px] sm:text-xs text-black font-bold">$BTS</span></p>
                            </div>
                          </div>

                          <div className="w-full flex-1 md:max-w-[300px]">
                            <div className="flex justify-between text-[11px] sm:text-xs mb-2.5 font-bold">
                              <span className="text-black">{isCompleted ? '100%' : `${Math.round(plan.progress)}%`}</span>
                              <span className="text-gray-400 uppercase tracking-wider text-[9px] sm:text-[10px]">{timeRemaining}</span>
                            </div>
                            <div className="w-full h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#81D7B4] rounded-full" style={{ width: isCompleted ? '100%' : `${plan.progress}%` }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-4 md:pt-0 border-t md:border-none border-gray-50">
                          {/* Desktop Top Up / Completion Tag */}
                          <div className="hidden md:flex items-center mr-2">
                            {!isCompleted && (
                              <button onClick={() => openTopUpModal(plan.name, plan.id, plan.isEth, plan.tokenName)} className="p-3 bg-[#81D7B4]/10 text-black hover:bg-[#81D7B4] hover:text-white rounded-xl transition-colors shadow-sm" title="Top Up">
                                <HiOutlinePlus className="w-5 h-5 font-bold" />
                              </button>
                            )}
                            {isCompleted && (
                              <span className="bg-[#81D7B4] text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm">100%</span>
                            )}
                          </div>

                          <div className="flex gap-2 w-full md:w-auto">
                            <button onClick={() => setPlanDetailsModal({ isOpen: true, plan, isEth: plan.isEth, tokenName: plan.tokenName || '' })} className="flex-1 md:flex-none px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold text-[#81D7B4] bg-white border border-gray-100 hover:border-[#81D7B4] rounded-xl transition-colors shadow-sm text-center">Details</button>
                            <button onClick={() => {
                              const maturityTimestamp = Number(plan.maturityTime || 0);
                              const isCurrentlyCompleted = Number(new Date()) >= maturityTimestamp * 1000;
                              openWithdrawModal(plan.id, plan.name, plan.isEth, plan.penaltyPercentage, plan.tokenName, isCurrentlyCompleted);
                            }} className={`flex-1 md:flex-none px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold rounded-xl transition-colors border shadow-sm text-center whitespace-nowrap ${isCompleted ? 'bg-[#81D7B4] text-white hover:bg-opacity-90 border-transparent' : 'bg-white hover:bg-red-50 text-[#81D7B4] border-gray-200 hover:text-red-500 hover:border-red-200'}`}>Withdraw</button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full bg-white rounded-[2rem] border border-gray-100 p-10 sm:p-16 text-center shadow-[0_10px_30px_rgba(0,0,0,0.03)] relative z-20">
                    <div className="w-20 h-20 bg-[#F8FAF9] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#81D7B4]/20 shadow-inner">
                      {activeTab === 'current' ? <HiOutlinePlus className="w-10 h-10 text-[#81D7B4]" /> : <HiOutlineCheckCircle className="w-10 h-10 text-[#81D7B4]" />}
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3">{activeTab === 'current' ? 'No Active Plans' : 'No Completed Plans'}</h3>
                    <p className="text-gray-500 mb-8 text-sm max-w-sm mx-auto font-medium leading-relaxed">{activeTab === 'current' ? 'Start your wealth-building journey by creating your first strategic savings plan today.' : 'Your successfully completed savings plans will appear here.'}</p>
                    {activeTab === 'current' && (
                      <Link href="/dashboard/create-savings" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#81D7B4] hover:bg-opacity-90 text-white text-sm font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(129,215,180,0.3)] transform hover:-translate-y-0.5">
                        Create Your First Plan
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
