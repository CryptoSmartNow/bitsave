'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Exo } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineArrowsRightLeft,
  HiOutlineBanknotes,
  HiOutlineArrowDownTray,
  HiOutlineArrowUpTray,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineCurrencyDollar,
  HiOutlineBolt,
  HiOutlineLink,
  HiOutlineLockClosed,
  HiOutlineChartBar
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { PaymentModal } from '@chainrails/react';
import './chainrails.css';

const exo = Exo({ subsets: ['latin'], display: 'swap', variable: '--font-exo' });

const SUPPORTED_TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', network: 'Base' },
  { symbol: 'ETH', name: 'Ethereum', network: 'Base' },
];

const FEATURES = [
  { icon: <HiOutlineBolt className="w-6 h-6 text-[#81D7B4]" />, title: 'Instant Settlement', desc: 'Funds arrive in minutes, not days' },
  { icon: <HiOutlineLink className="w-6 h-6 text-[#81D7B4]" />, title: 'Any Chain', desc: 'Pay from any supported blockchain' },
  { icon: <HiOutlineLockClosed className="w-6 h-6 text-[#81D7B4]" />, title: 'Non-Custodial', desc: 'Funds go directly to your wallet' },
  { icon: <HiOutlineChartBar className="w-6 h-6 text-[#81D7B4]" />, title: 'Best Rates', desc: 'Automatic best-rate routing' },
];

export default function OnOffRampPage() {
  const { address } = useAccount();
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0]);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleOpenRamp = async () => {
    if (!address) { toast.error('Please connect your wallet first'); return; }
    if (!amount || parseFloat(amount) <= 0) { toast.error('Please enter an amount'); return; }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        recipient: address,
        amount: amount,
        chain: selectedToken.network.toUpperCase(),
        token: selectedToken.symbol,
      });

      const res = await fetch(`/api/chainrails/session?${params}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Could not create session');
        return;
      }

      // If we got a session token, use it
      if (data.sessionToken || data.token || data.session_token || typeof data === 'string') {
        const token = data.sessionToken || data.token || data.session_token || (typeof data === 'string' ? data : '');
        setSessionToken(token);
        setIsModalOpen(true);
      } else {
        toast.error('Failed to parse session token.');
      }
    } catch (error) {
      toast.error('Failed to open payment. Please try again.');
      console.error('Ramp error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className={`${exo.variable} font-sans max-w-4xl mx-auto`}>
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-500 text-sm font-medium mt-1">
          Seamlessly convert between fiat currency and crypto using ChainRails.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Ramp Card */}
        <div>
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Mode Toggle */}
            <div className="flex p-2 gap-1 bg-gray-50 border-b border-gray-100">
              <button
                onClick={() => setMode('buy')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'buy' ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <HiOutlineArrowDownTray className="w-4 h-4" /> Buy Crypto
              </button>
              <button
                onClick={() => setMode('sell')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'sell' ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <HiOutlineArrowUpTray className="w-4 h-4" /> Sell Crypto
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Amount */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  {mode === 'buy' ? 'You Pay (USD)' : 'You Sell'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
                    {mode === 'buy' ? '$' : selectedToken.symbol[0]}
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    className="w-full pl-10 pr-4 py-4 rounded-xl border border-gray-200 focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 outline-none text-xl font-black text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                  {['20', '50', '100', '250', '500', '1000'].map(v => (
                    <button
                      key={v}
                      onClick={() => setAmount(v)}
                      className="py-2.5 bg-gray-50 hover:bg-[#81D7B4]/10 hover:text-[#81D7B4] text-gray-600 border border-gray-100/50 hover:border-[#81D7B4]/30 rounded-xl text-xs font-black transition-all"
                    >
                      ${v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Token Select */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  {mode === 'buy' ? 'You Receive' : 'Token'} 
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {SUPPORTED_TOKENS.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => setSelectedToken(token)}
                      className={`flex flex-col items-center justify-center gap-1 p-4 rounded-xl border text-center transition-all ${selectedToken.symbol === token.symbol ? 'border-[#81D7B4] bg-[#81D7B4]/5' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                    >
                      <span className={`text-sm font-black ${selectedToken.symbol === token.symbol ? 'text-[#81D7B4]' : 'text-gray-700'}`}>{token.symbol}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{token.network}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Recipient Wallet</label>
                <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                  <p className="text-sm font-mono text-gray-600 truncate">
                    {address ? address : 'Connect wallet to continue'}
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleOpenRamp}
                disabled={isLoading || !address || !amount}
                className="w-full py-4 bg-gradient-to-r from-[#81D7B4] to-[#5CB899] hover:from-[#6BC4A0] hover:to-[#4DA880] text-white font-black rounded-xl shadow-[0_4px_20px_rgba(129,215,180,0.35)] hover:shadow-[0_6px_28px_rgba(129,215,180,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Opening...</>
                ) : (
                  <><HiOutlineArrowsRightLeft className="w-5 h-5" /> {mode === 'buy' ? 'Buy Crypto' : 'Sell Crypto'} via ChainRails</>
                )}
              </button>

              <div className="flex items-center justify-center gap-3 text-[9px] text-gray-400 font-bold uppercase tracking-widest opacity-60">
                <span className="whitespace-nowrap">Powered by ChainRails</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0"></span>
                <span className="whitespace-nowrap">Direct-to-Wallet</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0"></span>
                <span className="whitespace-nowrap">Non-Custodial</span>
              </div>
            </div>
          </div>

          {/* Session Ready state removed -- we use the modal overlay */}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* How it works */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 mb-5 flex items-center gap-2">
              <HiOutlineInformationCircle className="w-5 h-5 text-[#81D7B4]" /> How it works
            </h3>
            <ol className="space-y-4">
              {[
                { step: '1', title: 'Choose token & amount', desc: 'Select the crypto you want and how much to buy or sell' },
                { step: '2', title: 'Connect your wallet', desc: 'Your wallet address will be the destination for purchased crypto' },
                { step: '3', title: 'Pay via ChainRails', desc: 'Use your preferred payment method — card, bank, or crypto' },
                { step: '4', title: 'Funds arrive instantly', desc: 'Crypto lands in your wallet and is ready to save on Bitsave' },
              ].map(item => (
                <li key={item.step} className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#81D7B4]/15 text-[#81D7B4] text-xs font-black flex items-center justify-center shrink-0">{item.step}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-[1.5rem] border border-gray-100 p-4 shadow-sm">
                <div className="mb-3">{f.icon}</div>
                <p className="text-sm font-black text-gray-900">{f.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
            <HiOutlineBanknotes className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 font-medium">
              <strong>Pro tip:</strong> After buying crypto, head to the <span className="font-black">Create Plan</span> page to lock it in a time-locked savings plan and earn $BTS rewards!
            </p>
          </div>
        </div>
      </div>

      <PaymentModal
        sessionToken={sessionToken}
        isOpen={isModalOpen}
        amount={amount}
        styles={{
          theme: 'light',
          accentColor: '#81D7B4'
        }}
        open={() => setIsModalOpen(true)}
        close={() => {
          setIsModalOpen(false);
          setIsLoading(false);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setIsLoading(false);
          toast.success('Crypto payment verified! Check your wallet.');
        }}
        onCancel={() => {
          setIsModalOpen(false);
          setIsLoading(false);
          toast.error('Payment cancelled.');
        }}
      />
    </div>
  );
}
