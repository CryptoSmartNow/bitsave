'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Activity01Icon, Calendar01Icon, ArrowDown01Icon, Download01Icon, Notification01Icon, Tick01Icon, ChartAverageIcon, Shield01Icon, Dollar01Icon, InformationCircleIcon, Cancel01Icon, Clock01Icon, GiftIcon } from "hugeicons-react";
import { useWallet } from '@solana/wallet-adapter-react';
import { usePrivy } from '@privy-io/react-auth';
import toast from 'react-hot-toast';
import { useBizSwapProgram } from '@/hooks/useBizSwapProgram';
import { CertificateCard } from '@/components/CertificateCard';
import { useBizSwapReferrals } from '@/lib/useBizSwapReferrals';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface Holding {
  _id: string;
  instrument: string;
  investmentAmount: number;
  entitlement: string;
  status: string;
  nextPayment: string;
  mintAddress: string;
  serialNumber: string;
  apr: string;
  payoutFrequency: string;
  purchaseDate: string;
}

interface Payment {
  _id: string;
  date: string;
  instrument: string;
  amount: number;
  currency: string;
  txHash: string;
}

export default function BizSwapStandaloneDashboard() {
  const { publicKey, connected: isSolanaConnected } = useWallet();
  const { ready, authenticated, user } = usePrivy();
  
  const connected = ready && (authenticated || isSolanaConnected);
  
  const privySolanaWallet = user?.linkedAccounts?.find(
    (account) => account.type === 'wallet' && account.chainType === 'solana'
  ) as { address: string } | undefined;
  
  const walletAddress = isSolanaConnected 
    ? publicKey?.toBase58() 
    : (privySolanaWallet?.address || user?.wallet?.address || user?.id);

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Holding | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  const program = useBizSwapProgram();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  const { referralData, loading: refLoading, generateReferralCode, submitWithdrawal } = useBizSwapReferrals(walletAddress);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount))) return;
    try {
      setIsWithdrawing(true);
      await submitWithdrawal(Number(withdrawAmount));
      toast.success('Withdrawal request submitted successfully');
      setWithdrawAmount('');
    } catch (e: any) {
      toast.error(e.message || 'Withdrawal failed');
    } finally {
      setIsWithdrawing(false);
    }
  };



  useEffect(() => {
    if (connected && walletAddress) {
      fetchHoldingsAndPayments(walletAddress);
    } else if (!connected && ready) {
      setHoldings([]);
      setPayments([]);
      setLoading(false);
    }
  }, [connected, walletAddress, ready]);

  const fetchHoldingsAndPayments = async (wallet: string) => {
    setLoading(true);
    try {
      const [holdingsRes, paymentsRes] = await Promise.all([
        fetch(`/api/bizswap/holdings?wallet=${wallet}`),
        fetch(`/api/bizswap/payments?wallet=${wallet}`)
      ]);
      
      const holdingsData = await holdingsRes.json();
      const paymentsData = await paymentsRes.json();

      if (holdingsRes.ok) {
        const fetchedHoldings = holdingsData.data || [];
        setHoldings(fetchedHoldings);
        
        // Check for delayed fiat confetti
        try {
          const ackCerts = JSON.parse(localStorage.getItem('bizswap_ack_certs') || '[]');
          let foundNew = false;
          
          fetchedHoldings.forEach((h: Holding) => {
            if (h.status.includes('Active') && !ackCerts.includes(h._id)) {
              const pDate = new Date(h.purchaseDate);
              const now = new Date();
              // If purchased in the last 7 days and unacknowledged
              if (now.getTime() - pDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
                foundNew = true;
                ackCerts.push(h._id);
              }
            }
          });
          
          if (foundNew) {
            localStorage.setItem('bizswap_ack_certs', JSON.stringify(ackCerts));
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 8000);
          }
        } catch(e) {}
      }
      if (paymentsRes.ok) setPayments(paymentsData.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Network error loading data');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current || !selectedCert) return;
    
    try {
      const toastId = toast.loading('Generating certificate image...', { id: 'download-cert' });
      
      // Temporarily hide the close and download buttons for the snapshot
      const closeBtn = document.getElementById('cert-close-btn');
      const actionBtns = document.getElementById('cert-action-btns');
      if (closeBtn) closeBtn.style.display = 'none';
      if (actionBtns) actionBtns.style.display = 'none';

      // Use html-to-image to take a high quality snapshot
      const htmlToImage = await import('html-to-image');
      const dataUrl = await htmlToImage.toPng(certificateRef.current, {
        backgroundColor: '#0F1825',
        pixelRatio: 2, // High resolution
        style: {
          margin: '0',
        }
      });
      
      // Restore buttons
      if (closeBtn) closeBtn.style.display = 'block';
      if (actionBtns) actionBtns.style.display = 'flex';

      const link = document.createElement('a');
      link.download = `BizMarket-Certificate-${selectedCert.serialNumber}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success('Certificate downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to download certificate', { id: 'download-cert' });
    }
  };

  const totalValue = holdings.reduce((sum, h) => sum + h.investmentAmount, 0);

  // Compute real figures based on holdings and payments
  const totalEarned = payments
    .filter(p => !p.txHash.includes('Pending'))
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingOrdersValue = payments
    .filter(p => p.txHash.includes('Pending'))
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingYield = Math.max(0, holdings.reduce((sum, h) => {
    if (!h.purchaseDate || !h.apr) return sum;
    const purchaseDate = new Date(h.purchaseDate);
    const now = new Date();
    const msElapsed = now.getTime() - purchaseDate.getTime();
    const daysElapsed = Math.max(0, msElapsed / (1000 * 60 * 60 * 24));
    
    const aprStr = h.apr.replace('%', '');
    const aprNum = parseFloat(aprStr) || 0;
    
    const dailyRate = (aprNum / 100) / 365;
    return sum + (h.investmentAmount * dailyRate * daysElapsed);
  }, 0) - totalEarned);

  const getNextPaymentDate = (purchaseDate: string, frequency: string) => {
    if (!purchaseDate) return new Date();
    const d = new Date(purchaseDate);
    const now = new Date();
    
    while (d <= now) {
      if (frequency.toLowerCase().includes('month')) d.setMonth(d.getMonth() + 1);
      else if (frequency.toLowerCase().includes('quarter')) d.setMonth(d.getMonth() + 3);
      else if (frequency.toLowerCase().includes('year') || frequency.toLowerCase().includes('annual')) d.setFullYear(d.getFullYear() + 1);
      else d.setMonth(d.getMonth() + 1); // fallback to monthly
    }
    return d;
  };

  const upcomingHolding = holdings.length > 0 
    ? holdings.reduce((earliest, h) => {
        const earliestDate = getNextPaymentDate(earliest.purchaseDate, earliest.payoutFrequency);
        const hDate = getNextPaymentDate(h.purchaseDate, h.payoutFrequency);
        return hDate < earliestDate ? h : earliest;
      }, holdings[0])
    : null;

  const nextPaymentDateStr = upcomingHolding 
    ? getNextPaymentDate(upcomingHolding.purchaseDate, upcomingHolding.payoutFrequency).toISOString() 
    : '';

  const getExpectedPaymentAmount = (h: Holding) => {
    const aprStr = h.apr.replace('%', '');
    const aprNum = parseFloat(aprStr) || 0;
    const yearlyReturn = h.investmentAmount * (aprNum / 100);
    
    if (h.payoutFrequency.toLowerCase().includes('month')) return yearlyReturn / 12;
    if (h.payoutFrequency.toLowerCase().includes('quarter')) return yearlyReturn / 4;
    return yearlyReturn;
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInstrumentIcon = (name: string, sizeClass = "w-5 h-5") => {
    let initials = 'BZ';
    let colorClass = 'text-[#7B8B9A]';
    if (name === 'BizYield') { initials = 'BY'; colorClass = 'text-[#FF6B6B]'; }
    if (name === 'BizCredit') { initials = 'BC'; colorClass = 'text-[#3B82F6]'; }
    if (name === 'BizBond') { initials = 'BB'; colorClass = 'text-[#81D7B4]'; }

    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${colorClass}`}>
        <path d="M12 2L20.6603 7V17L12 22L3.33975 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/>
        <text x="12" y="13.5" dominantBaseline="central" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">
          {initials}
        </text>
      </svg>
    );
  };

  const getInstrumentColorClass = (name: string, type: 'bg' | 'border' | 'text' | 'gradientFrom') => {
    switch(name) {
      case 'BizYield': return type === 'bg' ? 'bg-[#FF6B6B]/10' : type === 'border' ? 'border-[#FF6B6B]/30' : type === 'text' ? 'text-[#FF6B6B]' : 'from-[#FF6B6B]/5';
      case 'BizCredit': return type === 'bg' ? 'bg-[#3B82F6]/10' : type === 'border' ? 'border-[#3B82F6]/30' : type === 'text' ? 'text-[#3B82F6]' : 'from-[#3B82F6]/5';
      case 'BizBond': return type === 'bg' ? 'bg-[#81D7B4]/10' : type === 'border' ? 'border-[#81D7B4]/30' : type === 'text' ? 'text-[#81D7B4]' : 'from-[#81D7B4]/5';
      default: return type === 'bg' ? 'bg-gray-800' : type === 'border' ? 'border-gray-700' : type === 'text' ? 'text-gray-400' : 'from-gray-800/5';
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <Activity01Icon className="w-16 h-16 text-[#2C3E5D] mb-6" />
        <h2 className="text-2xl font-black text-[#F9F9FB] mb-2">Wallet Not Connected</h2>
        <p className="text-[#7B8B9A] mb-8 max-w-sm">Please connect your wallet in the top right to view your portfolio.</p>
      </div>
    );
  }

  return (
    <div className="relative p-4 md:p-8 w-full max-w-[1600px] mx-auto space-y-6 md:space-y-8 min-w-0 font-sans min-h-screen overflow-hidden" style={{ backgroundColor: '#080E18', color: '#F9F9FB' }}>
      
      {/* Background Texture & Glow */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ 
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(129, 215, 180, 0.05) 0%, transparent 60%), url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.03%22/%3E%3C/svg%3E")',
        backgroundSize: '100% auto, 200px 200px',
        backgroundRepeat: 'no-repeat, repeat'
      }}></div>

      <div className="relative z-10 space-y-6 md:space-y-8">
        {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={600} gravity={0.12} />}

        {/* DASHBOARD HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1C2538] pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#F9F9FB] drop-shadow-md" style={{ fontFamily: 'var(--font-display)' }}>Your Dashboard</h1>
            <p className="text-[#7B8B9A] mt-2 font-medium">Manage your BizShares portfolio and track real-world yields.</p>
          </div>
          <a 
            href="/bizswap/buy"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-[#81D7B4] to-[#6BC4A0] hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] text-[#0F1825] font-black rounded-xl transition-all shadow-[0_0_30px_rgba(129,215,180,0.2)] hover:shadow-[0_0_40px_rgba(129,215,180,0.4)]"
          >
            Buy BizShares
          </a>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="bg-gradient-to-br from-[#0D1724]/90 to-[#0A1019]/90 backdrop-blur-md border border-[#1E2F45] p-6 rounded-3xl flex justify-between items-center shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-[#81D7B4]/30 transition-colors">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#81D7B4]/10 blur-[30px] group-hover:bg-[#81D7B4]/20 transition-all"></div>
            <div className="relative z-10 w-full">
              <p className="text-[11px] font-bold text-[#7B8B9A] uppercase tracking-wider mb-2 flex items-center gap-2"><Dollar01Icon className="w-4 h-4"/> Total Invested</p>
              <h2 className="text-3xl xl:text-4xl font-black text-[#F9F9FB] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
              <p className="text-xs text-[#81D7B4] mt-3 font-bold flex items-center gap-1 bg-[#81D7B4]/10 px-2 py-1 rounded-md inline-flex border border-[#81D7B4]/20">
                {totalValue > 0 ? `+${((totalEarned / totalValue) * 100).toFixed(2)}%` : '0.00%'} Return
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0D1724]/90 to-[#0A1019]/90 backdrop-blur-md border border-[#1E2F45] p-6 rounded-3xl flex justify-between items-center shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-[#3B82F6]/30 transition-colors">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#3B82F6]/10 blur-[30px] group-hover:bg-[#3B82F6]/20 transition-all"></div>
            <div className="relative z-10 w-full">
              <p className="text-[11px] font-bold text-[#7B8B9A] uppercase tracking-wider mb-2 flex items-center gap-2"><Activity01Icon className="w-4 h-4"/> Total Earned</p>
              <h2 className="text-3xl xl:text-4xl font-black text-[#F9F9FB] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>${totalEarned.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
              <p className="text-xs text-[#4B5A75] mt-3 font-medium">Since you joined</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0D1724]/90 to-[#0A1019]/90 backdrop-blur-md border border-[#1E2F45] p-6 rounded-3xl flex justify-between items-center shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-[#F5A623]/30 transition-colors">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#F5A623]/10 blur-[30px] group-hover:bg-[#F5A623]/20 transition-all"></div>
            <div className="relative z-10 w-full">
              <p className="text-[11px] font-bold text-[#7B8B9A] uppercase tracking-wider mb-2 flex items-center gap-2"><ChartAverageIcon className="w-4 h-4"/> Pending Yield</p>
              <h2 className="text-3xl xl:text-4xl font-black text-[#F9F9FB] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>${pendingYield.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
              <p className="text-xs text-[#4B5A75] mt-3 font-medium">Across active instruments</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0D1724]/90 to-[#0A1019]/90 backdrop-blur-md border border-[#1E2F45] p-6 rounded-3xl flex justify-between items-center shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-[#A855F7]/30 transition-colors">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#A855F7]/10 blur-[30px] group-hover:bg-[#A855F7]/20 transition-all"></div>
            <div className="relative z-10 w-full">
              <p className="text-[11px] font-bold text-[#7B8B9A] uppercase tracking-wider mb-2 flex items-center gap-2"><Clock01Icon className="w-4 h-4"/> Pending Orders</p>
              <h2 className="text-3xl xl:text-4xl font-black text-[#F9F9FB] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>${pendingOrdersValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
              <p className="text-xs text-[#A855F7] mt-3 font-bold flex items-center gap-1 bg-[#A855F7]/10 px-2 py-1 rounded-md inline-flex border border-[#A855F7]/20">
                Awaiting Fiat Clearance
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0D1724]/90 to-[#0A1019]/90 backdrop-blur-md border border-[#1E2F45] p-6 rounded-3xl flex justify-between items-center shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-[#FF6B6B]/30 transition-colors">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#FF6B6B]/10 blur-[30px] group-hover:bg-[#FF6B6B]/20 transition-all"></div>
            <div className="relative z-10 w-full">
              <p className="text-[11px] font-bold text-[#7B8B9A] uppercase tracking-wider mb-2 flex items-center gap-2"><Calendar01Icon className="w-4 h-4"/> Next Payment</p>
              <h2 className="text-xl xl:text-2xl font-black text-[#F9F9FB] mt-1 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{upcomingHolding ? formatDate(nextPaymentDateStr) : 'No Upcoming'}</h2>
              <p className="text-xs text-[#4B5A75] mt-3 font-medium">
                {upcomingHolding ? `$${getExpectedPaymentAmount(upcomingHolding).toFixed(2)} from ${upcomingHolding.instrument}` : '-'}
              </p>
            </div>
          </div>
        </div>

      <div className="grid lg:grid-cols-3 gap-6 w-full">
        
        {/* MAIN LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          
          {/* HOLDINGS OVERVIEW */}
          <div className="bg-[#0A1019] border border-[#1E2F45] rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-[#1E2F45] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 bg-gradient-to-r from-[#0D1724] to-[#0A1019]">
              <h3 className="font-bold text-sm tracking-wider uppercase text-[#F9F9FB] flex items-center gap-2">Active Holdings Overview</h3>
              <button className="text-xs font-bold text-[#81D7B4] hover:underline">View all holdings details →</button>
            </div>
            {loading ? (
              <div className="p-8 text-center text-[#7B8B9A]">Loading holdings...</div>
            ) : holdings.length === 0 ? (
              <div className="p-8 text-center text-[#7B8B9A]">No active holdings.</div>
            ) : (
              <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#0A0F17]">
                    <tr>
                      <th className="px-5 py-3 text-xs font-bold text-[#4B5A75]">Instrument</th>
                      <th className="px-5 py-3 text-xs font-bold text-[#4B5A75]">Units Held</th>
                      <th className="px-5 py-3 text-xs font-bold text-[#4B5A75]">Total Invested</th>
                      <th className="px-5 py-3 text-xs font-bold text-[#4B5A75]">Entitlement / Yield</th>
                      <th className="px-5 py-3 text-xs font-bold text-[#4B5A75]">Status</th>
                      <th className="px-5 py-3 text-xs font-bold text-[#4B5A75]">Next Payment</th>
                      <th className="px-5 py-3 text-xs font-bold text-[#4B5A75]">Est. Next Payment</th>
                      <th className="px-5 py-3 text-xs font-bold text-[#4B5A75]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C2538]">
                    {holdings.map((h) => (
                      <tr key={h._id} className="hover:bg-[#1C2538]/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getInstrumentColorClass(h.instrument, 'bg')}`}>
                              {getInstrumentIcon(h.instrument)}
                            </div>
                            <div>
                              <p className="font-bold text-[#F9F9FB]">{h.instrument}</p>
                              <p className="text-xs text-[#7B8B9A]">{h.instrument === 'BizYield' ? 'Revenue Share' : h.instrument === 'BizCredit' ? 'Private Credit Pool' : 'Treasury Backed'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium text-[#F9F9FB]">
                          {h.instrument === 'BizYield' ? `${Math.floor(h.investmentAmount / 10)} Shares` : 
                           h.instrument === 'BizCredit' ? `${Math.floor(h.investmentAmount / 100)} Shares` : 
                           h.instrument === 'BizBond' ? `${Math.floor(h.investmentAmount / 1000)} Shares` : '1 Share'}
                        </td>
                        <td className="px-5 py-4 font-bold text-[#F9F9FB]">${h.investmentAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-[#F9F9FB]">{h.apr}</p>
                          <p className="text-xs text-[#7B8B9A]">{h.payoutFrequency}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest ${h.status.includes('Active') ? 'bg-[#059669]/20 text-[#059669] border border-[#059669]/30' : 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30'}`}>
                            {h.status.split('—')[0]}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium text-[#F9F9FB]">
                          {formatDate(h.nextPayment)}
                        </td>
                        <td className="px-5 py-4 font-bold text-[#81D7B4]">
                          ~${(h.investmentAmount * 0.05).toFixed(2)}
                        </td>
                        <td className="px-5 py-4">
                          <button className="w-8 h-8 rounded-lg bg-[#1C2538] hover:bg-[#2C3E5D] flex items-center justify-center text-[#7B8B9A] transition-colors border border-[#2C3E5D]">
                            <ArrowDown01Icon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden flex flex-col divide-y divide-[#1C2538]">
                {holdings.map((h) => (
                  <div key={h._id} className="p-5 flex flex-col gap-4 hover:bg-[#1C2538]/30 transition-colors cursor-pointer" onClick={() => setSelectedCert(h)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getInstrumentColorClass(h.instrument, 'bg')}`}>
                          {getInstrumentIcon(h.instrument)}
                        </div>
                        <div>
                          <p className="font-bold text-[#F9F9FB] text-base">{h.instrument}</p>
                          <p className="text-[10px] text-[#7B8B9A] uppercase tracking-wider">{h.instrument === 'BizYield' ? 'Revenue Share' : h.instrument === 'BizCredit' ? 'Private Credit Pool' : 'Treasury Backed'}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-[9px] font-bold rounded uppercase tracking-widest ${h.status.includes('Active') ? 'bg-[#059669]/20 text-[#059669] border border-[#059669]/30' : 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30'}`}>
                        {h.status.split('—')[0]}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 bg-[#0A0F17] rounded-xl p-4 border border-[#1C2538]">
                      <div>
                        <p className="text-[10px] font-bold text-[#4B5A75] uppercase tracking-wider mb-1">Total Invested</p>
                        <p className="font-black text-[#F9F9FB] text-lg">${h.investmentAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#4B5A75] uppercase tracking-wider mb-1">Est. Next Payment</p>
                        <p className="font-black text-[#81D7B4] text-lg">~${(h.investmentAmount * 0.05).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#4B5A75] uppercase tracking-wider mb-1">Entitlement</p>
                        <p className="text-sm font-bold text-[#F9F9FB]">{h.apr}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#4B5A75] uppercase tracking-wider mb-1">Next Date</p>
                        <p className="text-sm font-bold text-[#F9F9FB]">{formatDate(h.nextPayment)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
          </div>

          {/* REFERRALS SECTION - PREMIUM BANNER */}
          <div className="bg-gradient-to-br from-[#121D2C] via-[#0D1724] to-[#0A1019] border border-[#1E2F45] rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.4)] relative group">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#81D7B4]/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#81D7B4]/10 transition-colors duration-500"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#3B82F6]/10 transition-colors duration-500"></div>

            <div className="p-6 sm:p-8 relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
              
              {/* Left text section */}
              <div className="md:col-span-2 xl:col-span-1 flex flex-col justify-center text-center xl:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#81D7B4]/10 border border-[#81D7B4]/20 rounded-full mb-4 mx-auto xl:mx-0 w-max">
                  <GiftIcon className="w-4 h-4 text-[#81D7B4]" />
                  <span className="text-[10px] font-bold text-[#81D7B4] uppercase tracking-widest whitespace-nowrap">Refer & Earn</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#F9F9FB] tracking-tight mb-3">Invite Friends, Earn Passive Yield</h3>
                <p className="text-sm text-[#7B8B9A] leading-relaxed max-w-xl mx-auto xl:mx-0">
                  Get <strong className="text-[#F9F9FB]">0.1%</strong> of all investments made using your unique code, paid directly to your pending balance.
                </p>
              </div>
              
              {/* Center Code Generation */}
              <div className="md:col-span-1 xl:col-span-1 bg-[#0A0F17]/50 backdrop-blur-md rounded-2xl p-6 border border-[#1C2538] shadow-inner flex flex-col justify-center h-full">
                <p className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-widest mb-3 text-center sm:text-left">Your Unique Code</p>
                {refLoading ? (
                  <div className="h-14 bg-[#1C2538]/50 animate-pulse rounded-xl"></div>
                ) : referralData?.bizswapReferralCode ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 bg-[#0A1019] border border-[#1C2538] rounded-xl px-4 py-3 sm:py-4 text-xl font-black tracking-[0.2em] text-[#81D7B4] select-all shadow-inner text-center overflow-hidden text-ellipsis">
                      {referralData.bizswapReferralCode}
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(referralData.bizswapReferralCode);
                        toast.success('Code copied to clipboard!');
                      }}
                      className="text-sm font-bold text-[#F9F9FB] bg-gradient-to-br from-[#2C3E5D] to-[#1C2538] hover:from-[#3B527A] hover:to-[#2C3E5D] transition-all px-6 py-4 rounded-xl border border-[#3B527A] shadow-lg active:scale-95 shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={generateReferralCode}
                    className="w-full text-sm font-bold text-[#0F1825] bg-gradient-to-r from-[#81D7B4] to-[#6BC4A0] hover:brightness-110 transition-all px-6 py-4 rounded-xl shadow-[0_4px_20px_rgba(129,215,180,0.2)]"
                  >
                    Generate Invite Code
                  </button>
                )}
              </div>
              
              {/* Right Earnings Section */}
              <div className="md:col-span-1 xl:col-span-1 flex flex-col justify-center h-full border-t md:border-t-0 md:border-l border-[#1C2538] pt-8 md:pt-0 md:pl-8">
                <p className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-widest mb-2 text-center sm:text-left">Available to Withdraw</p>
                <div className="flex items-baseline justify-center sm:justify-start gap-1 mb-5">
                  <span className="text-4xl font-black text-[#F9F9FB]">${(referralData?.bizswapPendingUsdcEarnings || 0).toFixed(2)}</span>
                  <span className="text-xs text-[#4B5A75] font-bold">USDC</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Amt"
                      max={referralData?.bizswapPendingUsdcEarnings || 0}
                      className="w-full min-w-[80px] flex-1 bg-[#0A0F17] border border-[#1C2538] rounded-lg px-4 py-3 text-sm font-bold text-[#F9F9FB] outline-none placeholder:text-[#2C3E5D] focus:border-[#81D7B4]/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-inner"
                    />
                    <button 
                      onClick={handleWithdraw}
                      disabled={isWithdrawing || !withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > (referralData?.bizswapPendingUsdcEarnings || 0)}
                      className="text-sm font-bold text-[#F9F9FB] bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all px-6 py-3 rounded-lg shadow-lg whitespace-nowrap active:scale-95 shrink-0"
                    >
                      {isWithdrawing ? '...' : 'Withdraw'}
                    </button>
                  </div>
                  <div className="text-[10px] font-medium text-[#4B5A75] text-center sm:text-left mt-1">
                    Total Lifetime: ${(referralData?.bizswapTotalUsdcEarned || 0).toFixed(2)}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* PAYMENT HISTORY */}
          <div className="bg-[#0A1019] border border-[#1E2F45] rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-[#1E2F45] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0D1724]">
              <h3 className="font-bold text-sm tracking-wider uppercase text-[#F9F9FB]">Payment History</h3>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <select className="bg-[#0A0F17] border border-[#1E2F45] rounded-xl px-3 py-2 text-xs text-[#F9F9FB] outline-none">
                  <option>All Instruments</option>
                </select>
                <div className="bg-[#0A0F17] border border-[#1E2F45] rounded-xl px-3 py-2 text-xs text-[#F9F9FB]">
                  Apr 1, 2026 - May 20, 2026
                </div>
                <button className="flex items-center gap-2 text-xs font-bold text-[#F9F9FB] hover:text-[#81D7B4] border border-[#1E2F45] bg-[#0A0F17] px-3 py-2 rounded-xl transition-colors shadow-sm">
                  <Download01Icon className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#0A0F17]">
                  <tr>
                    <th className="px-5 py-3 text-xs font-bold text-[#4B5A75]">Date</th>
                    <th className="px-5 py-3 text-xs font-bold text-[#4B5A75]">Instrument</th>
                    <th className="px-5 py-3 text-xs font-bold text-[#4B5A75]">Amount Received</th>
                    <th className="px-5 py-3 text-xs font-bold text-[#4B5A75]">Currency</th>
                    <th className="px-5 py-3 text-xs font-bold text-[#4B5A75]">Status</th>
                    <th className="px-5 py-3 text-xs font-bold text-[#4B5A75]">Transaction Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2538]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-[#7B8B9A]">Loading history...</td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-[#7B8B9A]">No payment history yet.</td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p._id} className="hover:bg-[#1C2538]/30 transition-colors">
                        <td className="px-5 py-4 text-[#F9F9FB]">{formatDate(p.date)}</td>
                        <td className="px-5 py-4 font-bold text-[#F9F9FB]">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getInstrumentColorClass(p.instrument, 'bg').replace('/10', '')} ${p.instrument.includes('Pending') ? 'bg-[#F5A623]' : ''}`}></span>
                          {p.instrument}
                        </td>
                        <td className={`px-5 py-4 font-bold ${p.txHash.includes('Pending') ? 'text-[#F5A623]' : 'text-[#81D7B4]'}`}>+${p.amount.toFixed(2)}</td>
                        <td className="px-5 py-4 text-[#7B8B9A]">{p.currency?.includes('Fiat') ? 'Fiat' : (p.currency || 'USDC')}</td>
                        <td className="px-5 py-4 font-bold">
                          {p.txHash.includes('Pending') ? (
                            <span className="text-[#F5A623]">Pending</span>
                          ) : (
                            <span className="text-[#81D7B4]">Success</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {p.txHash.includes('Pending') ? (
                            <span className="text-[#7B8B9A]">N/A</span>
                          ) : (
                            <a 
                              href="#" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#3B82F6] hover:underline"
                            >
                              {p.txHash.slice(0, 4)}...{p.txHash.slice(-4)}
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="p-4 text-center border-t border-[#1C2538] bg-[#0A0F17]">
                <button className="text-xs font-bold text-[#81D7B4] hover:underline">View full payment history →</button>
              </div>
            </div>
          </div>

          {/* ALERTS & NOTIFICATIONS */}
          <div className="bg-[#121A27] border border-[#1C2538] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1C2538] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <h3 className="font-bold text-sm tracking-wider uppercase text-[#F9F9FB]">Alerts & Notifications</h3>
              <button className="text-xs font-bold text-[#81D7B4] hover:underline">View all alerts →</button>
            </div>
            <div className="p-8 text-center text-[#7B8B9A]">
              No new alerts.
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 min-w-0">
          
          {/* PAYMENT CALENDAR */}
          <div className="bg-[#0A1019] border border-[#1E2F45] rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-[#1E2F45] flex justify-between items-center bg-[#0D1724]">
              <h3 className="font-bold text-sm tracking-wider uppercase text-[#F9F9FB]">Payment Calendar</h3>
            </div>
            <div className="divide-y divide-[#1C2538]">
              {holdings.length === 0 ? (
                <div className="p-8 text-center text-[#7B8B9A]">No upcoming payments.</div>
              ) : (
                holdings.map((h, i) => {
                  const d = new Date(h.nextPayment);
                  const month = d.toLocaleString('default', { month: 'short' });
                  const day = d.getDate();
                  const estPayment = h.investmentAmount * 0.05;
                  
                  return (
                    <div key={i} className="p-5 flex items-center justify-between hover:bg-[#1C2538]/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-center w-10">
                          <p className="text-[10px] font-bold text-[#4B5A75] uppercase tracking-widest">{month}</p>
                          <p className="text-xl font-black text-[#F9F9FB]">{day}</p>
                        </div>
                        <div>
                          <p className="flex items-center gap-2 text-sm font-bold text-[#F9F9FB]">
                            <span className={`w-2 h-2 rounded-full ${getInstrumentColorClass(h.instrument, 'bg').replace('/10', '')}`}></span> {h.instrument}
                          </p>
                          <p className="text-xs text-[#7B8B9A]">{h.payoutFrequency}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-bold text-[#F9F9FB]">${estPayment.toFixed(2)}</p>
                          <p className="text-[10px] text-[#7B8B9A]">≈ ₦{(estPayment * 1450).toLocaleString()}</p>
                        </div>
                        <span className="px-2 py-1 text-[10px] font-bold bg-[#3B82F6]/20 text-[#3B82F6] rounded">Upcoming</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div className="p-4 text-center bg-[#0A0F17]">
                <button className="text-xs font-bold text-[#81D7B4] hover:underline">View full payment calendar →</button>
              </div>
            </div>
          </div>

          {/* MY CERTIFICATES - THE VAULT */}
          <div className="bg-gradient-to-b from-[#0A1019] to-[#05080C] border border-[#1E2F45] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex flex-col relative">
            {/* Vault Ambient Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1E2F45]/20 via-transparent to-transparent pointer-events-none"></div>

            <div className="p-6 border-b border-[#1E2F45] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 bg-gradient-to-r from-[#0D1724] to-transparent relative z-10">
              <h3 className="font-bold text-sm tracking-wider uppercase text-[#F9F9FB] flex items-center gap-2">
                <Tick01Icon className="w-5 h-5 text-[#81D7B4]" /> Certificate Vault
              </h3>
              <a href="/bizswap/dashboard/certificates" className="text-xs font-bold text-[#81D7B4] hover:text-[#F9F9FB] transition-colors hover:underline">View Gallery →</a>
            </div>
            
            <div className="p-6 sm:p-8 relative z-10 flex-1 flex flex-col">
              {holdings.length === 0 ? (
                <div className="text-center text-[#7B8B9A] py-12 bg-[#0A0F17]/50 rounded-2xl border border-[#1C2538] border-dashed">
                  <div className="w-12 h-12 rounded-full bg-[#1C2538] flex items-center justify-center mx-auto mb-3">
                    <InformationCircleIcon className="w-6 h-6 text-[#4B5A75]" />
                  </div>
                  <p className="font-bold text-[#F9F9FB] mb-1">Your Vault is Empty</p>
                  <p className="text-xs">Purchase BizShares to unlock digital certificates.</p>
                </div>
              ) : (
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 pt-4 px-2 -mx-2 scrollbar-hide" style={{ scrollPaddingLeft: '0.5rem' }}>
                  {holdings.map((h, i) => (
                    <div 
                      key={h._id} 
                      onClick={() => setSelectedCert(h)}
                      className="relative flex-none w-[320px] sm:w-[380px] h-[210px] sm:h-[240px] snap-start rounded-2xl overflow-hidden cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#2C3E5D] transition-all duration-500 ease-out hover:-translate-y-3 hover:scale-[1.03] hover:shadow-[0_20px_40px_rgba(129,215,180,0.15)] hover:border-[#81D7B4]/50 hover:z-20"
                      style={{ transform: `rotate(${i % 2 === 0 ? '-1deg' : '1deg'})`, transformOrigin: 'bottom center' }}
                    >
                      {/* Interactive glare effect */}
                      <div className="absolute inset-0 z-30 bg-gradient-to-tr from-white/0 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none transform -translate-x-full group-hover:translate-x-full transition-transform ease-in-out"></div>
                      
                      <div className="w-[1100px] flex-shrink-0 origin-center pointer-events-none scale-[0.29] sm:scale-[0.345] bg-[#0A0F17] flex justify-center items-center h-[730px] -mt-[250px] -ml-[390px] sm:-ml-[360px]">
                        <CertificateCard holding={{ ...h, wallet: walletAddress }} />
                      </div>
                      
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#05080C]/80 via-transparent to-transparent pointer-events-none" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 left-4 z-20">
                         <span className={`px-3 py-1 text-[9px] font-black rounded-md uppercase tracking-widest backdrop-blur-md border ${h.status.includes('Active') ? 'bg-[#059669]/80 text-white border-[#059669]/50 shadow-[0_0_15px_rgba(5,150,105,0.5)]' : 'bg-[#3B82F6]/80 text-white border-[#3B82F6]/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]'}`}>
                           {h.status.split('—')[0]}
                         </span>
                      </div>

                      {/* Info overlay */}
                      <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end opacity-90 group-hover:opacity-100 transition-opacity">
                        <div>
                          <p className="text-[10px] font-bold text-[#81D7B4] uppercase tracking-widest drop-shadow-md">{h.instrument}</p>
                          <p className="text-xl font-black text-white drop-shadow-md">${h.investmentAmount.toLocaleString()}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                          <Tick01Icon className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {holdings.length > 0 && (
              <div className="p-4 text-center border-t border-[#1C2538] bg-[#0A0F17] mt-auto">
                <p className="text-[10px] text-[#7B8B9A] uppercase tracking-widest font-bold">Total Certificates: {holdings.length}</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* CERTIFICATE MODAL */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto" onClick={() => setSelectedCert(null)}>
          <div 
            className="relative w-full max-w-[1100px] my-8 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              id="cert-close-btn"
              onClick={() => setSelectedCert(null)}
              className="absolute -top-4 -right-4 text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors z-50 bg-[#1A2538] p-2 rounded-full border border-[#2C3E5D] shadow-lg"
            >
              <Cancel01Icon className="w-5 h-5" />
            </button>

            <div ref={certificateRef} className="bg-[#0F1825] rounded-xl">
              <CertificateCard holding={{ ...selectedCert, wallet: walletAddress }} />
            </div>

            {/* Action Buttons */}
            <div id="cert-action-btns" className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={downloadCertificate}
                className="text-xs font-bold text-[#0F1825] bg-[#81D7B4] hover:bg-[#6BC4A0] transition-colors px-6 py-2.5 rounded-full shadow-lg flex items-center gap-2"
              >
                <Download01Icon className="w-4 h-4" />
                Download Certificate
              </button>
              <div 
                className="text-xs font-bold text-[#81D7B4] border border-[#81D7B4]/50 px-6 py-2.5 rounded-full inline-block shadow-lg bg-[#0F1825]"
              >
                ID: {selectedCert.mintAddress.split('_')[1] || selectedCert.mintAddress}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
