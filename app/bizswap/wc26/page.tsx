'use client';

import React, { useState, useEffect } from 'react';
import { Award01Icon, ChartUpIcon, ArrowLeft01Icon, InformationCircleIcon, Coins01Icon, FootballIcon } from "hugeicons-react";
import Image from 'next/image';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { BizSwapAuthButton } from '@/components/BizSwapAuthButton';
import toast from 'react-hot-toast';
import { PaymentModal } from '@chainrails/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';

export default function WC26Page() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();
  
  const connected = ready && authenticated;
  const userId = user?.id || '';

  const [poolState, setPoolState] = useState<any>(null);
  const [position, setPosition] = useState<any>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChainrailsModal, setShowChainrailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string | undefined>();
  const [pendingTx, setPendingTx] = useState<{ type: 'buy' | 'sell', shares: number } | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [userId]);

  const fetchData = async () => {
    try {
      const [poolRes, histRes] = await Promise.all([
        fetch('/api/wc26/pool'),
        fetch('/api/wc26/price-history')
      ]);
      const poolData = await poolRes.json();
      const histData = await histRes.json();
      
      setPoolState(poolData);
      
      if (histData.priceHistory) {
        const formattedHist = histData.priceHistory.map((h: any) => ({
          date: new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: h.price_usd
        }));
        setPriceHistory(formattedHist);
      }

      if (userId) {
        const posRes = await fetch(`/api/wc26/position?userId=${userId}`);
        const posData = await posRes.json();
        setPosition(posData);
      }
    } catch (err) {
      console.error("Failed to fetch WC26 data:", err);
    } finally {
      setLoading(false);
    }
  };

  const initiateBuy = () => {
    if (!connected) return toast.error("Please connect your account first");
    const shares = parseInt(buyAmount);
    if (!shares || shares <= 0) return toast.error("Enter a valid number of shares");
    if (!poolState?.trading_open) return toast.error("Trading is currently closed");
    
    const currentPrice = poolState?.current_price_usd || 12.00;
    const cost = shares * currentPrice * 1.01;
    
    setPendingTx({ type: 'buy', shares });
    handleInitiateDeposit(cost.toFixed(2));
  };

  const executeBuy = async () => {
    if (!pendingTx || pendingTx.type !== 'buy') return;
    const shares = pendingTx.shares;
    
    setIsProcessing(true);
    try {
      const res = await fetch('/api/wc26/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, shares })
      });
      const data = await res.json();
      
      if (data.error) {
        if (data.error === 'Insufficient USDC balance') {
            const currentPrice = poolState?.current_price_usd || 12.00;
            handleInitiateDeposit((shares * currentPrice * 1.01).toFixed(2));
        } else {
            toast.error(data.error);
        }
      } else {
        toast.success(`Successfully bought ${shares} WC26 Vouchers!`);
        setBuyAmount('');
        setShowConfirmModal(false);
        setPendingTx(null);
        fetchData();
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const initiateSell = () => {
    if (!connected) return toast.error("Please connect your account first");
    const shares = parseInt(sellAmount);
    if (!shares || shares <= 0) return toast.error("Enter a valid number of shares");
    if (!position || position.shares_held < shares) return toast.error("You don't have enough shares");
    
    setPendingTx({ type: 'sell', shares });
    setShowConfirmModal(true);
  };

  const executeSell = async () => {
    if (!pendingTx || pendingTx.type !== 'sell') return;
    const shares = pendingTx.shares;
    
    setIsProcessing(true);
    try {
      const res = await fetch('/api/wc26/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, shares })
      });
      const data = await res.json();
      
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(`Successfully sold ${shares} WC26 Vouchers!`);
        setSellAmount('');
        setShowConfirmModal(false);
        setPendingTx(null);
        fetchData();
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDepositSuccess = async () => {
    setShowChainrailsModal(false);
    if (pendingTx && pendingTx.type === 'buy') {
      await executeBuy();
    } else {
      toast.success("Payment successful!");
      fetchData();
    }
  };

  const handleInitiateDeposit = async (amount: string) => {
    setIsProcessing(true);
    try {
      const params = new URLSearchParams({
        recipient: '4QuNtXJeQkGb5wbkbEiWozJ13L3kgYx9SCq6bqASpyyi',
        amount: amount,
        chain: 'SOLANA',
        token: 'USDC',
        mode: 'buy',
        source: 'bizswap'
      });
      const res = await fetch(`/api/chainrails/session?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize payment');
      
      setSessionToken(data.sessionToken || data.token || data.session_token);
      setDepositAmount(amount);
      setShowChainrailsModal(true);
    } catch (e: any) {
      toast.error(e.message || 'Payment initialization failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white bg-[#020611]">Loading WC26 Market...</div>;
  }

  const currentPrice = poolState?.current_price_usd || 12.00;
  
  return (
    <div className="min-h-screen bg-[#020611] text-white font-sans selection:bg-[#D4AF37] selection:text-black" style={{ zoom: 0.9 }}>
      {/* Navbar Minimal */}
      <nav className="w-full px-6 md:px-12 py-6 flex justify-between items-center border-b border-white/5 relative z-40 bg-[#020611] sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/bizswap" className="p-2 md:p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors group">
            <ArrowLeft01Icon className="w-5 h-5 md:w-6 md:h-6 text-gray-300 group-hover:text-white transition-colors" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center">
              <Award01Icon className="w-4 h-4 text-black" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">WC26 Vouchers</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <BizSwapAuthButton connectText="Login" />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A3622] to-[#051A10] border border-[#D4AF37]/20 p-8 md:p-12 shadow-2xl shadow-[#0A3622]/20 group">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          {/* Decorative Icons */}
          <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-3">
            <Award01Icon className="w-[400px] h-[400px] text-[#D4AF37]" strokeWidth={1} />
          </div>
          <div className="absolute right-[15%] bottom-[-20%] opacity-[0.02] pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
            <FootballIcon className="w-[300px] h-[300px] text-white" strokeWidth={1} />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              Limited Time Market
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black mb-6 tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              The World Cup <br/> Trading Pool
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 leading-relaxed mb-8 font-medium max-w-xl">
              Backed by real-world businesses generating revenue during the 2026 World Cup. Trade temporary vouchers with zero gas fees. Expires July 19.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Chart & Info */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-[#0A1019] border border-[#1E2F45] rounded-2xl p-5 hover:border-[#D4AF37]/30 transition-colors">
                <p className="text-sm text-gray-400 mb-1 font-medium">Current Price</p>
                <p className="text-2xl font-bold text-white">${currentPrice.toFixed(2)}</p>
              </div>
              <div className="bg-[#0A1019] border border-[#1E2F45] rounded-2xl p-5 hover:border-[#D4AF37]/30 transition-colors">
                <p className="text-sm text-gray-400 mb-1 font-medium">Status</p>
                <p className={`text-xl font-bold ${poolState?.trading_open ? 'text-[#81D7B4]' : 'text-[#FF6B6B]'}`}>
                  {poolState?.trading_open ? 'LIVE' : 'CLOSED'}
                </p>
              </div>
              <div className="bg-[#0A1019] border border-[#1E2F45] rounded-2xl p-5 hover:border-[#D4AF37]/30 transition-colors">
                <p className="text-sm text-gray-400 mb-1 font-medium">Ends In</p>
                <p className="text-xl font-bold text-white">Jul 19, 2026</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-[#0A1019] border border-[#1E2F45] rounded-3xl p-6 md:p-8 relative overflow-hidden group">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                        <ChartUpIcon className="w-5 h-5" />
                     </div>
                     <h3 className="text-lg font-display font-bold">Price Action</h3>
                  </div>
               </div>
               
               <div className="h-[300px] w-full">
                  {priceHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E2F45" vertical={false} />
                        <XAxis dataKey="date" stroke="#7B8B9A" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                        <YAxis domain={['auto', 'auto']} stroke="#7B8B9A" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} dx={-10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#020611', borderColor: '#1E2F45', borderRadius: '12px', color: '#fff' }}
                          itemStyle={{ color: '#D4AF37' }}
                        />
                        <Line type="monotone" dataKey="price" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4, fill: '#020611', stroke: '#D4AF37', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#D4AF37', stroke: '#020611' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                      Not enough price history yet
                    </div>
                  )}
               </div>
            </div>
            
            {/* Info Box */}
            <div className="bg-[#0A1019]/50 border border-[#1E2F45]/50 rounded-2xl p-6 flex gap-4">
                <div className="text-[#3B82F6] shrink-0">
                  <InformationCircleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-200 mb-1">How Pricing Works</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This is an off-chain pool managed by BizMarket. The price reflects the revenue generated by the underlying businesses during the World Cup. As they earn more, the pool price increases. You can buy or sell instantly at the current price with a 1% platform fee.
                  </p>
                </div>
            </div>

          </div>

          {/* Right Column - Trading Terminal */}
          <div className="lg:col-span-4">
             <div className="sticky top-32 space-y-6">
                
                {/* User Position */}
                {connected && position && (
                  <div className="bg-[#0A1019] border border-[#1E2F45] rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
                    <h3 className="text-sm font-display font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Position</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Shares Held</p>
                        <p className="text-xl font-bold text-white">{position.shares_held}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Avg Price</p>
                        <p className="text-xl font-bold text-white">${position.avg_buy_price?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#020611] border border-[#1E2F45]/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-400">Current Value</span>
                        <span className="font-bold text-white">${position.current_value?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Unrealised PnL</span>
                        <span className={`font-semibold ${position.unrealised_pnl > 0 ? 'text-[#81D7B4]' : position.unrealised_pnl < 0 ? 'text-[#FF6B6B]' : 'text-gray-400'}`}>
                          {position.unrealised_pnl > 0 ? '+' : ''}{position.unrealised_pnl?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Trade Box */}
                <div className="bg-[#0A1019] border border-[#1E2F45] rounded-3xl p-6 shadow-xl">
                    <h3 className="text-xl font-display font-bold mb-6">Trade Vouchers</h3>
                    
                    <div className="space-y-6">
                      {/* BUY */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <label className="text-sm font-medium text-gray-400">Buy Shares</label>
                          <span className="text-xs text-gray-500">Price: ${currentPrice.toFixed(2)}</span>
                        </div>
                        <div className="relative group">
                          <input 
                            type="number"
                            min="1"
                            step="1"
                            value={buyAmount}
                            onChange={(e) => setBuyAmount(e.target.value)}
                            placeholder="0"
                            className="w-full bg-[#020611] border-2 border-[#1E2F45] rounded-2xl py-4 md:py-5 pl-5 pr-20 text-2xl md:text-3xl font-black focus:outline-none focus:border-[#D4AF37]/50 focus:ring-4 focus:ring-[#D4AF37]/10 transition-all placeholder:text-[#1E2F45] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1E2F45] font-black tracking-widest uppercase group-focus-within:text-[#D4AF37]/80 transition-colors">WC26</span>
                        </div>
                        {buyAmount && (
                          <div className="flex justify-between text-xs text-gray-400 px-1">
                            <span>Cost + 1% Fee:</span>
                            <span className="text-white font-medium">${((parseInt(buyAmount) || 0) * currentPrice * 1.01).toFixed(2)}</span>
                          </div>
                        )}
                        <button 
                          onClick={initiateBuy}
                          disabled={isProcessing || !poolState?.trading_open}
                          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? 'Processing...' : 'Buy Vouchers'}
                        </button>
                      </div>

                      <div className="h-px w-full bg-[#1E2F45]" />

                      {/* SELL */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <label className="text-sm font-medium text-gray-400">Sell Shares</label>
                          <span className="text-xs text-gray-500">Holdings: {position?.shares_held || 0}</span>
                        </div>
                        <div className="relative group">
                          <input 
                            type="number"
                            min="1"
                            max={position?.shares_held || 0}
                            step="1"
                            value={sellAmount}
                            onChange={(e) => setSellAmount(e.target.value)}
                            placeholder="0"
                            className="w-full bg-[#020611] border-2 border-[#1E2F45] rounded-2xl py-4 md:py-5 pl-5 pr-20 text-2xl md:text-3xl font-black focus:outline-none focus:border-[#1E2F45] focus:ring-4 focus:ring-white/5 transition-all placeholder:text-[#1E2F45] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1E2F45] font-black tracking-widest uppercase group-focus-within:text-white/50 transition-colors">WC26</span>
                        </div>
                        {sellAmount && (
                          <div className="flex justify-between text-xs text-gray-400 px-1">
                            <span>Payout - 1% Fee:</span>
                            <span className="text-white font-medium">${((parseInt(sellAmount) || 0) * currentPrice * 0.99).toFixed(2)}</span>
                          </div>
                        )}
                        <button 
                          onClick={initiateSell}
                          disabled={isProcessing || !poolState?.trading_open || !position?.shares_held}
                          className="w-full py-4 rounded-2xl bg-[#020611] border border-[#1E2F45] text-white hover:bg-white/5 font-bold text-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? 'Processing...' : 'Sell Vouchers'}
                        </button>
                      </div>

                    </div>
                </div>

                {!connected && (
                  <div className="text-center text-sm text-gray-500">
                    Connect your BizMarket account to start trading.
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>

      {/* Chainrails Modal for Deposit */}
      {/* Confirmation Modal */}
      {showConfirmModal && pendingTx && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0A1019] border border-[#1E2F45] rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-6">Confirm Transaction</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Action</span>
                <span className={`font-semibold ${pendingTx.type === 'buy' ? 'text-[#81D7B4]' : 'text-[#FF6B6B]'}`}>
                  {pendingTx.type === 'buy' ? 'BUY' : 'SELL'} Vouchers
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Amount</span>
                <span className="text-white font-medium">{pendingTx.shares} WC26</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Price per share</span>
                <span className="text-white font-medium">${currentPrice.toFixed(2)}</span>
              </div>
              
              <div className="h-px w-full bg-[#1E2F45]" />
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Gross Value</span>
                <span className="text-white font-medium">${(pendingTx.shares * currentPrice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Protocol Fee (1%)</span>
                <span className="text-[#FF6B6B] font-medium">
                  {pendingTx.type === 'buy' ? '+' : '-'}${(pendingTx.shares * currentPrice * 0.01).toFixed(2)}
                </span>
              </div>
              
              <div className="h-px w-full bg-[#1E2F45]" />
              
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-300 font-medium">
                  {pendingTx.type === 'buy' ? 'Total Cost' : 'You Receive'}
                </span>
                <span className="text-[#D4AF37] font-bold">
                  ${(pendingTx.shares * currentPrice * (pendingTx.type === 'buy' ? 1.01 : 0.99)).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { handleInitiateDeposit("10"); setPendingTx(null); }}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl border border-[#1E2F45] text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={pendingTx.type === 'buy' ? executeBuy : executeSell}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Chainrails Modal */}
      {showChainrailsModal && (
        <PaymentModal
          isOpen={showChainrailsModal}
          open={() => setShowChainrailsModal(true)}
          close={() => setShowChainrailsModal(false)}
          onCancel={() => setShowChainrailsModal(false)}
          sessionToken={sessionToken}
          amount={depositAmount}
          styles={{ theme: 'dark', accentColor: '#D4AF37' }}
          onSuccess={handleDepositSuccess}
        />
      )}
    </div>
  );
}
