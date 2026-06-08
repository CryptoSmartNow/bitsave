'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft01Icon, InformationCircleIcon, Shield01Icon, BarChartIcon, Dollar01Icon, ArrowDown01Icon, Tick01Icon } from "hugeicons-react";
import Image from 'next/image';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePrivy } from '@privy-io/react-auth';
import { BizSwapAuthButton } from '@/components/BizSwapAuthButton';
import toast from 'react-hot-toast';
import { PaymentModal } from '@chainrails/react';
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

  // Payment Flow State
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Solana State
  const program = useBizSwapProgram();
  const [remainingCap, setRemainingCap] = useState<number | null>(null);
  const [currentSupply, setCurrentSupply] = useState<number | null>(null);

  useEffect(() => { setMounted(true); }, []);

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
        console.error("Failed to fetch instrument config:", e);
        // Could be uninitialized
        setRemainingCap(null);
      }
    }
    fetchInstrument();
  }, [program, selectedInst]);

  const inst = INSTRUMENTS[selectedInst];
  const sharesCount = parseInt(amountStr) || 0;
  const inputAmount = sharesCount * inst.min;

  // Calculate Fee
  const feeAmount = inst.feePercent > 0 ? (inputAmount * inst.feePercent) / 100 : 0;
  const totalCharged = inputAmount + feeAmount;

  const handlePurchase = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (inputAmount < inst.min) {
      toast.error(`Minimum buy-in for ${inst.name} is $${inst.min}`);
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Get ChainRails session
      const params = new URLSearchParams({
        recipient: '6HPVCff7ist4ZNVUAakzuxq5sGekncdPHdvgNautx1D4',
        amount: totalCharged.toFixed(2),
        chain: 'SOLANA_TESTNET',
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
      // Call our mock backend to record purchase and mint
      const res = await fetch('/api/bizswap/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: walletAddress,
          instrument: inst.name,
          business: selectedInst === 'bizyield' ? selectedBusiness : null,
          investmentAmount: inputAmount,
          feeAmount: feeAmount,
          totalCharged: totalCharged
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
    <div className="min-h-screen bg-[#0A0F17] text-[#F9F9FB] font-sans">
      {/* NAV */}
      <nav className="border-b border-[#2C3E5D] bg-[#0F1825] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/bizswap" className="text-[#7B8B9A] hover:text-[#81D7B4] transition-colors">
              <ArrowLeft01Icon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Image src="/bitsavelogo.png" alt="BizMarket" width={100} height={32} className="object-contain" />
              <span className="text-[#2C3E5D]">|</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#81D7B4]">Market</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/bizswap/dashboard" className="hidden sm:block text-sm font-bold text-[#9BA8B5] hover:text-[#81D7B4] transition-colors">
              Dashboard
            </Link>
            <BizSwapAuthButton connectText="Login" style={{ backgroundColor: '#1A2538', border: '1px solid #2C3E5D', height: '36px', fontSize: '14px', borderRadius: '0.75rem' }} />
          </div>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: SWAP INTERFACE */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0F1825] border border-[#2C3E5D] rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#2C3E5D] flex justify-between items-center">
              <h1 className="text-xl font-black">Swap Stablecoins</h1>
              <span className="px-3 py-1 bg-[#81D7B4]/10 text-[#81D7B4] text-xs font-bold uppercase tracking-widest rounded-full">Primary Issuance</span>
            </div>

            <div className="p-6 space-y-8">
              {/* Select Instrument */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider">Select Instrument</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.keys(INSTRUMENTS) as Array<keyof typeof INSTRUMENTS>).map((key) => {
                    const i = INSTRUMENTS[key];
                    const active = selectedInst === key;
                    return (
                      <button
                        key={key}
                        onClick={() => { setSelectedInst(key); setAmountStr(''); }}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${active ? 'border-[#81D7B4] bg-[#81D7B4]/10' : 'border-[#2C3E5D] bg-[#1A2538] hover:border-[#3A4F73]'}`}
                      >
                        {getInstrumentIcon(i.name, "w-6 h-6", active ? '#81D7B4' : i.color)}
                        <span className={`text-sm font-bold ${active ? 'text-[#81D7B4]' : 'text-[#9BA8B5]'}`}>{i.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Select Business (Only for BizYield) */}
              {selectedInst === 'bizyield' && (
                <div className="space-y-3 relative z-10">
                  <label className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider">Select Business</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
                      className="w-full bg-[#1A2538] border border-[#2C3E5D] rounded-xl px-5 py-4 text-xl font-bold text-[#F9F9FB] outline-none focus:border-[#81D7B4] transition-colors flex justify-between items-center"
                    >
                      <span>{businesses.find(b => b.id === selectedBusiness)?.name || 'Select Business'}</span>
                      <ArrowDown01Icon className={`w-5 h-5 text-[#9BA8B5] transition-transform ${isBusinessDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isBusinessDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#1C2538] border border-[#2C3E5D] rounded-xl shadow-2xl overflow-hidden">
                        {businesses.map((bus) => (
                          <button
                            key={bus.id}
                            type="button"
                            onClick={() => {
                              setSelectedBusiness(bus.id);
                              setIsBusinessDropdownOpen(false);
                            }}
                            className={`w-full text-left px-5 py-4 text-xl font-bold transition-colors ${selectedBusiness === bus.id
                              ? 'bg-[#81D7B4]/10 text-[#81D7B4]'
                              : 'text-[#F9F9FB] hover:bg-[#2C3E5D]'
                              }`}
                          >
                            {bus.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Input Amount */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider">Select No of BizShares</label>
                  <span className="text-xs text-[#9BA8B5]">1 Share = ${inst.min}</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full bg-[#1A2538] border border-[#2C3E5D] rounded-xl px-5 py-4 text-2xl font-bold text-[#F9F9FB] outline-none focus:border-[#81D7B4] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#9BA8B5] font-bold">
                    Shares
                  </div>
                </div>
                {sharesCount > 0 && (
                  <div className="mt-2 text-sm text-[#81D7B4] font-bold">
                    Equivalent Amount: ${inputAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </div>
                )}
              </div>

              {/* Order Summary & Fee Calculation */}
              <div className="bg-[#1A2538] border border-[#2C3E5D] rounded-xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9BA8B5]">Investment Amount</span>
                  <span className="font-bold">${inputAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9BA8B5] flex items-center gap-1">
                    Platform Fee ({inst.feePercent}%)
                    {inst.feePercent > 0 && <InformationCircleIcon className="w-4 h-4 text-[#7B8B9A]" />}
                  </span>
                  <span className="font-bold">${feeAmount.toFixed(2)}</span>
                </div>
                <div className="h-px w-full bg-[#2C3E5D]" />
                <div className="flex justify-between items-center">
                  <span className="text-[#F9F9FB] font-bold">Total You Pay</span>
                  <span className="text-xl font-black text-[#81D7B4]">${totalCharged.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#7B8B9A] pt-1">
                  <span>BizShares you receive:</span>
                  <span className="font-bold text-[#F9F9FB]">{sharesCount} Share{sharesCount !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Action Button */}
              {!connected ? (
                <BizSwapAuthButton connectText="Login to Buy" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#2C3E5D', borderRadius: '0.75rem', height: '56px', fontSize: '16px', fontWeight: 'bold' }} />
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handlePurchase}
                    disabled={isProcessing || inputAmount < inst.min}
                    className="w-full h-14 bg-[#81D7B4] hover:bg-[#6BC4A0] disabled:bg-[#2C3E5D] disabled:text-[#7B8B9A] text-[#0F1825] font-black rounded-xl transition-all text-lg shadow-[0_0_20px_rgba(129,215,180,0.1)]"
                  >
                    {isProcessing ? 'Processing...' : `Purchase ${inst.name}`}
                  </button>
                  <div className="flex items-start gap-2 p-3 bg-[#81D7B4]/10 border border-[#81D7B4]/20 rounded-xl">
                    <InformationCircleIcon className="w-5 h-5 text-[#81D7B4] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#81D7B4] leading-relaxed">
                      Ensure you have enough <span className="font-bold">ETH</span> on <span className="font-bold">Base Testnet</span> for gas fees. Without gas fees, the transfer will fail.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INSTRUMENT DETAILS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#1A2538] border border-[#2C3E5D] rounded-3xl p-6">
            <h3 className="font-bold text-[#7B8B9A] uppercase tracking-wider text-xs mb-6">Selected Instrument Specs</h3>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-opacity-10 border border-opacity-20" style={{ backgroundColor: `${inst.color}15`, borderColor: inst.color }}>
                {getInstrumentIcon(inst.name, "w-8 h-8", inst.color)}
              </div>
              <div>
                <h2 className="text-2xl font-black">{inst.name}</h2>
                <span className="text-sm font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${inst.color}20`, color: inst.color }}>{inst.risk}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-[#2C3E5D]">
                <span className="text-[#9BA8B5] text-sm">Return Profile</span>
                <span className="font-bold text-[#F9F9FB]">{inst.apr}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-[#2C3E5D]">
                <span className="text-[#9BA8B5] text-sm">Payout Frequency</span>
                <span className="font-bold text-[#F9F9FB]">{inst.payout}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-[#2C3E5D]">
                <span className="text-[#9BA8B5] text-sm">Transferability</span>
                <span className="font-bold text-[#F9F9FB]">{inst.id === 'bizcredit' ? 'Immediate' : 'Locked for 3 months'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9BA8B5] text-sm">Supply Cap</span>
                <span className="font-bold text-[#F9F9FB]">
                  {remainingCap !== null ? `${remainingCap} Units Remaining` : '1,000 Units Cycle'}
                </span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-[#0F1825] border border-[#2C3E5D] rounded-xl flex gap-3">
              <Shield01Icon className="w-5 h-5 text-[#81D7B4] shrink-0" />
              <p className="text-xs text-[#7B8B9A] leading-relaxed">
                Your ownership is recorded on the Solana blockchain immediately. You will receive a digital certificate in your wallet upon successful purchase.
              </p>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        sessionToken={sessionToken}
        isOpen={isModalOpen}
        amount={totalCharged.toFixed(2)}
        styles={{ theme: 'dark', accentColor: '#81D7B4' }}
        open={() => setIsModalOpen(true)}
        close={() => setIsModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        onCancel={() => {
          setIsModalOpen(false);
          toast.error('Payment cancelled');
        }}
        // @ts-ignore - undocumented prop but common in these libraries
        onError={(err: any) => {
          setIsModalOpen(false);
          const msg = err?.message || String(err);
          if (msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('gas') || msg.toLowerCase().includes('revert')) {
            toast.error('Transfer failed. Please try again. Ensure you have ETH on Base Testnet for gas fees.', { duration: 6000 });
          } else {
            toast.error(`Transfer failed: ${msg}`);
          }
        }}
      />

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121A27] border border-[#81D7B4]/30 p-8 rounded-2xl max-w-md w-full text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/10 to-transparent pointer-events-none" />
            <div className="w-20 h-20 bg-[#81D7B4]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Tick01Icon className="w-10 h-10 text-[#81D7B4]" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Mint Successful!</h2>
            <p className="text-[#7B8B9A] mb-8">
              Your certificate has been successfully minted to your wallet and recorded on the Solana blockchain.
            </p>
            <div className="flex flex-col gap-3 relative z-10">
              <a 
                href={`https://x.com/intent/tweet?text=${encodeURIComponent(`Just bought a ${businesses.find(b => b.id === selectedBusiness)?.name || 'Business'} RWA BizShare on @BitsaveProtocol's BizMarket. Now I earn from their revenue, weekly, monthly, or quarterly. My stable coins work for me, backed by real business revenue, private credit, or government treasuries.\n\nhttps://www.bitsave.io/bizswap`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-black hover:bg-zinc-900 border border-[#2C3E5D] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Post to X
              </a>
              <button onClick={() => router.push('/bizswap/dashboard')} className="w-full py-3 px-4 bg-[#81D7B4] hover:bg-[#6BC29F] text-[#0A0F17] font-bold rounded-xl transition-colors">
                Go to Dashboard
              </button>
              <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 px-4 bg-[#1C2538] hover:bg-[#2C3E5D] text-white font-bold rounded-xl transition-colors">
                Purchase Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
