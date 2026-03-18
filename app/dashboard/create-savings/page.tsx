'use client'

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Exo } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import axios from 'axios';
import { trackSavingsCreated, trackError, trackPageVisit } from '@/lib/interactionTracker';
import { useReferrals } from '@/lib/useReferrals';
import { handleContractError } from '@/lib/contractErrorHandler';
import { useSavingsData } from '@/hooks/useSavingsData';
import { HiCheckCircle, HiBolt } from 'react-icons/hi2';
import { FaRobot } from 'react-icons/fa6';
import NetworkDetection from '@/components/NetworkDetection';
import { useWalletDetection } from '@/hooks/useWalletDetection';
import WalletRecommendationModal from '@/components/WalletRecommendationModal';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '@/utils/networkLogos';

import {
  NETWORKS,
  createSavingsGeneric,
  ensureImageUrl,
  switchToNetwork,
  fetchGoodDollarPrice,
  parseNLPInput,
} from './lib/createSavingsLogic';

import TransactionStatusModal from './components/TransactionStatusModal';
import NLPInputBlock from './components/NLPInputBlock';
import StepOnePlanDetails from './components/StepOnePlanDetails';
import StepTwoConfiguration from './components/StepTwoConfiguration';
import StepThreeReview from './components/StepThreeReview';

const exo = Exo({ subsets: ['latin'], display: 'swap' });

export default function CreateSavingsPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { referralData, generateReferralCode, markReferralConversion } = useReferrals();
  const { savingsData } = useSavingsData();
  const { walletInfo, shouldShowModal, dismissRecommendation } = useWalletDetection();

  // ─── Core form state ───
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
  const [isConnected, setIsConnected] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showCustomName, setShowCustomName] = useState(false);

  // NLP mode state
  const [nlpMode, setNlpMode] = useState(false);
  const [nlpText, setNlpText] = useState('');
  const [nlpParsed, setNlpParsed] = useState<{
    name?: string; amount?: string; currency?: string;
    network?: string; duration?: number; penalty?: string;
  } | null>(null);

  // GoodDollar state
  const [goodDollarPrice, setGoodDollarPrice] = useState(0.0001);
  const [goodDollarEquivalent, setGoodDollarEquivalent] = useState(0);

  // Network logos state
  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});
  const [isLoadingLogos, setIsLoadingLogos] = useState(true);

  const [walletAddress, setWalletAddress] = useState<string>('');
  const [selectedPenalty, setSelectedPenalty] = useState(1);
  const [errors, setErrors] = useState({ name: '', amount: '', endDate: '' });

  // ─── Stable references ───
  const planNamePresets = useMemo(() => [
    'Emergency Fund', 'Rent', 'School Fees', 'Vacation',
    'New Car', 'Gadget', 'Wedding', 'Investment'
  ], []);
  const penalties = useMemo(() => ['10%', '20%', '30%'], []);

  const chains = useMemo(() => [
    { id: 'base', name: 'Base', logo: networkLogos['base']?.logoUrl || '/base.png', color: 'bg-[#81D7B4]/10', textColor: 'text-[#81D7B4]' },
    { id: 'celo', name: 'Celo', logo: networkLogos['celo']?.logoUrl || '/celo.png', color: 'bg-green-100', textColor: 'text-green-600', active: true },
    { id: 'lisk', name: 'Lisk', logo: networkLogos['lisk']?.logoUrl || '/lisk-logo.png', color: 'bg-purple-100', textColor: 'text-purple-600', active: true },
    { id: 'avalanche', name: 'Avalanche', logo: networkLogos['avalanche']?.logoUrl || '/avalanche-logo.svg', color: 'bg-red-100', textColor: 'text-red-600', active: true },
    { id: 'bsc', name: 'Binance Smart Chain', logo: networkLogos['bsc']?.logoUrl || '/bsc.png', color: 'bg-yellow-100', textColor: 'text-yellow-600', active: true },
    { id: 'solana', name: 'Solana', logo: networkLogos['solana']?.logoUrl || '/solana.png', color: 'bg-purple-100', textColor: 'text-purple-600', isComingSoon: true },
  ], [networkLogos]);

  // ─── DayRange tracking for maturity calculation ───
  interface DayRange {
    from: { year: number | undefined; month: number | undefined; day: number | undefined } | null;
    to: { year: number | undefined; month: number | undefined; day: number | undefined } | null;
  }
  const [selectedDayRange, setSelectedDayRange] = useState<DayRange>({ from: null, to: null });

  // ─── Effects ───
  useEffect(() => {
    if (endDate) {
      setSelectedDayRange({
        from: { year: startDate?.getFullYear(), month: startDate ? startDate.getMonth() + 1 : 0, day: startDate?.getDate() },
        to: { year: endDate.getFullYear(), month: endDate.getMonth() + 1, day: endDate.getDate() }
      });
      if (errors.endDate) setErrors(prev => ({ ...prev, endDate: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  useEffect(() => { setSelectedPenalty(parseInt(penalty)); }, [penalty]);

  useEffect(() => {
    if (address && !referralData) generateReferralCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // NLP live parse
  useEffect(() => {
    if (nlpMode && nlpText.trim()) setNlpParsed(parseNLPInput(nlpText));
    else setNlpParsed(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nlpText, nlpMode]);

  // Wallet connection check
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          setIsConnected(accounts && accounts.length > 0);
          if (accounts && accounts.length > 0) setWalletAddress(accounts[0]);
        } catch (error) { console.error('Error checking wallet connection:', error); }
      }
    };
    checkConnection();
  }, []);

  useEffect(() => {
    const getWalletAddress = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) setWalletAddress(accounts[0]);
        }
      } catch (error) { console.error('Error getting wallet address:', error); }
    };
    getWalletAddress();
  }, []);

  // Transaction modal trigger
  useEffect(() => {
    if (error || (success && txHash)) setShowTransactionModal(true);
  }, [success, error, txHash]);

  // Mount and page tracking
  const hasTrackedRef = useRef(false);
  useEffect(() => {
    setMounted(true);
    if (address && !hasTrackedRef.current) {
      hasTrackedRef.current = true;
      trackPageVisit('/dashboard/create-savings', { walletAddress: address });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // GoodDollar price fetching
  useEffect(() => { fetchGoodDollarPrice().then(setGoodDollarPrice); }, []);

  useEffect(() => {
    if (currency === 'Gooddollar' && amount && goodDollarPrice) {
      const cleanAmount = amount.replace(/[^0-9.]/g, '');
      const usdAmount = parseFloat(cleanAmount);
      if (!isNaN(usdAmount) && usdAmount > 0) setGoodDollarEquivalent(usdAmount / goodDollarPrice);
      else setGoodDollarEquivalent(0);
    }
  }, [amount, goodDollarPrice, currency]);

  // Network logos
  useEffect(() => {
    const loadNetworkLogos = async () => {
      try {
        setIsLoadingLogos(true);
        const logos = await fetchMultipleNetworkLogos(['base', 'celo', 'lisk', 'avalanche', 'bsc']);
        setNetworkLogos(logos);
      } catch (error) { console.error('Error loading network logos:', error); }
      finally { setIsLoadingLogos(false); }
    };
    loadNetworkLogos();
  }, []);

  // ─── Helpers ───
  const applyNLPValues = () => {
    if (!nlpParsed) return;
    if (nlpParsed.name) setName(nlpParsed.name);
    if (nlpParsed.amount) setAmount(nlpParsed.amount);
    if (nlpParsed.currency) setCurrency(nlpParsed.currency);
    if (nlpParsed.network) setChain(nlpParsed.network);
    if (nlpParsed.penalty && ['10%', '20%', '30%'].includes(nlpParsed.penalty)) setPenalty(nlpParsed.penalty);
    if (nlpParsed.duration && startDate) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + nlpParsed.duration);
      setEndDate(d);
      setCalendarNavigateDate(d);
    }
    setNlpMode(false);
    setStep(3);
  };

  const calculateMaturityTime = () => {
    if (selectedDayRange && selectedDayRange.to) {
      return Math.floor(new Date(
        selectedDayRange.to.year ?? 0,
        (selectedDayRange.to.month ?? 1) - 1,
        selectedDayRange.to.day ?? 1
      ).getTime() / 1000);
    }
    return 0;
  };

  const validateStep = () => {
    let valid = true;
    const newErrors = { name: '', amount: '', endDate: '' };
    if (step === 1) {
      if (!name.trim()) { newErrors.name = 'Please enter a name for your savings plan'; valid = false; }
      else if (name !== name.trim()) { newErrors.name = 'Plan name cannot have leading or trailing spaces'; valid = false; }
      else {
        const existingPlanNames = [
          ...savingsData.currentPlans.map(plan => plan.name.toLowerCase()),
          ...savingsData.completedPlans.map(plan => plan.name.toLowerCase())
        ];
        if (existingPlanNames.includes(name.trim().toLowerCase())) { newErrors.name = 'Plan name already exists. Please choose a different name.'; valid = false; }
      }
      if (!chain) valid = false;
      if (!currency) valid = false;
    }
    if (step === 2) {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { newErrors.amount = 'Please enter a valid amount'; valid = false; }
      if (!endDate) { newErrors.endDate = 'Please select an end date'; valid = false; }
      else if (startDate && endDate && endDate <= startDate) { newErrors.endDate = 'End date must be after start date'; valid = false; }
    }
    setErrors(newErrors);
    return valid;
  };

  const handleNext = () => { if (validateStep()) { setStep(step + 1); window.scrollTo(0, 0); } };
  const handlePrevious = () => { setStep(step - 1); window.scrollTo(0, 0); };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const selectedNetwork = NETWORKS.find(n => n.id === chain);
      const tokenObj = selectedNetwork?.tokens.find(t => t.symbol === currency);
      if (!selectedNetwork || !tokenObj) throw new Error('Selected network or token is not supported.');

      const maturity = calculateMaturityTime();
      const receipt = await createSavingsGeneric({
        networkId: selectedNetwork.id,
        tokenSymbol: tokenObj.symbol,
        planName: name,
        amountRaw: amount,
        maturity,
        penalty: selectedPenalty,
        safeMode: false,
        address: address || '',
        additionalOptions: {}
      });

      // Referral conversion
      const referralCode = localStorage.getItem('referralCode') || new URLSearchParams(window.location.search).get('ref');
      if (referralCode) { markReferralConversion(referralCode); localStorage.removeItem('referralCode'); }

      // Record transaction
      try {
        await axios.post('/api/transactions', {
          amount: parseFloat(amount), txnhash: receipt.hash, chain, savingsname: name,
          useraddress: address, transaction_type: 'deposit', currency
        }, { headers: { 'accept': 'application/json', 'Content-Type': 'application/json' } });
      } catch (apiError) { console.error('Failed to record transaction:', apiError); }

      if (address) {
        trackSavingsCreated(address, { amount, currency, chain, planName: name, txHash: receipt.hash });
      }

      setTxHash(receipt.hash);
      setSuccess(true);
    } catch (err) {
      console.error('Error creating savings plan:', err);
      trackError(address, err instanceof Error ? err.message : 'Unknown error', {
        action: 'create_savings',
        context: { planName: name, amount, currency, chain }
      });
      setSuccess(false);
      setError(handleContractError(err, 'main'));
    } finally { setSubmitting(false); }
  };

  const handleCloseTransactionModal = () => {
    setShowTransactionModal(false);
    if (success) router.push('/dashboard');
  };

  if (!mounted) return null;

  // ─── Render ───
  return (
    <div className={`${exo.className} min-h-screen bg-[#F7FCFA] pt-20 pb-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative`}>
      <NetworkDetection />

      {/* Background decorations */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#81D7B4]/5 via-transparent to-transparent pointer-events-none" />
      <div className="fixed -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#81D7B4]/10 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#81D7B4]/10 to-transparent blur-3xl pointer-events-none" />

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
          savingsData={{ deposits: savingsData.deposits }}
          handleClose={handleCloseTransactionModal}
        />
      )}

      {/* ─── Progress Stepper ─── */}
      <div className="max-w-3xl lg:max-w-4xl mx-auto mt-6 mb-8 px-4 lg:px-8">
        <div className="flex items-center justify-between mb-4 px-2">
          {['Plan Details', 'Configuration', 'Review'].map((label, i) => {
            const stepNum = i + 1;
            const isCompleted = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm ${isCompleted || isCurrent ? 'bg-[#81D7B4] text-white ring-4 ring-[#81D7B4]/20' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : stepNum}
                </div>
                <span className={`text-sm font-bold transition-colors hidden sm:block ${isCurrent ? 'text-gray-900' : isCompleted ? 'text-[#81D7B4]' : 'text-gray-400'}`}>{label}</span>
              </div>
            );
          })}
        </div>
        <div className="h-2 bg-gray-100/80 p-0.5 rounded-full overflow-hidden border border-gray-200/50 shadow-inner block">
          <motion.div
            className="h-full bg-gradient-to-r from-[#81D7B4] to-[#5BBEA0] rounded-full"
            initial={false}
            animate={{ width: `${((step - 1) / 2) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ─── Mode Toggle ─── */}
      <div className="max-w-3xl lg:max-w-4xl mx-auto mb-8 flex justify-center px-4">
        <div className="inline-flex bg-white rounded-full p-1.5 shadow-[0_4px_24px_rgb(0,0,0,0.03)] border border-gray-100">
          <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={() => setNlpMode(false)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${!nlpMode ? 'bg-[#F4FBF8] text-[#81D7B4] shadow-sm ring-1 ring-[#81D7B4]/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
            Manual
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={() => setNlpMode(true)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${nlpMode ? 'bg-[#F4FBF8] text-[#81D7B4] shadow-sm ring-1 ring-[#81D7B4]/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
            <FaRobot className="w-4 h-4" />
            Smart Input
          </motion.button>
        </div>
      </div>

      {/* ─── Content ─── */}
      {nlpMode ? (
        <NLPInputBlock nlpText={nlpText} setNlpText={setNlpText} nlpParsed={nlpParsed} applyNLPValues={applyNLPValues} cancelNLP={() => { setNlpMode(false); setNlpText(''); }} chains={chains} />
      ) : (
        <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 lg:px-8">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
                <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-4 ring-green-100">
                  <HiCheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Savings Plan Created!</h2>
                <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">Your plan is now active and tracking. You can view it on your dashboard.</p>
                <Link href="/dashboard" className="bg-[#81D7B4] hover:bg-[#6BC7A0] text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm inline-flex items-center gap-2">
                  Go to Dashboard
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </motion.div>
            ) : (
              <>
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
                  />
                )}
                {step === 3 && (
                  <StepThreeReview
                    name={name} amount={amount} currency={currency}
                    chain={chain} chains={chains} ensureImageUrl={ensureImageUrl}
                    startDate={startDate} endDate={endDate} penalty={penalty}
                    savingsData={{ deposits: savingsData.deposits }}
                    termsAgreed={termsAgreed} setTermsAgreed={setTermsAgreed}
                    handlePrevious={handlePrevious} handleSubmit={handleSubmit}
                    submitting={submitting} isLoading={isLoading}
                  />
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Wallet Recommendation Modal */}
      <WalletRecommendationModal
        isOpen={shouldShowModal}
        onClose={dismissRecommendation}
        onDontShowAgain={() => { }}
        currentWallet={walletInfo?.name || 'Unknown Wallet'}
      />
    </div>
  );
}