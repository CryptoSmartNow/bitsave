'use client';

import { Tick01Icon, ArrowLeft01Icon } from "hugeicons-react";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import axios from 'axios';
import { submitTransaction } from '@/utils/transactionSync';
import { usePrivy } from '@privy-io/react-auth';
import { trackSavingsCreated, trackError } from '@/lib/interactionTracker';
import { useReferrals } from '@/lib/useReferrals';
import { handleContractError } from '@/lib/contractErrorHandler';
import { useSavingsData } from '@/hooks/useSavingsData';
import NetworkDetection from '@/components/NetworkDetection';
import { useWalletDetection } from '@/hooks/useWalletDetection';
import WalletRecommendationModal from '@/components/WalletRecommendationModal';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '@/utils/networkLogos';
import { useEthersSigner } from '@/app/bizfi/hooks/useEthersSigner';

import {
  NETWORKS,
  createSavingsGeneric,
  ensureImageUrl,
  switchToNetwork,
  fetchGoodDollarPrice,
  getWalletBalances,
} from './lib/createSavingsLogic';

import TransactionStatusModal from './components/TransactionStatusModal';
import StepOnePlanDetails from './components/StepOnePlanDetails';
import StepTwoConfiguration from './components/StepTwoConfiguration';
import StepThreeReview from './components/StepThreeReview';

export default function CreateSavingsPage() {
  const { user, getAccessToken } = usePrivy();
  const router = useRouter();
  const { address: evmAddress } = useAccount();
  const signer = useEthersSigner();
  const { referralData, generateReferralCode, markReferralConversion } = useReferrals();
  const { 
    savingsData,
    isBaseNetwork,
    isCeloNetwork,
    isLiskNetwork,
    isBSCNetwork,
    isAvalancheNetwork,
  } = useSavingsData();
  const { walletInfo, shouldShowModal, dismissRecommendation } = useWalletDetection();
  const searchParams = useSearchParams();

  const address = evmAddress || user?.wallet?.address;

  // ─── Core form state ───
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [txProgress, setTxProgress] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USDC');
  const [chain, setChain] = useState('base');
  const [startDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [calendarNavigateDate, setCalendarNavigateDate] = useState<Date | null>(null);
  const [penalty, setPenalty] = useState('10%');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showCustomName, setShowCustomName] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);

  // Live Wallet Balance State
  const [tokenBalance, setTokenBalance] = useState('0');
  const [nativeBalance, setNativeBalance] = useState('0');
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);

  // GoodDollar state
  const [goodDollarPrice, setGoodDollarPrice] = useState(0.0001);
  const [goodDollarEquivalent, setGoodDollarEquivalent] = useState(0);

  // Network logos state
  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});
  const [selectedPenalty, setSelectedPenalty] = useState(10);
  const [errors, setErrors] = useState({ name: '', amount: '', endDate: '' });

  // ─── Stable references ───
  const planNamePresets = useMemo(() => [
    'Emergency Fund', 'House Rent', 'School Fees', 'Travel & Vacation',
    'Dream Car', 'New Gadget', 'Wedding Fund', 'Crypto Growth'
  ], []);
  const penalties = useMemo(() => ['10%', '20%', '30%'], []);

  const chains = useMemo(() => [
    { id: 'base', name: 'Base', logo: '/base-square-logo.svg', color: 'bg-[#81D7B4]/10', textColor: 'text-[#81D7B4]' },
    { id: 'celo', name: 'Celo', logo: networkLogos['celo']?.logoUrl || '/celo.png', color: 'bg-green-100', textColor: 'text-green-600', active: true },
    { id: 'lisk', name: 'Lisk', logo: networkLogos['lisk']?.logoUrl || '/lisk-logo.png', color: 'bg-purple-100', textColor: 'text-purple-600', active: true },
    { id: 'bsc', name: 'Binance Smart Chain', logo: networkLogos['bsc']?.logoUrl || '/bsc.png', color: 'bg-yellow-100', textColor: 'text-yellow-600', active: true },
    { id: 'avalanche', name: 'Avalanche', logo: networkLogos['avalanche']?.logoUrl || '/avalanche-logo.svg', color: 'bg-red-100', textColor: 'text-red-600', active: true },
  ], [networkLogos]);

  const nativeSymbol = useMemo(() => {
    return NETWORKS.find(n => n.id === chain)?.nativeSymbol || 'ETH';
  }, [chain]);

  useEffect(() => {
    setMounted(true);
    fetchMultipleNetworkLogos(['base', 'celo', 'lisk', 'bsc', 'avalanche'])
      .then(setNetworkLogos)
      .catch(() => {});
    fetchGoodDollarPrice().then(setGoodDollarPrice);
  }, []);

  // Fetch balances whenever chain, currency, or address changes
  const refreshBalances = useCallback(async () => {
    if (!address) return;
    setIsCheckingBalance(true);
    try {
      const res = await getWalletBalances(chain, currency, address);
      setTokenBalance(res.tokenBalance);
      setNativeBalance(res.nativeBalance);
    } catch (e) {
      console.error('Failed to query wallet balances:', e);
    } finally {
      setIsCheckingBalance(false);
    }
  }, [chain, currency, address]);

  useEffect(() => {
    refreshBalances();
  }, [refreshBalances]);

  // Update GoodDollar equivalent when amount or currency changes
  useEffect(() => {
    if (currency === 'Gooddollar' && amount && goodDollarPrice > 0) {
      const parsed = parseFloat(amount);
      if (!isNaN(parsed)) setGoodDollarEquivalent(parsed / goodDollarPrice);
    } else {
      setGoodDollarEquivalent(0);
    }
  }, [amount, currency, goodDollarPrice]);

  useEffect(() => {
    const num = parseInt(penalty.replace('%', ''));
    setSelectedPenalty(isNaN(num) ? 10 : num);
  }, [penalty]);

  useEffect(() => {
    if (address && !referralData) generateReferralCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Sync chain selection with connected network on mount
  useEffect(() => {
    if (isCeloNetwork) setChain('celo');
    else if (isLiskNetwork) setChain('lisk');
    else if (isBSCNetwork) setChain('bsc');
    else if (isAvalancheNetwork) setChain('avalanche');
    else if (isBaseNetwork) setChain('base');
  }, [isBaseNetwork, isCeloNetwork, isLiskNetwork, isBSCNetwork, isAvalancheNetwork]);

  const calculateMaturityTime = () => {
    if (endDate) {
      return Math.floor(endDate.getTime() / 1000);
    }
    return 0;
  };

  const validateStep = () => {
    let valid = true;
    const newErrors = { name: '', amount: '', endDate: '' };

    if (step === 1) {
      if (!name.trim()) {
        newErrors.name = 'Please enter a name for your savings plan';
        valid = false;
      } else if (name !== name.trim()) {
        newErrors.name = 'Plan name cannot have leading or trailing spaces';
        valid = false;
      }
      if (!chain) valid = false;
      if (!currency) valid = false;
    }

    if (step === 2) {
      const enteredAmount = parseFloat(amount);
      const availableBalance = parseFloat(tokenBalance || '0');

      if (!amount || isNaN(enteredAmount) || enteredAmount <= 0) {
        newErrors.amount = 'Please enter a valid deposit amount';
        valid = false;
      } else if (enteredAmount > availableBalance) {
        newErrors.amount = `Insufficient wallet balance. You have ${availableBalance.toFixed(2)} ${currency}, but entered ${amount} ${currency}.`;
        valid = false;
      }

      if (!endDate) {
        newErrors.endDate = 'Please select a target maturity date';
        valid = false;
      } else if (startDate && endDate && endDate <= startDate) {
        newErrors.endDate = 'Target maturity date must be in the future';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const isStep1Invalid = useMemo(() => {
    if (step !== 1) return false;
    if (!name.trim()) return true;
    if (!chain || !currency) return true;
    return false;
  }, [step, name, chain, currency]);

  const isStep2Invalid = useMemo(() => {
    if (step !== 2) return false;
    const enteredAmount = parseFloat(amount || '0');
    const availableBalance = parseFloat(tokenBalance || '0');
    if (!amount || isNaN(enteredAmount) || enteredAmount <= 0) return true;
    if (enteredAmount > availableBalance) return true;
    if (!endDate) return true;
    if (startDate && endDate && endDate <= startDate) return true;
    return false;
  }, [step, amount, tokenBalance, endDate, startDate]);

  const isContinueDisabled = isStep1Invalid || isStep2Invalid;

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevious = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    setTxProgress('Verifying wallet balance & criteria...');

    try {
      const selectedNetwork = NETWORKS.find(n => n.id === chain);
      const tokenObj = selectedNetwork?.tokens.find(t => t.symbol === currency);
      if (!selectedNetwork || !tokenObj) throw new Error('Selected network or token is not supported.');

      const enteredAmount = parseFloat(amount);
      const availableBalance = parseFloat(tokenBalance || '0');
      if (enteredAmount > availableBalance) {
        throw new Error(`Insufficient ${currency} balance. Your wallet has ${availableBalance.toFixed(2)} ${currency}, but you are trying to save ${amount} ${currency}.`);
      }

      const maturity = calculateMaturityTime();
      if (!maturity || maturity <= Math.floor(Date.now() / 1000)) {
        throw new Error('Please select a valid future maturity date.');
      }
      
      const receipt = await createSavingsGeneric({
        networkId: selectedNetwork.id,
        tokenSymbol: tokenObj.symbol,
        planName: name.trim(),
        amountRaw: amount,
        maturity,
        penalty: selectedPenalty,
        safeMode: false,
        signerOverride: signer,
        address: address || '',
        onProgress: (status) => setTxProgress(status),
      });

      const receiptHash = receipt?.hash || receipt?.transactionHash || '';
      if (!receiptHash) {
        throw new Error('No transaction hash received from network.');
      }

      // Referral conversion
      const referralCode = localStorage.getItem('referralCode') || new URLSearchParams(window.location.search).get('ref');
      if (referralCode) {
        markReferralConversion(referralCode);
        localStorage.removeItem('referralCode');
      }

      // Record transaction to backend sync
      try {
        await submitTransaction({
          amount: parseFloat(amount).toString(),
          txnhash: receiptHash,
          chain,
          savingsname: name.trim(),
          useraddress: address || '',
          transaction_type: 'deposit',
          currency
        }, getAccessToken);
      } catch (apiError) {
        console.error('Failed to record transaction to backend:', apiError);
      }

      if (address) {
        trackSavingsCreated(address, { amount, currency, chain, planName: name.trim(), txHash: receiptHash });
      }

      // If this is part of a group saving, record contribution
      if (groupId && address) {
        try {
          await axios.put('/api/savings/group', {
            groupId,
            walletAddress: address,
            amount,
            action: 'contribute'
          });
        } catch (groupErr) {
          console.error('Failed to record group contribution:', groupErr);
        }
      }

      setTxHash(receiptHash);
      setSuccess(true);
      setShowTransactionModal(true);
      refreshBalances();
    } catch (err) {
      console.error('Error creating savings plan:', err);
      trackError(address, err instanceof Error ? err.message : 'Unknown error', {
        action: 'create_savings',
        context: { planName: name, amount, currency, chain }
      });
      setSuccess(false);
      setError(handleContractError(err, 'main'));
      setShowTransactionModal(true);
    } finally {
      setSubmitting(false);
      setTxProgress(null);
    }
  };

  const handleCloseTransactionModal = () => {
    setShowTransactionModal(false);
    if (success) router.push('/dashboard');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-transparent pt-4 pb-16 px-4 sm:px-6 lg:px-10 overflow-x-hidden relative font-sans">
      <NetworkDetection />

      {/* Subtle Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-[#81D7B4]/10 to-transparent rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Transaction Status Modal */}
      {showTransactionModal && (
        <TransactionStatusModal
          success={success}
          error={typeof error === 'string' ? error : (error as any)?.message || null}
          txHash={txHash}
          chain={chain}
          currency={currency}
          amount={amount}
          referralData={referralData}
          savingsData={{ deposits: savingsData?.deposits || 0 }}
          handleClose={handleCloseTransactionModal}
          tokenBalance={tokenBalance}
          nativeBalance={nativeBalance}
          nativeSymbol={nativeSymbol}
        />
      )}

      <div className="max-w-[1300px] mx-auto w-full flex flex-col lg:flex-row gap-8 lg:gap-14 pt-2 lg:pt-6">
        
        {/* ─── LEFT PANE: Sticky Summary Card ─── */}
        <div className="w-full lg:w-[380px] flex-shrink-0 flex flex-col">
          <div className="lg:sticky lg:top-24">
            <div className="mb-5">
              <span className="px-2.5 py-1 rounded-lg bg-[#81D7B4]/15 text-[#81D7B4] border border-[#81D7B4]/25 text-[11px] font-bold inline-block mb-2">
                SaveFi Vault Engine
              </span>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-normal leading-relaxed">
                Lock stablecoins on-chain with customizable maturity and penalty-backed discipline.
              </p>
            </div>

            {/* Live Preview Card */}
            {!success && step < 3 && (
              <div className="bg-white/90 dark:bg-[#0c121e]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-[2rem] p-6 shadow-xl shadow-gray-900/5 dark:shadow-black/20 mb-6 relative overflow-hidden">
                 <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#81D7B4] font-bold mb-0.5">Live Vault Preview</p>
                      <h3 className="text-xl font-normal font-instrument text-gray-900 dark:text-white truncate max-w-[190px]">{name || 'Unnamed Plan'}</h3>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-sm">
                       {chain ? (
                         <Image src={ensureImageUrl(chains.find(c => c.id === chain)?.logo || '/base-square-logo.svg')} alt={chain} width={18} height={18} className="rounded-full object-contain" />
                       ) : (
                         <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-700" />
                       )}
                    </div>
                 </div>
                 
                 <div className="mb-4">
                    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Target Amount</p>
                    <p className="text-4xl font-normal font-instrument text-gray-900 dark:text-white tracking-tight leading-none">${amount ? parseFloat(amount).toLocaleString() : '0'} <span className="text-xs font-bold font-sans text-gray-400">{currency}</span></p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-white/10 text-xs">
                    <div>
                       <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5 font-bold">Maturity</p>
                       <p className="font-normal font-instrument text-base text-gray-900 dark:text-white">{endDate ? format(endDate, 'MMM d, yyyy') : '--'}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5 font-bold">Strictness</p>
                       <p className="font-normal font-instrument text-base text-red-500">{penalty} Early Penalty</p>
                    </div>
                 </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {!success && (
              <div className="flex justify-between items-center gap-3">
                 {step > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 bg-white dark:bg-[#111827] shadow-sm border border-gray-200/80 dark:border-white/10 cursor-pointer"
                    >
                      <ArrowLeft01Icon className="w-4 h-4" />
                      Back
                    </button>
                 )}
                 {step < 3 && (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={isContinueDisabled}
                      className={`px-7 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ml-auto ${
                        isContinueDisabled
                          ? "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none"
                          : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md hover:bg-gray-800 dark:hover:bg-gray-100 cursor-pointer"
                      }`}
                    >
                      Continue
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-180" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                 )}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT PANE: Guided Multi-step Form ─── */}
        <div className="flex-1 min-w-0">
          <div className="w-full">
            {/* Step indicator */}
            {!success && (
              <div className="flex items-center gap-2 mb-8">
                {[
                  { title: '1. Plan & Asset' },
                  { title: '2. Amount & Goal' },
                  { title: '3. Confirm & Lock' }
                ].map((s, i) => {
                  const stepNum = i + 1;
                  const isCompleted = step > stepNum;
                  const isCurrent = step === stepNum;
                  return (
                    <div key={s.title} className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[11px] font-bold ${isCurrent ? 'text-[#81D7B4]' : isCompleted ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                          {s.title}
                        </span>
                      </div>
                      <div className={`h-1.5 rounded-full transition-all duration-300 ${isCurrent ? 'bg-[#81D7B4]' : isCompleted ? 'bg-[#81D7B4]/50' : 'bg-gray-200 dark:bg-white/10'}`} />
                    </div>
                  );
                })}
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === 1 && (
                <StepOnePlanDetails
                  name={name} setName={setName}
                  planNamePresets={planNamePresets}
                  showCustomName={showCustomName} setShowCustomName={setShowCustomName}
                  errors={errors}
                  chain={chain} setChain={setChain}
                  switchToNetwork={switchToNetwork}
                  chains={chains} NETWORKS={NETWORKS}
                  currency={currency} setCurrency={setCurrency}
                  ensureImageUrl={ensureImageUrl}
                  handleNext={handleNext}
                />
              )}
              {step === 2 && (
                <StepTwoConfiguration
                  amount={amount} setAmount={setAmount}
                  currency={currency} errors={errors}
                  goodDollarEquivalent={goodDollarEquivalent}
                  startDate={startDate} endDate={endDate} setEndDate={setEndDate}
                  calendarNavigateDate={calendarNavigateDate as Date} setCalendarNavigateDate={setCalendarNavigateDate as (d: Date) => void}
                  penalties={penalties} penalty={penalty} setPenalty={setPenalty}
                  handlePrevious={handlePrevious} handleNext={handleNext}
                  tokenBalance={tokenBalance}
                  nativeBalance={nativeBalance}
                  nativeSymbol={nativeSymbol}
                  isCheckingBalance={isCheckingBalance}
                />
              )}
              {step === 3 && (
                <StepThreeReview
                  name={name} amount={amount} currency={currency}
                  chain={chain} chains={chains} ensureImageUrl={ensureImageUrl}
                  startDate={startDate} endDate={endDate} penalty={penalty}
                  savingsData={{ deposits: savingsData?.deposits || 0 }}
                  termsAgreed={termsAgreed} setTermsAgreed={setTermsAgreed}
                  handlePrevious={handlePrevious} handleSubmit={handleSubmit}
                  submitting={submitting} isLoading={isLoading}
                  txProgress={txProgress}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Wallet Recommendation Modal */}
      <WalletRecommendationModal
        isOpen={shouldShowModal}
        onClose={dismissRecommendation}
        onDontShowAgain={() => {}}
        currentWallet={walletInfo?.name || 'Unknown Wallet'}
      />
    </div>
  );
}