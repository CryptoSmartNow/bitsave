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
import { HiOutlinePlus, HiOutlineBanknotes, HiOutlineEye, HiOutlineClipboardDocumentList, HiOutlineCurrencyDollar, HiOutlineChartPie, HiOutlineUsers, HiOutlineCheckCircle, HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '@/utils/networkLogos';
import SharePlanModal from '@/components/SharePlanModal';

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
        const logos = await fetchMultipleNetworkLogos(['ethereum', 'base', 'celo', 'lisk', 'avalanche', 'solana', 'bsc', 'hedera']);
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
    <div className={`${exo.className} pb-20`}>
      {/* Network Detection Component */}
      <NetworkDetection />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 relative z-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100">
          <div>
            <p className="text-[11px] text-[#81D7B4] font-black uppercase tracking-[0.2em] mb-2">My SaveFi</p>
            <h1 className="text-3xl md:text-[42px] font-black text-[#0f172a] mb-2 tracking-tight leading-[1.1]">Savings Plans</h1>
            <p className="text-[#64748b] font-medium text-[14px] max-w-xl">Track goals, top up balances, and monitor your yield in one place.</p>
          </div>
          <Link href="/dashboard/create-savings">
            <button className="flex items-center gap-2 bg-[#81D7B4] text-white font-bold py-3.5 px-7 rounded-2xl shadow-[0_8px_24px_rgba(129,215,180,0.35)] hover:bg-[#6ec2a0] hover:shadow-[0_8px_30px_rgba(129,215,180,0.4)] transition-all duration-300 whitespace-nowrap text-[14px]">
              <HiOutlinePlus className="w-5 h-5 stroke-[2.5]" />
              New Plan
            </button>
          </Link>
        </div>

        <div className="flex overflow-x-auto pb-6 pt-2 gap-4 md:grid md:grid-cols-3 md:gap-6 md:pb-0 snap-x snap-mandatory hide-scrollbar">
          {/* Active Plans Card */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group min-w-[280px] md:min-w-0 snap-center hover:shadow-[0_12px_40px_rgba(129,215,180,0.15)] hover:border-[#81D7B4]/30 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#81D7B4]/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
            
            <div className="flex justify-between items-start relative z-10">
               <h3 className="text-gray-400 font-bold text-[12px] uppercase tracking-widest mt-2">Active Plans</h3>
               <div className="w-12 h-12 rounded-[1.2rem] bg-[#F8FAF9] border border-gray-100 flex items-center justify-center text-[#81D7B4] shadow-[0_4px_10px_rgba(0,0,0,0.03)] group-hover:scale-110 transition-transform duration-500">
                 <HiOutlineChartPie className="w-6 h-6 stroke-[2]" />
               </div>
            </div>
            
            <div className="mt-8 mb-2 pb-1 relative z-10">
               <p className="text-[48px] md:text-[56px] font-black text-gray-900 tracking-tighter leading-tight">{stats.activeCount}</p>
            </div>
          </div>

          {/* Total Value Card */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group min-w-[280px] md:min-w-0 snap-center hover:shadow-[0_12px_40px_rgba(129,215,180,0.15)] hover:border-[#81D7B4]/30 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#81D7B4]/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
            
            <div className="flex justify-between items-start relative z-10">
               <h3 className="text-gray-400 font-bold text-[12px] uppercase tracking-widest mt-2">Total Value</h3>
               <div className="w-12 h-12 rounded-[1.2rem] bg-[#F8FAF9] border border-gray-100 flex items-center justify-center text-[#81D7B4] shadow-[0_4px_10px_rgba(0,0,0,0.03)] group-hover:scale-110 transition-transform duration-500">
                 <HiOutlineBanknotes className="w-6 h-6 stroke-[2]" />
               </div>
            </div>

            <div className="mt-8 mb-2 pb-1 relative z-10">
               <p className="text-[48px] md:text-[56px] font-black text-gray-900 tracking-tighter leading-tight flex items-start">
                 <span className="text-[24px] md:text-[28px] text-gray-400 mr-1.5 mt-1 sm:mt-2">$</span>
                 {parseFloat(stats.totalLocked).toLocaleString()}
               </p>
            </div>
          </div>

          {/* Rewards Earned Card */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group min-w-[280px] md:min-w-0 snap-center hover:shadow-[0_12px_40px_rgba(129,215,180,0.15)] hover:border-[#81D7B4]/30 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-[#81D7B4]/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
            
            <div className="flex justify-between items-start relative z-10">
               <h3 className="text-black font-black text-[12px] uppercase tracking-widest mt-2">Rewards Earned</h3>
               <div className="w-12 h-12 rounded-[1.2rem] bg-[#81D7B4]/20 border border-[#81D7B4]/30 flex items-center justify-center text-black shadow-[0_4px_10px_rgba(129,215,180,0.15)] group-hover:scale-110 transition-transform duration-500">
                 <HiOutlineCurrencyDollar className="w-6 h-6 stroke-[2]" />
               </div>
            </div>

            <div className="mt-8 mb-2 pb-1 relative z-10 flex items-baseline gap-2">
               <p className="text-[48px] md:text-[56px] font-black text-[#81D7B4] tracking-tighter leading-tight">{stats.rewards}</p>
               <span className="text-[16px] font-black text-black uppercase tracking-widest">$BTS</span>
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
                  className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative z-20"
                >
                  {/* Header - Brand Mint */}
                  <div className="bg-[#81D7B4] p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between sm:items-start gap-6 relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                     <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                     <div className="flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-sm backdrop-blur-sm">
                           <Image
                             src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')}
                             alt={plan.isEth ? 'ETH' : (plan.tokenName || 'Token')}
                             width={28}
                             height={28}
                             className="object-contain"
                           />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-[22px] font-bold tracking-wide">{plan.name}</h3>
                            {plan.isShared && (
                              <span className="flex items-center gap-1 bg-white text-[#81D7B4] text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-sm">
                                <HiOutlineUsers className="w-3 h-3" /> Shared
                              </span>
                            )}
                          </div>
                          <p className="text-[#81D7B4] text-[12px] uppercase tracking-widest font-semibold mt-1">
                            Started • {new Date(Number(plan.startTime) * 1000).toLocaleDateString()}
                          </p>
                        </div>
                     </div>
                     <div className="sm:text-right relative z-10">
                        <p className="text-[12px] text-[#81D7B4]/80 uppercase tracking-widest font-semibold mb-1">Total Saved</p>
                        <p className="text-[28px] font-black text-white tracking-tight leading-none">
                          {plan.isEth ? (
                            <>{parseFloat(plan.currentAmount).toFixed(4)} <span className="text-[14px] text-white/70 font-semibold ml-1">ETH</span></>
                          ) : plan.tokenName === 'Gooddollar' ? (
                            <>{parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-[14px] text-white/70 font-semibold ml-1">G$</span></>
                          ) : (
                            <><span className="text-[20px] text-white/70 mr-1 font-semibold">$</span>{parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</>
                          )}
                        </p>
                     </div>
                  </div>
                  
                  {/* Body - Clean White */}
                  <div className="p-6 sm:p-8 bg-white">
                     <div className="flex flex-col sm:flex-row justify-between w-full mb-8 gap-6">
                        <div className="flex gap-10">
                          <div>
                            <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-[0.15em] mb-2">Rewards Earned</p>
                            <p className="text-[22px] font-black text-[#81D7B4] tracking-tighter">
                              +{plan.tokenName === 'Gooddollar' ? ((parseFloat(plan.currentAmount) * goodDollarPrice) * 0.005 * 1000).toFixed(0) : (parseFloat(plan.currentAmount) * 0.005 * 1000).toFixed(0)} <span className="text-[13px] text-[#0f172a] font-black">$BTS</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-[0.15em] mb-2">Time Remaining</p>
                            <p className="text-[18px] font-bold text-[#0f172a]">
                              {(() => {
                                const now = Math.floor(Date.now() / 1000);
                                const end = Number(plan.maturityTime || 0);
                                const diff = end - now;
                                if (diff <= 0) return "Completed";
                                const days = Math.ceil(diff / (60 * 60 * 24));
                                if (days > 30) {
                                  const months = Math.floor(days / 30);
                                  const remainingDays = days % 30;
                                  return `${months} Mos, ${remainingDays} Days`;
                                }
                                return `${days} Days`;
                              })()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="sm:text-right w-full sm:w-2/5">
                          <div className="flex justify-between items-end mb-3 sm:justify-end sm:gap-4">
                            <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-[0.15em]">Lock Progress</p>
                            <p className="text-[22px] font-black text-[#0f172a] leading-none">{Math.round(plan.progress)}%</p>
                          </div>
                          <div className="w-full h-2.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                             <div className="h-full bg-[#81D7B4] rounded-full" style={{ width: `${plan.progress}%` }}></div>
                          </div>
                        </div>
                     </div>

                     {/* Actions */}
                     <div className="flex flex-wrap items-center sm:justify-end gap-3 pt-6 border-t border-gray-100">
                        {!plan.isShared && (
                          <button
                            onClick={() => setSharePlanModal({ isOpen: true, planName: plan.name, networkName: plan.network || '', contractAddress: (plan as any).contractAddress || '', chainId: (plan as any).chainId || 0 })}
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-[#81D7B4]/40 bg-[#81D7B4]/10 text-[#0f172a] font-bold hover:bg-[#81D7B4]/25 text-[13px] shadow-sm flex items-center justify-center transition-colors"
                          >
                            Share
                          </button>
                        )}
                        <button
                          onClick={() => openTopUpModal(plan.name, plan.id, plan.isEth, plan.tokenName)}
                          disabled={plan.isShared}
                          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#81D7B4] text-white font-black hover:bg-[#6ec2a0] text-[13px] shadow-sm flex items-center justify-center transition-colors ${plan.isShared ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Top Up
                        </button>
                        <button
                          onClick={() => setPlanDetailsModal({ isOpen: true, plan, isEth: plan.isEth, tokenName: plan.tokenName || '' })}
                          className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-gray-200 text-[#0f172a] font-bold hover:bg-gray-50 text-[13px] shadow-sm flex items-center justify-center transition-colors"
                        >
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
                          disabled={plan.isShared}
                          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-[#81D7B4] bg-[#81D7B4] text-white font-black hover:bg-[#6ec2a0] text-[13px] shadow-sm flex items-center justify-center transition-all ${plan.isShared ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
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
                    <div className="relative bg-[#F8FAF9] rounded-[1.5rem] border-2 border-dashed border-gray-200 hover:border-[#81D7B4] hover:bg-[#81D7B4]/5 transition-all duration-300 h-64 flex flex-col items-center justify-center p-8 text-center cursor-pointer group shadow-sm">
                      <div className="bg-white rounded-full p-4 mb-4 shadow-sm group-hover:scale-110 transition-transform text-[#81D7B4]">
                        <HiOutlinePlus className="w-8 h-8" />
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
                  {savingsData.completedPlans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="bg-white rounded-[1.5rem] border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col opacity-95 group"
                    >
                      <div className="bg-[#f8faf9] border-b border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                         <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm opacity-80 backdrop-blur-sm transition-all">
                               <Image
                                 src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')}
                                 alt={plan.isEth ? 'ETH' : (plan.tokenName || 'Token')}
                                 width={28}
                                 height={28}
                                 className="object-contain"
                               />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="text-[22px] font-bold text-[#0f172a] tracking-wide">{plan.name}</h3>
                                {plan.network && (
                                  <span className="flex items-center gap-1.5 bg-gray-200 text-gray-700 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md">
                                    {plan.network}
                                  </span>
                                )}
                              </div>
                              <p className="text-[#64748b] text-[12px] uppercase tracking-widest font-semibold mt-1">
                                Completed Plan
                              </p>
                            </div>
                         </div>
                         <div className="sm:text-right">
                            <p className="text-[12px] text-[#64748b] uppercase tracking-widest font-semibold mb-1">Final Amount</p>
                            <p className="text-[28px] font-black text-[#0f172a] tracking-tight leading-none">
                              {plan.isEth ? (
                                <>{parseFloat(plan.currentAmount).toFixed(4)} <span className="text-[14px] text-[#81D7B4] font-bold ml-1">ETH</span></>
                              ) : plan.tokenName === 'Gooddollar' ? (
                                <>{parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-[14px] text-[#81D7B4] font-bold ml-1">G$</span></>
                              ) : (
                                <><span className="text-[20px] text-[#81D7B4] mr-1 font-bold">$</span>{parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</>
                              )}
                            </p>
                         </div>
                      </div>
                      
                      <div className="p-6 sm:p-8 bg-white">
                         <div className="flex flex-col sm:flex-row justify-between w-full mb-8 gap-6 sm:gap-0">
                            <div className="flex gap-12">
                              <div>
                                <p className="text-[11px] text-[#64748b] font-bold uppercase tracking-widest mb-2">Total Rewards</p>
                                <p className="text-[22px] font-black text-[#81D7B4] tracking-tighter">
                                  +{plan.tokenName === 'Gooddollar' ? ((parseFloat(plan.currentAmount) * goodDollarPrice) * 0.005 * 1000).toFixed(0) : (parseFloat(plan.currentAmount) * 0.005 * 1000).toFixed(0)} <span className="text-[13px] text-[#0f172a]">$BTS</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] text-[#64748b] font-bold uppercase tracking-widest mb-2">Status</p>
                                <p className="text-[18px] font-bold text-[#81D7B4] flex items-center gap-1.5">
                                  Goal Reached <HiOutlineCheckCircle className="w-5 h-5"/>
                                </p>
                              </div>
                            </div>
                            
                            <div className="sm:text-right w-full sm:w-1/3">
                              <div className="flex justify-between items-end mb-2 sm:justify-end sm:gap-4">
                                <p className="text-[11px] text-[#64748b] font-bold uppercase tracking-widest">Progress Full</p>
                                <p className="text-[18px] font-black text-[#81D7B4]">100%</p>
                              </div>
                              <div className="w-full h-2.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                                 <div className="h-full bg-[#81D7B4] rounded-full" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                         </div>

                         <div className="flex flex-wrap items-center sm:justify-end gap-3 pt-6 border-t border-gray-100">
                            <button
                              onClick={() => setPlanDetailsModal({ isOpen: true, plan, isEth: plan.isEth, tokenName: plan.tokenName || '' })}
                              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-gray-200 text-[#0f172a] font-bold hover:bg-gray-50 text-[13px] shadow-sm flex items-center justify-center transition-colors"
                            >
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
                              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#81D7B4] text-white font-black hover:bg-[#6ec2a0] text-[13px] shadow-sm flex items-center justify-center transition-all"
                             >
                               Withdraw
                             </button>
                          </div>
                       </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity History Section */}
            <div className="pt-12 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-3xl font-black text-[#0f172a] tracking-tight mb-1">Activity History</h2>
                  <p className="text-[14px] text-[#64748b] font-medium">Recent blockchain transactions and account events</p>
                </div>
                {/* Tabs */}
                <div className="flex p-1.5 bg-[#f8faf9] rounded-2xl shadow-sm border border-gray-100 hide-scrollbar overflow-x-auto shrink-0">
                  {['all', 'deposit', 'topup', 'withdrawal'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap ${activeTab === tab
                        ? 'bg-[#81D7B4] text-white shadow-md'
                        : 'text-[#64748b] hover:text-[#0f172a] hover:bg-gray-100'
                        }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                {isLoadingActivity ? (
                  <div className="p-16 text-center">
                    <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-[#81D7B4] rounded-full mx-auto mb-6"></div>
                    <p className="text-[#0f172a] font-bold text-[15px] mb-1">Syncing with blockchain...</p>
                    <p className="text-[#64748b] text-[13px] font-medium">Fetching your activity history</p>
                  </div>
                ) : filteredActivityData.length > 0 ? (
                  <>
                    <div className="divide-y divide-gray-50">
                      {paginatedActivityData.map((activity, index) => (
                        <div key={index} className="px-6 py-5 hover:bg-[#f8faf9] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 border ${activity.type === 'deposit' || activity.type === 'savings_created'
                                ? 'bg-[#81D7B4]/10 text-[#0f172a] border-[#81D7B4]/20'
                                : activity.type === 'topup'
                                  ? 'bg-[#81D7B4]/10 text-[#0f172a] border-[#81D7B4]/20'
                                  : 'bg-slate-50 text-slate-500 border-slate-100'
                              }`}>
                              {activity.type === 'deposit' || activity.type === 'savings_created' ? (
                                <HiOutlinePlus className="w-5 h-5 stroke-[2]" />
                              ) : activity.type === 'topup' ? (
                                <HiOutlineCurrencyDollar className="w-5 h-5 stroke-[2]" />
                              ) : (
                                <HiOutlineBanknotes className="w-5 h-5 stroke-[2]" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-[#0f172a] text-[15px] tracking-tight">{activity.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[12px] text-[#94a3b8] font-medium uppercase tracking-wide">{activity.timestamp}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0"></span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest ${activity.type === 'withdrawal'
                                    ? 'bg-slate-100 text-slate-500'
                                    : activity.type === 'topup'
                                      ? 'bg-[#81D7B4]/20 text-[#0f172a]'
                                      : 'bg-[#81D7B4]/20 text-[#0f172a]'
                                  }`}>
                                  {activity.type}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:items-end sm:pl-0 pl-16">
                            <p className={`font-black text-[18px] tracking-tighter ${activity.type === 'deposit' || activity.type === 'savings_created'
                                ? 'text-[#81D7B4]'
                                : activity.type === 'topup'
                                  ? 'text-[#0f172a]'
                                  : 'text-[#0f172a]'
                              }`}>
                              {activity.type !== 'withdrawal' ? '+' : '-'}{activity.amount}
                            </p>
                            <a
                              href={`https://basescan.org/tx/${activity.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[12px] font-bold text-[#94a3b8] hover:text-[#81D7B4] transition-colors mt-1"
                            >
                              View on Explorer →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-[#f8faf9] rounded-b-[2rem]">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${currentPage === 1
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-[#0f172a] bg-white border border-gray-200 hover:bg-gray-50 shadow-sm'
                            }`}
                        >
                          Previous
                        </button>
                        <span className="text-[13px] font-bold text-[#64748b] uppercase tracking-widest">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${currentPage === totalPages
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-[#0f172a] bg-white border border-gray-200 hover:bg-gray-50 shadow-sm'
                            }`}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-20 text-center">
                    <div className="bg-[#f8faf9] w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 border border-gray-100">
                      <HiOutlineClipboardDocumentList className="w-9 h-9 text-[#81D7B4]" />
                    </div>
                    <h3 className="text-[18px] font-black text-[#0f172a] mb-2 tracking-tight">No {activeTab !== 'all' ? activeTab : ''} activity yet</h3>
                    <p className="text-[14px] text-[#64748b] font-medium">Your transactions will appear here</p>
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
        networkLogos={networkLogos}
      />
    </div>
  )
}
