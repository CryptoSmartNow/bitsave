'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineInformationCircle, HiOutlineShieldCheck, HiOutlineChartBar, HiOutlineCurrencyDollar } from 'react-icons/hi2';
import { PaymentModal } from '@chainrails/react';
import '@solana/wallet-adapter-react-ui/styles.css';
import { useBizSwapProgram } from '@/hooks/useBizSwapProgram';
import { getInstrumentConfigPda } from '@/lib/bizswap-solana';

const INSTRUMENTS = {
  bizyield: {
    id: 'bizyield',
    name: 'BizYield',
    risk: 'High Risk',
    icon: HiOutlineChartBar,
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
    icon: HiOutlineCurrencyDollar,
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
    icon: HiOutlineShieldCheck,
    color: '#81D7B4',
    min: 1000,
    feePercent: 0.5,
    apr: '10% Fixed',
    payout: 'Quarterly',
    cap: 1000
  }
};

export default function BizSwapAppPage() {
  const { publicKey, connected } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [selectedInst, setSelectedInst] = useState<keyof typeof INSTRUMENTS>('bizyield');
  const [amountStr, setAmountStr] = useState('');
  
  // Payment Flow State
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    if (!connected || !publicKey) {
      toast.error('Please connect your Solana wallet first');
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
        recipient: '0x6bd6109FB3Bf59F67c86caB3bC09adB8B77485B7', // Platform Treasury Wallet
        amount: totalCharged.toFixed(2),
        chain: 'BASE_TESTNET',
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
          wallet: publicKey?.toBase58(),
          instrument: inst.name,
          investmentAmount: inputAmount,
          feeAmount: feeAmount,
          totalCharged: totalCharged
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(`${inst.name} Certificate Minted Successfully!`, { id: 'mint' });
      setAmountStr('');
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
              <HiOutlineArrowLeft className="w-5 h-5" />
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
            <WalletMultiButton style={{ backgroundColor: '#1A2538', border: '1px solid #2C3E5D', height: '36px', fontSize: '14px' }} />
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
                    const Icon = i.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => { setSelectedInst(key); setAmountStr(''); }}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${active ? 'border-[#81D7B4] bg-[#81D7B4]/10' : 'border-[#2C3E5D] bg-[#1A2538] hover:border-[#3A4F73]'}`}
                      >
                        <Icon className="w-6 h-6" style={{ color: active ? '#81D7B4' : i.color }} />
                        <span className={`text-sm font-bold ${active ? 'text-[#81D7B4]' : 'text-[#9BA8B5]'}`}>{i.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

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
                    {inst.feePercent > 0 && <HiOutlineInformationCircle className="w-4 h-4 text-[#7B8B9A]" title="Added on top of investment. Cost of access." />}
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
              {/* Action Button */}
              {!connected ? (
                <WalletMultiButton style={{ width: '100%', justifyContent: 'center', backgroundColor: '#2C3E5D', borderRadius: '0.75rem', height: '56px', fontSize: '16px', fontWeight: 'bold' }} />
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={isProcessing || inputAmount < inst.min}
                  className="w-full h-14 bg-[#81D7B4] hover:bg-[#6BC4A0] disabled:bg-[#2C3E5D] disabled:text-[#7B8B9A] text-[#0F1825] font-black rounded-xl transition-all text-lg shadow-[0_0_20px_rgba(129,215,180,0.1)]"
                >
                  {isProcessing ? 'Processing...' : `Purchase ${inst.name}`}
                </button>
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
                <inst.icon className="w-8 h-8" style={{ color: inst.color }} />
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
              <HiOutlineShieldCheck className="w-5 h-5 text-[#81D7B4] shrink-0" />
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
      />
    </div>
  );
}
