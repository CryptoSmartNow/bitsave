'use client';

import { Download01Icon, Activity01Icon, Tick01Icon, Money01Icon } from "hugeicons-react";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAccount, useConfig } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { Exo } from 'next/font/google';
import toast from 'react-hot-toast';
import { PaymentModal } from '@chainrails/react';
import { ShimmerLoader } from '@/components/ShimmerLoader';
import './chainrails.css';

const exo = Exo({ subsets: ['latin'], display: 'swap', variable: '--font-exo' });

const SUPPORTED_TOKENS = [
  { symbol: 'USDT', name: 'Tether', network: 'BSC', dexpPayNetwork: 'BSC' },
  { symbol: 'USDC', name: 'USD Coin', network: 'Base', dexpPayNetwork: 'BASE' }
];

const BUY_AMOUNT_PRESETS_NGN = [5000, 10000, 25000, 50000, 100000];
const SELL_AMOUNT_PRESETS_USD = [10, 25, 50, 100, 250];

export default function OnOffRampPage() {
  const { address: wagmiAddress } = useAccount();
  const wagmiConfig = useConfig();
  const { user } = usePrivy();
  const address = user?.wallet?.address || wagmiAddress;

  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0]);
  const [amount, setAmount] = useState('');
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  
  // Quotes state
  const [quotes, setQuotes] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<'chainrails' | 'dexpay' | null>(null);
  
  // DexPay specifics
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isProcessingDexPay, setIsProcessingDexPay] = useState(false);
  const [dexPayOrder, setDexPayOrder] = useState<any>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Chainrails specifics
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isChainrailsModalOpen, setIsChainrailsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
    fetchBanks();
    return () => clearPolling(); // Cleanup on unmount
  }, []);

  const clearPolling = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/,/g, '');
    if (/^\d*\.?\d*$/.test(rawVal)) {
      setAmount(rawVal);
      setQuotes(null);
      setSelectedProvider(null);
    }
  };

  const getDisplayAmount = (val: string) => {
    if (!val) return '';
    const parts = val.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  const amountPresets = mode === 'buy' ? BUY_AMOUNT_PRESETS_NGN : SELL_AMOUNT_PRESETS_USD;
  const amountSymbol = mode === 'buy' ? '₦' : '$';

  const fetchBanks = async () => {
    try {
      const res = await fetch('/api/dexpay/banks');
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || data.message || 'DexPay banks currently unavailable');
        return;
      }
      if (data.data) {
        setBanks(data.data);
      }
    } catch (e) {
      toast.error('Failed to fetch banks');
      console.error("Failed to fetch banks", e);
    }
  };

  const handleGetQuotes = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (mode === 'sell' && (!selectedBank || !accountNumber || !accountName)) {
      toast.error('Please fill in your bank details to get accurate quotes');
      return;
    }
    
    setIsLoadingQuotes(true);
    setQuotes(null);
    setDexPayOrder(null);
    setSelectedProvider(null);

    try {
      // Fetch DexPay quote
      const dexPayRes = await fetch('/api/dexpay/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...(mode === 'buy' ? { fiatAmount: parseFloat(amount) } : { tokenAmount: parseFloat(amount) }),
            type: mode.toUpperCase(),
            asset: selectedToken.symbol,
            chain: selectedToken.dexpPayNetwork,
            receivingAddress: mode === 'buy' ? (address || '0x0000000000000000000000000000000000000000') : undefined,
            ...(mode === 'sell' ? {
              bankCode: selectedBank,
              accountNumber,
              accountName
            } : {})
          })
        });
      const dexPayData = await dexPayRes.json();

      if (!dexPayRes.ok) {
        toast.error(dexPayData.error || dexPayData.message || 'DexPay quote currently unavailable');
      }

      const dexpayQuote = dexPayRes.ok && dexPayData?.data?.id ? dexPayData.data : null;
      if (dexPayRes.ok && !dexpayQuote) {
        toast.error(dexPayData?.error || dexPayData?.message || 'DexPay returned an invalid quote');
      }
      
      const chainrailsBaseRate = dexpayQuote?.price || dexpayQuote?.rate || dexpayQuote?.exchangeRate || 1409;
      // For buy, we calculate crypto from fiat. For sell, the input IS the crypto amount.
      const chainrailsCryptoAmount = mode === 'buy' ? parseFloat(amount) / chainrailsBaseRate : parseFloat(amount);

      setQuotes({
        dexpay: dexpayQuote,
        chainrails: { 
          available: true,
          adjustedRate: chainrailsBaseRate,
          cryptoAmount: chainrailsCryptoAmount
        }
      });
      
    } catch (error) {
      toast.error('Failed to fetch quotes');
      console.error(error);
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const handleProceed = async () => {
    if (!selectedProvider) {
      toast.error('Please select a provider');
      return;
    }

    if (selectedProvider === 'chainrails') {
      await handleOpenChainrails();
    } else {
      await handleOpenDexPay();
    }
  };

  const handleOpenChainrails = async () => {
    if (!address) { toast.error('Please connect your wallet first'); return; }

    setIsProcessingDexPay(true);
    try {
      const amountToPass = quotes?.chainrails?.cryptoAmount?.toFixed(2) || (parseFloat(amount) / 1409).toFixed(2);
      
      const params = new URLSearchParams({
        recipient: address,
        amount: amountToPass,
        chain: selectedToken.network.toUpperCase(),
        token: selectedToken.symbol,
        mode: mode
      });

      const res = await fetch(`/api/chainrails/session?${params}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Could not create session');
        return;
      }

      if (data.sessionToken || data.token || data.session_token || typeof data === 'string') {
        const token = data.sessionToken || data.token || data.session_token || (typeof data === 'string' ? data : '');
        setSessionToken(token);
        setIsChainrailsModalOpen(true);
      } else {
        toast.error('Failed to parse session token.');
      }
    } catch (error) {
      toast.error('Failed to open payment. Please try again.');
      console.error('Ramp error:', error);
    } finally {
      setIsProcessingDexPay(false);
    }
  };

  const handleOpenDexPay = async () => {
    if (!quotes?.dexpay?.id) {
      toast.error('Invalid DexPay quote');
      return;
    }

    if (mode === 'buy' && !address) {
      toast.error('Please connect your wallet to proceed');
      return;
    }

    setIsProcessingDexPay(true);
    try {
      let quoteIdToUse = quotes.dexpay.id;
      
      const dexPayRes = await fetch('/api/dexpay/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(mode === 'buy' ? { fiatAmount: parseFloat(amount) } : { tokenAmount: parseFloat(amount) }),
          type: mode.toUpperCase(),
          asset: selectedToken.symbol,
          chain: selectedToken.dexpPayNetwork,
          ...(mode === 'sell' ? {
            bankCode: selectedBank,
            accountNumber,
            accountName
          } : {
            receivingAddress: address
          })
        })
      });
      const dexPayData = await dexPayRes.json();
      if (!dexPayRes.ok) throw new Error(dexPayData.message || dexPayData.error || 'Failed to re-quote');
      quoteIdToUse = dexPayData.data.id;

      const orderRes = await fetch('/api/dexpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: quoteIdToUse })
      });
      
      const orderData = await orderRes.json();
      
      if (!orderRes.ok) {
        toast.error(orderData.message || orderData.error || 'Failed to create order');
        return;
      }

      setDexPayOrder(orderData.data);
      pollDexPayStatus(orderData.data.id);
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to create DexPay order');
      console.error(error);
    } finally {
      setIsProcessingDexPay(false);
    }
  };

  const pollDexPayStatus = (orderId: string) => {
    clearPolling();
    pollInterval.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/dexpay/status?orderId=${orderId}`);
        const data = await res.json();
        if (data.data?.status === 'COMPLETED') {
          toast.success('Payment completed!');
          clearPolling();
          setDexPayOrder(null);
          setQuotes(null);
        } else if (data.data?.status === 'FAILED' || data.data?.status === 'CANCELLED') {
          toast.error('Payment failed or cancelled.');
          clearPolling();
          setDexPayOrder(null);
        }
      } catch (e) {
        console.error('Polling error', e);
      }
    }, 5000);
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-full w-full bg-[#f8fafc] ${exo.variable} font-sans pb-16`}>
      <div className="max-w-xl mx-auto px-4 pt-8">
        
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[#0F1825] tracking-tight">Buy & Sell Crypto</h1>
        </div>

        {/* Main Action Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#e2e8f0] overflow-hidden">
          
          {/* Clean Tab Switcher */}
          <div className="flex border-b border-[#e2e8f0]">
            <button
              onClick={() => { setMode('buy'); setQuotes(null); setDexPayOrder(null); clearPolling(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${mode === 'buy' ? 'bg-white text-[#059669] border-b-2 border-[#059669]' : 'text-[#64748b] hover:text-[#0F1825] bg-[#f8fafc] hover:bg-gray-50 border-b-2 border-transparent'}`}
            >
              <Download01Icon className="w-5 h-5" /> Buy
            </button>
            <button
              onClick={() => { setMode('sell'); setQuotes(null); setDexPayOrder(null); clearPolling(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${mode === 'sell' ? 'bg-white text-[#059669] border-b-2 border-[#059669]' : 'text-[#64748b] hover:text-[#0F1825] bg-[#f8fafc] hover:bg-gray-50 border-b-2 border-transparent'}`}
            >
              <Activity01Icon className="w-5 h-5" /> Sell
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {!dexPayOrder ? (
              <>
                {/* Token Selection */}
                <div>
                  <div className="grid grid-cols-2 gap-3">
                    {SUPPORTED_TOKENS.map((token) => (
                      <button
                        key={`${token.symbol}-${token.network}`}
                        onClick={() => { setSelectedToken(token); setQuotes(null); }}
                        className={`flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border transition-all ${selectedToken.symbol === token.symbol && selectedToken.network === token.network ? 'border-[#81D7B4] bg-[#f0fdf4] text-[#0F1825]' : 'border-[#e2e8f0] hover:border-[#cbd5e1] bg-white text-[#0F1825]'}`}
                      >
                        <span className="text-base font-semibold">{token.symbol}</span>
                        <span className={`text-[10px] font-medium uppercase tracking-widest ${selectedToken.symbol === token.symbol && selectedToken.network === token.network ? 'text-[#059669]' : 'text-[#64748b]'}`}>{token.network}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <div className="relative flex items-center bg-[#f8fafc] rounded-2xl border border-transparent focus-within:border-[#81D7B4] focus-within:bg-white transition-all overflow-hidden">
                    <span className="pl-6 pr-2 text-[#94a3b8] font-medium text-2xl shrink-0">{amountSymbol}</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={getDisplayAmount(amount)}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      className="w-full py-5 pr-6 bg-transparent outline-none text-3xl font-semibold text-[#0F1825] placeholder:text-[#cbd5e1]"
                    />
                  </div>
                  <div className="flex w-full mt-3 gap-2">
                    {amountPresets.map((preset, idx) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setAmount(String(preset));
                          setQuotes(null);
                          setDexPayOrder(null);
                          setSelectedProvider(null);
                        }}
                        className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0F1825] transition-colors"
                      >
                        {amountSymbol}{preset >= 1000 ? `${preset/1000}k` : preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sell Form (Bank Details) */}
                {mode === 'sell' && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#0F1825]">Receiving Bank Account</p>
                    </div>
                    <select 
                      value={selectedBank}
                      onChange={(e) => { setSelectedBank(e.target.value); setQuotes(null); }}
                      className="w-full px-4 py-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] focus:bg-white focus:border-[#81D7B4] outline-none text-[#0F1825] font-medium transition-all text-sm"
                    >
                      <option value="">Select Receiving Bank</option>
                      {banks.map((b: any) => (
                        <option key={b.code} value={b.code}>{b.name}</option>
                      ))}
                    </select>
                    <input 
                      type="text"
                      placeholder="Account Number"
                      value={accountNumber}
                      onChange={(e) => { setAccountNumber(e.target.value); setQuotes(null); }}
                      className="w-full px-4 py-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] focus:bg-white focus:border-[#81D7B4] outline-none text-[#0F1825] font-medium transition-all text-sm placeholder:text-[#94a3b8]"
                    />
                    <input 
                      type="text"
                      placeholder="Account Name"
                      value={accountName}
                      onChange={(e) => { setAccountName(e.target.value); setQuotes(null); }}
                      className="w-full px-4 py-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] focus:bg-white focus:border-[#81D7B4] outline-none text-[#0F1825] font-medium transition-all text-sm placeholder:text-[#94a3b8]"
                    />
                  </div>
                )}

                {/* Quotes Results */}
                {quotes ? (
                  <div className="space-y-3 pt-4 border-t border-[#f1f5f9]">
                    <p className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-widest text-center mb-4">Select Provider</p>
                    
                    {/* DexPay Card */}
                    {quotes.dexpay ? (
                      <div 
                        onClick={() => setSelectedProvider('dexpay')}
                        className={`p-4 md:p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${selectedProvider === 'dexpay' ? 'border-[#059669] bg-[#f0fdf4] shadow-sm' : 'border-[#e2e8f0] hover:border-[#cbd5e1] bg-white'}`}
                      >
                        <div>
                          <span className="font-semibold text-[#0F1825] text-base block">DexPay Local</span>
                          <span className="text-[11px] font-medium text-[#64748b] mt-0.5 block">Local Bank Transfer</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#059669] font-semibold text-lg block">{quotes.dexpay.adjustedRate ? `₦${Number(quotes.dexpay.adjustedRate).toFixed(2)}` : 'Best Rate'}</span>
                          <span className="text-[10px] font-medium text-[#94a3b8] uppercase tracking-widest mt-0.5 block">Exchange Rate</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl border border-dashed border-[#e2e8f0] bg-[#f8fafc]">
                        <p className="text-sm font-medium text-[#94a3b8] text-center">DexPay unavailable for this amount</p>
                      </div>
                    )}

                    {/* Chainrails Card */}
                    <div 
                      onClick={() => setSelectedProvider('chainrails')}
                      className={`p-4 md:p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${selectedProvider === 'chainrails' ? 'border-[#059669] bg-[#f0fdf4] shadow-sm' : 'border-[#e2e8f0] hover:border-[#cbd5e1] bg-white'}`}
                    >
                      <div>
                        <span className="font-semibold text-[#0F1825] text-base block">ChainRails</span>
                        <span className="text-[11px] font-medium text-[#64748b] mt-0.5 block">Card & Apple Pay</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#059669] font-semibold text-lg block">{quotes.chainrails?.adjustedRate ? `₦${Number(quotes.chainrails.adjustedRate).toFixed(2)}` : 'Best Rate'}</span>
                        <span className="text-[10px] font-medium text-[#94a3b8] uppercase tracking-widest mt-0.5 block">Exchange Rate</span>
                      </div>
                    </div>

                    {isProcessingDexPay ? (
                      <ShimmerLoader type="button" className="mt-6 bg-[#0F1825]/30 rounded-2xl h-12" />
                    ) : (
                      <button
                        onClick={handleProceed}
                        disabled={!selectedProvider}
                        className="w-full mt-6 py-3.5 bg-gradient-to-r from-[#81D7B4] to-[#6BC4A0] hover:from-[#6BC4A0] hover:to-[#81D7B4] text-white font-semibold text-base rounded-2xl transition-all disabled:opacity-50 disabled:grayscale shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
                      >
                        Proceed to Payment
                      </button>
                    )}
                  </div>
                ) : (
                  isLoadingQuotes ? (
                    <ShimmerLoader type="button" className="mt-6 bg-[#81D7B4]/40 rounded-2xl h-12" />
                  ) : (
                    <button
                      onClick={handleGetQuotes}
                      disabled={!amount}
                      className="w-full mt-6 py-3.5 bg-gradient-to-r from-[#81D7B4] to-[#6BC4A0] hover:from-[#6BC4A0] hover:to-[#81D7B4] text-white font-semibold text-base rounded-2xl transition-all disabled:opacity-50 disabled:grayscale shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      Get Quotes
                    </button>
                  )
                )}
              </>
            ) : (
              
              /* DexPay Order Active State */
              <div className="space-y-5 py-2">
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto bg-[#f0fdf4] text-[#059669] rounded-full flex items-center justify-center mb-3">
                    <Tick01Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-xl text-[#0F1825]">Awaiting Transfer</h3>
                  <p className="text-sm font-medium text-[#64748b] mt-1">Please complete the payment using the details below.</p>
                </div>

                <div className="bg-[#f8fafc] p-5 rounded-2xl border border-[#e2e8f0] space-y-4">
                  {mode === 'buy' ? (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#94a3b8] font-medium">Bank Name</span>
                        <span className="font-semibold text-[#0F1825]">{dexPayOrder.paymentAccount?.bankName || dexPayOrder.bankName || 'DexPay Partner Bank'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#94a3b8] font-medium">Account Number</span>
                        <span className="font-semibold text-[#0F1825] text-base font-mono tracking-wider">{dexPayOrder.paymentAccount?.accountNumber || dexPayOrder.accountNumber || '1234567890'}</span>
                      </div>
                      <div className="h-px w-full bg-[#e2e8f0]"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#94a3b8] font-medium">Amount to Sent</span>
                        <span className="font-semibold text-lg text-[#059669]">₦{amount}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-start text-sm flex-col gap-2">
                        <span className="text-[#94a3b8] font-medium">Deposit Address</span>
                        <div className="w-full bg-white border border-[#e2e8f0] p-3.5 rounded-xl font-mono font-medium text-xs text-[#0F1825] break-all">
                          {dexPayOrder.address || dexPayOrder.depositAddress || 'Txxx...'}
                        </div>
                      </div>
                      <div className="h-px w-full bg-[#e2e8f0] mt-3"></div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[#94a3b8] font-medium">Amount to Sent</span>
                        <span className="font-semibold text-lg text-[#059669]">{quotes.dexpay?.cryptoAmount || dexPayOrder.tokenAmount || amount} {selectedToken.symbol}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="relative overflow-hidden flex items-center justify-center gap-2 text-sm font-medium text-[#b45309] bg-[#fffbeb] p-3.5 rounded-2xl isolate border border-[#fef3c7]">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent z-[-1]"></div>
                  Listening for incoming payment...
                </div>

                <button
                  onClick={() => { setDexPayOrder(null); setQuotes(null); clearPolling(); }}
                  className="w-full py-3 text-[#94a3b8] text-sm font-medium hover:text-[#0F1825] transition-colors"
                >
                  Cancel & Go Back
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Promo Section */}
        <div className="mt-6 bg-[#f0fdf4] border border-[#81D7B4]/30 rounded-3xl p-5 md:p-6 text-[#0F1825] relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#81D7B4] rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
          <div className="flex items-start gap-4 relative z-10">
            <Money01Icon className="w-7 h-7 text-[#059669] shrink-0" />
            <div>
              <h4 className="font-semibold text-base text-[#0F1825] mb-1">Make Your Money Work</h4>
              <p className="text-sm font-medium text-[#64748b] leading-relaxed">
                After completing your on-ramp, head over to the <Link href="/dashboard/create-savings" className="text-[#059669] underline decoration-[#81D7B4] underline-offset-2 hover:text-[#81D7B4] transition-colors">Create Plan</Link> page. Lock your crypto to earn native $BTS rewards!
              </p>
            </div>
          </div>
        </div>

      </div>

      <PaymentModal
        sessionToken={sessionToken}
        isOpen={isChainrailsModalOpen}
        amount={quotes?.chainrails?.cryptoAmount?.toFixed(2) || (parseFloat(amount) / 1409).toFixed(2)}
        styles={{ theme: 'light', accentColor: '#81D7B4' }}
        open={() => setIsChainrailsModalOpen(true)}
        close={() => setIsChainrailsModalOpen(false)}
        onSuccess={() => {
          setIsChainrailsModalOpen(false);
          toast.success('Payment verified! Tick your wallet.');
        }}
        onCancel={() => {
          setIsChainrailsModalOpen(false);
          toast.error('Payment cancelled.');
        }}
      />
      
      {isChainrailsModalOpen && (
        <button
          onClick={() => {
            setIsChainrailsModalOpen(false);
            setSessionToken(null);
            toast.error('Payment cancelled.');
          }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[2147483647] bg-white hover:bg-gray-100 text-[#0F1825] rounded-full px-4 sm:px-8 py-3 sm:py-4 shadow-[0_10px_40px_rgba(0,0,0,0.25)] font-bold transition-all flex items-center justify-center gap-2 text-base w-[90%] max-w-[320px] border border-gray-200"
        >
          ✕ Cancel Payment
        </button>
      )}
    </div>
  );
}
