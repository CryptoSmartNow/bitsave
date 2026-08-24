'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft01Icon,
  InformationCircleIcon,
  Shield01Icon,
  BarChartIcon,
  Dollar01Icon,
  ArrowDown01Icon,
  Tick01Icon,
  ArrowRight01Icon,
  Coins01Icon,
  FlashIcon,
  CheckmarkCircle01Icon,
  Analytics01Icon,
  SecurityCheckIcon,
  Time02Icon,
  Wallet01Icon,
  HelpCircleIcon,
  LinkSquare01Icon,
  SparklesIcon,
} from "hugeicons-react";
import Image from 'next/image';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useSwitchChain } from 'wagmi';
import { BizSwapAuthButton } from '@/components/BizSwapAuthButton';
import toast from 'react-hot-toast';
import { UnifiedFiatModal } from '@/components/UnifiedFiatModal';
import { useBizSwapProgram } from '@/hooks/useBizSwapProgram';
import { getInstrumentConfigPda } from '@/lib/bizswap-solana';
import BizswapChatBot from '@/components/BizswapChatBot';
import { useRouter } from 'next/navigation';
import { useConfig } from 'wagmi';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { BIZSWAP_CHAINS, BizSwapSupportedChain, getChainConfig, getExplorerUrl } from '@/lib/bizswap-contracts';

const INSTRUMENTS = {
  bizyield: {
    id: 'bizyield',
    name: 'BizYield',
    typeBadge: 'Revenue Share',
    risk: 'Variable Yield',
    riskLevel: 'Moderate',
    icon: BarChartIcon,
    color: '#FF6B6B',
    accentBg: 'rgba(255, 107, 107, 0.12)',
    accentBorder: 'rgba(255, 107, 107, 0.35)',
    min: 10,
    feePercent: 0.5,
    aprDisplay: 'Variable (Rev Share)',
    aprNumeric: 24, // Est ~24% annualized benchmark
    payout: 'Monthly',
    payoutDays: 30,
    cap: 1000,
    vesting: '90 Days Lock · 24 Mo. Payouts',
    backedBy: 'Verified Business Top-line Revenue Pools',
    description: 'Share directly in real operating revenue from verified Web3 & FinTech protocols.',
  },
  bizcredit: {
    id: 'bizcredit',
    name: 'BizCredit',
    typeBadge: 'Private Credit',
    risk: 'Fixed Weekly',
    riskLevel: 'Fixed Yield',
    icon: Dollar01Icon,
    color: '#F5A623',
    accentBg: 'rgba(245, 166, 35, 0.12)',
    accentBorder: 'rgba(245, 166, 35, 0.35)',
    min: 100,
    feePercent: 0,
    aprDisplay: '16% Annualised',
    aprNumeric: 16,
    payout: 'Weekly',
    payoutDays: 7,
    cap: 1000,
    vesting: 'Immediate Transfer · 12 Wks Duration',
    backedBy: 'SME Invoice Factoring & Trade Credit',
    description: 'Predictable high-yield private credit with recurring weekly liquidity payouts.',
  },
  bizbond: {
    id: 'bizbond',
    name: 'BizBond',
    typeBadge: 'Treasury Backed',
    risk: 'Low Risk',
    riskLevel: 'Secured Fixed',
    icon: Shield01Icon,
    color: '#81D7B4',
    accentBg: 'rgba(129, 215, 180, 0.12)',
    accentBorder: 'rgba(129, 215, 180, 0.35)',
    min: 1000,
    feePercent: 0.5,
    aprDisplay: '10% Fixed APR',
    aprNumeric: 10,
    payout: 'Quarterly',
    payoutDays: 90,
    cap: 1000,
    vesting: '90 Days Lock · Annual Term',
    backedBy: 'Sovereign Treasury & Government Securities',
    description: 'Institutional-grade capital preservation backed by short-term treasury bills.',
  }
};

const getInstrumentIcon = (name: string, sizeClass = "w-5 h-5", activeStyleColor?: string) => {
  let initials = 'BZ';
  let defaultColorClass = 'text-[#7B8B9A]';
  if (name === 'BizYield') { initials = 'BY'; defaultColorClass = 'text-[#FF6B6B]'; }
  if (name === 'BizCredit') { initials = 'BC'; defaultColorClass = 'text-[#F5A623]'; }
  if (name === 'BizBond') { initials = 'BB'; defaultColorClass = 'text-[#81D7B4]'; }

  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${!activeStyleColor ? defaultColorClass : ''}`} style={activeStyleColor ? { color: activeStyleColor } : undefined}>
      <path d="M12 2L20.6603 7V17L12 22L3.33975 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12" />
      <text x="12" y="13.5" dominantBaseline="central" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">
        {initials}
      </text>
    </svg>
  );
};

export default function BizSwapAppPage() {
  const { address: wagmiAddress, isConnected: isWagmiConnected, chainId: activeChainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();
  const wagmiConfig = useConfig();
  const { width, height } = useWindowSize();

  const connected = ready && (authenticated || isWagmiConnected);
  const displayEvmWallet = isWagmiConnected ? wagmiAddress : user?.wallet?.address;
  const walletAddress = user?.wallet?.address || wagmiAddress || user?.email?.address || user?.id;

  const [mounted, setMounted] = useState(false);
  const [selectedChain, setSelectedChain] = useState<BizSwapSupportedChain>('base');
  const [selectedInst, setSelectedInst] = useState<keyof typeof INSTRUMENTS>('bizyield');
  const [selectedBusiness, setSelectedBusiness] = useState('shard');
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const businesses = [{ id: 'shard', name: 'Shard' }];
  const [amountStr, setAmountStr] = useState('5');
  const [referralCode, setReferralCode] = useState('');
  const [isReferralValid, setIsReferralValid] = useState(false);
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [emailInput, setEmailInput] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mintedCertId, setMintedCertId] = useState<string | null>(null);
  const [showPendingModal, setShowPendingModal] = useState(false);

  const program = useBizSwapProgram();
  const [remainingCap, setRemainingCap] = useState<number | null>(null);
  const [currentSupply, setCurrentSupply] = useState<number | null>(null);

  const chainConfig = getChainConfig(selectedChain);

  useEffect(() => {
    setMounted(true);
    const urlParams = new URLSearchParams(window.location.search);
    const code = 
      urlParams.get('ref') || 
      urlParams.get('referral') ||
      localStorage.getItem('bizswapPendingReferralCode') ||
      localStorage.getItem('pendingReferralCode') ||
      localStorage.getItem('bitsave_referral_code');

    if (code) {
      const clean = code.trim().toUpperCase();
      setReferralCode(clean);
      localStorage.setItem('bizswapPendingReferralCode', clean);
      localStorage.setItem('pendingReferralCode', clean);
      localStorage.setItem('bitsave_referral_code', clean);
    }

    const savedChain = localStorage.getItem('bizswap_selectedChain');
    if (savedChain === 'base' || savedChain === 'botchain') {
      setSelectedChain(savedChain);
    }

    const savedInst = localStorage.getItem('bizswap_selectedInst');
    if (savedInst && (savedInst in INSTRUMENTS)) {
      setSelectedInst(savedInst as any);
    }
    
    const savedAmount = localStorage.getItem('bizswap_amountStr');
    if (savedAmount) setAmountStr(savedAmount);
    
    const savedEmail = localStorage.getItem('bizswap_emailInput');
    if (savedEmail) setEmailInput(savedEmail);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('bizswap_selectedChain', selectedChain);
      localStorage.setItem('bizswap_selectedInst', selectedInst);
      localStorage.setItem('bizswap_amountStr', amountStr);
      localStorage.setItem('bizswap_emailInput', emailInput);
      if (referralCode) {
        localStorage.setItem('bizswapPendingReferralCode', referralCode);
      }
    }
  }, [selectedChain, selectedInst, amountStr, emailInput, referralCode, mounted]);

  useEffect(() => {
    if (user?.email?.address && !emailInput) {
      setEmailInput(user.email.address);
    }
  }, [user?.email?.address]);

  const validateReferral = async (code: string) => {
    if (!code) return;
    setValidatingReferral(true);
    setReferralError('');
    setIsReferralValid(false);
    try {
      const res = await fetch('/api/bizswap/referrals/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bizswapReferralCode: code, buyerWalletAddress: walletAddress })
      });
      const data = await res.json();
      if (data.valid) {
        setIsReferralValid(true);
        localStorage.setItem('bizswapPendingReferralCode', code);
      } else {
        setReferralError(data.error || 'Invalid code');
        localStorage.removeItem('bizswapPendingReferralCode');
      }
    } catch (e) {
      setReferralError('Validation failed');
    } finally {
      setValidatingReferral(false);
    }
  };

  useEffect(() => {
    if (referralCode && mounted && !isReferralValid && !referralError && !validatingReferral) {
      validateReferral(referralCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    async function fetchInstrument() {
      let cap = 1000;
      let dbSupply = 0;

      try {
        const res = await fetch('/api/bizswap/analytics');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.globalStats?.instrumentBreakdown) {
            const instName = INSTRUMENTS[selectedInst].name;
            const investedAmount = data.data.globalStats.instrumentBreakdown[instName] || 0;
            dbSupply = Math.floor(investedAmount / INSTRUMENTS[selectedInst].min);
          }
        }
      } catch (e) {
        console.error("Failed to fetch analytics for supply", e);
      }

      if (program) {
        let instrumentId = 0;
        if (selectedInst === 'bizcredit') instrumentId = 1;
        if (selectedInst === 'bizbond') instrumentId = 2;
        const pda = getInstrumentConfigPda(instrumentId);
        try {
          const config = await (program as any).account.instrumentConfig.fetch(pda);
          cap = config.supplyCap.toNumber();
          const chainSupply = config.currentSupply.toNumber();
          dbSupply = Math.max(dbSupply, chainSupply);
        } catch (e) {
          // Fallback to default cap
        }
      }

      setCurrentSupply(dbSupply);
      setRemainingCap(Math.max(0, cap - dbSupply));
    }
    fetchInstrument();
  }, [program, selectedInst]);

  const inst = INSTRUMENTS[selectedInst];
  const sharesCount = Math.max(0, parseInt(amountStr) || 0);
  const inputAmount = sharesCount * inst.min;
  const effectiveFeePercent = (inst.feePercent === 0.5 && isReferralValid) ? 0.4 : inst.feePercent;
  const feeAmount = effectiveFeePercent > 0 ? (inputAmount * effectiveFeePercent) / 100 : 0;
  const totalCharged = Number(Math.ceil(Number((inputAmount + feeAmount) + 'e2')) + 'e-2');

  // ROI / Yield calculations
  const projectedEarnings = useMemo(() => {
    if (inputAmount <= 0) return { perPeriod: 0, annual: 0, periodLabel: inst.payout };
    
    if (inst.id === 'bizcredit') {
      const units = Math.floor(inputAmount / 100);
      const perPeriod = units * 8.67; // $8.67 per week per unit
      const annual = (inputAmount * 0.16);
      return { perPeriod, annual, periodLabel: 'Week' };
    } else if (inst.id === 'bizbond') {
      const annual = inputAmount * 0.10;
      const perPeriod = annual / 4;
      return { perPeriod, annual, periodLabel: 'Quarter' };
    } else {
      // BizYield (Rev Share)
      const annual = inputAmount * 0.24;
      const perPeriod = annual / 12;
      return { perPeriod, annual, periodLabel: 'Month' };
    }
  }, [inputAmount, inst]);

  const handleNetworkChange = async (chainKey: BizSwapSupportedChain) => {
    setSelectedChain(chainKey);
    const targetConfig = BIZSWAP_CHAINS[chainKey];

    // If connected via Web3 browser wallet, seamlessly switch or add chain
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      const hexChainId = `0x${targetConfig.id.toString(16)}`;

      try {
        if (switchChain) {
          switchChain({ chainId: targetConfig.id });
        }
      } catch (err: any) {
        // If unrecognized chain or error, prompt wallet_addEthereumChain
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: hexChainId,
                chainName: targetConfig.name,
                nativeCurrency: {
                  name: chainKey === 'botchain' ? 'BOT' : 'ETH',
                  symbol: chainKey === 'botchain' ? 'BOT' : 'ETH',
                  decimals: 18,
                },
                rpcUrls: [targetConfig.rpcUrl],
                blockExplorerUrls: [targetConfig.explorerUrl],
              },
            ],
          });
        } catch (addErr) {
          console.log('Wallet chain switch or add handled:', addErr);
        }
      }
    }
  };

  const handleSetPresetShares = (shares: number) => {
    setAmountStr(shares.toString());
  };

  const handleSetPresetDollars = (dollars: number) => {
    const calculatedShares = Math.max(1, Math.floor(dollars / inst.min));
    setAmountStr(calculatedShares.toString());
  };

  const handlePurchase = async () => {
    if (!connected) { toast.error('Please connect your wallet first'); return; }
    if (inputAmount < inst.min) { toast.error(`Minimum buy-in for ${inst.name} is $${inst.min}`); return; }
    setIsProcessing(true);
    try {
      const params = new URLSearchParams({
        recipient: '0x038a4e7c11193eBdF6FE574bD9eCf6989c8bEafe',
        amount: totalCharged.toString(),
        chain: 'BASE',
        token: 'USDC',
        mode: 'buy',
        source: 'bizswap'
      });
      const res = await fetch(`/api/chainrails/session?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize payment');
      setSessionToken(data.sessionToken || data.token || data.session_token);
      setIsModalOpen(true);
    } catch (e: any) {
      toast.error(e.message || 'Payment initialization failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsModalOpen(false);
    toast.loading(`Minting ${inst.name} on ${chainConfig.name}...`, { id: 'mint' });
    try {
      const res = await fetch('/api/bizswap/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: walletAddress,
          instrument: inst.name,
          business: selectedInst === 'bizyield' ? selectedBusiness : null,
          investmentAmount: inputAmount,
          feeAmount: feeAmount,
          totalCharged: totalCharged,
          bizswapReferralCode: isReferralValid ? referralCode : null,
          email: emailInput || user?.email?.address,
          chain: selectedChain,
          chainId: chainConfig.id,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${inst.name} Certificate Minted on ${chainConfig.shortName}!`, { id: 'mint' });
      setAmountStr('');
      
      localStorage.removeItem('bizswap_amountStr');
      localStorage.removeItem('bizswap_selectedInst');
      localStorage.removeItem('bizswapPendingReferralCode');
      localStorage.removeItem('bizswap_emailInput');
      
      if (data.data && data.data._id) {
        setMintedCertId(data.data._id);
      }
      setShowSuccessModal(true);
    } catch (e: any) {
      toast.error(e.message || 'Generation failed, contact support', { id: 'mint' });
    }
  };

  const handlePendingPayment = () => {
    setIsModalOpen(false);
    setShowPendingModal(true);
    localStorage.removeItem('bizswap_amountStr');
    localStorage.removeItem('bizswap_selectedInst');
    localStorage.removeItem('bizswapPendingReferralCode');
    localStorage.removeItem('bizswap_emailInput');
    setAmountStr('');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen text-[#F9F9FB] bg-[#070A0F] relative font-sans overflow-x-hidden selection:bg-[#81D7B4]/30 selection:text-[#81D7B4]">
      
      {/* Dynamic Ambient Mesh Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[650px] h-[650px] bg-[#81D7B4]/5 rounded-full blur-[140px]"></div>
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-[#3B82F6]/5 rounded-full blur-[140px]"></div>
        <div className="absolute -bottom-40 left-10 w-[600px] h-[600px] bg-[#10B981]/5 rounded-full blur-[160px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293706_1px,transparent_1px),linear-gradient(to_bottom,#1f293706_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-[#070A0F]/90 backdrop-blur-2xl border-b border-[#161F30]">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/bizswap" className="text-[#64748B] hover:text-[#81D7B4] transition-all p-1.5 -ml-1 sm:p-2 sm:-ml-2 rounded-xl hover:bg-[#121A27] border border-transparent hover:border-[#1E293B] shrink-0">
              <ArrowLeft01Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="hidden sm:block h-4 w-px bg-[#1E293B]" />
            <span className="text-base sm:text-xl font-black text-[#F9F9FB] tracking-tight flex items-center gap-2 shrink-0">
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#81D7B4] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-[#81D7B4] shadow-[0_0_12px_#81D7B4]"></span>
              </span>
              BizSwap
              <span className="hidden sm:inline-flex text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-[#81D7B4]/10 text-[#81D7B4] border border-[#81D7B4]/20 tracking-wider">
                Multi-Chain RWA
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              href="/bizswap/app"
              className="text-[11px] sm:text-xs font-bold text-[#8DA2B5] hover:text-[#81D7B4] transition-colors uppercase tracking-wider inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl hover:bg-[#121A27] border border-transparent hover:border-[#1E293B]"
            >
              Dashboard
            </Link>
            <BizSwapAuthButton
              connectText="Connect"
              style={{
                backgroundColor: '#0E1726',
                border: '1px solid #1E293B',
                height: '32px',
                fontSize: '11px',
                borderRadius: '10px',
                fontWeight: '700',
              }}
            />
          </div>
        </div>
      </nav>

      {/* PAGE CONTAINER */}
      <div className="max-w-[1280px] mx-auto px-3 sm:px-6 py-4 sm:py-10 pb-32 sm:pb-16 grid lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start relative z-10">

        {/* ── LEFT: MAIN ACQUISITION PORTAL ── */}
        <div className="lg:col-span-7 bg-[#0B111C]/90 backdrop-blur-2xl border border-[#182338] rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden relative">
          
          {/* ── CLEAN HEADER SECTION ── */}
          <div className="px-4 sm:px-8 py-5 sm:py-6 border-b border-[#182338] bg-gradient-to-b from-[#111A2B]/60 to-transparent">
            <h1 className="text-2xl sm:text-4xl font-black text-[#F9F9FB] tracking-tight">
              Buy <span className="font-instrument italic font-normal text-[#81D7B4]">BizShares</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#7B8B9A] mt-1 font-medium leading-relaxed">
              Acquire yield-generating Real-World Asset BizShares on Base and Botchain.
            </p>
          </div>

          {/* ── FORM STEPS CONTAINER ── */}
          <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">

            {/* ── STEP 1: DESTINATION NETWORK ── */}
            <div className="bg-[#0E1726]/60 border border-[#1C2A42] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-[#3B82F6] flex items-center justify-center text-[10px] sm:text-xs font-black">1</div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#F9F9FB]">Certificate Minting Network</h3>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-[#81D7B4] uppercase tracking-wider bg-[#81D7B4]/10 px-2 py-0.5 rounded border border-[#81D7B4]/20">
                  Mint Destination
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-3">
                {/* Base Option */}
                <button
                  type="button"
                  onClick={() => handleNetworkChange('base')}
                  className={`group relative p-3 sm:p-3.5 rounded-xl border transition-all duration-300 flex items-center gap-3 text-left cursor-pointer ${
                    selectedChain === 'base'
                      ? 'bg-[#0052FF]/10 border-[#0052FF] shadow-[0_0_24px_rgba(0,82,255,0.25)]'
                      : 'bg-[#070A0F] border-[#182338] hover:border-[#2C3E5D]'
                  }`}
                >
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center p-1 border transition-all shrink-0 ${
                    selectedChain === 'base' ? 'bg-[#0052FF]/20 border-[#0052FF] shadow-[0_0_12px_rgba(0,82,255,0.4)]' : 'bg-[#121A27] border-[#1E293B]'
                  }`}>
                    <Image src="/base-logo.png" alt="Base Logo" width={28} height={28} className="rounded-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs sm:text-sm font-black ${selectedChain === 'base' ? 'text-[#F9F9FB]' : 'text-[#8DA2B5]'}`}>
                        Base
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#0052FF]/20 text-[#60A5FA]">Mainnet</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-[#64748B] font-medium truncate mt-0.5">Mint on Base &middot; Chain 8453</p>
                  </div>
                  {selectedChain === 'base' && (
                    <div className="w-4 h-4 rounded-full bg-[#0052FF] flex items-center justify-center shrink-0">
                      <CheckmarkCircle01Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>

                {/* Botchain Option */}
                <button
                  type="button"
                  onClick={() => handleNetworkChange('botchain')}
                  className={`group relative p-3 sm:p-3.5 rounded-xl border transition-all duration-300 flex items-center gap-3 text-left cursor-pointer ${
                    selectedChain === 'botchain'
                      ? 'bg-[#10B981]/10 border-[#10B981] shadow-[0_0_24px_rgba(16,185,129,0.25)]'
                      : 'bg-[#070A0F] border-[#182338] hover:border-[#2C3E5D]'
                  }`}
                >
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center p-1 border transition-all shrink-0 ${
                    selectedChain === 'botchain' ? 'bg-[#10B981]/20 border-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-[#121A27] border-[#1E293B]'
                  }`}>
                    <Image src="/botchain-logo.png" alt="Botchain Logo" width={28} height={28} className="rounded-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs sm:text-sm font-black ${selectedChain === 'botchain' ? 'text-[#F9F9FB]' : 'text-[#8DA2B5]'}`}>
                        Botchain
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#10B981]/20 text-[#34D399]">Testnet</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-[#64748B] font-medium truncate mt-0.5">Mint on Botchain &middot; Chain 968</p>
                  </div>
                  {selectedChain === 'botchain' && (
                    <div className="w-4 h-4 rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
                      <CheckmarkCircle01Icon className="w-3.5 h-3.5 text-[#070A0F]" />
                    </div>
                  )}
                </button>
              </div>

              <div className="px-3 py-2 bg-[#070A0F] rounded-lg border border-[#182338] flex items-center gap-2 text-[10px] text-[#7B8B9A]">
                <InformationCircleIcon className="w-3.5 h-3.5 text-[#81D7B4] shrink-0" />
                <span>Your certificate will be minted on this blockchain. You can pay using fiat or crypto in checkout.</span>
              </div>
            </div>

            {/* ── STEP 2: SELECT INSTRUMENT ── */}
            <div className="bg-[#0E1726]/60 border border-[#1C2A42] rounded-xl sm:rounded-2xl p-3.5 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#81D7B4]/20 border border-[#81D7B4]/40 text-[#81D7B4] flex items-center justify-center text-[10px] sm:text-xs font-black">2</div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#F9F9FB]">Yield Pool & Asset</h3>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-[#64748B] uppercase tracking-wider">3 Term Profiles</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                {(Object.keys(INSTRUMENTS) as Array<keyof typeof INSTRUMENTS>).map((key) => {
                  const i = INSTRUMENTS[key];
                  const active = selectedInst === key;
                  return (
                    <button
                      key={key}
                      onClick={() => { setSelectedInst(key); }}
                      className={`relative flex flex-col items-start p-2 sm:p-3.5 rounded-xl border transition-all duration-300 text-left ${
                        active
                          ? 'border-opacity-100 shadow-[0_0_20px_rgba(129,215,180,0.15)] scale-[1.01]'
                          : 'bg-[#070A0F] border-[#182338] hover:border-[#2C3E5D]'
                      }`}
                      style={{
                        backgroundColor: active ? i.accentBg : '#070A0F',
                        borderColor: active ? i.color : '#182338',
                      }}
                    >
                      <div className="flex items-center justify-between w-full mb-1 sm:mb-2">
                        {getInstrumentIcon(i.name, "w-4 h-4 sm:w-5 sm:h-5", active ? i.color : '#64748B')}
                        <span
                          className="text-[7px] sm:text-[9px] font-black uppercase px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded"
                          style={{ color: i.color, backgroundColor: `${i.color}18` }}
                        >
                          {i.payout}
                        </span>
                      </div>
                      <span className={`text-[11px] sm:text-sm font-black truncate w-full ${active ? 'text-[#F9F9FB]' : 'text-[#8DA2B5]'}`}>
                        {i.name}
                      </span>
                      <span className="text-[8px] sm:text-[10px] text-[#64748B] font-bold mt-0.5 truncate w-full">
                        {i.aprDisplay}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedInst === 'bizyield' && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#182338]">
                  <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A] mb-1.5 sm:mb-2">
                    Select Revenue Partner
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
                      className={`w-full rounded-xl border px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-[#F9F9FB] flex justify-between items-center bg-[#070A0F] transition-all ${
                        isBusinessDropdownOpen ? 'border-[#81D7B4]' : 'border-[#182338] hover:border-[#2C3E5D]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Image src="/shard.png" alt="Shard Logo" width={20} height={20} className="rounded-full object-cover" />
                        <span>Shard</span>
                      </div>
                      <ArrowDown01Icon className={`w-4 h-4 text-[#7B8B9A] transition-transform ${isBusinessDropdownOpen ? 'rotate-180 text-[#81D7B4]' : ''}`} />
                    </button>
                    {isBusinessDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-[#1C2538] bg-[#0E1726] shadow-2xl z-30 overflow-hidden">
                        {businesses.map((bus) => (
                          <button
                            key={bus.id}
                            type="button"
                            onClick={() => { setSelectedBusiness(bus.id); setIsBusinessDropdownOpen(false); }}
                            className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-bold text-[#F9F9FB] hover:bg-[#182338] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Image src="/shard.png" alt="Shard Logo" width={20} height={20} className="rounded-full object-cover" />
                              <span>{bus.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── STEP 3: INVESTMENT ALLOCATION & LIVE ROI CALCULATOR ── */}
            <div className="bg-[#0E1726]/60 border border-[#1C2A42] rounded-xl sm:rounded-2xl p-3.5 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center text-[10px] sm:text-xs font-black ${
                    sharesCount > 0 ? 'bg-[#81D7B4]/20 border-[#81D7B4] text-[#81D7B4]' : 'bg-[#182338] border-[#2C3E5D] text-[#64748B]'
                  }`}>3</div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#F9F9FB]">Allocation & Quantity</h3>
                </div>
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-[#81D7B4] bg-[#81D7B4]/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-[#81D7B4]/20">
                  <span>Unit:</span>
                  <span className="font-black">${inst.min}</span>
                </div>
              </div>

              {/* Main Input Box */}
              <div className="relative flex items-center bg-[#070A0F] border border-[#182338] rounded-xl overflow-hidden focus-within:border-[#81D7B4] transition-all px-3.5 sm:px-6 py-2.5 sm:py-3.5">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-3xl sm:text-5xl font-black text-[#F9F9FB] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-[#2C3E5D]"
                />
                <span className="text-xs sm:text-sm font-black text-[#64748B] uppercase tracking-wider ml-2 sm:ml-3 shrink-0">
                  Shares
                </span>
              </div>

              {/* Quick Presets by Shares */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                <span className="text-[9px] sm:text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Quick Presets:</span>
                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                  {[1, 5, 10, 50, 100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSetPresetShares(preset)}
                      className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all border ${
                        sharesCount === preset
                          ? 'bg-[#81D7B4]/20 border-[#81D7B4] text-[#81D7B4]'
                          : 'bg-[#070A0F] border-[#182338] text-[#8DA2B5] hover:border-[#81D7B4]/40 hover:text-[#81D7B4]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── LIVE INTERACTIVE YIELD ESTIMATOR PILL ── */}
              {sharesCount > 0 && (
                <div className="mt-3 sm:mt-4 p-3 rounded-xl bg-gradient-to-r from-[#070A0F] via-[#111A2B] to-[#070A0F] border border-[#1C2A42] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Analytics01Icon className="w-3.5 h-3.5 text-[#81D7B4]" />
                    <span className="text-[#8DA2B5] font-bold text-[11px]">Est. Return:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-instrument text-base sm:text-lg text-[#81D7B4]">
                      +${projectedEarnings.perPeriod.toFixed(2)} / {projectedEarnings.periodLabel}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-[#64748B] font-bold border-l border-[#182338] pl-2">
                      (~${projectedEarnings.annual.toFixed(0)}/yr)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ── STEP 4: REVIEW & CHECKOUT ── */}
            <div className={`bg-[#0E1726]/60 border border-[#1C2A42] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 transition-all duration-300 ${
              sharesCount <= 0 ? 'opacity-50 pointer-events-none' : ''
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#182338] border border-[#2C3E5D] text-[#8DA2B5] flex items-center justify-center text-xs font-black">4</div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#F9F9FB]">Review & Checkout</h3>
                </div>
                <span className="text-[10px] font-bold text-[#81D7B4]">
                  {effectiveFeePercent === 0.4 ? '🔥 20% Fee Discount Applied' : 'Zero Hidden Costs'}
                </span>
              </div>

              {/* Referral Active Banner (Silent / Link-based) */}
              {isReferralValid && referralCode && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#81D7B4]/10 border border-[#81D7B4]/20 rounded-xl mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-[#81D7B4]" />
                    <span className="text-[#F9F9FB] font-medium text-xs">Referral Active:</span>
                    <span className="font-mono font-bold text-[#81D7B4] text-xs">{referralCode}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#81D7B4] uppercase tracking-wider">0.1% Reward Linked</span>
                </div>
              )}

              {/* Receipt Email Input */}
              <div className="mb-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A] mb-1.5">
                  Receipt & Certificate Email (Optional)
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter email for minting receipt & certificate updates"
                  className="w-full rounded-xl border border-[#182338] focus:border-[#81D7B4]/60 px-4 py-2.5 text-xs font-bold text-[#F9F9FB] outline-none bg-[#070A0F] placeholder:text-[#3B4C68] transition-colors shadow-inner"
                />
              </div>

              {/* Order breakdown */}
              <div className="bg-[#070A0F] rounded-xl border border-[#182338] p-4 space-y-2.5 text-xs mb-4">
                <div className="flex justify-between items-center text-[#8DA2B5]">
                  <span>Minting Destination</span>
                  <span className="font-bold text-[#F9F9FB] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedChain === 'base' ? '#0052FF' : '#10B981' }}></span>
                    {chainConfig.name}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#8DA2B5]">
                  <span>Principal ({sharesCount} Shares)</span>
                  <span className="font-bold text-[#F9F9FB]">${inputAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[#8DA2B5]">
                  <span>Origination Fee ({effectiveFeePercent}%)</span>
                  <span className="font-bold text-[#F9F9FB]">${feeAmount.toFixed(2)}</span>
                </div>
                <div className="h-px bg-[#182338] my-1" />
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs font-black uppercase text-[#F9F9FB] tracking-wider">Total Price</span>
                  <span className="text-2xl sm:text-3xl font-normal text-[#81D7B4] font-instrument">
                    ${totalCharged.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start gap-2.5 px-1 mb-5">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#2C3E5D] bg-[#070A0F] accent-[#81D7B4] cursor-pointer"
                  id="terms-check"
                />
                <label htmlFor="terms-check" className="text-[11px] text-[#64748B] leading-relaxed cursor-pointer select-none">
                  I agree to the <Link href="/terms" className="text-[#81D7B4] font-bold hover:underline" target="_blank">Terms & Conditions</Link> for purchasing RWA BizShares.
                </label>
              </div>

              {/* Checkout Trigger Button */}
              {!connected ? (
                <BizSwapAuthButton
                  connectText="Connect Wallet to Buy"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    backgroundColor: '#81D7B4',
                    border: 'none',
                    borderRadius: '14px',
                    height: '52px',
                    fontSize: '15px',
                    fontWeight: '900',
                    color: '#070A0F',
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={isProcessing || inputAmount < inst.min || !agreedToTerms}
                  className="w-full h-13 py-3.5 font-black rounded-xl transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 hover:scale-[1.01] bg-[#81D7B4] text-[#070A0F] shadow-[0_0_24px_rgba(129,215,180,0.25)] flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Processing Transaction...' : `Buy for $${totalCharged.toFixed(2)}`}
                  {!isProcessing && <ArrowRight01Icon className="w-4 h-4" />}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ── RIGHT: LIVE POSITION & PROTOCOL METRICS ── */}
        <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-5">

          {/* Instrument Overview Card */}
          <div
            className="bg-[#0B111C]/90 backdrop-blur-2xl border rounded-2xl sm:rounded-3xl p-4 sm:p-7 relative overflow-hidden shadow-2xl transition-all duration-500"
            style={{ borderColor: `${inst.color}35` }}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: inst.color }} />
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] opacity-20 pointer-events-none" style={{ backgroundColor: inst.color }} />

            <div className="flex items-start justify-between mb-4 sm:mb-5 relative z-10">
              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full" style={{ backgroundColor: `${inst.color}15`, color: inst.color, border: `1px solid ${inst.color}30` }}>
                  {inst.typeBadge}
                </span>
                <h2 className="text-2xl sm:text-4xl font-normal text-[#F9F9FB] tracking-tight mt-1.5 sm:mt-2 font-instrument">
                  {inst.name}
                </h2>
                <p className="text-[11px] sm:text-xs text-[#7B8B9A] mt-1 font-medium">{inst.description}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-2xl bg-[#070A0F] border border-[#182338] shadow-inner shrink-0 ml-2">
                {getInstrumentIcon(inst.name, "w-6 h-6 sm:w-7 sm:h-7", inst.color)}
              </div>
            </div>

            {/* Spec rows */}
            <div className="bg-[#070A0F] rounded-xl sm:rounded-2xl border border-[#182338] overflow-hidden divide-y divide-[#182338] text-[11px] sm:text-xs">
              <div className="flex justify-between items-center px-3.5 sm:px-4 py-2.5 sm:py-3">
                <span className="text-[#64748B] font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">Target Yield</span>
                <span className="font-black text-[#F9F9FB]">{inst.aprDisplay}</span>
              </div>
              <div className="flex justify-between items-center px-3.5 sm:px-4 py-2.5 sm:py-3">
                <span className="text-[#64748B] font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">Payout Schedule</span>
                <span className="font-black text-[#81D7B4]">{inst.payout} ({inst.payoutDays} Days)</span>
              </div>
              <div className="flex justify-between items-center px-3.5 sm:px-4 py-2.5 sm:py-3">
                <span className="text-[#64748B] font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">Target Network</span>
                <span className="font-black text-[#F9F9FB] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedChain === 'base' ? '#0052FF' : '#10B981' }}></span>
                  {chainConfig.name}
                </span>
              </div>
              <div className="flex justify-between items-center px-3.5 sm:px-4 py-2.5 sm:py-3">
                <span className="text-[#64748B] font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">Vesting / Terms</span>
                <span className="font-black text-[#8DA2B5]">{inst.vesting}</span>
              </div>
              <div className="flex justify-between items-center px-3.5 sm:px-4 py-2.5 sm:py-3">
                <span className="text-[#64748B] font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">Asset Backing</span>
                <span className="font-bold text-[#8DA2B5] max-w-[65%] text-right text-[10px] sm:text-xs leading-tight">{inst.backedBy}</span>
              </div>
              <div className="flex justify-between items-center px-3.5 sm:px-4 py-2.5 sm:py-3">
                <span className="text-[#64748B] font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">Available Units</span>
                <span className="font-black text-[#81D7B4]">
                  {remainingCap !== null ? `${remainingCap.toLocaleString()} / ${inst.cap.toLocaleString()} Units` : '1,000 Units'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification & Security Box */}
          <div className="bg-[#0B111C]/80 border border-[#182338] rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#F9F9FB]">
              <Shield01Icon className="w-4 h-4 text-[#81D7B4]" />
              <span>Smart Contract Protection</span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Upon purchase confirmation, your ownership record and vesting parameters are minted directly on <strong className="text-[#8DA2B5]">{chainConfig.name}</strong>. Real yield is programmatically distributed to your wallet.
            </p>
          </div>

          {/* Telegram Support Box */}
          <div className="bg-[#0B111C]/80 border border-[#182338] rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#F9F9FB]">Support & Inquiries</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                Need help with on-chain settlement? Join our official community on <a href="https://t.me/bitsaveprotocol" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] font-bold hover:underline">Telegram</a>.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Unified Fiat / Crypto Modal */}
      <UnifiedFiatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={totalCharged.toString()}
        sessionToken={sessionToken}
        onSuccess={handlePaymentSuccess}
        onPending={handlePendingPayment}
        userId={user?.id || 'unknown'}
        project="bizswap"
        destinationWallet={chainConfig.contracts.revenueWallet}
        itemDescription={`${sharesCount} shares of ${inst.name}`}
        metadata={{
          instrument: inst.name,
          business: selectedInst === 'bizyield' ? selectedBusiness : null,
          investmentAmount: inputAmount,
          feeAmount,
          totalCharged,
          bizswapReferralCode: isReferralValid ? referralCode : null,
          email: emailInput || user?.email?.address,
          wallet: displayEvmWallet || walletAddress,
          chain: selectedChain,
          chainId: chainConfig.id,
        }}
      />

      {/* Pending Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#070A0F]/90 backdrop-blur-xl">
          <div className="bg-[#0E1726] border border-[#182338] rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#81D7B4]/10 border border-[#81D7B4]/30 flex items-center justify-center mx-auto mb-5">
              <InformationCircleIcon className="w-8 h-8 text-[#81D7B4]" />
            </div>
            <h3 className="text-xl font-black text-[#F9F9FB] mb-2">Payment Processing</h3>
            <p className="text-xs text-[#64748B] mb-6 leading-relaxed">
              Your transaction is being confirmed on {chainConfig.name}. Your certificate will be issued automatically to your dashboard.
            </p>
            <button
              onClick={() => { setShowPendingModal(false); router.push('/bizswap/app'); }}
              className="w-full py-3.5 rounded-xl bg-[#81D7B4] text-[#070A0F] font-black text-sm hover:opacity-90 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#070A0F]/90 backdrop-blur-xl">
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 110, pointerEvents: 'none' }}>
            <Confetti width={width} height={height} recycle={false} numberOfPieces={400} gravity={0.18} colors={['#81D7B4', '#0052FF', '#10B981', '#F9F9FB']} />
          </div>
          <div className="bg-[#0E1726] border border-[#81D7B4]/40 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(129,215,180,0.2)] relative z-20">
            <div className="w-16 h-16 rounded-2xl bg-[#81D7B4]/20 border border-[#81D7B4] flex items-center justify-center mx-auto mb-5 text-[#81D7B4] text-2xl font-black">
              ✓
            </div>
            <h2 className="text-2xl font-black text-[#F9F9FB] mb-1.5">Acquisition Successful!</h2>
            <p className="text-xs text-[#8DA2B5] mb-6">
              Your {inst.name} BizShares have been minted on <strong className="text-[#81D7B4]">{chainConfig.name}</strong>.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/bizswap/app')}
                className="w-full py-3.5 rounded-xl bg-[#81D7B4] text-[#070A0F] font-black text-sm hover:opacity-90 transition-all"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#F9F9FB] transition-colors"
              >
                Acquire More Shares
              </button>
            </div>
          </div>
        </div>
      )}

      <BizswapChatBot />
    </div>
  );
}
