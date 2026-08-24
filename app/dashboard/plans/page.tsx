'use client';

import { PlusSignIcon, Money01Icon, ViewIcon, Activity01Icon, Dollar01Icon, PieChartIcon, UserMultipleIcon, Tick01Icon, LinkSquare01Icon, ArrowUp01Icon, ArrowDown01Icon, Cancel01Icon, ArrowUpRight01Icon, Copy01Icon } from "hugeicons-react";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exo } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
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
import { useAccount } from 'wagmi';

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

interface ActivityItem {
  id: string;
  name: string;
  planName: string;
  token: string;
  isEth: boolean;
  tokenLogo: string;
  date: string;
  time: string;
  fullDate: string;
  status: string;
  badgeStyle: string;
  amountPrefix: string;
  amountValue: string;
  displayAmount: string;
  type: string;
  chain: string;
  txHash: string | null;
  explorerUrl: string | null;
  subtitle: string;
  rawDate?: Date;
}

// Chain metadata configuration
const CHAIN_METADATA: Record<string, { name: string; logo: string; color: string; badge: string }> = {
  base: { name: 'Base Network', logo: '/base-logo.svg', color: '#0052FF', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  celo: { name: 'Celo Network', logo: '/celo.png', color: '#35D07F', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  lisk: { name: 'Lisk Network', logo: '/lisk-logo.png', color: '#002E74', badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  bsc: { name: 'BNB Smart Chain', logo: '/bsc.png', color: '#F3BA2F', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  avalanche: { name: 'Avalanche C-Chain', logo: '/avalanche-logo.svg', color: '#E84142', badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

// Helper to get logo for a token
function getTokenLogo(tokenName: string, tokenLogo?: string) {
  if (tokenLogo && !tokenLogo.includes('gooddollar.png')) return tokenLogo;
  if (!tokenName) return '/coin.png';
  const lower = tokenName.toLowerCase();
  if (lower === 'cusd') return '/cusd.png';
  if (lower === 'cngn') return '/cngn.png';
  if (lower === 'usdglo') return '/usdglo.png';
  if (lower === 'gooddollar' || lower === '$g' || lower === 'g$') return '/$g.png';
  if (lower === 'usdc') return '/usdclogo.png';
  if (lower === 'eth' || lower === 'ethereum') return '/eth.png';
  if (lower === 'usdt') return '/usdt.png';
  if (lower === 'celo') return '/celo.png';
  if (lower === 'bnb' || lower === 'bsc') return '/bsc.png';
  if (lower === 'lisk' || lower === 'lsk') return '/lisk.png';
  return '/coin.png';
}

// Multi-chain explorer resolver
const getExplorerTxUrl = (networkName: string, txHash?: string) => {
  if (!txHash) return '#';
  const net = (networkName || 'base').toLowerCase();
  if (net.includes('celo')) return `https://celoscan.io/tx/${txHash}`;
  if (net.includes('lisk')) return `https://blockscout.lisk.com/tx/${txHash}`;
  if (net.includes('bsc') || net.includes('bnb') || net.includes('binance')) return `https://bscscan.com/tx/${txHash}`;
  if (net.includes('avalanche') || net.includes('avax')) return `https://snowtrace.io/tx/${txHash}`;
  return `https://basescan.org/tx/${txHash}`;
};

export default function PlansPage() {
  const [goodDollarPrice, setGoodDollarPrice] = useState(0.0001086);
  const [activityData, setActivityData] = useState<ActivityItem[]>([]);
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

  const [selectedTxForDetails, setSelectedTxForDetails] = useState<any | null>(null);

  // Use the new caching hook for savings data
  const { savingsData, isLoading, ethPrice } = useSavingsData()

  // Separate active, matured (ready to withdraw), and historical withdrawn plans
  const activePlans = useMemo(() => {
    return savingsData.currentPlans.filter(p => !p.isWithdrawn && p.status !== 'Withdrawn' && parseFloat(p.currentAmount || '0') > 0.0001);
  }, [savingsData.currentPlans]);

  const maturedPlans = useMemo(() => {
    return savingsData.completedPlans.filter(p => !p.isWithdrawn && p.status !== 'Withdrawn' && parseFloat(p.currentAmount || '0') > 0.0001);
  }, [savingsData.completedPlans]);

  const withdrawnPlans = useMemo(() => {
    return savingsData.completedPlans.filter(p => p.isWithdrawn || p.status === 'Withdrawn');
  }, [savingsData.completedPlans]);

  // Group plans by chain helper
  const groupPlansByChain = useCallback((plans: any[]) => {
    const groups: { [key: string]: { meta: typeof CHAIN_METADATA[string]; plans: any[]; totalUsd: number } } = {};
    
    plans.forEach(plan => {
      const rawChain = (plan.network || 'celo').toLowerCase();
      const chainKey = CHAIN_METADATA[rawChain] ? rawChain : 'celo';
      if (!groups[chainKey]) {
        groups[chainKey] = {
          meta: CHAIN_METADATA[chainKey] || { name: chainKey.toUpperCase(), logo: '/coin.png', color: '#81D7B4', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
          plans: [],
          totalUsd: 0
        };
      }
      groups[chainKey].plans.push(plan);
      
      const amount = parseFloat(plan.currentAmount || '0');
      if (!isNaN(amount)) {
        let usd = amount;
        if (plan.isEth || plan.tokenName === 'ETH') usd = amount * (ethPrice || 3500);
        else if (plan.tokenName === 'Gooddollar' || plan.tokenName === '$G') usd = amount * 0.0001086;
        groups[chainKey].totalUsd += usd;
      }
    });

    return Object.entries(groups).map(([key, value]) => ({
      key,
      meta: value.meta,
      plans: value.plans,
      totalUsd: value.totalUsd
    }));
  }, [ethPrice]);

  const activeGrouped = useMemo(() => groupPlansByChain(activePlans), [activePlans, groupPlansByChain]);
  const maturedGrouped = useMemo(() => groupPlansByChain(maturedPlans), [maturedPlans, groupPlansByChain]);
  const withdrawnGrouped = useMemo(() => groupPlansByChain(withdrawnPlans), [withdrawnPlans, groupPlansByChain]);

  // Withdrawn Plans UX states: collapsible, chain tab filtering, and pagination
  const [isWithdrawnCollapsed, setIsWithdrawnCollapsed] = useState(false);
  const [withdrawnChainTab, setWithdrawnChainTab] = useState('all');
  const [withdrawnPage, setWithdrawnPage] = useState(1);
  const withdrawnItemsPerPage = 6;

  // Reset pagination when chain tab changes
  useEffect(() => {
    setWithdrawnPage(1);
  }, [withdrawnChainTab]);

  // Available chains with counts for Withdrawn Savings
  const availableWithdrawnChains = useMemo(() => {
    return Object.entries(CHAIN_METADATA).map(([key, meta]) => {
      const match = withdrawnGrouped.find((g: any) => g.key === key);
      return {
        key,
        name: meta.name,
        logo: meta.logo,
        count: match ? match.plans.length : 0
      };
    }).filter(c => c.count > 0);
  }, [withdrawnGrouped]);

  // Filtered withdrawn groups according to selected chain tab
  const displayedWithdrawnGroups = useMemo(() => {
    if (withdrawnChainTab === 'all') return withdrawnGrouped;
    return withdrawnGrouped.filter((g: any) => g.key === withdrawnChainTab);
  }, [withdrawnGrouped, withdrawnChainTab]);

  // Calculate dynamic stats based on live active savings
  const stats = useMemo(() => {
    let totalUsd = 0;
    activePlans.forEach((plan) => {
      const amount = parseFloat(plan.currentAmount || '0');
      if (!isNaN(amount)) {
        if (plan.isEth || plan.tokenName === 'ETH') totalUsd += amount * (ethPrice || 3500);
        else if (plan.tokenName === 'Gooddollar' || plan.tokenName === '$G') totalUsd += amount * 0.0001086;
        else totalUsd += amount;
      }
    });

    const activeCount = activePlans.length;
    const rewards = (totalUsd * 0.005 * 1000).toFixed(0);

    return {
      activeCount,
      totalLocked: totalUsd.toFixed(2),
      rewards: Number(rewards).toLocaleString(),
    };
  }, [activePlans, ethPrice]);

  useEffect(() => {
    const loadNetworkLogos = async () => {
      try {
        const logos = await fetchMultipleNetworkLogos(['base', 'celo', 'lisk', 'avalanche', 'bsc']);
        setNetworkLogos(logos);
      } catch (error) {
        console.error('Error fetching network logos:', error);
      }
    };

    loadNetworkLogos();
  }, []);

  const { address } = useAccount();

  // Fetch real user activity data
  useEffect(() => {
    const fetchActivityData = async () => {
      if (!address) {
        setActivityData([]);
        return;
      }

      setIsLoadingActivity(true);
      try {
        let localTxs: any[] = [];
        try {
          const stored = localStorage.getItem(`bitsave_txs_${address.toLowerCase()}`);
          if (stored) localTxs = JSON.parse(stored);
        } catch {}

        let serverTxs: any[] = [];
        try {
          const res = await fetch(`/api/transactions?address=${address}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.transactions)) serverTxs = data.transactions;
          }
        } catch {}

        const combined = [...localTxs, ...serverTxs];
        const seen = new Set<string>();
        const formattedActivity: any[] = [];

        combined.forEach((tx: any) => {
          const key = (tx.txnhash || tx.id || tx.txHash || '').toLowerCase();
          if (key && seen.has(key)) return;
          if (key) seen.add(key);

          const rawType = (tx.transaction_type || tx.type || 'deposit').toLowerCase();
          const isWithdrawal = rawType.includes('withdraw');
          const isTopUp = rawType.includes('topup') || rawType.includes('top_up');
          const finalType = isWithdrawal ? 'withdrawal' : isTopUp ? 'topup' : 'deposit';

          const dateObj = tx.created_at ? new Date(tx.created_at) : new Date();
          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          const fullDate = `${formattedDate} at ${formattedTime}`;

          const planName = tx.savingsname || tx.name || 'Vault';
          const description = isWithdrawal 
            ? `Withdrew from ${planName}` 
            : isTopUp 
            ? `Topped up ${planName}` 
            : `Deposited into ${planName}`;

          const token = (tx.currency || tx.tokenName || 'USDC').toUpperCase();
          const isEth = token === 'ETH' || Boolean(tx.isEth);
          const tokenLogo = tx.tokenLogo || getTokenLogo(token, '');
          const amountNum = parseFloat(tx.amount || '0');
          const amountValue = isNaN(amountNum) ? '0.00' : amountNum.toFixed(2);
          const chain = tx.chain || tx.network || 'Base';
          const txHash = tx.txnhash || tx.txHash || null;
          const explorerUrl = txHash ? getExplorerTxUrl(chain, txHash) : null;

          formattedActivity.push({
            id: tx.id || `tx-${txHash || Math.random()}`,
            name: description,
            planName,
            token,
            isEth,
            tokenLogo,
            date: formattedDate,
            time: formattedTime,
            fullDate,
            status: isWithdrawal ? 'WITHDRAWAL' : isTopUp ? 'TOPUP' : 'DEPOSIT',
            badgeStyle: isWithdrawal 
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20'
              : isTopUp
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-[#81D7B4] border border-emerald-200/60 dark:border-emerald-500/20',
            amountPrefix: isWithdrawal ? '-' : '+',
            amountValue,
            displayAmount: `${isWithdrawal ? '-' : '+'}$${amountValue}`,
            type: finalType,
            chain,
            txHash,
            explorerUrl,
            subtitle: `${chain} • ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${formattedTime}`,
            rawDate: dateObj
          });
        });

        // 4. Fallback to on-chain savings if no standalone transaction events recorded yet
        if (formattedActivity.length === 0) {
          (savingsData.completedPlans || []).forEach((plan: any) => {
            const dateObj = plan.maturityTime ? new Date(Number(plan.maturityTime) * 1000) : new Date();
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const token = (plan.tokenName || (plan.isEth ? 'ETH' : 'USDC')).toUpperCase();
            const isEth = token === 'ETH' || Boolean(plan.isEth);
            const amountNum = parseFloat(plan.currentAmount || plan.amount || '0');
            const amountValue = isNaN(amountNum) ? '0.00' : amountNum.toFixed(2);
            const chain = plan.network || 'Base';

            formattedActivity.push({
              id: `completed-${plan.id}`,
              name: `Withdrew from ${plan.name}`,
              planName: plan.name,
              token,
              isEth,
              tokenLogo: plan.tokenLogo || getTokenLogo(token, ''),
              date: formattedDate,
              time: formattedTime,
              fullDate: `${formattedDate} at ${formattedTime}`,
              status: 'WITHDRAWAL',
              badgeStyle: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20',
              amountPrefix: '-',
              amountValue,
              displayAmount: `-$${amountValue}`,
              type: 'withdrawal',
              chain,
              txHash: null,
              explorerUrl: null,
              subtitle: `${chain} • ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${formattedTime}`,
              rawDate: dateObj
            });
          });

          (savingsData.currentPlans || []).forEach((plan: any) => {
            const dateObj = plan.startTime ? new Date(Number(plan.startTime) * 1000) : new Date();
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const token = (plan.tokenName || (plan.isEth ? 'ETH' : 'USDC')).toUpperCase();
            const isEth = token === 'ETH' || Boolean(plan.isEth);
            const amountNum = parseFloat(plan.currentAmount || plan.amount || '0');
            const amountValue = isNaN(amountNum) ? '0.00' : amountNum.toFixed(2);
            const chain = plan.network || 'Base';

            formattedActivity.push({
              id: `active-${plan.id}`,
              name: `Deposited into ${plan.name}`,
              planName: plan.name,
              token,
              isEth,
              tokenLogo: plan.tokenLogo || getTokenLogo(token, ''),
              date: formattedDate,
              time: formattedTime,
              fullDate: `${formattedDate} at ${formattedTime}`,
              status: 'DEPOSIT',
              badgeStyle: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-[#81D7B4] border border-emerald-200/60 dark:border-emerald-500/20',
              amountPrefix: '+',
              amountValue,
              displayAmount: `+$${amountValue}`,
              type: 'deposit',
              chain,
              txHash: null,
              explorerUrl: null,
              subtitle: `Deposited into vault • ${formattedDate}`,
              rawDate: dateObj
            });
          });
        }

        formattedActivity.sort((a, b) => b.rawDate ? (b.rawDate.getTime() - a.rawDate.getTime()) : 0);
        setActivityData(formattedActivity);
      } catch (err) {
        console.error("Error fetching activity data:", err);
        setActivityData([]);
      } finally {
        setIsLoadingActivity(false);
      }
    };

    fetchActivityData();
    const handleTxUpdate = () => fetchActivityData();
    window.addEventListener('bitsave_tx_updated', handleTxUpdate);
    return () => window.removeEventListener('bitsave_tx_updated', handleTxUpdate);
  }, [address, savingsData]);

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
            <h1 className="text-[32px] font-instrument text-gray-900 dark:text-white mb-1 tracking-tight leading-none">Your Vaults</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track goals, top up balances, and monitor your yield.</p>
          </div>
          <Link href="/dashboard/create-savings">
            <button className="bg-[#81D7B4] text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-[#6BBF9E] transition-colors text-sm whitespace-nowrap shadow-sm">
              New Plan
            </button>
          </Link>
        </div>

        <div 
          className="rounded-[24px] p-8 border border-white/80 dark:border-white/10 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none bg-white/90 dark:bg-[#121212]/60 backdrop-blur-xl group"
        >
          {/* Subtle glow orb top-left */}
          <div className="pointer-events-none absolute -top-24 -left-24 w-64 h-64 rounded-full opacity-50 mix-blend-multiply dark:mix-blend-screen transition-transform duration-700 group-hover:scale-110" style={{ background: 'radial-gradient(circle, rgba(129,215,180,0.2) 0%, transparent 70%)' }} />
          {/* Subtle glow orb bottom-right */}
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-40 mix-blend-multiply dark:mix-blend-screen transition-transform duration-700 group-hover:scale-110" style={{ background: 'radial-gradient(circle, rgba(129,215,180,0.15) 0%, transparent 70%)' }} />
          
          {/* Minimal Dot Pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.12] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#81D7B4 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

          {/* Flowing Wave Pattern */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04] dark:opacity-[0.02] text-[#81D7B4] transition-opacity duration-700 group-hover:opacity-[0.06] dark:group-hover:opacity-[0.04]" preserveAspectRatio="none" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-50 100 C 100 -50, 300 250, 500 100 C 700 -50, 900 250, 1100 100" stroke="currentColor" strokeWidth="2" />
            <path d="M-50 120 C 100 -30, 300 270, 500 120 C 700 -30, 900 270, 1100 120" stroke="currentColor" strokeWidth="2" />
            <path d="M-50 140 C 100 -10, 300 290, 500 140 C 700 -10, 900 290, 1100 140" stroke="currentColor" strokeWidth="2" />
            <path d="M-50 160 C 100 10, 300 310, 500 160 C 700 10, 900 310, 1100 160" stroke="currentColor" strokeWidth="2" />
          </svg>

          {/* Giant Shadow Icon */}
          <div className="absolute -bottom-10 right-10 w-64 h-64 opacity-[0.02] dark:opacity-[0.01] group-hover:opacity-[0.04] dark:group-hover:opacity-[0.03] transition-all duration-700 pointer-events-none z-0 transform -rotate-12 group-hover:-rotate-6 group-hover:scale-105">
            <PieChartIcon className="w-full h-full text-[#81D7B4]" strokeWidth={1} />
          </div>

          {/* Content Layer */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 relative z-10">
            <div className="flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#81D7B4] shadow-[0_0_8px_rgba(129,215,180,0.8)] animate-pulse"></div>
                <p className="text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-widest" style={{ letterSpacing: '0.1em' }}>Active Plans</p>
              </div>
              <p className="text-3xl sm:text-[48px] font-instrument leading-none tracking-tight text-gray-900 dark:text-white">{stats.activeCount}</p>
            </div>

            <div className="flex flex-col justify-between">
              <p className="text-gray-400 dark:text-gray-500 text-[11px] font-bold mb-3 uppercase tracking-widest" style={{ letterSpacing: '0.1em' }}>Total Value</p>
              <p className="text-3xl sm:text-[48px] font-instrument leading-none tracking-tight text-gray-900 dark:text-white flex items-baseline gap-2">
                {parseFloat(stats.totalLocked).toLocaleString()} <span className="text-sm font-sans font-bold text-[#81D7B4] tracking-widest uppercase">USD</span>
              </p>
            </div>

            <div className="flex flex-col justify-between col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-gray-100/60 dark:border-white/5 pt-6 md:pt-0 md:pl-8">
              <p className="text-gray-400 dark:text-gray-500 text-[11px] font-bold mb-3 uppercase tracking-widest" style={{ letterSpacing: '0.1em' }}>Rewards Earned</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl sm:text-[48px] font-instrument leading-none tracking-tight text-gray-900 dark:text-white">{stats.rewards}</p>
                <span className="text-sm font-sans font-bold text-[#81D7B4] tracking-widest uppercase">$BTS</span>
              </div>
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
            {/* Active Plans Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[26px] font-instrument font-medium text-[#0f172a] dark:text-white tracking-tight">Active Savings</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ongoing plans actively accumulating rewards</p>
                </div>
                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                  {activePlans.length} {activePlans.length === 1 ? 'Plan' : 'Plans'}
                </span>
              </div>

              {activeGrouped.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <Link href="/dashboard/create-savings">
                    <div className="relative bg-white dark:bg-[#121212]/60 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-white/10 hover:border-[#81D7B4]/50 dark:hover:border-[#81D7B4]/50 transition-all duration-300 h-48 flex flex-col items-center justify-center p-6 text-center cursor-pointer group shadow-sm dark:shadow-none overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 opacity-[0.03] dark:opacity-[0.05] pointer-events-none z-0 transition-transform duration-500 group-hover:scale-110">
                        <PlusSignIcon className="w-full h-full text-[#81D7B4]" />
                      </div>
                      <div className="relative z-10 flex flex-col items-center">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Create New Plan</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-[13px] max-w-xs">Start a new savings goal and track your progress</p>
                        <div className="mt-4 px-4 py-2 bg-[#81D7B4]/10 text-[#81D7B4] rounded-lg text-xs font-semibold group-hover:bg-[#81D7B4] group-hover:text-white transition-colors">
                          Get Started
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ) : (
                activeGrouped.map((group: any) => (
                  <div key={group.key} className="space-y-4">
                    {/* Chain Section Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 p-1 flex items-center justify-center shadow-2xs">
                          <Image src={group.meta.logo} alt={group.meta.name} width={18} height={18} className="object-contain" />
                        </div>
                        <span className="font-bold text-sm text-gray-900 dark:text-white">{group.meta.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${group.meta.badge}`}>
                          {group.plans.length} {group.plans.length === 1 ? 'plan' : 'plans'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        ${group.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </span>
                    </div>

                    {/* Cards Grid */}
                    <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4 -mx-4 px-4 sm:pb-0 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {group.plans.map((plan: any) => {
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
                            className="bg-white dark:bg-[#121212]/60 backdrop-blur-xl rounded-[24px] border border-gray-100 dark:border-white/10 shadow-xs dark:shadow-none p-6 hover:shadow-xl dark:hover:bg-white/10/80 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden min-h-[260px] shrink-0 w-[85%] max-w-[320px] snap-center sm:w-auto sm:max-w-none sm:snap-align-none"
                          >
                            {/* Background Watermark */}
                            <div className="absolute -right-8 -bottom-8 w-48 h-48 opacity-[0.03] dark:opacity-[0.05] pointer-events-none grayscale dark:grayscale-0 mix-blend-multiply dark:mix-blend-screen z-0">
                              <Image src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')} alt={plan.name} fill className="object-contain" />
                            </div>

                            {/* Top: Icon & Status */}
                            <div className="flex items-center justify-between relative z-10 w-full mb-6">
                              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 shadow-inner dark:shadow-none group-hover:bg-[#81D7B4]/10 transition-colors">
                                <Image src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')} alt={plan.name} width={24} height={24} className="w-6 h-6 object-contain opacity-90 dark:opacity-100" />
                              </div>
                              <span className="text-[10px] text-[#81D7B4] font-bold tracking-widest uppercase bg-[#81D7B4]/10 dark:bg-[#81D7B4]/20 px-2.5 py-1.5 rounded-md">
                                {Number(plan.startTime) > 0 ? new Date(Number(plan.startTime) * 1000).toLocaleDateString() : 'Pending'}
                              </span>
                            </div>

                            {/* Middle: Plan Name & Huge Stats */}
                            <div className="relative z-10 flex-1 flex flex-col justify-center mb-6">
                              <h3 className="font-bold text-gray-400 dark:text-gray-500 text-[11px] tracking-widest uppercase mb-1">{plan.name}</h3>
                              <p className="font-instrument text-gray-900 dark:text-white text-[32px] leading-none tracking-tight">
                                {plan.isEth ? safeAmount.toFixed(4) : safeAmount.toLocaleString()}
                                <span className="text-lg font-sans font-bold text-gray-400 dark:text-gray-500 ml-1.5">{plan.isEth ? 'ETH' : plan.tokenName}</span>
                              </p>
                              <p className="text-[13px] font-bold text-[#81D7B4] mt-2">
                                +{reward} <span className="text-[11px] text-[#81D7B4]/70 font-black tracking-widest uppercase ml-0.5">$BTS</span>
                              </p>
                            </div>

                            {/* Bottom: Progress & Actions */}
                            <div className="relative z-10 w-full flex flex-col gap-6 mt-auto">
                              <div className="w-full">
                                <div className="flex justify-between text-[11px] mb-2 font-bold uppercase tracking-wider">
                                  <span className="text-gray-400 dark:text-gray-500">{timeRemaining}</span>
                                  <span className="text-gray-900 dark:text-gray-200">{isCompleted ? '100%' : `${Math.round(plan.progress)}%`}</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 dark:bg-[#1a1a1a] rounded-full overflow-hidden">
                                  <div className="h-full bg-[#81D7B4] rounded-full relative" style={{ width: isCompleted ? '100%' : `${plan.progress}%` }}>
                                  </div>
                                </div>
                              </div>

                                <div className="grid grid-cols-3 gap-2">
                                  {!isCompleted && (
                                    <button onClick={() => openTopUpModal(plan)} className="col-span-1 px-2 py-3 text-[11px] font-bold bg-[#81D7B4]/15 text-[#81D7B4] hover:bg-[#81D7B4] hover:text-white rounded-xl transition-colors shadow-xs dark:shadow-none text-center">
                                      Top Up
                                    </button>
                                  )}
                                  <button onClick={() => setPlanDetailsModal({ isOpen: true, plan, isEth: plan.isEth, tokenName: plan.tokenName || '' })} className={`${isCompleted ? 'col-span-1' : 'col-span-1'} px-2 py-3 text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 rounded-xl transition-colors border border-gray-200 dark:border-white/10 shadow-xs dark:shadow-none text-center`}>
                                    Details
                                  </button>
                                  <button onClick={() => {
                                    const maturityTimestamp = Number(plan.maturityTime || 0);
                                    const isCurrentlyCompleted = Number(new Date()) >= maturityTimestamp * 1000;
                                    openWithdrawModal(plan, isCurrentlyCompleted);
                                  }} className={`${isCompleted ? 'col-span-2' : 'col-span-1'} px-2 py-3 text-[11px] font-bold rounded-xl transition-colors shadow-xs dark:shadow-none text-center border ${isCompleted ? 'bg-[#81D7B4] text-white hover:bg-[#6BBF9E] border-transparent' : 'bg-white dark:bg-transparent hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 border-gray-200 dark:border-red-500/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/50'}`}>
                                    Withdraw
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Completed Plans Section (Matured & Ready to Withdraw) */}
              {maturedGrouped.length > 0 && (
                <div className="pt-8 border-t border-gray-100 dark:border-white/10 space-y-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-[26px] font-instrument font-medium text-[#0f172a] dark:text-white tracking-tight">Completed Plans (Ready to Withdraw)</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Matured savings waiting to be claimed to your wallet</p>
                    </div>
                    <span className="text-[11px] font-bold text-[#81D7B4] uppercase tracking-widest bg-[#81D7B4]/10 px-3 py-1.5 rounded-lg border border-[#81D7B4]/20 whitespace-nowrap shrink-0">
                      {maturedPlans.length} {maturedPlans.length === 1 ? 'Matured Plan' : 'Matured Plans'}
                    </span>
                  </div>

                  {maturedGrouped.map((group: any) => (
                    <div key={group.key} className="space-y-4">
                      {/* Chain Section Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 p-1 flex items-center justify-center shadow-2xs">
                            <Image src={group.meta.logo} alt={group.meta.name} width={18} height={18} className="object-contain" />
                          </div>
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{group.meta.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap shrink-0 ${group.meta.badge}`}>
                            {group.plans.length} {group.plans.length === 1 ? 'plan' : 'plans'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                          ${group.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                        </span>
                      </div>

                      {/* Cards Grid */}
                      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4 -mx-4 px-4 sm:pb-0 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {group.plans.map((plan: any) => {
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
                              className="bg-gray-50/50 dark:bg-[#1a1a1a]/40 backdrop-blur-xl rounded-[24px] border border-gray-100 dark:border-white/10 shadow-xs dark:shadow-none p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden min-h-[260px] opacity-90 hover:opacity-100 shrink-0 w-[85%] max-w-[320px] snap-center sm:w-auto sm:max-w-none sm:snap-align-none"
                            >
                              {/* Background Watermark */}
                              <div className="absolute -right-8 -bottom-8 w-48 h-48 opacity-[0.02] dark:opacity-[0.05] pointer-events-none grayscale dark:grayscale-0 mix-blend-multiply dark:mix-blend-screen z-0">
                                <Image src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')} alt={plan.name} fill className="object-contain" />
                              </div>

                              {/* Top: Icon & Status */}
                              <div className="flex items-center justify-between relative z-10 w-full mb-6">
                                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 shadow-inner dark:shadow-none group-hover:bg-[#81D7B4]/10 transition-colors opacity-80 dark:opacity-100">
                                  <Image src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')} alt={plan.name} width={24} height={24} className="w-6 h-6 object-contain opacity-80 dark:opacity-100" />
                                </div>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase bg-gray-200/50 dark:bg-gray-700/50 px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0">
                                  Completed
                                </span>
                              </div>

                              {/* Middle: Plan Name & Huge Stats */}
                              <div className="relative z-10 flex-1 flex flex-col justify-center mb-6">
                                <h3 className="font-bold text-gray-400 dark:text-gray-500 text-[11px] tracking-widest uppercase mb-1">{plan.name}</h3>
                                <p className="font-instrument text-gray-800 dark:text-gray-200 text-[32px] leading-none tracking-tight">
                                  {plan.isEth ? safeAmount.toFixed(4) : safeAmount.toLocaleString()}
                                  <span className="text-lg font-sans font-bold text-gray-400 dark:text-gray-500 ml-1.5">{plan.isEth ? 'ETH' : plan.tokenName}</span>
                                </p>
                                <p className="text-[13px] font-bold text-gray-500 dark:text-gray-400 mt-2">
                                  +{reward} <span className="text-[11px] text-gray-400 dark:text-gray-500 font-black tracking-widest uppercase ml-0.5">$BTS</span>
                                </p>
                              </div>

                              {/* Bottom: Progress & Actions */}
                              <div className="relative z-10 w-full flex flex-col gap-6 mt-auto">
                                <div className="w-full">
                                  <div className="flex justify-between text-[11px] mb-2 font-bold uppercase tracking-wider">
                                    <span className="text-gray-400 dark:text-gray-500">100%</span>
                                    <span className="text-[#81D7B4]">Ready</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#81D7B4] rounded-full relative" style={{ width: '100%' }}>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <button onClick={() => setPlanDetailsModal({ isOpen: true, plan, isEth: plan.isEth, tokenName: plan.tokenName || '' })} className="col-span-1 px-2 py-3 text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 rounded-xl transition-colors border border-gray-200 dark:border-white/10 shadow-xs dark:shadow-none text-center cursor-pointer">
                                    Details
                                  </button>
                                  <button onClick={() => {
                                    openWithdrawModal(plan, true);
                                  }} className="col-span-1 px-2 py-3 text-[11px] font-bold rounded-xl transition-colors shadow-xs dark:shadow-none text-center border bg-[#81D7B4] text-white hover:bg-[#6BBF9E] border-transparent cursor-pointer">
                                    Withdraw
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Withdrawn Plans Section (Past Records) */}
              {withdrawnGrouped.length > 0 && (
                <div className="pt-8 border-t border-gray-100 dark:border-white/10 space-y-6">
                  {/* Header with Collapsible Trigger */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-[26px] font-instrument font-medium text-[#0f172a] dark:text-white tracking-tight">Withdrawn Savings</h2>
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-3 py-1 rounded-lg whitespace-nowrap shrink-0">
                          {withdrawnPlans.length} {withdrawnPlans.length === 1 ? 'Record' : 'Records'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Funds successfully claimed and returned to your wallet</p>
                    </div>

                    <button
                      onClick={() => setIsWithdrawnCollapsed(prev => !prev)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all border border-gray-200/80 dark:border-white/10 shrink-0 self-start sm:self-auto cursor-pointer"
                    >
                      <span>{isWithdrawnCollapsed ? 'Show Records' : 'Hide Records'}</span>
                      <motion.div
                        animate={{ rotate: isWithdrawnCollapsed ? 0 : 180 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowDown01Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </motion.div>
                    </button>
                  </div>

                  {/* Collapsible Content Area */}
                  <AnimatePresence initial={false}>
                    {!isWithdrawnCollapsed && (
                      <motion.div
                        key="withdrawn-content"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden space-y-6"
                      >
                        {/* Chain Filter Tabs */}
                        {withdrawnGrouped.length > 0 && (
                          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
                            <button
                              onClick={() => setWithdrawnChainTab('all')}
                              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                withdrawnChainTab === 'all'
                                  ? 'bg-[#81D7B4] text-white shadow-sm border border-[#81D7B4]'
                                  : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200/60 dark:border-white/5'
                              }`}
                            >
                              <span>All Chains</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${withdrawnChainTab === 'all' ? 'bg-white/25 text-white font-bold' : 'bg-gray-200 dark:bg-white/10'}`}>
                                {withdrawnPlans.length}
                              </span>
                            </button>

                            {availableWithdrawnChains.map((chain) => (
                              <button
                                key={chain.key}
                                onClick={() => setWithdrawnChainTab(chain.key)}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                  withdrawnChainTab === chain.key
                                    ? 'bg-[#81D7B4] text-white shadow-sm border border-[#81D7B4]'
                                    : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200/60 dark:border-white/5'
                                }`}
                              >
                                <div className="w-4 h-4 relative flex items-center justify-center shrink-0">
                                  <Image src={chain.logo} alt={chain.name} width={14} height={14} className="object-contain" />
                                </div>
                                <span>{chain.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${withdrawnChainTab === chain.key ? 'bg-white/25 text-white font-bold' : 'bg-gray-200 dark:bg-white/10'}`}>
                                  {chain.count}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                      {/* Display Groups */}
                      {displayedWithdrawnGroups.map((group: any) => {
                        const totalGroupPages = Math.ceil(group.plans.length / withdrawnItemsPerPage);
                        const paginatedGroupPlans = group.plans.slice(
                          (withdrawnPage - 1) * withdrawnItemsPerPage,
                          withdrawnPage * withdrawnItemsPerPage
                        );

                        return (
                          <div key={group.key} className="space-y-4">
                            {/* Chain Section Header */}
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 p-1 flex items-center justify-center shadow-2xs">
                                  <Image src={group.meta.logo} alt={group.meta.name} width={18} height={18} className="object-contain grayscale opacity-70" />
                                </div>
                                <span className="font-bold text-sm text-gray-600 dark:text-gray-300">{group.meta.name}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400">
                                  {group.plans.length} {group.plans.length === 1 ? 'record' : 'records'}
                                </span>
                              </div>

                              {totalGroupPages > 1 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-gray-400 font-medium">
                                    Page {withdrawnPage} of {totalGroupPages}
                                  </span>
                                  <button
                                    onClick={() => setWithdrawnPage(p => Math.max(1, p - 1))}
                                    disabled={withdrawnPage === 1}
                                    className="px-2 py-1 text-[11px] font-bold rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 cursor-pointer"
                                  >
                                    ←
                                  </button>
                                  <button
                                    onClick={() => setWithdrawnPage(p => Math.min(totalGroupPages, p + 1))}
                                    disabled={withdrawnPage === totalGroupPages}
                                    className="px-2 py-1 text-[11px] font-bold rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 cursor-pointer"
                                  >
                                    →
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Cards Grid */}
                            <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4 -mx-4 px-4 sm:pb-0 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                              {paginatedGroupPlans.map((plan: any) => {
                                const amount = parseFloat(plan.currentAmount);
                                const safeAmount = !isNaN(amount) ? amount : 0;

                                return (
                                  <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-50/40 dark:bg-[#1a1a1a]/30 backdrop-blur-xl rounded-[24px] border border-gray-100 dark:border-white/5 p-6 opacity-75 hover:opacity-100 transition-all duration-300 flex flex-col justify-between relative overflow-hidden min-h-[240px] shrink-0 w-[85%] max-w-[320px] snap-center sm:w-auto sm:max-w-none sm:snap-align-none"
                                  >
                                    {/* Top: Icon & Status */}
                                    <div className="flex items-center justify-between relative z-10 w-full mb-6">
                                      <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5">
                                        <Image src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')} alt={plan.name} width={24} height={24} className="w-6 h-6 object-contain grayscale opacity-60" />
                                      </div>
                                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold tracking-widest uppercase bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-2.5 py-1.5 rounded-md">
                                        Withdrawn
                                      </span>
                                    </div>

                                    {/* Middle: Plan Name & Amount */}
                                    <div className="relative z-10 flex-1 flex flex-col justify-center mb-6">
                                      <h3 className="font-bold text-gray-400 dark:text-gray-500 text-[11px] tracking-widest uppercase mb-1">{plan.name}</h3>
                                      <p className="font-instrument text-gray-600 dark:text-gray-400 text-[30px] leading-none tracking-tight">
                                        {plan.isEth ? safeAmount.toFixed(4) : safeAmount.toLocaleString()}
                                        <span className="text-base font-sans font-bold text-gray-400 ml-1.5">{plan.isEth ? 'ETH' : plan.tokenName}</span>
                                      </p>
                                    </div>

                                    {/* Bottom: Details Button Only */}
                                    <div className="relative z-10 w-full mt-auto">
                                      <button onClick={() => setPlanDetailsModal({ isOpen: true, plan, isEth: plan.isEth, tokenName: plan.tokenName || '' })} className="w-full py-2.5 text-[11.5px] font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors border border-gray-200 dark:border-white/10 text-center cursor-pointer">
                                        View Plan Details
                                      </button>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Activity History Section */}
            <div className="pt-12 border-t border-gray-100 dark:border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6">
                <div>
                  <h2 className="text-[24px] font-instrument text-gray-900 dark:text-white mb-1 leading-none tracking-tight">Recent transactions</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Recent blockchain transactions</p>
                </div>
                {/* Tabs */}
                <div className="flex bg-gray-50 dark:bg-[#121212]/50 rounded-xl p-1 shrink-0 overflow-x-auto hide-scrollbar">
                  {['all', 'deposit', 'topup', 'withdrawal'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${activeTab === tab
                        ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm dark:shadow-none'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                        }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#121212]/60 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-none">
                {isLoadingActivity ? (
                  <div className="p-4 sm:p-6 w-full">
                    <TableShimmer />
                  </div>
                ) : filteredActivityData.length > 0 ? (
                  <>
                    <div className="divide-y divide-gray-50 dark:divide-white/5">
                      {paginatedActivityData.map((activity, index) => (
                        <div
                          key={activity.id || index}
                          onClick={() => setSelectedTxForDetails(activity)}
                          className="group flex items-center px-4 sm:px-7 py-4 hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-all cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0"
                        >
                          <div className="relative w-11 h-11 rounded-[14px] bg-gray-50 dark:bg-[#1a1a1a]/80 border border-gray-100 dark:border-white/5 flex items-center justify-center mr-3.5 sm:mr-4 shrink-0 transition-transform group-hover:scale-105 shadow-sm">
                            <Image
                              src={activity.isEth ? '/eth.png' : getTokenLogo(activity.token || '', activity.tokenLogo || '')}
                              alt={activity.name}
                              width={24}
                              height={24}
                              className="w-5 h-5 object-contain drop-shadow-sm"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm ${
                              activity.type === 'withdrawal' ? 'bg-amber-500 text-white' : activity.type === 'topup' ? 'bg-blue-500 text-white' : 'bg-[#81D7B4] text-white'
                            }`}>
                              {activity.type === 'withdrawal' ? '↓' : activity.type === 'topup' ? '↑' : '+'}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-[14px] sm:text-[14.5px] font-bold text-gray-900 dark:text-gray-100 truncate leading-none">{activity.name}</p>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0 ${activity.badgeStyle}`}>{activity.status}</span>
                            </div>
                            <p className="text-[11.5px] sm:text-[12px] text-gray-500 dark:text-gray-400 font-medium leading-none truncate">{activity.subtitle}</p>
                          </div>
                          
                          <div className="text-right shrink-0 flex flex-col items-end pl-2">
                            <p className="text-[18px] sm:text-[20px] font-instrument text-gray-900 dark:text-white tabular-nums tracking-tight leading-none mb-1">
                              <span className={`mr-0.5 font-sans text-[14px] sm:text-[15px] font-bold ${activity.amountPrefix === '+' ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                {activity.amountPrefix}
                              </span>
                              ${activity.amountValue} <span className="text-[12px] font-sans font-semibold text-gray-400 dark:text-gray-500">{activity.token}</span>
                            </p>
                            {activity.txHash ? (
                              <span className="text-[10.5px] font-medium text-emerald-600 dark:text-[#81D7B4] group-hover:underline">
                                View tx ↗
                              </span>
                            ) : (
                              <span className="text-[10.5px] font-medium text-gray-400 dark:text-gray-500">
                                Recorded
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-[#121212]/30">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${currentPage === 1
                            ? 'text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-[#1a1a1a] cursor-not-allowed border border-transparent'
                            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                            }`}
                        >
                          Previous
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${currentPage === totalPages
                            ? 'text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-[#1a1a1a] cursor-not-allowed border border-transparent'
                            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                            }`}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-16 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No {activeTab !== 'all' ? activeTab : ''} activity yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fintech Transaction Details Modal */}
      {selectedTxForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setSelectedTxForDetails(null)} />
          
          <div className="relative w-full max-w-md bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/10 rounded-[28px] p-6 shadow-2xl z-10 overflow-hidden">
            {/* Close Button */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Transaction Details</span>
              </div>
              <button 
                onClick={() => setSelectedTxForDetails(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
              >
                <Cancel01Icon className="w-4 h-4" />
              </button>
            </div>

            {/* Amount Header */}
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm">
                <Image
                  src={selectedTxForDetails.isEth ? '/eth.png' : getTokenLogo(selectedTxForDetails.token || '', selectedTxForDetails.tokenLogo || '')}
                  alt={selectedTxForDetails.token || 'token'}
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <h3 className="text-[32px] font-instrument text-gray-900 dark:text-white tracking-tight leading-none mb-1">
                <span className={`mr-0.5 font-sans text-[24px] font-bold ${selectedTxForDetails.amountPrefix === '+' ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {selectedTxForDetails.amountPrefix}
                </span>
                ${selectedTxForDetails.amountValue} <span className="text-[18px] font-sans font-semibold text-gray-400 dark:text-gray-500">{selectedTxForDetails.token}</span>
              </h3>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{selectedTxForDetails.name}</p>
            </div>

            {/* Details Breakdown Card */}
            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 space-y-3 border border-gray-100 dark:border-white/5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Type</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${selectedTxForDetails.badgeStyle}`}>
                  {selectedTxForDetails.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Savings Plan</span>
                <span className="font-bold text-gray-900 dark:text-white">{selectedTxForDetails.planName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Network</span>
                <span className="font-bold text-gray-900 dark:text-white capitalize">{selectedTxForDetails.chain}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Date & Time</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{selectedTxForDetails.fullDate}</span>
              </div>

              {selectedTxForDetails.txHash && selectedTxForDetails.txHash !== '0x0' && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-white/5">
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Tx Hash</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-gray-700 dark:text-gray-300">
                    <span>{selectedTxForDetails.txHash.slice(0, 6)}...{selectedTxForDetails.txHash.slice(-4)}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedTxForDetails.txHash);
                        toast.success("Transaction hash copied!");
                      }}
                      className="text-[#81D7B4] hover:underline text-[11px] font-sans font-bold cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-5 flex gap-3">
              {selectedTxForDetails.explorerUrl && (
                <a
                  href={selectedTxForDetails.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#252525] text-gray-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition border border-gray-200 dark:border-white/10"
                >
                  <span>View on Explorer</span>
                  <ArrowUpRight01Icon className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={() => setSelectedTxForDetails(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#81D7B4] hover:bg-[#68C5A0] text-white font-bold text-xs flex items-center justify-center transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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
