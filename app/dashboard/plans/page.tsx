'use client'

import { useState, useEffect } from 'react';
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
  }>>([]);
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
                console.error('Error mapping transaction:', mapError);
                return null;
              }
            }).filter(Boolean);

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
            <button className="bg-[#81D7B4] text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-[#81D7B4]/20 hover:shadow-[#81D7B4]/30 hover:bg-[#6BC4A0] transition-all duration-300 flex items-center whitespace-nowrap">
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
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="relative bg-gradient-to-br from-white via-white to-[#81D7B4]/10 rounded-3xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group overflow-hidden"
                >
                  {/* Noise Texture Overlay */}
                  <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

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
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="relative bg-gradient-to-br from-white via-white to-[#81D7B4]/10 rounded-3xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group overflow-hidden"
                    >
                      {/* Noise Texture Overlay */}
                      <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

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
                        {/* Completed Badge */}
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
                </div>
              </div>
            )}

            {/* Activity History Section */}
            <div className="pt-8 border-t border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Activity History</h2>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {isLoadingActivity ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-[#81D7B4] rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading activity...</p>
                  </div>
                ) : activityData.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {activityData.map((activity, index) => (
                      <div key={index} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            activity.type === 'deposit' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-orange-100 text-orange-600'
                          }`}>
                            {activity.type === 'deposit' ? (
                              <HiOutlinePlus className="w-5 h-5" />
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
                              activity.type === 'deposit' 
                                ? 'text-green-600' 
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
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No activity yet</h3>
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
        planId={withdrawModal.planId}
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
