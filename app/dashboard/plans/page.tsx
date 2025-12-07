'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exo } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import WithdrawModal from '@/components/WithdrawModal';
import TopUpModal from '@/components/TopUpModal';
import NetworkDetection from '@/components/NetworkDetection';
import { ethers } from 'ethers';
import { useSavingsData } from '@/hooks/useSavingsData';
import { formatTimestamp } from '@/utils/dateUtils';
import { HiOutlinePlus, HiOutlineBanknotes } from 'react-icons/hi2';
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
  isUSDGLO?: boolean; // Add this property
  startTime: number;
  maturityTime: number;
  penaltyPercentage: number;
  tokenName?: string;
  tokenLogo?: string;
  network?: string; // Add network field
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
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
  const [topUpPlan, setTopUpPlan] = useState<Plan | null>(null)
  const [goodDollarPrice, setGoodDollarPrice] = useState(0.0001);
  const [showActivityHistory, setShowActivityHistory] = useState(false);
  const [activityData, setActivityData] = useState<Array<{
    type: string;
    description: string;
    amount: string;
    timestamp: string;
    network: string;
    txHash: string;
  }>>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});

  // Use the new caching hook for savings data
  const { savingsData, isLoading, ethPrice } = useSavingsData()

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
            console.log('Fetching activity data for address:', address);

            const response = await fetch(`/api/transactions?address=${address}`);
            console.log('Response status:', response.status);

            if (!response.ok) {
              const errorText = await response.text().catch(() => 'Could not read error response');
              console.error('API response error:', {
                status: response.status,
                statusText: response.statusText,
                errorText: errorText,
                url: response.url
              });

              // Don't throw for 404 or empty responses, just set empty data
              if (response.status === 404) {
                console.log('No transactions found for address');
                setActivityData([]);
                return;
              }

              throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            let data;
            try {
              data = await response.json();
              console.log('Activity data received:', data);
            } catch (jsonError) {
              console.error('Error parsing JSON response:', jsonError);
              const textResponse = await response.text();
              console.error('Raw response:', textResponse);
              setActivityData([]);
              return;
            }

            if (!data || !Array.isArray(data.transactions)) {
              console.warn('Invalid data format received:', data);
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
                  network: 'Base',
                  txHash: tx.txnhash
                };
              } catch (mapError) {
                console.error('Error mapping transaction:', tx, mapError);
                return null;
              }
            }).filter(Boolean); // Remove any null entries from mapping errors

            setActivityData(formattedActivity);
          } else {
            console.log('No accounts found, skipping activity data fetch');
            setActivityData([]);
          }
        } catch (error) {
          console.error('Error fetching activity data:', error);
          console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace',
            type: typeof error,
            error: JSON.stringify(error, null, 2)
          });
          setActivityData([]); // Set empty data on error to prevent UI issues
        } finally {
          setIsLoadingActivity(false);
        }
      } else {
        console.log('No ethereum provider found, skipping activity data fetch');
        setActivityData([]);
      }
    };

    fetchActivityData();
  }, []);

  // Fetch GoodDollar price from Coingecko
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

  // Update the openPlanDetails function to use the Plan type
  const openPlanDetails = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  // Add a new function to handle top-up
  const openTopUpModal = (e: React.MouseEvent, plan: Plan) => {
    e.stopPropagation(); // Prevent the card click event from firing
    setTopUpPlan(plan);
    setIsTopUpModalOpen(true);
  };

  return (
    <div className={`${exo.className} min-h-screen bg-gradient-to-b from-gray-50 to-gray-100`}>
      {/* Network Detection Component */}
      <NetworkDetection />

      {/* Decorative elements */}
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-[#81D7B4]/10 rounded-full blur-3xl"></div>
      <div className="fixed -bottom-40 -left-40 w-96 h-96 bg-[#81D7B4]/10 rounded-full blur-3xl"></div>
      <div className="fixed top-1/4 left-1/3 w-64 h-64 bg-[#81D7B4]/5 rounded-full blur-3xl"></div>

      {/* Noise texture removed per redesign spec */}

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 relative z-10 space-y-10">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-2">Your Savings Plans</h1>
          <p className="text-gray-600 max-w-2xl">Track and manage your savings goals. Create new plans or contribute to existing ones to reach your financial targets faster.</p>
        </div>

        {/* Create New Plan Button */}
        <div className="mb-8">
          <Link href="/dashboard/create-savings">
            <button className="bg-[#81D7B4] text-white font-medium py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center">
              <HiOutlinePlus className="w-5 h-5 mr-2" />
              Create New Savings Plan
            </button>
          </Link>
        </div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savingsData.currentPlans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group"
                onClick={() => openPlanDetails(plan)}
              >
                <div className="relative bg-gradient-to-br from-white via-white to-[#81D7B4]/10 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 h-full p-6 overflow-hidden">
                  {/* Noise Texture Overlay */}
                  <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#81D7B4]/10 flex items-center justify-center border border-[#81D7B4]/20">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-[#81D7B4]">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-lg">{plan.name}</h3>
                        <p className="text-xs text-gray-500">Started {formatTimestamp(plan.startTime)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                        <Image src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')} alt={plan.isEth ? 'ETH' : (plan.tokenName || 'Token')} width={16} height={16} className="w-4 h-4 mr-2" />
                        <span className="text-xs font-medium text-gray-700">
                          {plan.isEth ? 'ETH' : plan.tokenName === 'cUSD' ? 'cUSD' : plan.tokenName === 'Gooddollar' ? '$G' : plan.tokenName}
                        </span>
                      </div>
                      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                        <Image
                          src={
                            plan.network === 'Base' ? '/base.svg' :
                              plan.network === 'Celo' ? '/celo.png' :
                                plan.network === 'Lisk' ? '/lisk.png' :
                                  '/default-network.png'
                          }
                          alt={plan.network || 'Network'}
                          width={16}
                          height={16}
                          className="w-4 h-4 mr-2"
                        />
                        <span className="text-xs font-medium text-gray-700">
                          {plan.network || 'Network'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-1">Current Amount</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-medium text-gray-900">
                        {plan.isEth ? (
                          <>{parseFloat(plan.currentAmount).toFixed(4)}</>
                        ) : plan.isGToken ? (
                          <>{parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</>
                        ) : plan.isUSDGLO ? (
                          <>${Number(ethers.formatUnits(plan.currentAmount.split('.')[0], 18)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
                        ) : (
                          <>${parseFloat(plan.currentAmount).toFixed(2)}</>
                        )}
                      </span>
                      <span className="text-sm font-medium text-gray-500">
                        {plan.isEth ? 'ETH' : plan.tokenName}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium text-gray-900">{plan.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#81D7B4] rounded-full"
                        style={{ width: `${plan.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">End Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatTimestamp(plan.maturityTime)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <p className="text-sm font-medium text-[#81D7B4]">Active</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className="px-4 py-2.5 text-sm font-medium text-white bg-[#81D7B4] rounded-xl hover:shadow-md transition-all"
                      onClick={(e) => openTopUpModal(e, plan)}
                    >
                      Top Up
                    </button>
                    <button
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPlanDetails(plan);
                      }}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Empty state card with neomorphism */}
            {savingsData.currentPlans.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="group"
              >
                <Link href="/dashboard/create-savings">
                  <div className="relative bg-white rounded-2xl border border-dashed border-gray-300 hover:border-[#81D7B4] shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col items-center justify-center p-8 text-center group-hover:bg-gray-50/50">
                    <div className="bg-[#81D7B4]/10 rounded-full p-4 mb-4 group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-[#81D7B4]">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Plan</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-xs">Start a new savings goal and track your progress towards financial freedom</p>
                    <div className="bg-[#81D7B4] text-white font-medium py-2.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-sm">
                      Get Started
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        )}

        {/* Completed Plans Section */}
        {savingsData.completedPlans.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Completed Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savingsData.completedPlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="group"
                  onClick={() => openPlanDetails(plan)}
                >
                  <div className="relative bg-gradient-to-br from-white via-white to-[#81D7B4]/10 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 h-full p-6 overflow-hidden">
                    {/* Noise Texture Overlay */}
                    <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#81D7B4] rounded-t-2xl"></div>

                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#81D7B4]/10 flex items-center justify-center border border-[#81D7B4]/20">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-[#81D7B4]">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-lg">{plan.name}</h3>
                          <div className="flex gap-2 text-xs text-gray-500">
                            <span>Started: {formatTimestamp(plan.startTime)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center bg-green-50 rounded-lg px-3 py-1.5 border border-green-100">
                        <span className="text-xs font-medium text-green-700">Completed</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-xs text-gray-500 mb-1">Final Amount</p>
                      <p className="text-2xl font-medium text-gray-900">
                        {plan.isEth ? `${parseFloat(plan.currentAmount).toFixed(4)} ETH` : `$${parseFloat(plan.currentAmount).toFixed(2)}`}
                      </p>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium text-[#81D7B4]">100%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#81D7B4] rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>

                    <button className="w-full bg-[#81D7B4] text-white font-medium py-3 rounded-xl hover:shadow-md transition-all text-sm">
                      Withdraw Funds
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Section with Neomorphism */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Savings Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Total Saved Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="bg-[#81D7B4]/10 rounded-xl p-3 mr-4">
                  <HiOutlineBanknotes className="w-6 h-6 text-[#81D7B4]" />
                </div>
                <h3 className="font-medium text-gray-900 text-lg">Total Saved</h3>
              </div>

              <p className="text-4xl font-medium text-gray-900 mb-2">${savingsData.totalLocked}</p>
              <p className="text-sm text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-1 text-[#81D7B4]">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Across all savings plans
              </p>
            </div>

            {/* Total Goals Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="bg-[#81D7B4]/10 rounded-xl p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-[#81D7B4]">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 text-lg">Active Goals</h3>
              </div>

              <p className="text-4xl font-medium text-gray-900 mb-2">{savingsData.currentPlans.length}</p>
              <p className="text-sm text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-1 text-[#81D7B4]">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {savingsData.currentPlans.length > 0 ? `${savingsData.currentPlans.length} active plans` : 'No active plans'}
              </p>
            </div>
          </div>
        </div>

        {/* Activity History Section */}
        <div className="mt-12 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Recent Activity</h2>
            <button
              onClick={() => setShowActivityHistory(!showActivityHistory)}
              className="bg-white/70 backdrop-blur-sm text-gray-800 font-normal py-2 px-4 rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 text-sm flex items-center"
            >
              {showActivityHistory ? 'Hide' : 'Show'} Activity
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={`w-4 h-4 ml-2 transition-transform ${showActivityHistory ? 'rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <AnimatePresence>
            {showActivityHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] p-6">
                  {isLoadingActivity ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex items-center space-x-4">
                          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activityData.length > 0 ? (
                    <div className="space-y-4">
                      {activityData.slice(0, 5).map((activity, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white/40"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${activity.type === 'deposit' ? 'bg-green-100 text-green-600' :
                              activity.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                                'bg-[#81D7B4]/20 text-[#81D7B4]'
                              }`}>
                              {activity.type === 'deposit' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              ) : activity.type === 'withdrawal' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-normal text-gray-800">{activity.description}</p>
                              <p className="text-sm text-gray-500">{activity.timestamp}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${activity.type === 'deposit' ? 'text-green-600' :
                              activity.type === 'withdrawal' ? 'text-red-600' :
                                'text-gray-800'
                              }`}>
                              {activity.amount}
                            </p>
                            <p className="text-sm text-gray-500">{activity.network}</p>
                          </div>
                        </motion.div>
                      ))}
                      <div className="text-center pt-4">
                        <Link href="/dashboard/activity">
                          <button className="text-[#81D7B4] hover:text-[#81D7B4]/80 font-normal text-sm transition-colors">
                            View All Activity →
                          </button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No Activity Yet</h3>
                      <p className="text-gray-500">Your savings activity will appear here once you start making deposits or withdrawals.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


      </div>

      {/* Plan Details Modal */}
      {selectedPlan && (
        <WithdrawModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          planName={selectedPlan.name}
          isEth={selectedPlan.isEth}
          penaltyPercentage={selectedPlan.penaltyPercentage}
          tokenName={selectedPlan.tokenName}
          isCompleted={new Date().getTime() >= selectedPlan.maturityTime * 1000}
        />
      )}

      {/* TopUpModal component */}
      {isTopUpModalOpen && topUpPlan && (
        <TopUpModal
          isOpen={isTopUpModalOpen}
          onClose={() => setIsTopUpModalOpen(false)}
          planName={topUpPlan.name}
          planId={topUpPlan.address}
          isEth={topUpPlan.isEth}
          tokenName={topUpPlan.tokenName}
          networkLogos={networkLogos}
        />
      )}
    </div>
  )
}