'use client';

import { PlusSignIcon, Money01Icon, ViewIcon, Activity01Icon, Dollar01Icon, PieChartIcon, UserMultipleIcon, Tick01Icon, LinkSquare01Icon } from "hugeicons-react";
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exo } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import WithdrawModal from '@/components/WithdrawModal';
import TopUpModal from '@/components/TopUpModal';
import PlanDetailsModal from '@/components/PlanDetailsModal';
import NetworkDetection from '@/components/NetworkDetection';
import { ethers } from 'ethers';
import { useSavingsData } from '@/hooks/useSavingsData';
import { formatTimestamp } from '@/utils/dateUtils';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '@/utils/networkLogos';
import SharePlanModal from '@/components/SharePlanModal';
import { TableShimmer } from '@/components/ShimmerLoading';

// Helper function to ensure image URLs are properly formatted for Next.js AiImage
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

// Initialize the Exo font
const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk'
});

// Define types for our plan data
interface Plan {
  id: string;
  address: string;
  name: string;
  currentAmount: string;
  targetAmount: string;
  progress: number;
  isEth: boolean;
  isGToken?: boolean;
  isUSDGLO?: boolean;
  startTime: number;
  maturityTime: number;
  penaltyPercentage: number;
  tokenName?: string;
  tokenLogo?: string;
  network?: string;
  contractAddress?: string;
  chainId?: number;
  isShared?: boolean;
  sharedBy?: string;
}

// Helper to get logo for a token
function getTokenLogo(tokenName: string, tokenLogo?: string) {
  if (tokenLogo) return tokenLogo;
  if (tokenName === 'cUSD') return '/cusd.png';
  if (tokenName === 'USDGLO') return '/usdglo.png';
  if (tokenName === 'Gooddollar' || tokenName === '$G') return '/$g.png';
  if (tokenName === 'USDC') return '/usdclogo.png';
  return `/${tokenName.toLowerCase()}.png`;
}

export default function PlansPage() {
  const [goodDollarPrice, setGoodDollarPrice] = useState(0.0001);
  const [activityData, setActivityData] = useState<Array<{
    type: string;
    description: string;
    amount: string;
    timestamp: string;
    network: string;
    txHash: string;
    rawDate: Date;
  }>>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states aligned with Dashboard
  const [topUpModal, setTopUpModal] = useState({
    isOpen: false,
    planName: '',
    planId: '',
    isEth: false,
    isGToken: false,
    tokenName: '',
    contractAddress: '',
    network: '',
    startTime: 0
  });

  const [withdrawModal, setWithdrawModal] = useState({
    isOpen: false,
    planId: '',
    planName: '',
    isEth: false,
    penaltyPercentage: 0,
    tokenName: '',
    isCompleted: false,
    contractAddress: '',
    network: '',
    startTime: 0
  });

  const [planDetailsModal, setPlanDetailsModal] = useState({
    isOpen: false,
    plan: null as any,
    isEth: false,
    tokenName: ''
  });

  const [sharePlanModal, setSharePlanModal] = useState({
    isOpen: false,
    planName: '',
    networkName: '',
    contractAddress: '',
    chainId: 0
  });

  // Use the new caching hook for savings data
  const { savingsData, isLoading, ethPrice } = useSavingsData()

  // Calculate stats
  const stats = useMemo(() => {
    return {
      activeCount: savingsData.currentPlans.length,
      completedCount: savingsData.completedPlans.length,
      totalLocked: savingsData.totalLocked,
      rewards: savingsData.rewards
    };
  }, [savingsData]);

  // Fetch network logos on component mount
  useEffect(() => {
    const loadNetworkLogos = async () => {
      try {
        const logos = await fetchMultipleNetworkLogos(['ethereum', 'base', 'celo', 'lisk', 'avalanche', 'solana', 'bsc']);
        setNetworkLogos(logos);
      } catch (error) {
        console.error('Error fetching network logos:', error);
      }
    };

    loadNetworkLogos();
  }, []);

  // Fetch user activity data
  useEffect(() => {
    const fetchActivityData = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          setIsLoadingActivity(true);
          const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
          if (accounts.length > 0) {
            const address = accounts[0];

            const response = await fetch(`/api/transactions?address=${address}`);

            if (!response.ok) {
              if (response.status === 404) {
                setActivityData([]);
                return;
              }
              const errorText = await response.text().catch(() => 'Could not read error response');
              console.error('API response error:', errorText);
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            let data;
            try {
              data = await response.json();
            } catch (jsonError) {
              console.error('Error parsing JSON response:', jsonError);
              setActivityData([]);
              return;
            }

            if (!data || !Array.isArray(data.transactions)) {
              setActivityData([]);
              return;
            }

            const transactions = data.transactions || [];

            // Transform transaction data for display
            const formattedActivity = transactions.map((tx: {
              transaction_type: string;
              savingsname: string;
              amount: string;
              currency?: string;
              created_at: string;
              txnhash: string;
              chain?: string;
            }) => {
              try {
                return {
                  type: tx.transaction_type,
                  description: `${tx.transaction_type === 'deposit' ? 'Deposited to' : 'Withdrew from'} ${tx.savingsname}`,
                  amount: `${tx.transaction_type === 'deposit' ? '+' : '-'}${tx.amount} ${tx.currency || 'ETH'}`,
                  timestamp: new Date(tx.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }),
                  rawDate: new Date(tx.created_at),
                  network: tx.chain || 'Base',
                  txHash: tx.txnhash
                };
              } catch (mapError) {
                console.error('Error mapping transaction:', mapError);
                return null;
              }
            })
              .filter(Boolean)
              .sort((a: any, b: any) => b.rawDate.getTime() - a.rawDate.getTime());

            setActivityData(formattedActivity);
          } else {
            setActivityData([]);
          }
        } catch (error) {
          console.error('Error fetching activity data:', error);
          setActivityData([]);
        } finally {
          setIsLoadingActivity(false);
        }
      } else {
        setActivityData([]);
      }
    };

    fetchActivityData();
  }, []);

  // Fetch GoodDollar price
  const fetchGoodDollarPrice = async () => {
    try {
      const response = await fetch('/api/prices?ids=gooddollar');
      const data = await response.json();
      return data.gooddollar.usd;
    } catch (error) {
      console.error("Error fetching GoodDollar price:", error);
      return 0.0001; // fallback
    }
  };

  useEffect(() => {
    fetchGoodDollarPrice().then(setGoodDollarPrice);
  }, []);

  // Modal Handlers
  const openTopUpModal = (plan: any) => {
    setTopUpModal({
      isOpen: true,
      planName: plan.name,
      planId: plan.id,
      isEth: plan.isEth,
      isGToken: plan.tokenName === '$G',
      tokenName: plan.tokenName,
      contractAddress: plan.contractAddress,
      network: plan.network,
      startTime: plan.startTime
    });
  };

  const closeTopUpModal = () => {
    setTopUpModal({ isOpen: false, planName: '', planId: '', isEth: false, isGToken: false, tokenName: '', contractAddress: '', network: '', startTime: 0 });
  };

  const openWithdrawModal = (plan: any, isCompleted: boolean = false) => {
    setWithdrawModal({
      isOpen: true,
      planId: plan.id,
      planName: plan.name,
      isEth: plan.isEth,
      penaltyPercentage: plan.penaltyPercentage || 5,
      tokenName: plan.tokenName,
      isCompleted,
      contractAddress: plan.contractAddress,
      network: plan.network,
      startTime: plan.startTime
    });
  };

  const closeWithdrawModal = () => {
    setWithdrawModal({ isOpen: false, planId: '', planName: '', isEth: false, penaltyPercentage: 0, tokenName: '', isCompleted: false, contractAddress: '', network: '', startTime: 0 });
  };

  const filteredActivityData = useMemo(() => {
    if (activeTab === 'all') return activityData;
    return activityData.filter(item => {
      const type = item.type.toLowerCase();
      if (activeTab === 'deposit') return type === 'deposit' || type === 'savings_created';
      if (activeTab === 'withdrawal') return type === 'withdrawal' || type === 'withdraw';
      if (activeTab === 'topup') return type === 'topup' || type === 'top_up';
      return true;
    });
  }, [activityData, activeTab]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const paginatedActivityData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredActivityData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredActivityData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredActivityData.length / itemsPerPage);

  return (
    <div className={`${exo.variable} font-sans pb-20`}>
      {/* Network Detection Component */}
      <NetworkDetection />

      <div className="w-full px-0 py-4 sm:px-4 sm:py-6 md:p-8 relative z-10 space-y-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-medium text-gray-900 mb-1">Your Vaults</h1>
            <p className="text-gray-500 text-sm">Track goals, top up balances, and monitor your yield.</p>
          </div>
          <Link href="/dashboard/create-savings">
            <button className="bg-[#81D7B4] text-white font-medium py-2.5 px-6 rounded-xl hover:bg-[#6ec2a0] transition-colors text-sm whitespace-nowrap shadow-sm">
              New Plan
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="bg-white rounded-[1.5rem] border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
            <p className="text-gray-500 text-xs font-medium mb-3">Active Plans</p>
            <p className="text-3xl font-bold text-black">{stats.activeCount}</p>
          </div>

          {/* Total Value Card */}
          <div className="bg-white rounded-[1.5rem] border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
            <p className="text-gray-500 text-xs font-medium mb-3">Total Value</p>
            <p className="text-3xl font-bold text-black flex items-baseline gap-1">
              {parseFloat(stats.totalLocked).toLocaleString()} <span className="text-xs text-[#81D7B4]">USD</span>
            </p>
          </div>

          {/* Rewards Earned Card */}
          <div className="bg-white rounded-[1.5rem] border border-gray-100 p-4 shadow-sm flex flex-col justify-between col-span-2 md:col-span-1">
            <p className="text-gray-500 text-xs font-medium mb-3">Rewards Earned</p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-black">{stats.rewards}</p>
              <span className="text-xs font-bold text-[#81D7B4]">$BTS</span>
            </div>
          </div>
        </div>

        {/* Plans Grid - Full Width / Vertical ListView */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-50 rounded-2xl h-[200px]"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Active Plans */}
            <div className="flex flex-col gap-6">
              {savingsData.currentPlans.map((plan) => {
                const amount = parseFloat(plan.currentAmount);
                const safeAmount = !isNaN(amount) ? amount : 0;
                let usdVal = safeAmount;
                if (plan.isEth || plan.tokenName === 'ETH') usdVal = safeAmount * (ethPrice || 3500);
                if (plan.tokenName === 'Gooddollar') usdVal = safeAmount * 0.0001086;
                const reward = (usdVal * 0.005 * 1000).toFixed(0);

                const isCompleted = Number(plan.maturityTime || 0) * 1000 <= Date.now();

                let timeRemaining = "Completed";
                if (!isCompleted) {
                  const diff = Number(plan.maturityTime || 0) - Math.floor(Date.now() / 1000);
                  if (diff <= 0) { timeRemaining = "Completed"; } else {
                    const days = Math.ceil(diff / 86400);
                    timeRemaining = days > 30 ? `${Math.floor(days / 30)}mo ${days % 30}d` : `${days} days`;
                  }
                }

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 sm:p-6 lg:p-8 hover:shadow-[0_10px_40px_rgba(129,215,180,0.15)] hover:border-[#81D7B4] transition-all duration-300 group flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-20"
                  >
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
                      {/* Mobile Completion Tag */}
                      <div className="md:hidden flex items-center">
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
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-4 md:pt-0 border-t md:border-none border-gray-50">
                      {isCompleted && (
                        <span className="hidden md:flex bg-[#81D7B4] text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm items-center justify-center mr-2">100%</span>
                      )}
                      <div className="flex gap-2 w-full md:w-auto">
                        {!isCompleted && (
                          <button onClick={() => openTopUpModal(plan)} className="flex-1 md:flex-none px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold bg-[#81D7B4]/10 text-[#81D7B4] hover:bg-[#81D7B4] hover:text-white rounded-xl transition-colors shadow-sm text-center whitespace-nowrap">
                            Top Up
                          </button>
                        )}
                        <button onClick={() => setPlanDetailsModal({ isOpen: true, plan, isEth: plan.isEth, tokenName: plan.tokenName || '' })} className="flex-1 md:flex-none px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold text-[#81D7B4] bg-white border border-gray-100 hover:border-[#81D7B4] rounded-xl transition-colors shadow-sm text-center">Details</button>
                        <button onClick={() => {
                          const maturityTimestamp = Number(plan.maturityTime || 0);
                          const isCurrentlyCompleted = Number(new Date()) >= maturityTimestamp * 1000;
                          openWithdrawModal(plan, isCurrentlyCompleted);
                        }} className={`flex-1 md:flex-none px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold rounded-xl transition-colors border shadow-sm text-center whitespace-nowrap ${isCompleted ? 'bg-[#81D7B4] text-white hover:bg-opacity-90 border-transparent' : 'bg-white hover:bg-red-50 text-[#81D7B4] border-gray-200 hover:text-red-500 hover:border-red-200'}`}>Withdraw</button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Empty state card */}
              {savingsData.currentPlans.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full"
                >
                  <Link href="/dashboard/create-savings">
                    <div className="relative bg-[#F8FAF9] rounded-[1.5rem] border-2 border-dashed border-gray-200 hover:border-[#81D7B4] hover:bg-[#81D7B4]/5 transition-all duration-300 h-64 flex flex-col items-center justify-center p-8 text-center cursor-pointer group shadow-sm">
                      <div className="bg-white rounded-full p-4 mb-4 shadow-sm group-hover:scale-110 transition-transform text-[#81D7B4]">
                        <PlusSignIcon className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Create New Plan</h3>
                      <p className="text-gray-500 text-sm max-w-xs">Start a new savings goal and track your progress</p>
                    </div>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Completed Plans Section */}
            {savingsData.completedPlans.length > 0 && (
              <div className="pt-8 border-t border-gray-100">
                <h2 className="text-2xl font-black text-[#0f172a] mb-6 tracking-tight">Completed Plans</h2>
                <div className="flex flex-col gap-6">
                  {savingsData.completedPlans.map((plan) => {
                    const amount = parseFloat(plan.currentAmount);
                    const safeAmount = !isNaN(amount) ? amount : 0;
                    let usdVal = safeAmount;
                    if (plan.isEth || plan.tokenName === 'ETH') usdVal = safeAmount * (ethPrice || 3500);
                    if (plan.tokenName === 'Gooddollar') usdVal = safeAmount * 0.0001086;
                    const reward = (usdVal * 0.005 * 1000).toFixed(0);

                    return (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-sm p-5 sm:p-6 lg:p-8 relative z-20 flex flex-col md:flex-row md:items-center justify-between gap-6 opacity-90"
                      >
                        {/* Left: Icon & Name */}
                        <div className="flex justify-between items-center md:justify-start w-full md:w-auto md:min-w-[240px]">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl flex border border-gray-200 items-center justify-center shadow-sm">
                              <Image src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')} alt={plan.name} width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 object-contain grayscale" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-700 text-base sm:text-lg tracking-tight truncate max-w-[140px] sm:max-w-[200px]">{plan.name}</h3>
                              <span className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1 block">
                                Completed
                              </span>
                            </div>
                          </div>
                          {/* Mobile Completion Tag */}
                          <div className="md:hidden flex items-center">
                            <span className="bg-[#81D7B4] text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">100%</span>
                          </div>
                        </div>

                        {/* Middle: Stats Grid & Progress */}
                        <div className="flex-1 flex flex-col lg:flex-row items-start lg:items-center gap-6 w-full lg:px-6">
                          <div className="grid grid-cols-2 gap-4 p-4 sm:p-5 bg-white rounded-[1.5rem] border border-gray-100 w-full lg:w-auto min-w-[240px] flex-none">
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold mb-1.5 uppercase tracking-widest">Final Amount</p>
                              <p className="font-medium text-gray-700 text-base sm:text-lg flex items-baseline gap-1">
                                {plan.isEth ? safeAmount.toFixed(4) : safeAmount.toLocaleString()}
                                <span className="text-xs font-bold text-gray-400">{plan.isEth ? 'ETH' : plan.tokenName}</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold mb-1.5 uppercase tracking-widest">Reward</p>
                              <p className="font-medium text-gray-700 text-base sm:text-lg">+{reward} <span className="text-[10px] sm:text-xs text-gray-400 font-bold">$BTS</span></p>
                            </div>
                          </div>

                          <div className="w-full flex-1 md:max-w-[300px]">
                            <div className="flex justify-between text-[11px] sm:text-xs mb-2.5 font-bold">
                              <span className="text-gray-500">100%</span>
                              <span className="text-green-500 uppercase tracking-wider text-[9px] sm:text-[10px]">Ready</span>
                            </div>
                            <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-400 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-4 md:pt-0 border-t md:border-none border-gray-200">
                          {/* Desktop Completion Tag */}
                          <div className="hidden md:flex items-center mr-2">
                            <span className="bg-[#81D7B4] text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm">100%</span>
                          </div>

                          <div className="flex gap-2 w-full md:w-auto">
                            <button onClick={() => setPlanDetailsModal({ isOpen: true, plan, isEth: plan.isEth, tokenName: plan.tokenName || '' })} className="flex-1 md:flex-none px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold text-gray-500 bg-white border border-gray-200 hover:border-gray-300 rounded-xl transition-colors shadow-sm text-center">Details</button>
                            <button onClick={() => {
                              openWithdrawModal(plan, true);
                            }} className={`flex-1 md:flex-none px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold rounded-xl transition-colors border shadow-sm text-center whitespace-nowrap bg-[#81D7B4] text-white hover:bg-opacity-90 border-transparent`}>Withdraw</button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Activity History Section */}
            <div className="pt-12 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                <div>
                  <h2 className="text-xl font-medium text-gray-900 mb-1">Activity History</h2>
                  <p className="text-sm text-gray-500">Recent blockchain transactions</p>
                </div>
                {/* Tabs */}
                <div className="flex bg-gray-50 rounded-xl p-1 shrink-0 overflow-x-auto hide-scrollbar">
                  {['all', 'deposit', 'topup', 'withdrawal'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${activeTab === tab
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                {isLoadingActivity ? (
                  <div className="p-4 sm:p-6 w-full">
                    <TableShimmer />
                  </div>
                ) : filteredActivityData.length > 0 ? (
                  <>
                    <div className="divide-y divide-gray-50">
                      {paginatedActivityData.map((activity, index) => (
                        <div key={index} className="px-6 py-5 hover:bg-gray-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-50 border border-gray-100 text-gray-500">
                              {activity.type === 'deposit' || activity.type === 'savings_created' ? (
                                <span className="text-green-600 text-lg font-medium">+</span>
                              ) : activity.type === 'topup' ? (
                                <span className="text-gray-900 text-lg font-medium">↑</span>
                              ) : (
                                <span className="text-gray-900 text-lg font-medium">↓</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{activity.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{activity.timestamp}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0"></span>
                                <span className="text-xs text-gray-500 capitalize">{activity.type.replace('_', ' ')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:items-end sm:pl-0 pl-14">
                            <p className={`font-medium text-base ${activity.type === 'deposit' || activity.type === 'savings_created'
                                ? 'text-green-600'
                                : 'text-gray-900'
                              }`}>
                              {activity.type !== 'withdrawal' ? '+' : '-'}{activity.amount}
                            </p>
                            <a
                              href={`https://basescan.org/tx/${activity.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1"
                            >
                              View on Explorer →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${currentPage === 1
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          Previous
                        </button>
                        <span className="text-xs text-gray-500">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${currentPage === totalPages
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-16 text-center">
                    <p className="text-gray-500 text-sm">No {activeTab !== 'all' ? activeTab : ''} activity yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SharePlanModal
        isOpen={sharePlanModal.isOpen}
        onClose={() => setSharePlanModal({ ...sharePlanModal, isOpen: false })}
        planName={sharePlanModal.planName}
        networkName={sharePlanModal.networkName}
        contractAddress={sharePlanModal.contractAddress}
        chainId={sharePlanModal.chainId}
      />

      <TopUpModal
        isOpen={topUpModal.isOpen}
        onClose={closeTopUpModal}
        planName={topUpModal.planName}
        planId={topUpModal.planId}
        isEth={topUpModal.isEth}
        tokenName={topUpModal.tokenName}
        networkLogos={networkLogos}
        contractAddress={topUpModal.contractAddress}
        network={topUpModal.network}
        startTime={topUpModal.startTime}
      />

      <WithdrawModal
        isOpen={withdrawModal.isOpen}
        onClose={closeWithdrawModal}
        planName={withdrawModal.planName}
        isEth={withdrawModal.isEth}
        penaltyPercentage={withdrawModal.penaltyPercentage}
        tokenName={withdrawModal.tokenName}
        isCompleted={withdrawModal.isCompleted}
        contractAddress={withdrawModal.contractAddress}
        network={withdrawModal.network}
        startTime={withdrawModal.startTime}
      />

      <PlanDetailsModal
        isOpen={planDetailsModal.isOpen}
        onClose={() => setPlanDetailsModal({ ...planDetailsModal, isOpen: false })}
        plan={planDetailsModal.plan}
        isEth={planDetailsModal.isEth}
        tokenName={planDetailsModal.tokenName}
        goodDollarPrice={goodDollarPrice}
        networkLogos={networkLogos}
      />
    </div>
  )
}
