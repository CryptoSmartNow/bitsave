'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft01Icon, InformationCircleIcon, Shield01Icon, BarChartIcon, Dollar01Icon, ArrowDown01Icon, Tick01Icon } from "hugeicons-react";
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
  }, []);

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
      if (!program) return;
      let instrumentId = 0;
      if (selectedInst === 'bizcredit') instrumentId = 1;
      if (selectedInst === 'bizbond') instrumentId = 2;
      const pda = getInstrumentConfigPda(instrumentId);
      try {
        const config = await (program as any).account.instrumentConfig.fetch(pda);
        const supply = config.currentSupply.toNumber();
        const cap = config.supplyCap.toNumber();
        setCurrentSupply(supply);
        setRemainingCap(cap - supply);
      } catch (e) {
        setRemainingCap(null);
      }
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
        recipient: '6HPVCff7ist4ZNVUAakzuxq5sGekncdPHdvgNautx1D4',
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
    toast.loading('Minting your certificate on Solana...', { id: 'mint' });
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
      setShowSuccessModal(true);
    } catch (e: any) {
      toast.error(e.message || 'Minting failed, contact support', { id: 'mint' });
    }
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen text-[#F9F9FB]"
      style={{ backgroundColor: '#080E18', fontFamily: 'var(--font-inter), system-ui, sans-serif', zoom: 0.9 }}
    >
      {/* NAV */}
      <nav
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: '#080E18', borderColor: '#1E2F45' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/bizswap" className="text-[#4A5568] hover:text-[#81D7B4] transition-colors">
              <ArrowLeft01Icon className="w-4 h-4" />
            </Link>
            <div className="h-5 w-px bg-[#1E2F45]" />
            <span
              className="text-lg font-extrabold text-[#81D7B4] tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              BizSwap
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/bizswap/dashboard"
              className="hidden sm:block text-sm font-semibold text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors"
            >
              Dashboard
            </Link>
            <BizSwapAuthButton
              connectText="Login"
              style={{
                backgroundColor: '#0D1724',
                border: '1px solid #1E2F45',
                height: '36px',
                fontSize: '13px',
                borderRadius: '10px',
                fontWeight: '700',
              }}
            />
          </div>
        </div>
      </nav>

      {/* PAGE BODY */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-12 gap-8 items-start">

        {/* ── LEFT: SWAP PANEL ── */}
        <div className="lg:col-span-7">
          <div
            className="rounded-3xl border overflow-hidden"
            style={{ backgroundColor: '#0D1724', borderColor: '#1E2F45' }}
          >
            {/* Panel header */}
            <div className="px-8 py-6 border-b" style={{ borderColor: '#1E2F45' }}>
              <h1
                className="text-2xl font-extrabold text-[#F9F9FB]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Swap Stablecoins
              </h1>
              <p className="text-sm text-[#7B8B9A] mt-1">
                Select an instrument, choose your share count, and earn real-world yield.
              </p>
            </div>

            <div className="p-8 space-y-8">

              {/* ── Instrument selector ── */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#7B8B9A] mb-4">
                  Select Instrument
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(INSTRUMENTS) as Array<keyof typeof INSTRUMENTS>).map((key) => {
                    const i = INSTRUMENTS[key];
                    const active = selectedInst === key;
                    return (
                      <button
                        key={key}
                        onClick={() => { setSelectedInst(key); setAmountStr(''); }}
                        className="relative flex flex-col items-start gap-1.5 p-4 rounded-2xl border transition-all text-left overflow-hidden"
                        style={{
                          backgroundColor: active ? `${i.color}10` : '#0A1019',
                          borderColor: active ? `${i.color}50` : '#1E2F45',
                        }}
                      >
                        {active && (
                          <div
                            className="absolute top-0 left-0 right-0 h-px"
                            style={{ background: `linear-gradient(to right, transparent, ${i.color}80, transparent)` }}
                          />
                        )}
                        <div className="flex items-center justify-between w-full">
                          {getInstrumentIcon(i.name, "w-5 h-5", active ? i.color : '#3A4F73')}
                          <span
                            className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
                            style={{
                              color: i.color,
                              backgroundColor: `${i.color}15`,
                            }}
                          >
                            {i.risk.split(' ')[0]}
                          </span>
                        </div>
                        <span
                          className="text-sm font-extrabold mt-1"
                          style={{ color: active ? i.color : '#9BA8B5', fontFamily: 'var(--font-display)' }}
                        >
                          {i.name}
                        </span>
                        <span className="text-[10px] text-[#7B8B9A]">{i.apr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Business selector (BizYield only) ── */}
              {selectedInst === 'bizyield' && (
                <div className="relative z-10">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#7B8B9A] mb-4">
                    Select Business
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
                      className="w-full rounded-xl border px-5 py-4 text-base font-bold text-[#F9F9FB] flex justify-between items-center transition-colors focus:outline-none"
                      style={{
                        backgroundColor: '#0A1019',
                        borderColor: isBusinessDropdownOpen ? '#81D7B4' : '#1E2F45',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {selectedBusiness === 'shard' && (
                          <Image src="/shard.png" alt="Shard Logo" width={24} height={24} className="rounded-full object-cover" />
                        )}
                        <span>{businesses.find(b => b.id === selectedBusiness)?.name || 'Select Business'}</span>
                      </div>
                      <ArrowDown01Icon className={`w-4 h-4 text-[#7B8B9A] transition-transform ${isBusinessDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isBusinessDropdownOpen && (
                      <div
                        className="absolute top-full left-0 right-0 mt-2 rounded-xl border overflow-hidden shadow-2xl z-20"
                        style={{ backgroundColor: '#0D1724', borderColor: '#1E2F45' }}
                      >
                        {businesses.map((bus) => (
                          <button
                            key={bus.id}
                            type="button"
                            onClick={() => { setSelectedBusiness(bus.id); setIsBusinessDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 text-left px-5 py-3.5 text-sm font-bold transition-colors"
                            style={{
                              color: selectedBusiness === bus.id ? '#81D7B4' : '#F9F9FB',
                              backgroundColor: selectedBusiness === bus.id ? '#81D7B410' : 'transparent',
                            }}
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

              {/* ── Share count input ── */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7B8B9A]">
                    Number of BizShares
                  </label>
                  <span className="text-xs text-[#7B8B9A] font-medium">
                    1 Share = <span className="text-[#F9F9FB] font-bold">${inst.min.toLocaleString()}</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border px-5 py-4 text-3xl font-extrabold text-[#F9F9FB] outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-[#2C3E5D]"
                    style={{
                      backgroundColor: '#0A1019',
                      borderColor: '#1E2F45',
                      fontFamily: 'var(--font-display)',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#81D7B4')}
                    onBlur={(e) => (e.target.style.borderColor = '#1E2F45')}
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#3A4F73]">
                    Shares
                  </div>
                </div>
                {sharesCount > 0 && (
                  <p className="mt-2.5 text-sm font-semibold" style={{ color: inst.color }}>
                    ≈ ${inputAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </p>
                )}
              </div>

              {/* ── Referral Code ── */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#7B8B9A] mb-4">
                  Referral Code (Optional)
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => {
                      setReferralCode(e.target.value.toUpperCase());
                      setIsReferralValid(false);
                      setReferralError('');
                    }}
                    placeholder="Enter code"
                    className="w-full rounded-xl border px-4 py-3 text-sm font-bold text-[#F9F9FB] outline-none transition-colors placeholder:text-[#2C3E5D]"
                    style={{
                      backgroundColor: '#0A1019',
                      borderColor: isReferralValid ? '#81D7B4' : referralError ? '#FF6B6B' : '#1E2F45',
                    }}
                    onBlur={() => referralCode && validateReferral(referralCode)}
                  />
                  <button
                    type="button"
                    onClick={() => validateReferral(referralCode)}
                    disabled={validatingReferral || !referralCode || isReferralValid}
                    className="px-5 rounded-xl text-xs font-bold transition-colors border disabled:opacity-50"
                    style={{
                      backgroundColor: isReferralValid ? '#81D7B410' : '#0A1019',
                      borderColor: isReferralValid ? '#81D7B450' : '#1E2F45',
                      color: isReferralValid ? '#81D7B4' : '#F9F9FB'
                    }}
                  >
                    {validatingReferral ? '...' : isReferralValid ? 'Applied' : 'Apply'}
                  </button>
                </div>
                {referralError && <p className="mt-2 text-[10px] font-bold text-[#FF6B6B]">{referralError}</p>}
                {isReferralValid && <p className="mt-2 text-[10px] font-bold text-[#81D7B4]">Referral applied! Platform fee reduced to 0.4%.</p>}
              </div>

              {/* ── Receipt Email ── */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#7B8B9A] mb-4">
                  Receipt Email (Optional)
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Where should we send your receipt?"
                  className="w-full rounded-xl border px-4 py-3 text-sm font-bold text-[#F9F9FB] outline-none transition-colors placeholder:text-[#2C3E5D]"
                  style={{
                    backgroundColor: '#0A1019',
                    borderColor: '#1E2F45',
                  }}
                />
              </div>

              {/* ── Order summary ── */}
              <div className="rounded-2xl border" style={{ backgroundColor: '#0A1019', borderColor: '#1E2F45' }}>
                <div className="px-6 py-4 border-b" style={{ borderColor: '#1E2F45' }}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7B8B9A]">Order Summary</span>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7B8B9A]">Investment Amount</span>
                    <span className="font-semibold text-[#F9F9FB]">${inputAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7B8B9A] flex items-center gap-1.5">
                      Platform Fee ({effectiveFeePercent}%)
                      {effectiveFeePercent > 0 && <InformationCircleIcon className="w-3.5 h-3.5 text-[#3A4F73]" />}
                    </span>
                    <span className="font-semibold text-[#F9F9FB]">${feeAmount.toFixed(2)}</span>
                  </div>
                  <div className="h-px w-full" style={{ backgroundColor: '#1E2F45' }} />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-bold text-[#F9F9FB]">Total You Pay</span>
                    <span
                      className="text-2xl font-black"
                      style={{ color: '#81D7B4', fontFamily: 'var(--font-display)' }}
                    >
                      ${totalCharged.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-[#7B8B9A]">
                    <span>BizShares you receive</span>
                    <span className="font-bold text-[#F9F9FB]">
                      {sharesCount} Share{sharesCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Terms & Conditions ── */}
              <div className="flex items-start gap-3 px-1 py-2">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 bg-[#0A1019] border-[#1E2F45] text-[#81D7B4] rounded focus:ring-[#81D7B4] focus:ring-offset-[#020611] cursor-pointer"
                  id="terms-checkbox"
                />
                <label htmlFor="terms-checkbox" className="text-xs text-[#7B8B9A] leading-relaxed cursor-pointer select-none">
                  I have read and agree to the <Link href="/terms" className="text-[#81D7B4] hover:underline transition-colors" target="_blank">BizMarket Protocol Terms & Conditions</Link>. I understand the risks involved in purchasing BizShares instruments.
                </label>
              </div>

              {/* ── Action ── */}
              {!connected ? (
                <BizSwapAuthButton
                  connectText="Login to Buy"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    backgroundColor: '#0D1724',
                    border: '1px solid #1E2F45',
                    borderRadius: '14px',
                    height: '56px',
                    fontSize: '15px',
                    fontWeight: '700',
                  }}
                />
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={isProcessing || inputAmount < inst.min || !agreedToTerms}
                  className="w-full h-14 font-black rounded-2xl transition-all text-base disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 hover:scale-[1.01]"
                  style={{
                    backgroundColor: '#81D7B4',
                    color: '#080E18',
                    fontFamily: 'var(--font-display)',
                    boxShadow: '0 8px 32px rgba(129,215,180,0.18)',
                  }}
                >
                  {isProcessing ? 'Processing...' : `Purchase ${inst.name}`}
                </button>
              )}

            </div>
          </div>
        </div>

        {/* ── RIGHT: INSTRUMENT DETAIL ── */}
        <div className="lg:col-span-5 flex flex-col gap-5">

          {/* Instrument header card */}
          <div
            className="rounded-3xl border p-7 relative overflow-hidden"
            style={{ backgroundColor: '#0D1724', borderColor: `${inst.color}30` }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(to right, transparent, ${inst.color}40, transparent)` }}
            />
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[50px] opacity-15"
              style={{ backgroundColor: inst.color }} />

            <div className="flex items-start justify-between mb-6">
              <div>
                <h2
                  className="text-3xl font-extrabold text-[#F9F9FB] leading-none mb-2"
                  style={{ fontFamily: 'var(--font-display)', color: inst.color }}
                >
                  {inst.name}
                </h2>
                <span
                  className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${inst.color}15`, color: inst.color, border: `1px solid ${inst.color}30` }}
                >
                  {inst.risk}
                </span>
              </div>
              {getInstrumentIcon(inst.name, "w-10 h-10", inst.color)}
            </div>

            {/* Spec rows */}
            <div className="space-y-0">
              {[
                { label: 'Return Profile', value: inst.apr },
                { label: 'Payout Frequency', value: inst.payout },
                { label: 'Transferability', value: inst.id === 'bizcredit' ? 'Immediate' : 'Locked · 3 months' },
                { label: 'Supply Cap', value: remainingCap !== null ? `${remainingCap} Units Remaining` : '1,000 Units / Cycle' },
              ].map(({ label, value }, i, arr) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-4"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid #1E2F45' : 'none' }}
                >
                  <span className="text-sm text-[#7B8B9A]">{label}</span>
                  <span className="text-sm font-bold text-[#F9F9FB]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust note — minimal, no icon */}
          <div
            className="rounded-2xl border px-6 py-5"
            style={{ backgroundColor: '#0A1019', borderColor: '#1E2F45' }}
          >
            <p className="text-xs text-[#7B8B9A] leading-relaxed">
              Your ownership is recorded on the <span className="text-[#F9F9FB] font-semibold">Solana blockchain</span> immediately. You will receive a digital certificate in your wallet upon successful purchase.
            </p>
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
        userId={user?.id || 'unknown'}
        project="bizswap"
        destinationWallet="0x125629FAab442e459C1015FCBa50499D0aAB8EE0"
        itemDescription={`${sharesCount} shares of ${INSTRUMENTS[selectedInst as keyof typeof INSTRUMENTS]?.name || 'instrument'}`}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="rounded-3xl border p-10 max-w-md w-full text-center relative overflow-hidden"
            style={{ backgroundColor: '#0D1724', borderColor: '#81D7B430' }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, #81D7B450, transparent)' }} />
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[60px] bg-[#81D7B4]/10" />

            {/* Check mark — text-based to avoid icon clutter */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 text-2xl font-black"
              style={{ backgroundColor: '#81D7B415', border: '1px solid #81D7B430', color: '#81D7B4' }}
            >
              ✓
            </div>

            <h2
              className="text-3xl font-extrabold text-[#F9F9FB] mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Mint Successful!
            </h2>
            <p className="text-[#7B8B9A] text-sm leading-relaxed mb-10">
              Your certificate has been successfully minted to your wallet and recorded on the Solana blockchain.
            </p>

            <div className="flex flex-col gap-3 relative z-10">
              <a
                href={`https://x.com/intent/tweet?text=${encodeURIComponent(`Just bought a ${businesses.find(b => b.id === selectedBusiness)?.name || 'Business'} RWA BizShare on @BitsaveProtocol's BizMarket. Now I earn from their revenue, weekly, monthly, or quarterly. My stable coins work for me, backed by real business revenue, private credit, or government treasuries.\n\nhttps://www.bitsave.io/bizswap`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 font-bold rounded-xl transition-colors text-sm border text-[#F9F9FB] flex items-center justify-center gap-2"
                style={{ backgroundColor: '#0A1019', borderColor: '#1E2F45' }}
              >
                Post to X
              </a>
              <button
                onClick={() => router.push('/bizswap/dashboard')}
                className="w-full py-3.5 px-5 font-black rounded-xl transition-all text-sm hover:opacity-90"
                style={{ backgroundColor: '#81D7B4', color: '#080E18', fontFamily: 'var(--font-display)' }}
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3.5 px-5 font-semibold rounded-xl transition-colors text-sm text-[#7B8B9A] hover:text-[#F9F9FB]"
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
