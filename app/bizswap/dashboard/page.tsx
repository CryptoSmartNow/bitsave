'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Activity01Icon, Calendar01Icon, ArrowDown01Icon, Download01Icon, Notification01Icon, Tick01Icon, ChartAverageIcon, Shield01Icon, Dollar01Icon, InformationCircleIcon, Cancel01Icon } from "hugeicons-react";
import { useWallet } from '@solana/wallet-adapter-react';
import { usePrivy } from '@privy-io/react-auth';
import toast from 'react-hot-toast';
import { useBizSwapProgram } from '@/hooks/useBizSwapProgram';
import { CertificateCard } from '@/components/CertificateCard';
import { useBizSwapReferrals } from '@/lib/useBizSwapReferrals';

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
    : (privySolanaWallet?.address || user?.wallet?.address);

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Holding | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  const program = useBizSwapProgram();

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

      if (holdingsRes.ok) setHoldings(holdingsData.data || []);
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
  const totalEarned = payments.reduce((sum, p) => sum + p.amount, 0);
  
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
        <p className="text-[#7B8B9A] mb-8 max-w-sm">Please connect your Solana wallet in the top right to view your portfolio.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-[1600px] mx-auto space-y-6 md:space-y-8 min-w-0">
      
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121A27] border border-[#1C2538] p-5 rounded-2xl flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-2">Total Invested</p>
            <h2 className="text-3xl font-black text-[#F9F9FB]">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
            <p className="text-xs text-[#059669] mt-1 font-medium">
              {totalValue > 0 ? `+${((totalEarned / totalValue) * 100).toFixed(2)}%` : '0.00%'} <span className="text-[#4B5A75]">All instruments</span>
            </p>
          </div>
        </div>

        <div className="bg-[#121A27] border border-[#1C2538] p-5 rounded-2xl flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-2">Total Earned To Date</p>
            <h2 className="text-3xl font-black text-[#F9F9FB]">${totalEarned.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
            <p className="text-xs text-[#4B5A75] mt-1 font-medium">Since you joined</p>
          </div>
        </div>

        <div className="bg-[#121A27] border border-[#1C2538] p-5 rounded-2xl flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-2">Pending Yield</p>
            <h2 className="text-3xl font-black text-[#F9F9FB]">${pendingYield.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
            <p className="text-xs text-[#4B5A75] mt-1 font-medium">Across all instruments</p>
          </div>
        </div>

        <div className="bg-[#121A27] border border-[#1C2538] p-5 rounded-2xl flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-2">Next Payment</p>
            <h2 className="text-xl font-black text-[#F9F9FB]">{upcomingHolding ? formatDate(nextPaymentDateStr) : 'No Upcoming'}</h2>
            <p className="text-xs text-[#4B5A75] mt-1 font-medium">
              {upcomingHolding ? `$${getExpectedPaymentAmount(upcomingHolding).toFixed(2)} from ${upcomingHolding.instrument}` : '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 w-full">
        
        {/* MAIN LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          
          {/* HOLDINGS OVERVIEW */}
          <div className="bg-[#121A27] border border-[#1C2538] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1C2538] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <h3 className="font-bold text-sm tracking-wider uppercase text-[#F9F9FB]">Holdings Overview</h3>
              <button className="text-xs font-bold text-[#81D7B4] hover:underline">View all holdings details →</button>
            </div>
            {loading ? (
              <div className="p-8 text-center text-[#7B8B9A]">Loading holdings...</div>
            ) : holdings.length === 0 ? (
              <div className="p-8 text-center text-[#7B8B9A]">No active holdings.</div>
            ) : (
              <div className="overflow-x-auto">
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
            )}
          </div>

          {/* REFERRALS SECTION */}
          <div className="bg-[#121A27] border border-[#1C2538] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1C2538]">
              <h3 className="font-bold text-sm tracking-wider uppercase text-[#F9F9FB]">Referral Program</h3>
              <p className="text-xs text-[#7B8B9A] mt-1">Earn 0.1% of investments made using your code.</p>
            </div>
            <div className="p-5 sm:p-8 grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-widest mb-2">Your Referral Code</p>
                {refLoading ? (
                  <div className="h-12 bg-[#1C2538]/50 animate-pulse rounded-xl"></div>
                ) : referralData?.bizswapReferralCode ? (
                  <div className="flex items-center gap-3">
                    <div className="bg-[#0A0F17] border border-[#1C2538] rounded-xl px-5 py-3 text-lg font-black tracking-widest text-[#81D7B4] select-all">
                      {referralData.bizswapReferralCode}
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(referralData.bizswapReferralCode);
                        toast.success('Code copied to clipboard!');
                      }}
                      className="text-xs font-bold text-[#F9F9FB] bg-[#1C2538] hover:bg-[#2C3E5D] transition-colors px-4 py-3 rounded-xl border border-[#2C3E5D]"
                    >
                      Copy
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={generateReferralCode}
                    className="text-xs font-bold text-[#0F1825] bg-[#81D7B4] hover:bg-[#6BC4A0] transition-colors px-6 py-3 rounded-xl shadow-lg"
                  >
                    Generate Code
                  </button>
                )}
              </div>
              
              <div className="border-t md:border-t-0 md:border-l border-[#1C2538] pt-6 md:pt-0 md:pl-8">
                <p className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-widest mb-2">Pending USDC Earnings</p>
                <div className="flex items-end justify-between gap-4">
                  <h2 className="text-3xl font-black text-[#F9F9FB]">
                    ${(referralData?.bizswapPendingUsdcEarnings || 0).toFixed(2)}
                  </h2>
                  <div className="text-xs font-medium text-[#4B5A75] mb-1">
                    Total Earned: ${(referralData?.bizswapTotalUsdcEarned || 0).toFixed(2)}
                  </div>
                </div>
                
                <div className="mt-4 flex gap-3">
                  <input 
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Amount"
                    max={referralData?.bizswapPendingUsdcEarnings || 0}
                    className="w-full bg-[#0A0F17] border border-[#1C2538] rounded-xl px-4 py-2.5 text-sm font-bold text-[#F9F9FB] outline-none placeholder:text-[#2C3E5D] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button 
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || !withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > (referralData?.bizswapPendingUsdcEarnings || 0)}
                    className="text-xs font-bold text-[#F9F9FB] bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 disabled:hover:bg-[#3B82F6] transition-colors px-6 py-2.5 rounded-xl shadow-lg whitespace-nowrap"
                  >
                    {isWithdrawing ? '...' : 'Withdraw'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT HISTORY */}
          <div className="bg-[#121A27] border border-[#1C2538] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1C2538] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-bold text-sm tracking-wider uppercase text-[#F9F9FB]">Payment History</h3>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <select className="bg-[#0A0F17] border border-[#1C2538] rounded-lg px-3 py-1.5 text-xs text-[#F9F9FB] outline-none">
                  <option>All Instruments</option>
                </select>
                <div className="bg-[#0A0F17] border border-[#1C2538] rounded-lg px-3 py-1.5 text-xs text-[#F9F9FB]">
                  Apr 1, 2026 - May 20, 2026
                </div>
                <button className="flex items-center gap-2 text-xs font-bold text-[#F9F9FB] hover:text-[#81D7B4] border border-[#1C2538] bg-[#0A0F17] px-3 py-1.5 rounded-lg transition-colors">
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
                    <th className="px-5 py-3 text-xs font-bold text-[#4B5A75]">Transaction Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2538]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-[#7B8B9A]">Loading history...</td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-[#7B8B9A]">No payment history yet.</td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p._id} className="hover:bg-[#1C2538]/30 transition-colors">
                        <td className="px-5 py-4 text-[#F9F9FB]">{formatDate(p.date)}</td>
                        <td className="px-5 py-4 font-bold text-[#F9F9FB]">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getInstrumentColorClass(p.instrument, 'bg').replace('/10', '')}`}></span>
                          {p.instrument}
                        </td>
                        <td className="px-5 py-4 font-bold text-[#81D7B4]">+${p.amount.toFixed(2)}</td>
                        <td className="px-5 py-4 text-[#7B8B9A]">{p.currency || 'USDC'}</td>
                        <td className="px-5 py-4">
                          <a 
                            href={`https://explorer.solana.com/tx/${p.txHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#3B82F6] hover:underline"
                          >
                            {p.txHash.slice(0, 4)}...{p.txHash.slice(-4)}
                          </a>
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
          <div className="bg-[#121A27] border border-[#1C2538] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1C2538] flex justify-between items-center">
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

          {/* MY CERTIFICATES */}
          <div className="bg-[#121A27] border border-[#1C2538] rounded-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#1C2538] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <h3 className="font-bold text-sm tracking-wider uppercase text-[#F9F9FB]">My Certificates</h3>
              <a href="/bizswap/dashboard/certificates" className="text-xs font-bold text-[#81D7B4] hover:underline">View all →</a>
            </div>
            
            <div className="p-5">
              {holdings.length === 0 ? (
                <div className="text-center text-[#7B8B9A] py-8">No certificates yet.</div>
              ) : (
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide">
                  {holdings.map(h => (
                    <div 
                      key={h._id} 
                      onClick={() => setSelectedCert(h)}
                      className="relative flex-none w-[300px] sm:w-[400px] h-[200px] sm:h-[250px] snap-start rounded-xl overflow-hidden cursor-pointer group border border-[#1C2538] bg-[#0A0D10] flex justify-center items-center"
                    >
                      <div className="w-[1100px] flex-shrink-0 origin-center pointer-events-none scale-[0.25] sm:scale-[0.35]">
                        <CertificateCard holding={{ ...h, wallet: walletAddress }} />
                      </div>
                      <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-white/5 transition-colors" />
                      
                      {/* Badge Overlay */}
                      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                         <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${h.status.includes('Active') ? 'bg-[#059669]/90 text-white shadow-lg' : 'bg-[#3B82F6]/90 text-white shadow-lg'}`}>
                           {h.status.split('—')[0]}
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {holdings.length > 0 && (
              <div className="p-4 text-center border-t border-[#1C2538] bg-[#0A0F17] mt-auto">
                <a href="/bizswap/dashboard/certificates" className="text-xs font-bold text-[#81D7B4] hover:underline">View all certificates →</a>
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
              <a 
                href={`https://explorer.solana.com/address/${selectedCert.mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#81D7B4] hover:text-[#0F1825] transition-colors border border-[#81D7B4]/50 px-6 py-2.5 rounded-full hover:bg-[#81D7B4] inline-block shadow-lg bg-[#0F1825]"
              >
                Verify on Solana Explorer →
              </a>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
