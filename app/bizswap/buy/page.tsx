'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft01Icon, InformationCircleIcon, Shield01Icon, BarChartIcon, Dollar01Icon, ArrowDown01Icon, Tick01Icon, ArrowRight01Icon } from "hugeicons-react";
import Image from 'next/image';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePrivy } from '@privy-io/react-auth';
import { BizSwapAuthButton } from '@/components/BizSwapAuthButton';
import toast from 'react-hot-toast';
import { UnifiedFiatModal } from '@/components/UnifiedFiatModal';
import '@solana/wallet-adapter-react-ui/styles.css';
import { useBizSwapProgram } from '@/hooks/useBizSwapProgram';
import { getInstrumentConfigPda } from '@/lib/bizswap-solana';
import { useRouter } from 'next/navigation';
import { useConfig } from 'wagmi';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const INSTRUMENTS = {
  bizyield: {
    id: 'bizyield',
    name: 'BizYield',
    risk: 'High Risk',
    icon: BarChartIcon,
    color: '#FF6B6B',
    min: 10,
    feePercent: 0.5,
    apr: 'Variable (Revenue Share)',
    payout: 'Monthly',
    cap: 1000
  },
  bizcredit: {
    id: 'bizcredit',
    name: 'BizCredit',
    risk: 'Medium Risk',
    icon: Dollar01Icon,
    color: '#F5A623',
    min: 100,
    feePercent: 0,
    apr: '16% Annualised',
    payout: 'Weekly',
    cap: 1000
  },
  bizbond: {
    id: 'bizbond',
    name: 'BizBond',
    risk: 'Low Risk',
    icon: Shield01Icon,
    color: '#81D7B4',
    min: 1000,
    feePercent: 0.5,
    apr: '10% Fixed',
    payout: 'Quarterly',
    cap: 1000
  }
};

const getInstrumentIcon = (name: string, sizeClass = "w-5 h-5", activeStyleColor?: string) => {
  let initials = 'BZ';
  let defaultColorClass = 'text-[#7B8B9A]';
  if (name === 'BizYield') { initials = 'BY'; defaultColorClass = 'text-[#FF6B6B]'; }
  if (name === 'BizCredit') { initials = 'BC'; defaultColorClass = 'text-[#3B82F6]'; }
  if (name === 'BizBond') { initials = 'BB'; defaultColorClass = 'text-[#81D7B4]'; }

  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${!activeStyleColor ? defaultColorClass : ''}`} style={activeStyleColor ? { color: activeStyleColor } : undefined}>
      <path d="M12 2L20.6603 7V17L12 22L3.33975 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
      <text x="12" y="13.5" dominantBaseline="central" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">
        {initials}
      </text>
    </svg>
  );
};

export default function BizSwapAppPage() {
  const { publicKey, connected: isSolanaConnected } = useWallet();
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();
  const wagmiConfig = useConfig();
  const { width, height } = useWindowSize();

  const connected = ready && (authenticated || isSolanaConnected);

  const privySolanaWallet = user?.linkedAccounts?.find(
    (account) => account.type === 'wallet' && account.chainType === 'solana'
  ) as { address: string } | undefined;

  const walletAddress = isSolanaConnected
    ? publicKey?.toBase58()
    : (privySolanaWallet?.address || user?.wallet?.address);

  const [mounted, setMounted] = useState(false);
  const [selectedInst, setSelectedInst] = useState<keyof typeof INSTRUMENTS>('bizyield');
  const [selectedBusiness, setSelectedBusiness] = useState('shard');
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const businesses = [{ id: 'shard', name: 'Shard' }];
  const [amountStr, setAmountStr] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isReferralValid, setIsReferralValid] = useState(false);
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [emailInput, setEmailInput] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mintedCertId, setMintedCertId] = useState<string | null>(null);
  const [showPendingModal, setShowPendingModal] = useState(false);

  const program = useBizSwapProgram();
  const [remainingCap, setRemainingCap] = useState<number | null>(null);
  const [currentSupply, setCurrentSupply] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('ref') || localStorage.getItem('bizswapPendingReferralCode');
    if (code) {
      setReferralCode(code);
    }

    // Restore saved form state
    const savedInst = localStorage.getItem('bizswap_selectedInst');
    if (savedInst) setSelectedInst(savedInst as any);
    
    const savedAmount = localStorage.getItem('bizswap_amountStr');
    if (savedAmount) setAmountStr(savedAmount);
    
    const savedEmail = localStorage.getItem('bizswap_emailInput');
    if (savedEmail) setEmailInput(savedEmail);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('bizswap_selectedInst', selectedInst);
      localStorage.setItem('bizswap_amountStr', amountStr);
      localStorage.setItem('bizswap_emailInput', emailInput);
      if (referralCode) {
        localStorage.setItem('bizswapPendingReferralCode', referralCode);
      }
    }
  }, [selectedInst, amountStr, emailInput, referralCode, mounted]);

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
      // Auto-validate on mount if loaded from storage
      validateReferral(referralCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    async function fetchInstrument() {
      let cap = 1000;
      let dbSupply = 0;

      // 1. Fetch sold units from database analytics
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

      // 2. Fetch cap (and chain supply) from Program
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
          // Fallback to default cap if chain fetch fails
        }
      }

      setCurrentSupply(dbSupply);
      setRemainingCap(Math.max(0, cap - dbSupply));
    }
    fetchInstrument();
  }, [program, selectedInst]);

  const inst = INSTRUMENTS[selectedInst];
  const sharesCount = parseInt(amountStr) || 0;
  const inputAmount = sharesCount * inst.min;
  const effectiveFeePercent = (inst.feePercent === 0.5 && isReferralValid) ? 0.4 : inst.feePercent;
  const feeAmount = effectiveFeePercent > 0 ? (inputAmount * effectiveFeePercent) / 100 : 0;
  const totalCharged = Number(Math.ceil(Number((inputAmount + feeAmount) + 'e2')) + 'e-2');

  const handlePurchase = async () => {
    if (!connected) { toast.error('Please connect your wallet first'); return; }
    if (inputAmount < inst.min) { toast.error(`Minimum buy-in for ${inst.name} is $${inst.min}`); return; }
    setIsProcessing(true);
    try {
      const params = new URLSearchParams({
        recipient: process.env.NEXT_PUBLIC_BIZSWAP_SOLANA_REVENUE_WALLET!,
        amount: totalCharged.toFixed(2),
        chain: 'SOLANA',
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
    toast.loading('Generating your certificate...', { id: 'mint' });
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
          email: emailInput || user?.email?.address
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${inst.name} Certificate Minted Successfully!`, { id: 'mint' });
      setAmountStr('');
      // Clear persistent storage
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
    // Clear persistent storage to give a fresh start after payment
    localStorage.removeItem('bizswap_amountStr');
    localStorage.removeItem('bizswap_selectedInst');
    localStorage.removeItem('bizswapPendingReferralCode');
    localStorage.removeItem('bizswap_emailInput');
    setAmountStr('');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen text-[#F9F9FB] bg-[#0A0F17] relative font-sans overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] bg-[#81D7B4]/5 rounded-full blur-[80px] sm:blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[#3B82F6]/5 rounded-full blur-[80px] sm:blur-[120px]"></div>
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-[#0A0F17]/80 backdrop-blur-xl border-b border-[#1C2538]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/bizswap" className="text-[#4B5A75] hover:text-[#81D7B4] transition-colors p-2 -ml-2 rounded-full hover:bg-[#81D7B4]/10">
              <ArrowLeft01Icon className="w-5 h-5" />
            </Link>
            <div className="hidden sm:block h-5 w-px bg-[#1C2538]" />
            <span className="text-lg sm:text-xl font-black text-[#F9F9FB] tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#81D7B4] shadow-[0_0_10px_rgba(129,215,180,0.8)]"></span>
              BizSwap
            </span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/bizswap/app" className="text-xs sm:text-sm font-bold text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors uppercase tracking-widest">
              Dashboard
            </Link>
            <BizSwapAuthButton
              connectText="Login"
              style={{
                backgroundColor: '#121A27',
                border: '1px solid #1C2538',
                height: '36px',
                fontSize: '13px',
                borderRadius: '10px',
                fontWeight: '800',
              }}
            />
          </div>
        </div>
      </nav>

      {/* PAGE BODY */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-12 grid lg:grid-cols-12 gap-6 sm:gap-8 items-start relative z-10">

        {/* ── LEFT: SWAP PANEL ── */}
        <div className="lg:col-span-7 bg-[#0A0F17]/80 backdrop-blur-xl border border-[#1C2538] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#81D7B4]/0 via-[#81D7B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

          {/* Panel header */}
          <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-[#1C2538] bg-[#121A27]/50 relative z-10">
            <h1 className="text-xl sm:text-3xl font-black text-[#F9F9FB] tracking-tight">Buy BizShares</h1>
            <p className="text-xs sm:text-sm text-[#7B8B9A] mt-1 sm:mt-2 font-medium">Select an instrument, set your shares, and earn real-world yield.</p>
          </div>

          <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 relative z-10">

            {/* ── STEP 1: Instrument & Business ── */}
            <div className="relative z-10 bg-[#121A27]/30 border border-[#1C2538] rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#81D7B4]/20 border border-[#81D7B4]/30 text-[#81D7B4] flex items-center justify-center text-xs sm:text-sm font-black shadow-[0_0_15px_rgba(129,215,180,0.15)]">1</div>
                <h3 className="text-sm sm:text-base font-black uppercase tracking-widest text-[#F9F9FB]">Select Instrument</h3>
              </div>

              <div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {(Object.keys(INSTRUMENTS) as Array<keyof typeof INSTRUMENTS>).map((key) => {
                    const i = INSTRUMENTS[key];
                    const active = selectedInst === key;
                    return (
                      <button
                        key={key}
                        onClick={() => { setSelectedInst(key); setAmountStr(''); }}
                        className={`relative flex flex-col items-start gap-1 sm:gap-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                          active ? 'border-[#81D7B4]/50 shadow-[0_0_20px_rgba(129,215,180,0.15)] scale-[1.02] sm:scale-[1.05]' : 'bg-[#0A0F17] border-[#1C2538] hover:border-[#2C3E5D] hover:scale-[1.02] shadow-sm'
                        }`}
                        style={active ? { backgroundColor: `${i.color}15`, borderColor: `${i.color}60` } : {}}
                      >
                        <div className="flex items-center justify-between w-full mb-1 sm:mb-0">
                          {getInstrumentIcon(i.name, "w-4 h-4 sm:w-5 sm:h-5", active ? i.color : '#4B5A75')}
                          <span className="hidden sm:inline-block text-[8px] sm:text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full" style={{ color: i.color, backgroundColor: `${i.color}15` }}>
                            {i.risk.split(' ')[0]}
                          </span>
                        </div>
                        <span className={`text-[10px] sm:text-sm font-black tracking-wide ${active ? 'text-[#F9F9FB]' : 'text-[#7B8B9A]'}`}>{i.name}</span>
                        <span className="hidden sm:block text-[9px] sm:text-[10px] text-[#4B5A75] font-bold uppercase tracking-wider">{i.apr === 'Variable (Revenue Share)' ? 'Variable' : i.apr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedInst === 'bizyield' && (
                <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-[#1C2538]/50">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#7B8B9A] mb-3">Select Business</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
                      className={`w-full rounded-xl sm:rounded-2xl border px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-bold text-[#F9F9FB] flex justify-between items-center transition-all focus:outline-none bg-[#0A0F17] ${isBusinessDropdownOpen ? 'border-[#81D7B4]/50 shadow-[0_0_15px_rgba(129,215,180,0.1)]' : 'border-[#1C2538] hover:border-[#2C3E5D]'}`}
                    >
                      <div className="flex items-center gap-3">
                        {selectedBusiness === 'shard' && (
                          <Image src="/shard.png" alt="Shard Logo" width={24} height={24} className="rounded-full object-cover shadow-sm" />
                        )}
                        <span>{businesses.find(b => b.id === selectedBusiness)?.name || 'Select Business'}</span>
                      </div>
                      <ArrowDown01Icon className={`w-4 h-4 text-[#7B8B9A] transition-transform duration-300 ${isBusinessDropdownOpen ? 'rotate-180 text-[#81D7B4]' : ''}`} />
                    </button>
                    {isBusinessDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 rounded-xl sm:rounded-2xl border border-[#1C2538] bg-[#121A27]/95 backdrop-blur-xl shadow-2xl z-20 overflow-hidden transform opacity-100 scale-100 transition-all origin-top">
                        {businesses.map((bus) => (
                          <button
                            key={bus.id}
                            type="button"
                            onClick={() => { setSelectedBusiness(bus.id); setIsBusinessDropdownOpen(false); }}
                            className={`w-full flex items-center gap-3 text-left px-5 py-4 text-sm font-bold transition-colors ${selectedBusiness === bus.id ? 'bg-[#81D7B4]/10 text-[#81D7B4]' : 'text-[#F9F9FB] hover:bg-[#1C2538]'}`}
                          >
                            {bus.id === 'shard' && (
                              <Image src="/shard.png" alt="Shard Logo" width={20} height={20} className="rounded-full object-cover" />
                            )}
                            <span>{bus.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── STEP 2: Share count input ── */}
            <div className={`relative z-10 bg-[#121A27]/30 border border-[#1C2538] rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-500 ${!selectedInst ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center text-xs sm:text-sm font-black transition-colors ${sharesCount > 0 ? 'bg-[#81D7B4]/20 border-[#81D7B4]/30 text-[#81D7B4] shadow-[0_0_15px_rgba(129,215,180,0.15)]' : 'bg-[#1C2538] border-[#2C3E5D] text-[#7B8B9A]'}`}>2</div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-widest text-[#F9F9FB]">Investment Amount</h3>
                </div>
                <div className="flex items-center gap-2 bg-[#0A0F17] px-2 sm:px-3 py-1.5 rounded-lg border border-[#1C2538]">
                  <span className="text-[9px] sm:text-[10px] font-black text-[#4B5A75] uppercase tracking-widest">1 Share =</span>
                  <span className="text-[10px] sm:text-xs font-black text-[#81D7B4]">${inst.min.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="relative group/input">
                <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4] to-[#3B82F6] rounded-2xl blur-md opacity-0 group-hover/input:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                <div className="relative flex items-center bg-[#0A0F17] border border-[#1C2538] rounded-xl sm:rounded-2xl overflow-hidden focus-within:border-[#81D7B4]/50 transition-colors shadow-inner px-4 sm:px-6 py-4 sm:py-6">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent text-4xl sm:text-6xl font-black text-[#F9F9FB] outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-[#2C3E5D]"
                  />
                  <span className="text-[10px] sm:text-xs font-black text-[#4B5A75] uppercase tracking-widest ml-4">Shares</span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold text-[#7B8B9A]">USDC Equivalent</span>
                {sharesCount > 0 ? (
                  <p className="text-sm sm:text-base font-black text-[#F9F9FB]">
                    ≈ ${inputAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                ) : (
                  <p className="text-sm sm:text-base font-bold text-[#4B5A75]">$0.00</p>
                )}
              </div>
            </div>

            {/* ── STEP 3: Review & Checkout ── */}
            <div className={`relative z-10 bg-[#121A27]/30 border border-[#1C2538] rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-500 ${sharesCount <= 0 ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#1C2538] border border-[#2C3E5D] text-[#7B8B9A] flex items-center justify-center text-xs sm:text-sm font-black">3</div>
                <h3 className="text-sm sm:text-base font-black uppercase tracking-widest text-[#F9F9FB]">Review & Checkout</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-5 sm:mb-6">
                {/* ── Referral Code ── */}
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A] mb-2 sm:mb-3">Referral (Optional)</label>
                  <div className="flex gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => {
                        setReferralCode(e.target.value.toUpperCase());
                        setIsReferralValid(false);
                        setReferralError('');
                      }}
                      placeholder="Code"
                      className="w-full rounded-xl border px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#F9F9FB] outline-none transition-all placeholder:text-[#2C3E5D] bg-[#0A0F17] focus:border-[#81D7B4]/50 shadow-inner"
                      style={{ borderColor: isReferralValid ? '#81D7B4' : referralError ? '#FF6B6B' : '#1C2538' }}
                      onBlur={() => referralCode && validateReferral(referralCode)}
                    />
                    <button
                      type="button"
                      onClick={() => validateReferral(referralCode)}
                      disabled={validatingReferral || !referralCode || isReferralValid}
                      className="px-3 sm:px-4 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all border disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                      style={{
                        backgroundColor: isReferralValid ? '#81D7B415' : '#0A0F17',
                        borderColor: isReferralValid ? '#81D7B450' : '#1C2538',
                        color: isReferralValid ? '#81D7B4' : '#F9F9FB'
                      }}
                    >
                      {validatingReferral ? '...' : isReferralValid ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                  {referralError && <p className="mt-2 text-[9px] font-bold text-[#FF6B6B] uppercase tracking-wide">{referralError}</p>}
                  {isReferralValid && <p className="mt-2 text-[9px] font-bold text-[#81D7B4] uppercase tracking-wide">Fee reduced to 0.4%!</p>}
                </div>

                {/* ── Receipt Email ── */}
                <div>
                  <label className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A] mb-2 sm:mb-3">Receipt Email</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full rounded-xl border border-[#1C2538] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#F9F9FB] outline-none transition-all placeholder:text-[#2C3E5D] bg-[#0A0F17] focus:border-[#81D7B4]/50 shadow-inner"
                  />
                </div>
              </div>

              {/* ── Order summary ── */}
              <div className="bg-[#0A0F17] rounded-xl sm:rounded-2xl border border-[#1C2538] overflow-hidden mb-5 sm:mb-6 shadow-inner">
                <div className="px-4 sm:px-5 py-3 sm:py-4 space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-[#7B8B9A] font-bold">Investment ({sharesCount} Shares)</span>
                    <span className="font-black text-[#F9F9FB]">${inputAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-[#7B8B9A] font-bold flex items-center gap-1.5">
                      Platform Fee <span className="text-[#4B5A75] text-[9px] sm:text-[10px]">({effectiveFeePercent}%)</span>
                    </span>
                    <span className="font-black text-[#F9F9FB]">${feeAmount.toFixed(2)}</span>
                  </div>
                  <div className="h-px w-full bg-[#1C2538]" />
                  <div className="flex justify-between items-end pt-1">
                    <span className="text-[10px] sm:text-xs font-black text-[#F9F9FB] uppercase tracking-widest">Total Pay</span>
                    <span className="text-xl sm:text-2xl font-black text-[#81D7B4] tracking-tight drop-shadow-[0_0_15px_rgba(129,215,180,0.2)]">
                      ${totalCharged.toFixed(2)} USDC
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Terms & Conditions ── */}
              <div className="flex items-start gap-3 px-1 mb-5 sm:mb-6">
                <div className="relative flex items-center mt-0.5 sm:mt-1 shrink-0">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="peer w-4 h-4 sm:w-5 sm:h-5 appearance-none rounded-md border border-[#2C3E5D] bg-[#0A0F17] checked:bg-[#81D7B4] checked:border-[#81D7B4] transition-all cursor-pointer shadow-inner"
                    id="terms-checkbox"
                  />
                  <Tick01Icon className="absolute pointer-events-none w-3 h-3 sm:w-4 sm:h-4 left-0.5 text-[#0A0F17] opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <label htmlFor="terms-checkbox" className="text-[10px] sm:text-xs font-medium text-[#7B8B9A] leading-relaxed cursor-pointer select-none">
                  I agree to the <Link href="/terms" className="text-[#81D7B4] font-bold hover:underline transition-colors" target="_blank">Terms & Conditions</Link>. I understand the risks involved in purchasing BizShares instruments.
                </label>
              </div>

              {/* ── Action ── */}
              {!connected ? (
                <BizSwapAuthButton
                  connectText="Login to Checkout"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    backgroundColor: '#81D7B4',
                    border: 'none',
                    borderRadius: '12px',
                    height: '56px',
                    fontSize: '16px',
                    fontWeight: '900',
                    color: '#080E18'
                  }}
                />
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={isProcessing || inputAmount < inst.min || !agreedToTerms}
                  className="w-full h-14 font-black rounded-xl sm:rounded-2xl transition-all text-sm sm:text-base disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 hover:scale-[1.02] bg-[#81D7B4] text-[#080E18] shadow-[0_0_20px_rgba(129,215,180,0.2)] flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Processing Transaction...' : `Pay $${totalCharged.toFixed(2)} USDC`}
                  {!isProcessing && <ArrowRight01Icon className="w-5 h-5" />}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ── RIGHT: INSTRUMENT DETAIL ── */}
        <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6 relative z-10">

          {/* Instrument header card */}
          <div className="bg-gradient-to-br from-[#121A27] to-[#0A0F17] border rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl group transition-all duration-500" style={{ borderColor: `${inst.color}30` }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${inst.color}50, transparent)` }} />
            <div className="absolute -top-12 -right-12 w-32 sm:w-48 h-32 sm:h-48 rounded-full blur-[40px] sm:blur-[60px] opacity-20 transition-all duration-700 group-hover:opacity-40 group-hover:scale-110" style={{ backgroundColor: inst.color }} />

            <div className="flex items-start justify-between mb-6 sm:mb-8 relative z-10">
              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-[#F9F9FB] tracking-tight mb-2 sm:mb-3 drop-shadow-md" style={{ color: inst.color }}>
                  {inst.name}
                </h2>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 sm:px-3 py-1 sm:py-1.5 rounded-full" style={{ backgroundColor: `${inst.color}15`, color: inst.color, border: `1px solid ${inst.color}30` }}>
                  {inst.risk}
                </span>
              </div>
              <div className="p-2 sm:p-3 rounded-2xl bg-[#0A0F17]/50 border shadow-inner backdrop-blur-md" style={{ borderColor: `${inst.color}20` }}>
                {getInstrumentIcon(inst.name, "w-6 h-6 sm:w-8 sm:h-8", inst.color)}
              </div>
            </div>

            {/* Spec rows */}
            <div className="bg-[#0A0F17]/60 rounded-xl sm:rounded-2xl border border-[#1C2538] overflow-hidden relative z-10">
              {[
                { label: 'Return Profile', value: inst.apr },
                { label: 'Payout Frequency', value: inst.payout },
                { label: 'Transferability', value: inst.id === 'bizcredit' ? 'Immediate' : 'Locked · 3 months' },
                { label: 'Supply Cap', value: `${inst.cap.toLocaleString()} Units / Cycle` },
                { label: 'Available', value: remainingCap !== null ? `${remainingCap.toLocaleString()} Units` : '...' },
              ].map(({ label, value }, i, arr) => (
                <div key={label} className="flex justify-between items-center px-4 sm:px-5 py-3 sm:py-4 transition-colors hover:bg-[#121A27]/50" style={{ borderBottom: i < arr.length - 1 ? '1px solid #1C2538' : 'none' }}>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#7B8B9A]">{label}</span>
                  <span className="text-xs sm:text-sm font-black text-[#F9F9FB] text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#121A27]/30 backdrop-blur-md rounded-xl sm:rounded-2xl border border-[#1C2538] px-5 sm:px-6 py-4 sm:py-5 shadow-sm">
            <div className="flex gap-3">
              <Shield01Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#81D7B4] shrink-0 mt-0.5" />
              <p className="text-[10px] sm:text-xs font-medium text-[#7B8B9A] leading-relaxed">
                Your ownership is recorded on the <span className="text-[#F9F9FB] font-black">Solana blockchain</span> immediately. You will receive a digital certificate in your wallet upon successful purchase.
              </p>
            </div>
          </div>

          <div className="bg-[#121A27]/30 backdrop-blur-md rounded-xl sm:rounded-2xl border border-[#1C2538] px-5 sm:px-6 py-4 sm:py-5 shadow-sm">
            <div className="flex gap-3">
              <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#3B82F6] shrink-0 mt-0.5" />
              <p className="text-[10px] sm:text-xs font-medium text-[#7B8B9A] leading-relaxed">
                For support, please join our <a href="https://t.me/KarlaGod" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] font-black hover:underline transition-colors drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">Telegram channel</a>. You can reach out there and tag <span className="text-[#F9F9FB] font-black">@KarlaGod</span>.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Unified Payment Modal */}
      <UnifiedFiatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={totalCharged.toFixed(2)}
        sessionToken={sessionToken}
        onSuccess={handlePaymentSuccess}
        onPending={handlePendingPayment}
        userId={user?.id || 'unknown'}
        project="bizswap"
        destinationWallet={process.env.NEXT_PUBLIC_BIZSWAP_EVM_REVENUE_WALLET}
        itemDescription={`${sharesCount} shares of ${INSTRUMENTS[selectedInst as keyof typeof INSTRUMENTS]?.name || 'instrument'}`}
        metadata={{
          instrument: inst.name,
          business: selectedInst === 'bizyield' ? selectedBusiness : null,
          investmentAmount: inputAmount,
          feeAmount,
          totalCharged,
          bizswapReferralCode: isReferralValid ? referralCode : null,
          email: emailInput || user?.email?.address,
          wallet: walletAddress
        }}
      />

      {/* Pending Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A0F17]/90 backdrop-blur-xl">
          <div className="bg-gradient-to-br from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-3xl p-8 sm:p-10 w-full max-w-md relative flex flex-col items-center text-center shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#81D7B4] to-transparent opacity-50"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#81D7B4]/10 rounded-full blur-[50px] pointer-events-none"></div>

            <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-[#81D7B4]/10 flex items-center justify-center mb-6 border border-[#81D7B4]/30 shadow-[0_0_30px_rgba(129,215,180,0.15)]">
              <InformationCircleIcon className="w-8 sm:w-10 h-8 sm:h-10 text-[#81D7B4]" />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-[#F9F9FB] tracking-tight mb-3">
              Payment Pending
            </h3>
            
            <p className="text-[#7B8B9A] mb-8 text-xs sm:text-sm font-medium leading-relaxed">
              Your fiat payment is currently processing. As soon as the bank transfer clears, your certificate will be automatically minted and will appear in your dashboard!
            </p>

            <button
              onClick={() => {
                setShowPendingModal(false);
                router.push('/bizswap/dashboard');
              }}
              className="w-full py-3.5 sm:py-4 rounded-xl bg-[#81D7B4] text-[#080E18] font-black text-sm sm:text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(129,215,180,0.3)]"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => setShowPendingModal(false)}
              className="mt-4 w-full py-2 sm:py-3 rounded-xl text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors font-bold text-xs sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A0F17]/90 backdrop-blur-xl">
          <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.15} colors={['#81D7B4', '#3B82F6', '#FF6B6B', '#F9F9FB']} />
          <div className="bg-gradient-to-br from-[#121A27] to-[#0A0F17] border border-[#81D7B4]/30 rounded-3xl p-8 sm:p-10 w-full max-w-md relative flex flex-col items-center text-center shadow-[0_0_50px_rgba(129,215,180,0.15)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#81D7B4] to-transparent opacity-80"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#81D7B4]/10 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl flex items-center justify-center mb-6 text-3xl sm:text-4xl font-black relative z-10" style={{ backgroundColor: '#81D7B415', border: '1px solid #81D7B440', color: '#81D7B4', boxShadow: 'inset 0 0 20px rgba(129,215,180,0.2)' }}>
              ✓
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#F9F9FB] tracking-tight mb-3 relative z-10">
              Mint Successful!
            </h2>
            <p className="text-[#7B8B9A] text-xs sm:text-sm font-medium leading-relaxed mb-8 relative z-10">
              Your certificate has been successfully minted to your wallet and recorded on the Solana blockchain.
            </p>

            <div className="flex flex-col gap-3 w-full relative z-10">
              <a
                href={`https://x.com/intent/tweet?text=${encodeURIComponent(`Just bought a ${businesses.find(b => b.id === selectedBusiness)?.name || 'Business'} RWA BizShare on @BitsaveProtocol's BizMarket. Now I earn from their revenue. My stable coins work for me.\n\nhttps://www.bitsave.io/bizswap${mintedCertId ? `/certificate/${mintedCertId}` : ''}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 sm:py-3.5 px-5 font-black rounded-xl transition-all text-xs sm:text-sm border border-[#1C2538] text-[#F9F9FB] bg-[#0A0F17] hover:bg-[#121A27] flex items-center justify-center gap-2 shadow-inner"
              >
                Share on X
              </a>
              <button
                onClick={() => router.push('/bizswap/dashboard')}
                className="w-full py-3.5 sm:py-4 px-5 font-black rounded-xl transition-all text-sm sm:text-base hover:opacity-90 bg-[#81D7B4] text-[#080E18] shadow-[0_0_20px_rgba(129,215,180,0.2)] active:scale-[0.98]"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 sm:py-3 px-5 font-bold rounded-xl transition-colors text-xs sm:text-sm text-[#7B8B9A] hover:text-[#F9F9FB]"
              >
                Purchase Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
