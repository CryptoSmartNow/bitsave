'use client';

import { Activity01Icon, Tick01Icon, ArrowDown01Icon, Dollar01Icon, PlusSignIcon, Cancel01Icon, UserMultipleIcon, ArrowUpRight01Icon, ArrowLeft01Icon, Wallet02Icon, PiggyBankIcon, Award01Icon } from "hugeicons-react";
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import TopUpModal from '../../components/TopUpModal';
import WithdrawModal from '../../components/WithdrawModal';
import PlanDetailsModal from '../../components/PlanDetailsModal';
import SelectTopUpPlanModal from '../../components/SelectTopUpPlanModal';
import NetworkDetection from '../../components/NetworkDetection';
import V3WelcomeModal from '../../components/V3WelcomeModal';
import OnboardingTour, { TourStep } from '../../components/OnboardingTour';
import { motion, AnimatePresence } from 'framer-motion';
import { handleContractError } from '../../lib/contractErrorHandler';
import { useSavingsData } from '../../hooks/useSavingsData';
import { ShimmerList, PageShimmer } from '../../components/ShimmerLoading';
import { useNetworkSync } from '../../hooks/useNetworkSync';
import { initializeSavingsCache } from '../../utils/savingsCache';
import { useENSData } from '../../hooks/useENSData';
import { formatTimestamp } from '../../utils/dateUtils';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '../../utils/networkLogos';
import { toast } from 'react-hot-toast';

const ensureImageUrl = (url: string | undefined): string => {
  if (!url) return '/default-network.png';
  if (url.startsWith('/')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return `/${url}`;
  return url;
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const { address: wagmiAddress, isConnected } = useAccount();
  const { user, logout } = usePrivy();
  const evmAddress = wagmiAddress || user?.wallet?.address;
  const address = evmAddress;

  const {
    savingsData, isLoading, isBackgroundLoading, ethPrice,
    isBaseNetwork, isCeloNetwork, isLiskNetwork, isBSCNetwork, isAvalancheNetwork,
    currentNetwork, refetch: refetchSavingsData
  } = useSavingsData();

  const router = useRouter();

  const { syncToWalletNetwork, switchToNetwork: syncSwitchToNetwork, isNetworkSynced, currentNetworkName, isNetworkSwitching: hookNetworkSwitching } = useNetworkSync();
  const { ensName, getDisplayName, hasENS } = useENSData(address);

  const [displayName, setDisplayName] = useState('');
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  
  const [showV3Modal, setShowV3Modal] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hideV3 = localStorage.getItem('bitsave_hide_v3_modal');
      
      if (!hideV3) {
        // slight delay to ensure UI is ready
        setTimeout(() => setShowV3Modal(true), 400);
      }
    }
  }, []);

  const tourSteps: TourStep[] = [
    { target: '[data-tour="balance"]', title: 'Total Balance & Chains', content: 'Your aggregated balance across all supported networks.', position: 'bottom' },
    { target: '[data-tour="currency"]', title: 'Multi-Currency Toggle', content: 'Switch between NGN, USD, EUR, and GBP dynamically.', position: 'bottom' },
    { target: '[data-tour="quick-actions"]', title: 'Quick Actions', content: 'Instantly create plans, top up, or manage group savings.', position: 'top' },
    { target: '[data-tour="tabs"]', title: 'Active & Completed Plans', content: 'Track your yield generation and maturity dates.', position: 'top' },
    { target: '[data-tour="tvl-by-chain"]', title: 'Wallet TVL by Chain', content: 'Track and monitor your locked savings broken down across each connected blockchain network.', position: 'bottom' }
  ];
  const [selectedUpdate, setSelectedUpdate] = useState<{ title: string; content: string; date: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [goodDollarPrice, setGoodDollarPrice] = useState<number>(0.00009189);
  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});
  const [isLoadingLogos, setIsLoadingLogos] = useState(true);
  const [updates, setUpdates] = useState<Array<{ id: string; title: string; content: string; date: string; isNew: boolean }>>([]);

  const [topUpModal, setTopUpModal] = useState({ isOpen: false, planName: '', planId: '', isEth: false, isGToken: false, tokenName: '', contractAddress: '', network: '', startTime: 0 });
  const [selectPlanModalOpen, setSelectPlanModalOpen] = useState(false);
  const [planDetailsModal, setPlanDetailsModal] = useState({ isOpen: false, plan: null as any, isEth: false, tokenName: '' });
  const [withdrawModal, setWithdrawModal] = useState({ isOpen: false, planId: '', planName: '', isEth: false, penaltyPercentage: 0, tokenName: '', isCompleted: false, contractAddress: '', network: '', startTime: 0 });
  const [savingsTab, setSavingsTab] = useState<'active' | 'completed'>('active');

  // Currency selector
  const currencies = [
    { code: 'USD', label: 'US Dollar',  symbol: '$',  rate: 1 },
    { code: 'NGN', label: 'Naira',      symbol: '₦',  rate: 1346.49 },
    { code: 'EUR', label: 'Euro',       symbol: '€',  rate: 0.92 },
    { code: 'GBP', label: 'Pounds',     symbol: '£',  rate: 0.79 },
  ];
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const currencyBtnRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const openCurrencyDropdown = () => {
    if (currencyBtnRef.current) {
      const r = currencyBtnRef.current.getBoundingClientRect();
      setDropdownPos({ top: r.bottom + 6, left: r.left });
    }
    setCurrencyDropdownOpen(o => !o);
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && address) setDisplayName(getDisplayName(address));
    else setDisplayName('User');
  }, [mounted, address, getDisplayName]);

  const switchToNetwork = async (networkName: string) => {
    await syncSwitchToNetwork(networkName);
  };

  const handleNetworkSelect = async (network: { name: string; isActive: boolean }) => {
    if (network.isActive && isNetworkSynced) await refetchSavingsData();
    else if (network.isActive && !isNetworkSynced) await syncToWalletNetwork();
    else await switchToNetwork(network.name);
  };

  const networkOptions = useMemo(() => [
    { name: 'Base', desc: 'Ethereum L2', icon: networkLogos['base']?.logoUrl || '/base-square-logo.svg', isActive: isBaseNetwork },
    { name: 'Celo', desc: 'Mobile-First', icon: networkLogos['celo']?.logoUrl || '/celo.png', isActive: isCeloNetwork },
    { name: 'Lisk', desc: 'Ethereum L2', icon: networkLogos['lisk']?.logoUrl || '/lisk-logo.png', isActive: isLiskNetwork },
    { name: 'Binance Smart Chain', desc: 'EVM Mainnet', icon: networkLogos['bsc']?.logoUrl || '/bsc.png', isActive: isBSCNetwork },
    { name: 'Avalanche', desc: 'EVM Mainnet', icon: networkLogos['avalanche']?.logoUrl || '/avalanche-logo.svg', isActive: isAvalancheNetwork },
  ], [networkLogos, isBaseNetwork, isCeloNetwork, isLiskNetwork, isAvalancheNetwork, isBSCNetwork]);

  // Calculate savings on each supported chain
  const chainSavings = useMemo(() => {
    const breakdown: Record<string, number> = {
      'Base': 0,
      'Celo': 0,
      'Lisk': 0,
      'Binance Smart Chain': 0,
      'Avalanche': 0,
    };

    const allLockedPlans = [
      ...(savingsData.currentPlans || []),
      ...(savingsData.completedPlans || []).filter((p: any) => !p.isWithdrawn && p.status !== 'Withdrawn')
    ];

    allLockedPlans.forEach((p: any) => {
      const rawChain = (p.network || p.chain || '').toLowerCase();
      const amt = parseFloat(p.currentAmount || p.amount || '0');
      const val = p.isEth ? amt * ethPrice : (p.tokenName === 'cNGN' ? amt * 0.0007426 : amt);

      if (rawChain.includes('celo')) breakdown['Celo'] += val;
      else if (rawChain.includes('lisk')) breakdown['Lisk'] += val;
      else if (rawChain.includes('bsc') || rawChain.includes('binance')) breakdown['Binance Smart Chain'] += val;
      else if (rawChain.includes('avax') || rawChain.includes('avalanche')) breakdown['Avalanche'] += val;
      else breakdown['Base'] += val;
    });

    return breakdown;
  }, [savingsData.currentPlans, savingsData.completedPlans, ethPrice]);

  useEffect(() => { initializeSavingsCache(); }, []);

  useEffect(() => {
    if (mounted && address) {
      const timer = setTimeout(() => refetchSavingsData(false), 100);
      return () => clearTimeout(timer);
    }
  }, [mounted, address, refetchSavingsData]);

  useEffect(() => {
    const loadNetworkLogos = async () => {
      try {
        setIsLoadingLogos(true);
        const logos = await fetchMultipleNetworkLogos(['base', 'celo', 'lisk', 'avalanche', 'bsc']);
        setNetworkLogos(logos);
      } catch { } finally { setIsLoadingLogos(false); }
    };
    if (mounted) loadNetworkLogos();
  }, [mounted]);

  useEffect(() => {
    if (mounted) {
      (async () => {
        try {
          const r = await fetch('/api/prices?ids=gooddollar');
          const d = await r.json();
          const p = d.gooddollar?.usd;
          if (p && p > 0) setGoodDollarPrice(p);
        } catch { }
      })();
    }
  }, [mounted]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); setIsInstallable(true); };
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstallable(false);
    else window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const getTokenLogo = useCallback((tokenName: string, tokenLogo?: string) => {
    if (tokenLogo) return tokenLogo;
    if (tokenName === 'cUSD') return '/cusd.png';
    if (tokenName === 'cNGN') return '/cngn.png';
    if (tokenName === 'USDGLO') return '/usdglo.png';
    if (tokenName === '$G' || tokenName === 'Gooddollar') return '/$g.png';
    if (tokenName === 'USDC') return '/usdclogo.png';
    return `/${tokenName.toLowerCase()}.png`;
  }, []);

  const openTopUpModal = (plan: any) => setTopUpModal({ isOpen: true, planName: plan.name, planId: plan.id, isEth: plan.isEth, isGToken: plan.tokenName === '$G', tokenName: plan.tokenName, contractAddress: plan.contractAddress, network: plan.network, startTime: plan.startTime });
  const closeTopUpModal = () => setTopUpModal({ isOpen: false, planName: '', planId: '', isEth: false, isGToken: false, tokenName: '', contractAddress: '', network: '', startTime: 0 });
  const openWithdrawModal = (plan: any, isCompleted = false) => setWithdrawModal({ isOpen: true, planId: plan.id, planName: plan.name, isEth: plan.isEth, penaltyPercentage: plan.penaltyPercentage || 5, tokenName: plan.tokenName, isCompleted, contractAddress: plan.contractAddress, network: plan.network, startTime: plan.startTime });
  const closeWithdrawModal = () => setWithdrawModal({ isOpen: false, planId: '', planName: '', isEth: false, penaltyPercentage: 0, tokenName: '', isCompleted: false, contractAddress: '', network: '', startTime: 0 });
  const [showTransactionsDrawer, setShowTransactionsDrawer] = useState(false);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [selectedTxForDetails, setSelectedTxForDetails] = useState<any | null>(null);

  // Fetch real user transaction history from storage & API
  const loadTransactions = useCallback(async () => {
    if (!address) return;
    try {
      setIsLoadingTransactions(true);
      // 1. Read local storage transactions (instant client sync)
      let localTxs: any[] = [];
      try {
        const stored = localStorage.getItem(`bitsave_txs_${address.toLowerCase()}`);
        if (stored) localTxs = JSON.parse(stored);
      } catch {}

      // 2. Fetch server DB transactions
      let serverTxs: any[] = [];
      try {
        const res = await fetch(`/api/transactions?address=${address}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.transactions)) {
            serverTxs = data.transactions;
          }
        }
      } catch {}

      // 3. Deduplicate
      const combined = [...localTxs, ...serverTxs];
      const seen = new Set<string>();
      const deduped: any[] = [];
      for (const tx of combined) {
        const key = (tx.txnhash || tx.id || tx.txHash || '').toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          deduped.push(tx);
        } else if (!key) {
          deduped.push(tx);
        }
      }
      setUserTransactions(deduped);
    } catch (e) {
      console.warn("Failed to load user transactions:", e);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [address]);

  useEffect(() => {
    loadTransactions();
    const handleTxUpdate = () => loadTransactions();
    window.addEventListener('bitsave_tx_updated', handleTxUpdate);
    return () => window.removeEventListener('bitsave_tx_updated', handleTxUpdate);
  }, [loadTransactions]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <PageShimmer />
      </div>
    );
  }

  // --- Derived data ---
  const activePlans = savingsData?.currentPlans || [];
  const completedPlans = savingsData?.completedPlans || [];
  const totalLocked = parseFloat(savingsData?.totalLocked || '0').toFixed(2);

  // Fintech-grade transaction record derivation
  const getExplorerUrl = (txHash?: string, chainName?: string) => {
    if (!txHash || txHash === '0x0') return null;
    const c = (chainName || '').toLowerCase();
    if (c.includes('celo')) return `https://celoscan.io/tx/${txHash}`;
    if (c.includes('lisk')) return `https://blockscout.lisk.com/tx/${txHash}`;
    if (c.includes('bsc') || c.includes('binance')) return `https://bscscan.com/tx/${txHash}`;
    if (c.includes('avax') || c.includes('avalanche')) return `https://snowtrace.io/tx/${txHash}`;
    return `https://basescan.org/tx/${txHash}`;
  };

  const recentTransactions = (() => {
    const list: any[] = [];

    if (userTransactions.length > 0) {
      userTransactions.forEach((tx) => {
        const rawType = (tx.transaction_type || tx.type || 'deposit').toLowerCase();
        const isWithdrawal = rawType.includes('withdraw');
        const isTopUp = rawType.includes('topup') || rawType.includes('top_up');

        let badgeLabel = 'DEPOSIT';
        let badgeStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-[#81D7B4] border border-emerald-200/60 dark:border-emerald-500/20';
        let amountPrefix = '+';
        let actionTitle = tx.savingsname || 'Vault Deposit';
        let subtitleAction = 'Deposited to';

        if (isWithdrawal) {
          badgeLabel = 'WITHDRAWAL';
          badgeStyle = 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20';
          amountPrefix = '-';
          actionTitle = tx.savingsname || 'Vault Withdrawal';
          subtitleAction = 'Withdrawn to wallet from';
        } else if (isTopUp) {
          badgeLabel = 'TOP UP';
          badgeStyle = 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20';
          amountPrefix = '+';
          actionTitle = tx.savingsname || 'Vault Top Up';
          subtitleAction = 'Added to';
        }

        const dateObj = tx.created_at ? new Date(tx.created_at) : new Date();
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const token = tx.currency || 'USDC';
        const isEth = token.toLowerCase() === 'eth';

        list.push({
          id: tx.id || tx.txnhash || Math.random().toString(),
          name: actionTitle,
          planName: tx.savingsname || 'Savings Vault',
          token,
          isEth,
          tokenLogo: getTokenLogo(token, ''),
          date: formattedDate,
          time: formattedTime,
          fullDate: `${formattedDate} at ${formattedTime}`,
          status: badgeLabel,
          badgeStyle,
          amountPrefix,
          amountValue: parseFloat(tx.amount || '0').toFixed(2),
          displayAmount: `$${parseFloat(tx.amount || '0').toFixed(2)}`,
          type: isWithdrawal ? 'withdrawal' : isTopUp ? 'topup' : 'deposit',
          chain: tx.chain || 'Base',
          txHash: tx.txnhash || tx.txHash,
          explorerUrl: getExplorerUrl(tx.txnhash || tx.txHash, tx.chain),
          subtitle: `${subtitleAction} ${token} • ${formattedDate}`
        });
      });
    }

    // Fallback: If no standalone event journal yet, derive exact deposits and withdrawals from on-chain state
    if (list.length === 0) {
      completedPlans.forEach((plan: any) => {
        const isWithdrawn = plan.isWithdrawn || plan.status === 'Withdrawn';
        const dateObj = plan.maturityTime ? new Date(Number(plan.maturityTime) * 1000) : new Date();
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const token = plan.tokenName || 'USDC';

        list.push({
          id: `completed-${plan.id}`,
          name: plan.name,
          planName: plan.name,
          token,
          isEth: plan.isEth,
          tokenLogo: plan.tokenLogo || getTokenLogo(token, ''),
          date: formattedDate,
          time: '--',
          fullDate: formattedDate,
          status: isWithdrawn ? 'WITHDRAWAL' : 'DEPOSIT',
          badgeStyle: isWithdrawn 
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20'
            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-[#81D7B4] border border-emerald-200/60 dark:border-emerald-500/20',
          amountPrefix: isWithdrawn ? '-' : '+',
          amountValue: parseFloat(plan.currentAmount || plan.amount || '0').toFixed(2),
          displayAmount: `$${parseFloat(plan.currentAmount || plan.amount || '0').toFixed(2)}`,
          type: isWithdrawn ? 'withdrawal' : 'deposit',
          chain: plan.network || 'Base',
          txHash: null,
          explorerUrl: null,
          subtitle: isWithdrawn ? `Withdrawn to wallet • ${formattedDate}` : `Saved in ${token} • ${formattedDate}`
        });
      });

      activePlans.forEach((plan: any) => {
        const dateObj = plan.startTime ? new Date(Number(plan.startTime) * 1000) : new Date();
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const token = plan.tokenName || 'USDC';

        list.push({
          id: `active-${plan.id}`,
          name: plan.name,
          planName: plan.name,
          token,
          isEth: plan.isEth,
          tokenLogo: plan.tokenLogo || getTokenLogo(token, ''),
          date: formattedDate,
          time: '--',
          fullDate: formattedDate,
          status: 'DEPOSIT',
          badgeStyle: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-[#81D7B4] border border-emerald-200/60 dark:border-emerald-500/20',
          amountPrefix: '+',
          amountValue: parseFloat(plan.currentAmount || plan.amount || '0').toFixed(2),
          displayAmount: `$${parseFloat(plan.currentAmount || plan.amount || '0').toFixed(2)}`,
          type: 'deposit',
          chain: plan.network || 'Base',
          txHash: null,
          explorerUrl: null,
          subtitle: `Deposited into vault • ${formattedDate}`
        });
      });
    }

    return list;
  })();

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="relative">
      {/* Subtle page tint / glassmorphism backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{
        background: 'radial-gradient(ellipse 80% 60% at 60% 0%, rgba(129,215,180,0.07) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 0% 100%, rgba(129,215,180,0.05) 0%, transparent 70%)'
      }} />

      {/* Modals */}
      <V3WelcomeModal 
        isOpen={showV3Modal} 
        onClose={() => setShowV3Modal(false)} 
        onStartTour={() => {
          setShowV3Modal(false);
          setTimeout(() => setShowTour(true), 300);
        }} 
      />
      <OnboardingTour 
        isOpen={showTour} 
        onClose={() => setShowTour(false)} 
        steps={tourSteps} 
      />
      <NetworkDetection />
      <SelectTopUpPlanModal
        isOpen={selectPlanModalOpen}
        onClose={() => setSelectPlanModalOpen(false)}
        plans={activePlans}
        onSelectPlan={openTopUpModal}
        networkLogos={networkLogos}
        getTokenLogo={getTokenLogo}
      />
      <TopUpModal isOpen={topUpModal.isOpen} onClose={closeTopUpModal} planName={topUpModal.planName} planId={topUpModal.planId} isEth={topUpModal.isEth} tokenName={topUpModal.tokenName} networkLogos={networkLogos} contractAddress={topUpModal.contractAddress} network={topUpModal.network} startTime={topUpModal.startTime} />
      <WithdrawModal isOpen={withdrawModal.isOpen} onClose={closeWithdrawModal} planName={withdrawModal.planName} isEth={withdrawModal.isEth} penaltyPercentage={withdrawModal.penaltyPercentage} tokenName={withdrawModal.tokenName} isCompleted={withdrawModal.isCompleted} networkLogos={networkLogos} contractAddress={withdrawModal.contractAddress} network={withdrawModal.network} startTime={withdrawModal.startTime} />
      <PlanDetailsModal isOpen={planDetailsModal.isOpen} onClose={() => setPlanDetailsModal({ ...planDetailsModal, isOpen: false })} plan={planDetailsModal.plan} isEth={planDetailsModal.isEth} tokenName={planDetailsModal.tokenName} goodDollarPrice={goodDollarPrice} networkLogos={networkLogos} />

      {/* Update Modal */}
      {showUpdateModal && selectedUpdate && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md mx-auto p-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{selectedUpdate.title}</h3>
              <button onClick={() => setShowUpdateModal(false)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100">
                <Cancel01Icon className="w-5 h-5" />
              </button>
            </div>
            <div className="text-[13px] text-gray-500 mb-4">{new Date(selectedUpdate.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="text-[14px] text-gray-600 leading-relaxed mb-6">{selectedUpdate.content}</div>
            <button onClick={() => setShowUpdateModal(false)} className="w-full py-3 text-center text-sm font-bold text-white bg-[#81D7B4] hover:bg-[#6BBF9E] rounded-xl transition-all">Got it</button>
          </div>
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-7 flex flex-col gap-5">

          {/* Balance — glassmorphism card */}
          <div
            data-tour="balance"
            className="rounded-2xl border border-white/60 dark:border-white/10/60 p-5 sm:p-7 relative bg-gradient-to-br from-white/95 to-[#F1FDF8]/90 dark:from-[#1a1a1a]/95 dark:to-[#121212]/90"
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 4px 24px rgba(129,215,180,0.10), 0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            {/* Fintech decorative layer — clipped separately so dropdown can escape */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
              {/* Topographic / tree-bark wavy contour lines */}
              <svg className="absolute top-0 right-0 w-3/4 h-full opacity-[0.07]" viewBox="0 0 300 140" preserveAspectRatio="xMaxYMid meet" fill="none">
                <path d="M300,18 C270,14 240,22 210,18 C180,14 150,26 120,20 C90,14 60,24 30,19" stroke="#81D7B4" strokeWidth="0.9"/>
                <path d="M300,32 C265,27 235,38 205,33 C175,28 145,42 115,35 C85,28 55,40 25,34" stroke="#81D7B4" strokeWidth="0.9"/>
                <path d="M300,47 C268,41 238,54 208,48 C178,42 148,57 118,50 C88,43 58,56 28,50" stroke="#81D7B4" strokeWidth="0.9"/>
                <path d="M300,63 C271,56 241,70 211,63 C181,56 151,72 121,65 C91,58 61,73 31,66" stroke="#81D7B4" strokeWidth="0.9"/>
                <path d="M300,79 C274,71 244,87 214,79 C184,71 154,88 124,80 C94,72 64,89 34,81" stroke="#81D7B4" strokeWidth="0.9"/>
                <path d="M300,96 C277,87 247,105 217,96 C187,87 157,106 127,97 C97,88 67,107 37,98" stroke="#81D7B4" strokeWidth="0.9"/>
                <path d="M300,114 C280,104 250,124 220,114 C190,104 160,125 130,115 C100,105 70,126 40,116" stroke="#81D7B4" strokeWidth="0.9"/>
              </svg>
              {/* Soft green glow orb */}
              <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(129,215,180,0.22) 0%, transparent 65%)' }} />
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(129,215,180,0.4) 45%, transparent)' }} />
            </div>

            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Total Balance</h2>
              <span 
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-semibold bg-[#81D7B4]/10 text-[#81D7B4] border border-[#81D7B4]/20 shadow-sm"
                title="This is your total aggregated savings across all supported blockchains (Base, Celo, Lisk, Avalanche, and BSC)."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4] animate-pulse"></span>
                Across all chains
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 mb-4">
              <p
                className="text-[38px] xs:text-[44px] sm:text-[54px] leading-none text-gray-900 dark:text-white font-instrument truncate"
                style={{ fontWeight: 400, letterSpacing: '-0.02em' }}
              >
                {selectedCurrency.symbol}{(parseFloat(totalLocked) * selectedCurrency.rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>

              <Link
                href="/dashboard/withdraw"
                className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[12px] sm:text-[13px] font-semibold text-gray-800 dark:text-gray-200 transition-all whitespace-nowrap bg-white/85 dark:bg-[#1a1a1a]/85 shrink-0 shadow-sm hover:shadow"
                style={{
                  border: '1px solid rgba(0,0,0,0.08)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <ArrowUpRight01Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Withdraw</span>
              </Link>
            </div>

            {/* Pills row */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Currency dropdown trigger */}
              <div className="relative" data-tour="currency">
                <button
                  ref={currencyBtnRef}
                  onClick={openCurrencyDropdown}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[11.5px] font-semibold text-gray-600 dark:text-gray-300 transition-all bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 select-none"
                >
                  <span>{selectedCurrency.label}</span>
                  <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${currencyDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Install App pill */}
              <button
                onClick={() => deferredPrompt?.prompt?.()}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[11.5px] font-semibold transition-all bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
                style={{ color: '#81D7B4' }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Install app</span>
              </button>
            </div>
          </div>

          {/* Quick actions — unified premium glassmorphism */}
          <div
            data-tour="quick-actions"
            className="rounded-[20px] p-4 sm:p-6 border border-white/60 dark:border-white/10/60 relative overflow-hidden bg-gradient-to-br from-white/95 to-[#F8FCFA]/95 dark:from-[#1a1a1a]/95 dark:to-[#121212]/90"
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.02)',
            }}
          >
            {/* Subtle glow orb in the background */}
            <div className="pointer-events-none absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(129,215,180,0.15) 0%, transparent 60%)' }} />

            <h2 className="text-[11px] sm:text-[12px] font-semibold text-gray-400 mb-3 sm:mb-5 uppercase tracking-widest">Quick actions</h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 relative z-10">

              {/* Create plan */}
              <Link
                href="/dashboard/create-savings"
                className="group flex flex-col items-start justify-between p-3 sm:p-4 h-[88px] sm:h-[100px] rounded-[16px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(129,215,180,0.12)] relative overflow-hidden bg-white/70 dark:bg-[#1a1a1a]/70"
                style={{
                  border: '1px solid rgba(129,215,180,0.2)',
                }}
              >
                {/* Small Icon top-left */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#81D7B4]/15 flex items-center justify-center relative z-10">
                  <Wallet02Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#81D7B4]" strokeWidth={2.2} />
                </div>

                {/* Background Shadow Icon */}
                <div className="absolute -bottom-4 -right-4 w-[60px] sm:w-[72px] h-[60px] sm:h-[72px] opacity-[0.05] group-hover:opacity-[0.08] transition-opacity pointer-events-none z-0">
                  <Wallet02Icon className="w-full h-full text-[#81D7B4]" strokeWidth={1.5} />
                </div>
                
                <span className="text-[11.5px] sm:text-[13px] font-semibold text-gray-700 dark:text-gray-200 group-hover:text-[#81D7B4] dark:group-hover:text-[#81D7B4] transition-colors relative z-10 mt-1 sm:mt-2 truncate w-full">Create plan</span>
              </Link>

              {/* Top up */}
              <button
                type="button"
                onClick={() => setSelectPlanModalOpen(true)}
                className="group flex flex-col items-start justify-between p-3 sm:p-4 h-[88px] sm:h-[100px] rounded-[16px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(129,215,180,0.12)] relative overflow-hidden bg-white/70 dark:bg-[#1a1a1a]/70 cursor-pointer text-left w-full"
                style={{
                  border: '1px solid rgba(129,215,180,0.2)',
                }}
              >
                {/* Small Icon top-left */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#81D7B4]/15 flex items-center justify-center relative z-10">
                  <PlusSignIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#81D7B4]" strokeWidth={2.2} />
                </div>

                {/* Background Shadow Icon */}
                <div className="absolute -bottom-4 -right-4 w-[60px] sm:w-[72px] h-[60px] sm:h-[72px] opacity-[0.05] group-hover:opacity-[0.08] transition-opacity pointer-events-none z-0">
                  <PlusSignIcon className="w-full h-full text-[#81D7B4]" strokeWidth={1.5} />
                </div>
                
                <span className="text-[11.5px] sm:text-[13px] font-semibold text-gray-700 dark:text-gray-200 group-hover:text-[#81D7B4] dark:group-hover:text-[#81D7B4] transition-colors relative z-10 mt-1 sm:mt-2 truncate w-full">Top up</span>
              </button>

              {/* Group savings */}
              <Link
                href="/dashboard/group-savings"
                className="group flex flex-col items-start justify-between p-3 sm:p-4 h-[88px] sm:h-[100px] rounded-[16px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(129,215,180,0.12)] relative overflow-hidden bg-white/70 dark:bg-[#1a1a1a]/70"
                style={{
                  border: '1px solid rgba(129,215,180,0.2)',
                }}
              >
                {/* Small Icon top-left */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#81D7B4]/15 flex items-center justify-center relative z-10">
                  <UserMultipleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#81D7B4]" strokeWidth={2.2} />
                </div>

                {/* Background Shadow Icon */}
                <div className="absolute -bottom-4 -right-4 w-[60px] sm:w-[72px] h-[60px] sm:h-[72px] opacity-[0.05] group-hover:opacity-[0.08] transition-opacity pointer-events-none z-0">
                  <UserMultipleIcon className="w-full h-full text-[#81D7B4]" strokeWidth={1.5} />
                </div>
                
                <span className="text-[11.5px] sm:text-[13px] font-semibold text-gray-700 dark:text-gray-200 group-hover:text-[#81D7B4] dark:group-hover:text-[#81D7B4] transition-colors relative z-10 mt-1 sm:mt-2 truncate w-full">Group savings</span>
              </Link>

            </div>
          </div>

          {/* Active / Completed Savings — stretched to align with right column */}
          <div
            data-tour="tabs"
            className="flex-1 flex flex-col justify-between rounded-[20px] border border-white/60 dark:border-white/10/60 relative overflow-hidden bg-gradient-to-br from-white/95 to-[#FAFCFB]/85 dark:from-[#1a1a1a]/95 dark:to-[#121212]/85 min-h-[360px]"
            style={{
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.02)',
            }}
          >
            {/* Soft decorative background circles */}
            <div className="pointer-events-none absolute -bottom-10 -right-10 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(129,215,180,0.12) 0%, transparent 65%)' }} />

            {/* Header with tabs */}
            <div className="flex items-center justify-between px-4 sm:px-7 pt-5 sm:pt-6 pb-2 sm:pb-3 relative z-10 shrink-0">
              <div className="flex items-center bg-gray-100/60 dark:bg-[#1a1a1a]/60 p-1 rounded-full border border-black/5 dark:border-white/5 shadow-inner">
                <button
                  onClick={() => setSavingsTab('active')}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[12px] sm:text-[12.5px] font-semibold transition-all ${savingsTab === 'active' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-black/5 dark:border-transparent' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  Active {activePlans.length > 0 && <span className="ml-1 opacity-60">· {activePlans.length}</span>}
                </button>
                <button
                  onClick={() => setSavingsTab('completed')}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[12px] sm:text-[12.5px] font-semibold transition-all ${savingsTab === 'completed' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-black/5 dark:border-transparent' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  Completed {completedPlans.length > 0 && <span className="ml-1 opacity-60">· {completedPlans.length}</span>}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/plans"
                  className="text-[12px] font-bold text-[#81D7B4] hover:text-[#6BBF9E] transition-colors bg-[#81D7B4]/15 px-3.5 py-1.5 rounded-lg shadow-sm"
                >
                  Manage
                </Link>
              </div>
            </div>

            {/* Plan cards or Center-aligned Empty State */}
            <div className="flex-1 flex flex-col justify-center relative z-10">
              {isLoading ? (
                <div className="p-6"><ShimmerList count={3} /></div>
              ) : (savingsTab === 'active' ? activePlans : completedPlans).length > 0 ? (
                <div className="flex-1 flex flex-col justify-start">
                  {savingsTab === 'active' ? (
                    <div className="flex flex-col gap-3 px-4 sm:px-6 py-2 sm:py-3">
                      {/* Premium vertical cards for active plans (preview top 4) */}
                      {activePlans.slice(0, 4).map((plan: any, i: number) => (
                        <button
                          key={plan.id}
                          onClick={() => setPlanDetailsModal({ isOpen: true, plan, isEth: plan.isEth, tokenName: plan.tokenName || '' })}
                          className="shrink-0 w-full min-h-[76px] flex flex-col p-4 rounded-[16px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] group text-left relative overflow-hidden bg-white/90 dark:bg-[#1a1a1a]/90"
                          style={{ border: '1px solid rgba(0,0,0,0.04)' }}
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="flex items-start justify-between w-full mb-2.5 relative z-10">
                            <div className="flex items-center gap-3.5">
                              <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-gray-50 border border-gray-100 transition-colors shadow-sm shrink-0">
                                <Image
                                  src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')}
                                  alt={plan.name}
                                  width={24}
                                  height={24}
                                  className="w-6 h-6 object-contain"
                                />
                              </div>
                              <div>
                                <h4 className="text-[14px] font-semibold text-gray-900 dark:text-white group-hover:text-[#81D7B4] transition-colors">{plan.name}</h4>
                                <p className="text-[11px] text-gray-400 mt-0.5 font-medium flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.5)]"></span> Active • Locked in {plan.tokenName || 'USDC'}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="text-[19px] text-gray-900 dark:text-white font-instrument" style={{ fontWeight: 400 }}>
                                ${parseFloat(plan.currentAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <span className="text-[10px] font-bold text-[#81D7B4] bg-[#81D7B4]/10 border border-[#81D7B4]/20 px-2 py-0.5 rounded-full group-hover:bg-[#81D7B4]/20 transition-colors">Details</span>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-gray-100 h-[5px] rounded-full overflow-hidden mt-0.5 relative z-10">
                            <div className="bg-[#81D7B4] h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(15, (i + 1) * 35))}%` }} />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 px-4 sm:px-6 py-2 sm:py-3">
                      {/* Premium vertical cards for completed plans (preview top 4) */}
                      {completedPlans.slice(0, 4).map((plan: any) => (
                        <button
                          key={plan.id}
                          onClick={() => setPlanDetailsModal({ isOpen: true, plan, isEth: plan.isEth, tokenName: plan.tokenName || '' })}
                          className="shrink-0 w-full min-h-[72px] flex items-center justify-between p-4 rounded-[16px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] group text-left relative overflow-hidden bg-white/90 dark:bg-[#1a1a1a]/90"
                          style={{ border: '1px solid rgba(0,0,0,0.04)' }}
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none opacity-50 group-hover:opacity-100 group-hover:bg-[#81D7B4]/20 transition-all duration-500" />
                          <div className="flex items-center gap-3.5 relative z-10 min-w-0">
                            <div className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-gray-50 border border-gray-100 transition-colors shadow-sm shrink-0">
                              <Image
                                src={plan.isEth ? '/eth.png' : getTokenLogo(plan.tokenName || '', plan.tokenLogo || '')}
                                alt={plan.name}
                                width={24}
                                height={24}
                                className="w-6 h-6 object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-[14px] font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors truncate">{plan.name}</h4>
                              <p className="text-[11px] text-gray-400 mt-0.5 font-medium flex items-center gap-1.5 truncate">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${plan.status === 'Withdrawn' ? 'bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]'}`}></span> 
                                {plan.status === 'Withdrawn' ? 'Withdrawn' : 'Completed'} {plan.maturityTime ? new Date(Number(plan.maturityTime) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end relative z-10 gap-1 shrink-0 ml-3">
                            <span className="text-[19px] text-gray-900 dark:text-white font-instrument tabular-nums" style={{ fontWeight: 400 }}>
                              ${parseFloat(plan.currentAmount || plan.amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full group-hover:bg-emerald-100 transition-colors">Details</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* ── PERFECTLY CENTERED EMPTY STATE ── */
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10 my-auto">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#81D7B4]/10 border border-[#81D7B4]/20 shadow-sm mb-4">
                    <Wallet02Icon className="w-7 h-7 text-[#81D7B4]" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-1.5">
                    {savingsTab === 'active' ? 'No active savings' : 'No completed savings'}
                  </h3>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 max-w-[290px] mb-6 leading-relaxed">
                    {savingsTab === 'active' 
                      ? 'Start a new savings plan and lock tokens safely towards your goals.' 
                      : 'Completed and withdrawn savings plans will appear here once matured.'}
                  </p>
                  {savingsTab === 'active' && (
                    <Link
                      href="/dashboard/create-savings"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13.5px] font-bold text-white shadow-[0_4px_14px_rgba(129,215,180,0.35)] transition-all hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] bg-[#81D7B4]"
                      style={{ color: '#FFFFFF' }}
                    >
                      <PlusSignIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                      <span>Create a plan</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Bottom alignment footer with View All link (only shown when plans exist) */}
            {(savingsTab === 'active' ? activePlans : completedPlans).length > 0 && (
              <div className="px-6 py-3.5 border-t border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex items-center justify-between mt-auto relative z-10 shrink-0">
                <span className="text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                  Showing {Math.min((savingsTab === 'active' ? activePlans : completedPlans).length, 4)} of {(savingsTab === 'active' ? activePlans : completedPlans).length} plans
                </span>
                <Link 
                  href="/dashboard/plans" 
                  className="text-[12.5px] font-bold text-[#81D7B4] hover:text-[#6BBF9E] flex items-center gap-1.5 transition-colors group"
                >
                  View all in My Savings 
                  <ArrowUpRight01Icon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-5 flex flex-col gap-5">

          {/* Wallet Card */}
          <div data-tour="tvl-by-chain" className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4">
              <h2 className="text-[14px] sm:text-[15px] font-semibold text-gray-900 dark:text-white tracking-tight">Wallet TVL by Chain</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] sm:text-[11px] font-bold text-[#81D7B4] bg-[#81D7B4]/10 border border-[#81D7B4]/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4] animate-pulse"></span>
                  5 Chains Connected
                </span>
              </div>
            </div>
            
            {/* Card strip with mobile peek-out */}
            <div className="flex gap-3 sm:gap-4 px-4 sm:px-6 pb-5 overflow-x-auto hide-scrollbar scroll-pl-4 sm:scroll-pl-6" style={{ scrollSnapType: 'x mandatory' }}>
              {[
                { name: 'Base', key: 'Base', logoSrc: '/base-logo.svg', tag: 'L2 Network' },
                { name: 'Celo', key: 'Celo', logoSrc: '/celo.png', tag: 'Mobile-First' },
                { name: 'Lisk', key: 'Lisk', logoSrc: '/lisk-logo.png', tag: 'L2 Network' },
                { name: 'Binance Smart Chain', key: 'Binance Smart Chain', logoSrc: '/bsc.png', tag: 'EVM Chain' },
                { name: 'Avalanche', key: 'Avalanche', logoSrc: '/avalanche-logo.svg', tag: 'EVM Chain' },
              ].map(net => {
                const amountNum = chainSavings[net.key] || 0;
                const formattedAmount = `$${amountNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                const cardWidthClass = "w-[74vw] xs:w-[76vw] sm:w-[280px] lg:w-[260px] xl:w-[280px] max-w-[280px] shrink-0";

                return (
                  <div key={net.name} className={`${cardWidthClass} bg-gradient-to-br from-[#F4FAF7] to-white dark:from-[#16221E] dark:to-[#121A16] backdrop-blur-xl rounded-[20px] p-4 sm:p-5 relative overflow-hidden border border-[#81D7B4]/30 dark:border-[#81D7B4]/20 flex flex-col justify-between shadow-[0_4px_24px_-8px_rgba(5,150,105,0.12)] hover:border-[#81D7B4]/50 transition-all`} style={{ scrollSnapAlign: 'start' }}>
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(129,215,180,0.2)' }} />
                    
                    {/* Background Logo */}
                    <div className="absolute -bottom-3 -right-3 w-24 sm:w-28 h-24 sm:h-28 opacity-15 pointer-events-none z-0">
                      <Image src={net.logoSrc} alt={net.name} width={112} height={112} className="w-full h-full object-contain" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <span className="text-[11.5px] sm:text-[12px] font-extrabold text-gray-900 dark:text-gray-100 uppercase tracking-widest">
                          {net.name}
                        </span>
                        <span className="text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#81D7B4]/15 dark:bg-[#81D7B4]/20 text-emerald-800 dark:text-[#81D7B4] border border-[#81D7B4]/30 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-[#81D7B4]"></span>
                          Connected
                        </span>
                      </div>
                      <p className="text-[9.5px] sm:text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 font-medium uppercase tracking-wider">Locked Savings</p>
                      <p className="text-[28px] sm:text-[32px] font-instrument tracking-tight text-gray-900 dark:text-gray-50 mb-1.5 sm:mb-2 leading-none" style={{ letterSpacing: '-0.02em' }}>
                        {formattedAmount}
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-4 relative z-10">
                      <p className="text-[8.5px] sm:text-[9px] text-gray-400 dark:text-gray-500 mb-0.5 uppercase tracking-wider">Wallet address</p>
                      <p className="text-[12px] sm:text-[13px] font-bold tracking-widest text-gray-700 dark:text-gray-300 font-mono">
                        {evmAddress ? `**** ${evmAddress.slice(-4)}` : '---- ----'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent transactions */}
          <div className="bg-white dark:bg-[#121212]/60 dark:backdrop-blur-xl rounded-[24px] border border-gray-100 dark:border-white/10 shadow-sm relative z-0 overflow-hidden">
            <div className="flex items-end justify-between px-7 pt-7 pb-4">
              <h2 className="text-[24px] font-instrument text-gray-900 dark:text-white leading-none tracking-tight">Recent transactions</h2>
              <button 
                onClick={() => setShowTransactionsDrawer(true)} 
                className="text-[12px] font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-1 group"
              >
                View All
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {recentTransactions.length > 0 ? recentTransactions.slice(0, 5).map((tx) => (
                <div 
                  key={tx.id} 
                  onClick={() => setSelectedTxForDetails(tx)}
                  className="group flex items-center px-7 py-4 hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-all cursor-pointer"
                >
                  <div className="relative w-11 h-11 rounded-[14px] bg-gray-50 dark:bg-[#1a1a1a]/80 border border-gray-100 dark:border-white/5 flex items-center justify-center mr-4 shrink-0 transition-transform group-hover:scale-105 shadow-sm">
                    <Image
                      src={tx.isEth ? '/eth.png' : getTokenLogo(tx.token || '', tx.tokenLogo || '')}
                      alt={tx.name}
                      width={24}
                      height={24}
                      className="w-5 h-5 object-contain drop-shadow-sm"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm ${
                      tx.type === 'withdrawal' ? 'bg-amber-500 text-white' : tx.type === 'topup' ? 'bg-blue-500 text-white' : 'bg-[#81D7B4] text-gray-900'
                    }`}>
                      {tx.type === 'withdrawal' ? '↓' : tx.type === 'topup' ? '↑' : '+'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[14.5px] font-bold text-gray-900 dark:text-gray-100 truncate leading-none">{tx.name}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${tx.badgeStyle}`}>{tx.status}</span>
                    </div>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 font-medium leading-none truncate">{tx.subtitle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[20px] font-instrument text-gray-900 dark:text-white tabular-nums tracking-tight leading-none">
                      <span className={`mr-0.5 font-sans text-[15px] font-bold ${tx.amountPrefix === '+' ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        {tx.amountPrefix}
                      </span>
                      ${tx.amountValue}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No recent transactions.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Transactions Drawer */}
          {showTransactionsDrawer && (
            <>
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeInDrawer { 0% { opacity: 0; } 100% { opacity: 1; } }
                @keyframes slideInRightDrawer { 0% { transform: translateX(100%); } 100% { transform: translateX(0); } }
                .drawer-bg-animate { animation: fadeInDrawer 0.4s ease-out forwards; }
                .drawer-panel-animate { animation: slideInRightDrawer 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
              `}} />
              <div className="fixed inset-0 z-50 overflow-hidden">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm drawer-bg-animate" onClick={() => setShowTransactionsDrawer(false)} />
                
                <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white dark:bg-[#121212] shadow-2xl flex flex-col border-l border-gray-100 dark:border-white/10 drawer-panel-animate">
                  <div className="px-6 py-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#121212] z-10">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transaction History</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">All deposits, top-ups and withdrawals</p>
                    </div>
                    <button onClick={() => setShowTransactionsDrawer(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors">
                      <Cancel01Icon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                    {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                      <div 
                        key={`drawer-${tx.id}`} 
                        onClick={() => setSelectedTxForDetails(tx)}
                        className="flex items-center px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-all rounded-2xl border border-transparent hover:border-gray-100 dark:hover:border-white/5 cursor-pointer"
                      >
                        <div className="relative w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 flex items-center justify-center mr-3.5 shrink-0">
                          <Image
                            src={tx.isEth ? '/eth.png' : getTokenLogo(tx.token || '', tx.tokenLogo || '')}
                            alt={tx.name}
                            width={20}
                            height={20}
                            className="w-5 h-5 object-contain"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm ${
                            tx.type === 'withdrawal' ? 'bg-amber-500 text-white' : tx.type === 'topup' ? 'bg-blue-500 text-white' : 'bg-[#81D7B4] text-gray-900'
                          }`}>
                            {tx.type === 'withdrawal' ? '↓' : tx.type === 'topup' ? '↑' : '+'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[13.5px] font-bold text-gray-900 dark:text-gray-100 truncate">{tx.name}</p>
                            <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded uppercase ${tx.badgeStyle}`}>{tx.status}</span>
                          </div>
                          <p className="text-[11.5px] text-gray-500 dark:text-gray-400 font-medium truncate">{tx.subtitle}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[15px] font-instrument text-gray-900 dark:text-white tabular-nums">
                            <span className={`mr-0.5 font-sans text-[12px] font-bold ${tx.amountPrefix === '+' ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'}`}>
                              {tx.amountPrefix}
                            </span>
                            ${tx.amountValue}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-16">
                        <Activity01Icon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-[15px] font-semibold text-gray-700 dark:text-gray-300 mb-1">No transactions yet</p>
                        <p className="text-[13px] text-gray-400">Your deposits, top-ups, and withdrawals will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Fintech Transaction Details Modal */}
          {selectedTxForDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setSelectedTxForDetails(null)} />
              
              <div className="relative w-full max-w-md bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/10 rounded-[28px] p-6 shadow-2xl z-10 overflow-hidden">
                {/* Close Button */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Transaction Confirmed</span>
                  </div>
                  <button 
                    onClick={() => setSelectedTxForDetails(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                  >
                    <Cancel01Icon className="w-4 h-4" />
                  </button>
                </div>

                {/* Amount Header */}
                <div className="text-center py-6">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm">
                    <Image
                      src={selectedTxForDetails.isEth ? '/eth.png' : getTokenLogo(selectedTxForDetails.token || '', selectedTxForDetails.tokenLogo || '')}
                      alt={selectedTxForDetails.token}
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
                          className="text-[#81D7B4] hover:underline text-[11px] font-sans font-bold"
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
                    className="flex-1 py-3 px-4 rounded-xl bg-[#81D7B4] hover:bg-[#68C5A0] text-gray-900 font-bold text-xs flex items-center justify-center transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rewards */}
          <div className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-5">
            <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-4">Rewards</h2>
            <div className="bg-[#FDFBF0] dark:bg-[#81D7B4]/5 rounded-xl p-4 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#81D7B4] flex shrink-0 items-center justify-center">
                <ArrowUpRight01Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100 mb-0.5">Refer a new member</p>
                <p className="text-[11.5px] text-gray-500 dark:text-gray-400 leading-snug">Get $BTS for every new user who signs up and actively uses SaveFi. Write to support for more info.</p>
              </div>
              <Link
                href="/dashboard/referrals"
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full text-[12px] font-semibold text-gray-700 dark:text-gray-300 transition"
              >
                Copy link
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Currency dropdown — fixed portal so it escapes overflow containers ── */}
      {currencyDropdownOpen && (
        <>
          {/* Click-outside backdrop */}
          <div className="fixed inset-0 z-[998]" onClick={() => setCurrencyDropdownOpen(false)} />
          {/* Dropdown panel */}
          <div
            className="fixed z-[999] w-44 rounded-2xl overflow-hidden bg-white/95 dark:bg-[#121212]/95 border border-black/10 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)]"
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {currencies.map((c, i) => (
              <button
                key={c.code}
                onClick={() => { setSelectedCurrency(c); setCurrencyDropdownOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 text-[13px] font-medium transition-colors hover:bg-[#81D7B4]/10 dark:hover:bg-[#81D7B4]/20 ${
                  selectedCurrency.code === c.code
                    ? 'text-[#81D7B4] bg-[#81D7B4]/10 font-semibold'
                    : 'text-gray-700 dark:text-gray-200'
                } ${i > 0 ? 'border-t border-gray-50 dark:border-white/10' : ''}`}
              >
                <span>{c.label}</span>
                <span className="text-gray-400 text-[12px] font-mono">{c.symbol}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
