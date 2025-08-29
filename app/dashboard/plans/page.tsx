'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Space_Grotesk } from 'next/font/google';
import Link from 'next/link';
import WithdrawModal from '@/components/WithdrawModal';
import TopUpModal from '@/components/TopUpModal';
import { ethers } from 'ethers';
import { useSavingsData } from '@/hooks/useSavingsData';

// Initialize the Space Grotesk font
const spaceGrotesk = Space_Grotesk({
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
  if (tokenName === 'USDC') return '/usdc.png';
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

  // Use the new caching hook for savings data
  const { savingsData, isLoading, isCorrectNetwork, ethPrice } = useSavingsData()

  // Fetch user activity data
  useEffect(() => {
    const fetchActivityData = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          setIsLoadingActivity(true);
          const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
          if (accounts.length > 0) {
            const response = await fetch(`/api/transactions?address=${accounts[0]}`);
            if (response.ok) {
              const data = await response.json();
              const transactions = data.transactions || [];
              
              // Transform transaction data for display
              const formattedActivity = transactions.map((tx: {
                transaction_type: string;
                savingsname: string;
                amount: string;
                currency?: string;
                created_at: string;
                txnhash: string;
              }) => ({
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
              }));
              
              setActivityData(formattedActivity);
            }
          }
        } catch (error) {
          console.error('Error fetching activity data:', error);
        } finally {
          setIsLoadingActivity(false);
        }
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
    <div className={`${spaceGrotesk.className} min-h-screen bg-gradient-to-b from-gray-50 to-gray-100`}>
      {/* Decorative elements */}
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-[#81D7B4]/10 rounded-full blur-3xl"></div>
      <div className="fixed -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="fixed top-1/4 left-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>

      {/* Noise texture */}
      <div className="fixed inset-0 bg-[url('/noise.jpg')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Your Savings Plans</h1>
          <p className="text-gray-600 max-w-2xl">Track and manage your savings goals. Create new plans or contribute to existing ones to reach your financial targets faster.</p>
        </div>

        {/* Network Warning */}
        {!isCorrectNetwork && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Please connect to Base or Celo network to view your savings plans.</span>
            </div>
          </div>
        )}

        {/* Create New Plan Button */}
        <div className="mb-8">
          <Link href="/dashboard/create-savings">
            <button className="bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/90 text-white font-medium py-3 px-6 rounded-xl shadow-[0_4px_10px_rgba(129,215,180,0.3)] hover:shadow-[0_6px_15px_rgba(129,215,180,0.4)] transition-all duration-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Savings Plan
            </button>
          </Link>
        </div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                {/* Glassmorphism Card */}
                <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-300 group-hover:shadow-[0_15px_35px_-15px_rgba(0,0,0,0.25)] h-full">
                  {/* Card inner shadow for neomorphism effect */}
                  <div className="absolute inset-0 rounded-2xl shadow-inner pointer-events-none"></div>

                  {/* Subtle noise texture */}
                  <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

                  {/* Decorative accent */}
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#81D7B4]/10 rounded-full blur-2xl"></div>

                  <div className="p-6 relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="bg-[#81D7B4]/20 rounded-full p-2.5 mr-3 border border-[#81D7B4]/30">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-[#81D7B4]">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{plan.name}</h3>
                          <p className="text-xs text-gray-500">{new Date(plan.startTime * 1000).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/60 shadow-sm">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/20 text-[#163239] text-xs font-medium shadow-sm">
                          <img src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')} alt={plan.isEth ? 'ETH' : plan.tokenName} className="w-4 h-4 mr-1" />
                          {plan.isEth ? 'ETH' : plan.tokenName === 'cUSD' ? 'cUSD' : plan.tokenName === 'Gooddollar' ? '$G' : plan.tokenName}
                          <span className="mx-1 text-gray-400">|</span>
                          <img src={plan.network === 'Base' ? '/base.svg' : '/celo.png'} alt={plan.network} className="w-4 h-4 mr-1" />
                          {plan.network}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-end mb-1.5">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Current Amount</p>
                          <span className="text-base font-bold text-gray-900">
                            {plan.isEth ? (
                              <>{parseFloat(plan.currentAmount).toFixed(4)} <span className="text-xs font-medium text-gray-500 ml-1">ETH</span></>
                            ) : plan.isGToken ? (
                              <>{parseFloat(plan.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} <span className="text-xs font-medium text-gray-500 ml-1">$G</span> <span className="text-xs text-gray-400 ml-2">(${(parseFloat(plan.currentAmount) * goodDollarPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)</span></>
                            ) : plan.isUSDGLO ? (
                              <>${Number(ethers.formatUnits(plan.currentAmount.split('.')[0], 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-medium text-gray-500 ml-1">USDGLO</span></>
                            ) : plan.tokenName === 'cUSD' ? (
                              <>
                                ${parseFloat(plan.currentAmount).toFixed(2)} <span className="text-xs font-medium text-gray-500 ml-1">cUSD</span>
                              </>
                            ) : (
                              <>${parseFloat(plan.currentAmount).toFixed(2)} <span className="text-xs font-medium text-gray-500 ml-1">{plan.tokenName}</span></>
                            )}
                          </span>
                          {plan.isEth && (
                            <p className="text-xs text-gray-500">
                              ≈ ${(parseFloat(plan.currentAmount) * ethPrice).toFixed(2)}
                            </p>
                          )}
                        </div>
                        {/* Target display removed */}
                      </div>

                      {/* Progress bar with neomorphism effect */}
                      <div className="relative h-2.5 bg-white rounded-full overflow-hidden mb-1.5 shadow-inner">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/80 rounded-full shadow-[0_0_6px_rgba(129,215,180,0.5)]"
                          style={{ width: `${plan.progress}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">{plan.progress}% Complete</span>
                        <span className="text-[#81D7B4] font-medium">Matures: {new Date(plan.maturityTime * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        className="flex-1 bg-white/70 backdrop-blur-sm text-gray-800 font-medium py-2 rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 text-sm flex items-center justify-center"
                        onClick={(e) => openTopUpModal(e, plan)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-600">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Top Up
                      </button>
                      <button
                        className="flex-1 bg-gradient-to-r from-[#81D7B4]/90 to-[#81D7B4]/80 text-white font-medium py-2 rounded-xl shadow-[0_2px_8px_rgba(129,215,180,0.3)] hover:shadow-[0_4px_12px_rgba(129,215,180,0.4)] transition-all duration-300 text-sm flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-1.5 text-white">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Withdraw
                      </button>
                    </div>
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
                <Link href="dashboard/create-savings">
                  <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300/80 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-300 group-hover:shadow-[0_15px_35px_-15px_rgba(0,0,0,0.15)] h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-[#81D7B4]/10 rounded-full p-4 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-[#81D7B4]">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Create New Plan</h3>
                    <p className="text-gray-600 text-sm mb-4">Start a new savings goal and track your progress</p>
                    <div className="bg-gradient-to-r from-[#81D7B4]/90 to-[#81D7B4]/80 text-white font-medium py-2 px-4 rounded-xl shadow-[0_2px_8px_rgba(129,215,180,0.3)] hover:shadow-[0_4px_12px_rgba(129,215,180,0.4)] transition-all duration-300 text-sm">
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
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Completed Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-300 group-hover:shadow-[0_15px_35px_-15px_rgba(0,0,0,0.25)] h-full">
                    <div className="absolute inset-0 rounded-2xl shadow-inner pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>

                    <div className="p-6 relative">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="bg-purple-100 rounded-full p-2.5 mr-3 border border-purple-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-purple-500">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">{plan.name}</h3>
                            <p className="text-xs text-gray-500">Completed on {new Date(plan.maturityTime * 1000).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/60 shadow-sm">
                          <img src={plan.isEth ? '/eth.svg' : '/usdc.svg'} alt={plan.isEth ? 'Ethereum' : 'USDC'} className="w-3.5 h-3.5 mr-1.5" />
                          <span className="text-xs font-medium text-gray-700">{plan.isEth ? 'ETH' : 'USDC'}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between items-end mb-1.5">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Final Amount</p>
                            <p className="text-2xl font-bold text-gray-800">
                              {plan.isEth ? `${parseFloat(plan.currentAmount).toFixed(4)} ETH` : `$${parseFloat(plan.currentAmount).toFixed(2)}`}
                            </p>
                          </div>
                        </div>

                        <div className="relative h-2.5 bg-white rounded-full overflow-hidden mb-1.5 shadow-inner">
                          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full shadow-[0_0_6px_rgba(168,85,247,0.5)]" style={{ width: '100%' }}></div>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">100% Complete</span>
                          <span className="text-purple-500 font-medium">Ready to withdraw</span>
                        </div>
                      </div>

                      <button className="w-full bg-gradient-to-r from-purple-500/90 to-purple-600/80 text-white font-medium py-2 rounded-xl shadow-[0_2px_8px_rgba(168,85,247,0.3)] hover:shadow-[0_4px_12px_rgba(168,85,247,0.4)] transition-all duration-300 text-sm">
                        Withdraw Funds
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Section with Neomorphism */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Savings Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Saved Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>

              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full p-2.5 mr-3 border border-blue-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-blue-500">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800">Total Saved</h3>
              </div>

              <p className="text-3xl font-bold text-gray-800 mb-1">${savingsData.totalLocked}</p>
              <p className="text-sm text-blue-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Across all savings plans
              </p>
            </div>

            {/* Total Goals Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>

              <div className="flex items-center mb-4">
                <div className="bg-purple-100 rounded-full p-2.5 mr-3 border border-purple-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-purple-500">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800">Active Goals</h3>
              </div>

              <p className="text-3xl font-bold text-gray-800 mb-1">{savingsData.currentPlans.length}</p>
              <p className="text-sm text-purple-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {savingsData.currentPlans.length > 0 ? `${savingsData.currentPlans.length} active plans` : 'No active plans'}
              </p>
            </div>

            {/* Rewards Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#81D7B4]/10 rounded-full blur-2xl"></div>

              <div className="flex items-center mb-4">
                <div className="bg-[#81D7B4]/20 rounded-full p-2.5 mr-3 border border-[#81D7B4]/30">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-[#81D7B4]">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800">Total Deposits</h3>
              </div>

              <p className="text-3xl font-bold text-gray-800 mb-1">{savingsData.deposits}</p>
              <p className="text-sm text-[#81D7B4] flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {savingsData.deposits > 0 ? `${savingsData.deposits} total deposits` : 'No deposits yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Activity History Section */}
        <div className="mt-12 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
            <button
              onClick={() => setShowActivityHistory(!showActivityHistory)}
              className="bg-white/70 backdrop-blur-sm text-gray-800 font-medium py-2 px-4 rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 text-sm flex items-center"
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
                            <div className={`p-2 rounded-full ${
                              activity.type === 'deposit' ? 'bg-green-100 text-green-600' :
                              activity.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
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
                              <p className="font-medium text-gray-800">{activity.description}</p>
                              <p className="text-sm text-gray-500">{activity.timestamp}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${
                              activity.type === 'deposit' ? 'text-green-600' :
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
                          <button className="text-[#81D7B4] hover:text-[#81D7B4]/80 font-medium text-sm transition-colors">
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

        {/* Tips Section */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Savings Tips</h2>
          <div className="bg-gradient-to-br from-[#81D7B4]/10 to-blue-500/5 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-sm">
            <div className="flex items-start mb-4">
              <div className="bg-[#81D7B4]/20 rounded-full p-2.5 mr-4 border border-[#81D7B4]/30 flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-[#81D7B4]">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">Build Your Financial Safety Net</h3>
                <p className="text-gray-600">Every dollar saved today is peace of mind for tomorrow. Consistent saving creates a buffer against life&apos;s uncertainties while helping you achieve your most important goals.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-2.5 mr-4 border border-blue-200 flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">Spread Your Financial Wings</h3>
                <p className="text-gray-600">Diversifying across assets and networks reduces risk while maximizing potential returns. A balanced savings portfolio protects you against market volatility.</p>
              </div>
            </div>
          </div>
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
        />
      )}
    </div>
  )
}