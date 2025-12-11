'use client'

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
import { HiOutlinePlus, HiOutlineBanknotes, HiOutlineEye, HiOutlineClipboardDocumentList, HiOutlineCurrencyDollar, HiOutlineChartPie } from 'react-icons/hi2';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '@/utils/networkLogos';

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

// Initialize the Exo font
const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
})

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

  // Modal states aligned with Dashboard
  const [topUpModal, setTopUpModal] = useState({
    isOpen: false,
    planName: '',
    planId: '',
    isEth: false,
    isGToken: false,
    tokenName: ''
  });

  const [withdrawModal, setWithdrawModal] = useState({
    isOpen: false,
    planId: '',
    planName: '',
    isEth: false,
    penaltyPercentage: 0,
    tokenName: '',
    isCompleted: false
  });

  const [planDetailsModal, setPlanDetailsModal] = useState({
    isOpen: false,
    plan: null as any,
    isEth: false,
    tokenName: ''
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
        const logos = await fetchMultipleNetworkLogos(['ethereum', 'base', 'celo', 'lisk', 'avalanche', 'solana']);
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
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=gooddollar&vs_currencies=usd');
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

  const closeTopUpModal = () => {
    setTopUpModal({ isOpen: false, planName: '', planId: '', isEth: false, isGToken: false, tokenName: '' });
  };

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

  const closeWithdrawModal = () => {
    setWithdrawModal({ isOpen: false, planId: '', planName: '', isEth: false, penaltyPercentage: 0, tokenName: '', isCompleted: false });
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

  return (
    <div className={`${exo.className} pb-20`}>
      {/* Network Detection Component */}
      <NetworkDetection />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 relative z-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Your Savings Plans</h1>
            <p className="text-gray-500 max-w-2xl">Track and manage your savings goals. Create new plans or contribute to existing ones.</p>
          </div>
          <Link href="/dashboard/create-savings">
            <button className="bg-[#81D7B4] text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-[#81D7B4]/20 hover:shadow-[#81D7B4]/30 hover:bg-[#6BC4A0] transition-all duration-300 flex items-center whitespace-nowrap">
              <HiOutlinePlus className="w-5 h-5 mr-2" />
              Create New Plan
            </button>
          </Link>
        </div>

        {/* Stats Cards - Carousel on mobile, Grid on desktop */}
        <div className="flex overflow-x-auto pb-4 gap-4 md:grid md:grid-cols-3 md:gap-6 md:pb-0 snap-x snap-mandatory hide-scrollbar">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group min-w-[280px] md:min-w-0 snap-center">
             <div className="absolute top-0 right-0 w-24 h-24 bg-[#81D7B4]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 rounded-full bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4]">
                   <HiOutlineChartPie className="w-5 h-5" />
                 </div>
                 <h3 className="text-gray-500 font-medium text-sm">Active Plans</h3>
               </div>
               <p className="text-3xl font-bold text-gray-900">{stats.activeCount}</p>
             </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group min-w-[280px] md:min-w-0 snap-center">
             <div className="absolute top-0 right-0 w-24 h-24 bg-[#81D7B4]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 rounded-full bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4]">
                   <HiOutlineBanknotes className="w-5 h-5" />
                 </div>
                 <h3 className="text-gray-500 font-medium text-sm">Total Value</h3>
               </div>
               <p className="text-3xl font-bold text-gray-900">${parseFloat(stats.totalLocked).toLocaleString()}</p>
             </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group min-w-[280px] md:min-w-0 snap-center">
             <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                   <HiOutlineCurrencyDollar className="w-5 h-5" />
                 </div>
                 <h3 className="text-gray-500 font-medium text-sm">Rewards Earned</h3>
               </div>
               <p className="text-3xl font-bold text-gray-900">{stats.rewards} <span className="text-sm font-medium text-gray-400">$BTS</span></p>
             </div>
          </div>
        </div>

        {/* Plans Grid - Full Width / Vertical List */}
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
              {savingsData.currentPlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="relative bg-gradient-to-br from-white via-white to-[#81D7B4]/10 rounded-3xl border border-gray-100 p-6 sm:p-8 hover:shadow-lg transition-all duration-300 group overflow-hidden"
                >
                  {/* Noise Texture Overlay */}
                  <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Header: Icon, Title/Date */}
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="w-16 h-16 rounded-2xl border border-gray-100 bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                        <Image
                          src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')}
                          alt={plan.isEth ? 'ETH' : (plan.tokenName || 'Token')}
                          width={36}
                          height={36}
                          className="w-9 h-9 object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight mb-1">
                          {plan.name}
                        </h3>
                        <p className="text-sm font-medium text-gray-400">
                          Started {new Date(Number(plan.startTime) * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 bg-white/50 rounded-xl px-4 sm:px-6 py-3 border border-gray-100/50 w-full sm:w-auto">
                        <div>
                          <p className="text-xs font-medium text-gray-400 mb-1">Saved Amount</p>
                          <p className="font-bold text-gray-900 text-lg md:text-xl">
                            {plan.isEth ? (
                              <>{parseFloat(plan.currentAmount).toFixed(4)} ETH</>
                            ) : plan.tokenName === 'Gooddollar' ? (
                              <>{parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $G</>
                            ) : (
                              <>${parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</>
                            )}
                          </p>
                        </div>
                        <div className="w-px h-10 bg-gray-200"></div>
                        <div>
                          <p className="text-xs font-medium text-gray-400 mb-1">Rewards</p>
                          <p className="font-bold text-[#81D7B4] text-lg md:text-xl">
                            +{plan.tokenName === 'Gooddollar' ? ((parseFloat(plan.currentAmount) * goodDollarPrice) * 0.005 * 1000).toFixed(0) : (parseFloat(plan.currentAmount) * 0.005 * 1000).toFixed(0)} $BTS
                          </p>
                        </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-gray-100 my-6"></div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
                    {/* Progress Bar Section */}
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-center text-sm font-medium text-gray-500 mb-2">
                         <span>Progress</span>
                         <span className="text-[#81D7B4] font-bold">{Math.round(plan.progress)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#81D7B4] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${plan.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <div className="mt-2 text-right">
                         <span className="text-xs font-medium text-gray-400">
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
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => openTopUpModal(plan.name, plan.id, plan.isEth, plan.tokenName)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-6 sm:py-3 rounded-xl bg-[#81D7B4] text-white font-bold text-xs sm:text-sm hover:bg-[#6BC4A0] shadow-lg shadow-[#81D7B4]/20 transition-all transform hover:scale-105"
                      >
                        <HiOutlinePlus className="w-3 h-3 sm:w-4 sm:h-4" />
                        Top Up
                      </button>
                      <button
                        onClick={() => setPlanDetailsModal({ isOpen: true, plan, isEth: plan.isEth, tokenName: plan.tokenName || '' })}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-6 sm:py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs sm:text-sm hover:bg-gray-50 hover:text-gray-900 transition-all"
                      >
                        <HiOutlineEye className="w-3 h-3 sm:w-4 sm:h-4" />
                        Details
                      </button>
                      <button
                        onClick={() => {
                          const currentDate = new Date();
                          const maturityTimestamp = Number(plan.maturityTime || 0);
                          const maturityDate = new Date(maturityTimestamp * 1000);
                          const isCompleted = currentDate >= maturityDate;
                          openWithdrawModal(plan.id, plan.name, plan.isEth, plan.penaltyPercentage, plan.tokenName, isCompleted);
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-6 sm:py-3 rounded-xl border border-[#81D7B4] text-[#81D7B4] font-semibold text-xs sm:text-sm hover:bg-[#81D7B4]/5 transition-all"
                      >
                        <HiOutlineBanknotes className="w-3 h-3 sm:w-4 sm:h-4" />
                        Withdraw
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Empty state card */}
              {savingsData.currentPlans.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full"
                >
                  <Link href="/dashboard/create-savings">
                    <div className="relative bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#81D7B4] hover:bg-[#81D7B4]/5 transition-all duration-300 h-64 flex flex-col items-center justify-center p-8 text-center cursor-pointer group">
                      <div className="bg-white rounded-full p-4 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <HiOutlinePlus className="w-8 h-8 text-[#81D7B4]" />
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">Completed Plans</h2>
                <div className="flex flex-col gap-6">
                  {savingsData.completedPlans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="relative bg-gradient-to-br from-white via-white to-[#81D7B4]/10 rounded-3xl border border-gray-100 p-6 sm:p-8 hover:shadow-lg transition-all duration-300 group overflow-hidden"
                    >
                      {/* Noise Texture Overlay */}
                      <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="w-16 h-16 rounded-2xl border border-gray-100 bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                            <Image
                              src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')}
                              alt={plan.isEth ? 'ETH' : (plan.tokenName || 'Token')}
                              width={36}
                              height={36}
                              className="w-9 h-9 object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight mb-1">
                              {plan.name}
                            </h3>
                            <div className="flex items-center gap-2">
                               <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                                 Completed
                               </span>
                               <span className="text-sm font-medium text-gray-400">
                                 Goal Reached
                               </span>
                            </div>
                          </div>
                        </div>

                         {/* Stats Row */}
                        <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 bg-white/50 rounded-xl px-4 sm:px-6 py-3 border border-gray-100/50 w-full sm:w-auto">
                            <div>
                              <p className="text-xs font-medium text-gray-400 mb-1">Final Amount</p>
                              <p className="font-bold text-gray-900 text-lg md:text-xl">
                                {plan.isEth ? (
                                  <>{parseFloat(plan.currentAmount).toFixed(4)} ETH</>
                                ) : plan.tokenName === 'Gooddollar' ? (
                                  <>{parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $G</>
                                ) : (
                                  <>${parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</>
                                )}
                              </p>
                            </div>
                            <div className="w-px h-10 bg-gray-200"></div>
                            <div>
                              <p className="text-xs font-medium text-gray-400 mb-1">Rewards</p>
                              <p className="font-bold text-[#81D7B4] text-lg md:text-xl">
                                +{plan.tokenName === 'Gooddollar' ? ((parseFloat(plan.currentAmount) * goodDollarPrice) * 0.005 * 1000).toFixed(0) : (parseFloat(plan.currentAmount) * 0.005 * 1000).toFixed(0)} $BTS
                              </p>
                            </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px w-full bg-gray-100 my-6"></div>

                      <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
                        <div className="flex-1 w-full">
                          <div className="flex justify-between items-center text-sm font-medium text-gray-500 mb-2">
                             <span>Progress</span>
                             <span className="text-green-500 font-bold">100%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-[#81D7B4] rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => setPlanDetailsModal({ isOpen: true, plan, isEth: plan.isEth, tokenName: plan.tokenName || '' })}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-6 sm:py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs sm:text-sm hover:bg-gray-50 hover:text-gray-900 transition-all"
                          >
                            <HiOutlineEye className="w-3 h-3 sm:w-4 sm:h-4" />
                            Details
                          </button>
                          <button
                            onClick={() => {
                              const currentDate = new Date();
                              const maturityTimestamp = Number(plan.maturityTime || 0);
                              const maturityDate = new Date(maturityTimestamp * 1000);
                              const isCompleted = currentDate >= maturityDate;
                              openWithdrawModal(plan.id, plan.name, plan.isEth, plan.penaltyPercentage, plan.tokenName, isCompleted);
                            }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-6 sm:py-3 rounded-xl border border-[#81D7B4] text-[#81D7B4] font-semibold text-xs sm:text-sm hover:bg-[#81D7B4] hover:text-white transition-all shadow-sm hover:shadow-md"
                          >
                            <HiOutlineBanknotes className="w-3 h-3 sm:w-4 sm:h-4" />
                            Withdraw Funds
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity History Section */}
            <div className="pt-8 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Activity History</h2>
                
                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-xl overflow-x-auto hide-scrollbar">
                  {['all', 'deposit', 'topup', 'withdrawal'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        activeTab === tab
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {isLoadingActivity ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-[#81D7B4] rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading activity...</p>
                  </div>
                ) : filteredActivityData.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredActivityData.map((activity, index) => (
                      <div key={index} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            activity.type === 'deposit' || activity.type === 'savings_created'
                              ? 'bg-green-100 text-green-600'
                              : activity.type === 'topup'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-orange-100 text-orange-600'
                          }`}>
                            {activity.type === 'deposit' || activity.type === 'savings_created' ? (
                              <HiOutlinePlus className="w-5 h-5" />
                            ) : activity.type === 'topup' ? (
                              <HiOutlineCurrencyDollar className="w-5 h-5" />
                            ) : (
                              <HiOutlineBanknotes className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{activity.description}</p>
                            <p className="text-sm text-gray-500">{activity.timestamp}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 pl-14 sm:pl-0">
                          <div className="text-right">
                            <p className={`font-bold ${
                              activity.type === 'deposit' || activity.type === 'savings_created'
                                ? 'text-green-600'
                                : activity.type === 'topup'
                                ? 'text-blue-600'
                                : 'text-orange-600'
                            }`}>
                              {activity.amount}
                            </p>
                            <a 
                              href={`https://basescan.org/tx/${activity.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#81D7B4] hover:underline"
                            >
                              View on Explorer
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HiOutlineClipboardDocumentList className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No {activeTab !== 'all' ? activeTab : ''} activity yet</h3>
                    <p className="text-gray-500">Your transactions will appear here</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Modals */}
      <TopUpModal
        isOpen={topUpModal.isOpen}
        onClose={closeTopUpModal}
        planName={topUpModal.planName}
        planId={topUpModal.planId}
        isEth={topUpModal.isEth}
        tokenName={topUpModal.tokenName}
        networkLogos={networkLogos}
      />

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

      <PlanDetailsModal
        isOpen={planDetailsModal.isOpen}
        onClose={() => setPlanDetailsModal({ ...planDetailsModal, isOpen: false })}
        plan={planDetailsModal.plan}
        isEth={planDetailsModal.isEth}
        tokenName={planDetailsModal.tokenName}
        goodDollarPrice={goodDollarPrice}
      />
    </div>
  )
}
