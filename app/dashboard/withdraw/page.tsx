'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft01Icon, 
  PiggyBankIcon, 
  Coins01Icon, 
  ArrowRight01Icon, 
  Clock01Icon, 
  AlertCircleIcon, 
  Tick01Icon, 
  PlusSignIcon, 
  SecurityCheckIcon,
  Wallet02Icon,
  Search01Icon
} from "hugeicons-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import Image from 'next/image';
import { useSavingsData } from '@/hooks/useSavingsData';
import WithdrawModal from '@/components/WithdrawModal';
import { formatTimestamp } from '@/utils/dateUtils';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '@/utils/networkLogos';

function getTokenLogo(tokenName?: string, tokenLogo?: string) {
  if (tokenLogo) return tokenLogo;
  if (!tokenName) return '/usdclogo.png';
  if (tokenName === 'cUSD') return '/cusd.png';
  if (tokenName === 'cNGN') return '/cngn.png';
  if (tokenName === 'USDGLO') return '/usdglo.png';
  if (tokenName === 'Gooddollar' || tokenName === '$G') return '/$g.png';
  if (tokenName === 'USDC') return '/usdclogo.png';
  return `/${tokenName.toLowerCase()}.png`;
}

export default function WithdrawPage() {
  const { address: wagmiAddress, isConnected, isConnecting, isReconnecting } = useAccount();
  const { user, ready, authenticated } = usePrivy();
  const privyEvmWallet = user?.linkedAccounts?.find(
    (account: any) => account.type === 'wallet' && account.chainType === 'ethereum'
  ) as { address: string } | undefined;
  const address = wagmiAddress || privyEvmWallet?.address || user?.wallet?.address;

  // True while Privy or Wagmi is rehydrating authentication state
  const isAuthHydrating = (!ready && !isConnected) || isConnecting || isReconnecting;

  const { savingsData, isLoading, isBackgroundLoading, refetch } = useSavingsData();
  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all');

  const [withdrawModal, setWithdrawModal] = useState<{
    isOpen: boolean;
    planName: string;
    isEth: boolean;
    amount?: string;
    penaltyPercentage: number;
    tokenName: string;
    isCompleted: boolean;
    maturityTime?: number;
    contractAddress?: string;
    network?: string;
    startTime?: number;
  }>({
    isOpen: false,
    planName: '',
    isEth: false,
    amount: '0',
    penaltyPercentage: 0,
    tokenName: 'USDC',
    isCompleted: false,
  });

  useEffect(() => {
    fetchMultipleNetworkLogos(['base', 'celo', 'lisk', 'avalanche', 'bsc'])
      .then(setNetworkLogos)
      .catch(() => {});
  }, []);

  const currentPlans = savingsData?.currentPlans || [];
  const completedPlans = savingsData?.completedPlans || [];
  const allWithdrawablePlans = [...currentPlans, ...completedPlans.filter(p => !p.isWithdrawn && p.status !== 'Withdrawn')];

  const filteredPlans = allWithdrawablePlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plan.tokenName && plan.tokenName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesNetwork = selectedNetwork === 'all' || (plan.network && plan.network.toLowerCase() === selectedNetwork.toLowerCase());
    return matchesSearch && matchesNetwork;
  });

  const openWithdrawModal = (plan: any) => {
    const isCompleted = plan.status === 'Completed' || (plan.maturityTime ? Date.now() / 1000 >= plan.maturityTime : false);
    setWithdrawModal({
      isOpen: true,
      planName: plan.name,
      isEth: plan.isEth || false,
      amount: plan.currentAmount || plan.amount || '0',
      penaltyPercentage: plan.penaltyPercentage || 0,
      tokenName: plan.tokenName || (plan.isEth ? 'ETH' : 'USDC'),
      isCompleted: isCompleted,
      maturityTime: plan.maturityTime,
      contractAddress: plan.contractAddress,
      network: plan.network,
      startTime: plan.startTime,
    });
  };

  // If auth is still resolving or data is loading, show page skeleton instead of false "Connect Wallet" screen
  if (!isAuthHydrating && ready && !authenticated && !isConnected && !address) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-[#121212] backdrop-blur-2xl border border-gray-200/80 dark:border-white/10 rounded-3xl p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#81D7B4]/15 border border-[#81D7B4]/30 flex items-center justify-center mx-auto mb-5 text-[#81D7B4]">
            <Wallet02Icon className="w-8 h-8 text-emerald-600 dark:text-[#81D7B4]" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Please connect your wallet to view and withdraw your active savings.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-5 bg-[#81D7B4] hover:bg-[#6BC7A0] text-white font-bold rounded-xl text-sm transition-all shadow-[0_4px_14px_rgba(129,215,180,0.35)]"
          >
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-2 px-2 sm:px-4 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/dashboard" 
              className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all inline-flex items-center justify-center"
            >
              <ArrowLeft01Icon className="w-4 h-4" />
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-[#81D7B4] bg-[#81D7B4]/15 px-3 py-1 rounded-full border border-[#81D7B4]/30">
              SaveFi Protocol
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Withdraw <span className="font-instrument italic font-normal text-emerald-600 dark:text-[#81D7B4]">Savings</span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Select an active or completed savings plan to claim your funds.
          </p>
        </div>

        <Link
          href="/dashboard/create-savings"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#81D7B4] hover:bg-[#6BC7A0] text-white font-bold text-sm transition-all shadow-[0_4px_16px_rgba(129,215,180,0.35)] shrink-0 self-start md:self-auto"
        >
          <PlusSignIcon className="w-4 h-4 text-white" />
          <span>Create New Plan</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      {allWithdrawablePlans.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search01Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search savings by name or token..."
              className="w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#81D7B4] transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'base', 'celo', 'lisk', 'avalanche', 'bsc'].map((net) => (
              <button
                key={net}
                onClick={() => setSelectedNetwork(net)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all border shrink-0 ${
                  selectedNetwork === net
                    ? 'bg-[#81D7B4]/20 border-[#81D7B4]/50 text-emerald-700 dark:text-[#81D7B4]'
                    : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10'
                }`}
              >
                {net}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-3xl bg-gray-100 dark:bg-[#121212] border border-gray-200 dark:border-white/5 animate-pulse p-6"></div>
          ))}
        </div>
      ) : filteredPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredPlans.map((plan, index) => {
              const currentAmt = parseFloat(plan.currentAmount || '0');
              const targetAmt = parseFloat(plan.targetAmount || '0');
              const progress = targetAmt > 0 ? Math.min(100, (currentAmt / targetAmt) * 100) : 100;
              const isMature = plan.maturityTime ? (Date.now() / 1000 >= plan.maturityTime) : false;
              const tokenLogo = getTokenLogo(plan.tokenName, plan.tokenLogo);
              const networkKey = plan.network ? plan.network.toLowerCase() : 'celo';
              const networkLogo = networkLogos[networkKey]?.logoUrl || `/${networkKey}.png`;

              return (
                <motion.div
                  key={plan.id || `${plan.name}-${index}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white dark:bg-[#121212] backdrop-blur-xl border border-gray-200/80 dark:border-white/10 hover:border-[#81D7B4]/60 dark:hover:border-[#81D7B4]/40 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_32px_rgba(129,215,180,0.15)]"
                >
                  <div>
                    {/* Top Row: Token & Network Badges */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                          <Image
                            src={tokenLogo}
                            alt={plan.tokenName || 'Token'}
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-black text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-[#81D7B4] transition-colors">
                            {plan.name}
                          </h3>
                          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {plan.tokenName || 'USDC'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 px-2.5 py-1 rounded-full shrink-0">
                        <Image
                          src={networkLogo}
                          alt={plan.network || 'Network'}
                          width={14}
                          height={14}
                          className="rounded-full"
                        />
                        <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 capitalize">
                          {plan.network || 'Celo'}
                        </span>
                      </div>
                    </div>

                    {/* Balance Display */}
                    <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-white/5 mb-4">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Available Balance</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-[#81D7B4] font-instrument">
                          {currentAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {plan.tokenName || 'USDC'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                        <div 
                          className="bg-gradient-to-r from-[#81D7B4] to-[#6BC7A0] h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Maturity & Penalty Status */}
                    <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock01Icon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                          Maturity:
                        </span>
                        <span className="font-bold text-gray-800 dark:text-gray-300 text-[11px]">
                          {plan.maturityTime ? formatTimestamp(plan.maturityTime) : 'Flexible'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[11px]">
                          <AlertCircleIcon className="w-3.5 h-3.5 text-amber-500" />
                          Early Penalty:
                        </span>
                        <span className={`font-bold text-[11px] ${isMature ? 'text-emerald-600 dark:text-[#81D7B4]' : 'text-amber-500'}`}>
                          {isMature ? '0% (Matured)' : `${plan.penaltyPercentage || 0}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Withdraw Button */}
                  <button
                    onClick={() => openWithdrawModal(plan)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#81D7B4] to-[#6BC7A0] hover:from-[#6BC7A0] hover:to-[#58B28D] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_4px_14px_rgba(129,215,180,0.3)] hover:shadow-[0_6px_20px_rgba(129,215,180,0.4)] flex items-center justify-center gap-2 group-hover:scale-[1.01]"
                  >
                    <span>Withdraw Funds</span>
                    <ArrowRight01Icon className="w-4 h-4 text-white" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State embedded naturally on the page */
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto text-center py-16 px-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#81D7B4]/15 border border-[#81D7B4]/30 flex items-center justify-center mx-auto mb-4 text-[#81D7B4] shadow-[0_0_24px_rgba(129,215,180,0.15)]">
            <PiggyBankIcon className="w-8 h-8 text-emerald-600 dark:text-[#81D7B4]" />
          </div>

          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            No Savings to Withdraw
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
            You don&apos;t have any active or completed savings plans ready for withdrawal yet. Lock crypto into high-yield SaveFi child vaults and start earning today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/create-savings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#81D7B4] hover:bg-[#6BC7A0] text-white font-bold text-sm transition-all shadow-[0_4px_16px_rgba(129,215,180,0.35)]"
            >
              <PlusSignIcon className="w-4 h-4 text-white" />
              <span>Create Savings Plan</span>
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white font-bold text-sm transition-all"
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Withdraw Modal Integration */}
      <WithdrawModal
        isOpen={withdrawModal.isOpen}
        onClose={() => {
          setWithdrawModal(prev => ({ ...prev, isOpen: false }));
          refetch(true);
        }}
        planName={withdrawModal.planName}
        isEth={withdrawModal.isEth}
        amount={withdrawModal.amount}
        penaltyPercentage={withdrawModal.penaltyPercentage}
        tokenName={withdrawModal.tokenName}
        isCompleted={withdrawModal.isCompleted}
        maturityTime={withdrawModal.maturityTime}
        networkLogos={networkLogos}
        contractAddress={withdrawModal.contractAddress}
        network={withdrawModal.network}
        startTime={withdrawModal.startTime}
      />
    </div>
  );
}