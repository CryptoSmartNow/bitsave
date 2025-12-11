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
import { HiOutlinePlus, HiOutlineBanknotes, HiOutlineEye } from 'react-icons/hi2';
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
    <div className={`${exo.className} pb-20`}>
      {/* Network Detection Component */}
      <NetworkDetection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Your Savings Plans</h1>
            <p className="text-gray-500 max-w-2xl">Track and manage your savings goals. Create new plans or contribute to existing ones.</p>
          </div>
          <Link href="/dashboard/create-savings">
            <button className="bg-[#81D7B4] text-[#0F1825] font-bold py-3 px-6 rounded-xl shadow-lg shadow-[#81D7B4]/20 hover:shadow-[#81D7B4]/30 hover:bg-[#6BC4A0] transition-all duration-300 flex items-center whitespace-nowrap">
              <HiOutlinePlus className="w-5 h-5 mr-2" />
              Create New Plan
            </button>
          </Link>
        </div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-50 rounded-2xl h-[300px]"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Active Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savingsData.currentPlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-105 transition-transform duration-300">
                        <Image
                          src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')}
                          alt={plan.isEth ? 'ETH' : (plan.tokenName || 'Token')}
                          width={28}
                          height={28}
                          className="object-contain"
                        />
                      </div>
                      {/* Title & Date */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight line-clamp-1">{plan.name}</h3>
                        <p className="text-xs font-medium text-gray-400">
                          Started {new Date(Number(plan.startTime) * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    {/* Top Up Button */}
                    <button
                      onClick={(e) => openTopUpModal(e, plan)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#81D7B4]/10 text-[#81D7B4] text-xs font-bold hover:bg-[#81D7B4]/20 transition-colors"
                    >
                      <HiOutlinePlus className="w-3.5 h-3.5" />
                      Top Up
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-gray-50 mb-6"></div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">
                      {plan.isEth ? (
                        parseFloat(plan.currentAmount).toFixed(4)
                      ) : plan.isGToken ? (
                        parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
                      ) : plan.isUSDGLO ? (
                        Number(ethers.formatUnits(plan.currentAmount.split('.')[0], 18)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      ) : (
                        parseFloat(plan.currentAmount).toFixed(2)
                      )}
                    </span>
                    <span className="text-sm font-medium text-gray-400 mt-1">
                      {plan.isEth ? 'ETH' : plan.tokenName}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-gray-50 rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full bg-[#81D7B4] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${plan.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>

                  {/* Footer Info */}
                  <div className="flex justify-between items-center text-xs font-medium text-gray-400 mb-6">
                    <span className="text-gray-500">{Math.round(plan.progress)}% Saved</span>
                    <span>
                      {(() => {
                        const now = Math.floor(Date.now() / 1000);
                        const end = Number(plan.maturityTime || 0);
                        const diff = end - now;
                        if (diff <= 0) return "Completed";
                        const days = Math.ceil(diff / (60 * 60 * 24));
                        return `${days} Days Left`;
                      })()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => openPlanDetails(plan)}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 hover:text-gray-900 transition-all"
                    >
                      <HiOutlineEye className="w-4 h-4" />
                      Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPlanDetails(plan);
                      }}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#81D7B4] text-[#81D7B4] font-semibold text-sm hover:bg-[#81D7B4]/5 transition-all"
                    >
                      <HiOutlineBanknotes className="w-4 h-4" />
                      Withdraw
                    </button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savingsData.completedPlans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-gray-100">
                            <Image
                              src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')}
                              alt={plan.isEth ? 'ETH' : (plan.tokenName || 'Token')}
                              width={28}
                              height={28}
                              className="object-contain opacity-50 grayscale"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-700 line-clamp-1">{plan.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                                Completed
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Final Amount</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-700">
                            {plan.isEth ? parseFloat(plan.currentAmount).toFixed(4) : parseFloat(plan.currentAmount).toFixed(2)}
                          </span>
                          <span className="text-sm font-medium text-gray-400">
                            {plan.isEth ? 'ETH' : plan.tokenName}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => openPlanDetails(plan)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold text-sm hover:text-gray-900 hover:border-gray-300 transition-all"
                      >
                        <HiOutlineBanknotes className="w-4 h-4" />
                        View Details
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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