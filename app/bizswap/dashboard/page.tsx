'use client';

import React, { useEffect, useState, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import QRCode from 'react-qr-code';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  HiOutlineBriefcase, 
  HiOutlineArrowTrendingUp, 
  HiOutlineClock, 
  HiOutlineCalendar,
  HiOutlineChevronDown,
  HiOutlineArrowUpRight,
  HiOutlineArrowDownTray,
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineMegaphone,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlineCurrencyDollar,
  HiOutlineInformationCircle,
  HiOutlineXMark
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useBizSwapProgram } from '@/hooks/useBizSwapProgram';

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

export default function BizSwapStandaloneDashboard() {
  const { publicKey, connected } = useWallet();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Holding | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  const program = useBizSwapProgram();

  useEffect(() => {
    if (connected && publicKey && program) {
      fetchHoldings(publicKey.toBase58());
    } else if (!connected) {
      setHoldings([]);
      setLoading(false);
    }
  }, [connected, publicKey, program]);

  const fetchHoldings = async (wallet: string) => {
    if (!program) return;
    setLoading(true);
    try {
      // Fetch all Certificate Records matching the user's wallet
      const certificates = await (program as any).account.certificateRecord.all([
        {
          memcmp: {
            offset: 8, // Skip anchor discriminator
            bytes: wallet,
          }
        }
      ]);

      const formattedHoldings: Holding[] = certificates.map(({ account, publicKey: pubkey }: any) => {
        // Map on-chain data to UI format
        let instrumentName = 'Unknown';
        if (account.instrumentType.bizYield !== undefined) instrumentName = 'BizYield';
        if (account.instrumentType.bizCredit !== undefined) instrumentName = 'BizCredit';
        if (account.instrumentType.bizBond !== undefined) instrumentName = 'BizBond';

        let statusText = 'Unknown';
        if (account.status.vesting) statusText = `Vesting — ${new Date(account.vestEndTimestamp.toNumber() * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        if (account.status.active) statusText = 'Active';
        if (account.status.redeemed) statusText = 'Redeemed';

        return {
          _id: pubkey.toBase58(),
          instrument: instrumentName,
          investmentAmount: account.amountUsdCents.toNumber() / 100, // convert back to dollars
          entitlement: `${account.entitlementBps.toNumber() / 100}%`,
          status: statusText,
          nextPayment: new Date(account.yieldStartTimestamp.toNumber() * 1000).toISOString(),
          mintAddress: account.mint.toBase58(),
          serialNumber: account.serialNumber.toString(),
          apr: instrumentName === 'BizCredit' ? '16% Annualised' : instrumentName === 'BizBond' ? '10% Fixed' : 'Variable',
          payoutFrequency: instrumentName === 'BizCredit' ? 'Weekly' : instrumentName === 'BizBond' ? 'Quarterly' : 'Monthly',
          purchaseDate: new Date(account.purchaseTimestamp.toNumber() * 1000).toISOString()
        };
      });
      
      setHoldings(formattedHoldings);
    } catch (e) {
      console.error(e);
      toast.error('Network error loading holdings');
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

  // Compute real figures based on holdings
  const totalEarned = 0; // We haven't paid out anything yet in this MVP
  const pendingYield = holdings.reduce((sum, h) => {
    // Rough estimate: 5% of investment amount as pending yield
    return sum + (h.investmentAmount * 0.05);
  }, 0);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInstrumentIcon = (name: string) => {
    switch(name) {
      case 'BizYield': return <HiOutlineChartBar className="w-5 h-5 text-[#FF6B6B]" />;
      case 'BizCredit': return <HiOutlineCurrencyDollar className="w-5 h-5 text-[#3B82F6]" />;
      case 'BizBond': return <HiOutlineShieldCheck className="w-5 h-5 text-[#81D7B4]" />;
      default: return <HiOutlineBriefcase className="w-5 h-5 text-[#7B8B9A]" />;
    }
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
        <HiOutlineChartBar className="w-16 h-16 text-[#2C3E5D] mb-6" />
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
          <div className="w-12 h-12 rounded-full bg-[#81D7B4]/10 flex items-center justify-center border border-[#81D7B4]/20">
            <HiOutlineBriefcase className="w-6 h-6 text-[#81D7B4]" />
          </div>
        </div>

        <div className="bg-[#121A27] border border-[#1C2538] p-5 rounded-2xl flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-2">Total Earned To Date</p>
            <h2 className="text-3xl font-black text-[#F9F9FB]">${totalEarned.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
            <p className="text-xs text-[#4B5A75] mt-1 font-medium">Since you joined</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#059669]/10 flex items-center justify-center border border-[#059669]/20">
            <HiOutlineArrowTrendingUp className="w-6 h-6 text-[#059669]" />
          </div>
        </div>

        <div className="bg-[#121A27] border border-[#1C2538] p-5 rounded-2xl flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-2">Pending Yield</p>
            <h2 className="text-3xl font-black text-[#F9F9FB]">${pendingYield.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
            <p className="text-xs text-[#4B5A75] mt-1 font-medium">Across all instruments</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#F5A623]/10 flex items-center justify-center border border-[#F5A623]/20">
            <HiOutlineClock className="w-6 h-6 text-[#F5A623]" />
          </div>
        </div>

        <div className="bg-[#121A27] border border-[#1C2538] p-5 rounded-2xl flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-2">Next Payment</p>
            <h2 className="text-xl font-black text-[#F9F9FB]">{holdings.length > 0 ? formatDate(holdings[0].nextPayment) : 'No Upcoming'}</h2>
            <p className="text-xs text-[#4B5A75] mt-1 font-medium">
              {holdings.length > 0 ? `$${(holdings[0].investmentAmount * 0.05).toFixed(2)} from ${holdings[0].instrument}` : '-'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center border border-[#3B82F6]/20">
            <HiOutlineCalendar className="w-6 h-6 text-[#3B82F6]" />
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
                            <HiOutlineChevronDown className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                  <HiOutlineArrowDownTray className="w-4 h-4" />
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
                  {/* Empty state for real data */}
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-[#7B8B9A]">No payment history yet.</td>
                  </tr>
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
              <button className="text-xs font-bold text-[#81D7B4] hover:underline">View all →</button>
            </div>
            
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {holdings.length === 0 ? (
                <div className="text-center text-[#7B8B9A] py-8">No certificates yet.</div>
              ) : (
                holdings.map(h => (
                  <div 
                    key={h._id} 
                    onClick={() => setSelectedCert(h)}
                    className={`rounded-xl border p-4 bg-gradient-to-b ${getInstrumentColorClass(h.instrument, 'gradientFrom')} to-transparent ${getInstrumentColorClass(h.instrument, 'border')} relative overflow-hidden group hover:border-opacity-100 transition-all cursor-pointer hover:shadow-lg`}
                  >
                    
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${getInstrumentColorClass(h.instrument, 'text')}`}>{h.instrument}</p>
                        <p className="text-xs text-[#F9F9FB] font-bold mt-1 tracking-widest">
                          {h.instrument === 'BizYield' ? 'SHARD' : h.instrument === 'BizCredit' ? 'PRIVATE CREDIT' : 'TREASURY BACKED'}
                        </p>
                      </div>
                      <div className={`p-2 rounded-lg ${getInstrumentColorClass(h.instrument, 'bg')}`}>
                        {getInstrumentIcon(h.instrument)}
                      </div>
                    </div>

                    <div className="text-center py-4 border-y border-[#1C2538] my-4">
                      <p className="font-mono text-xs text-[#7B8B9A]">#BY-{h.serialNumber}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-widest ${h.status.includes('Active') ? 'bg-[#059669]/20 text-[#059669]' : 'bg-[#3B82F6]/20 text-[#3B82F6]'}`}>
                        {h.status.split('—')[0]}
                      </span>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] text-[#4B5A75] uppercase tracking-widest">Purchased</p>
                        <p className="text-xs font-bold text-[#F9F9FB]">{formatDate(h.purchaseDate)}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] text-[#4B5A75] uppercase tracking-widest">Value</p>
                         <p className="text-sm font-bold text-[#F9F9FB]">
                           ${h.investmentAmount} <span className="text-xs font-normal text-[#7B8B9A]">
                             ({h.instrument === 'BizYield' ? Math.floor(h.investmentAmount / 10) : 
                               h.instrument === 'BizCredit' ? Math.floor(h.investmentAmount / 100) : 
                               h.instrument === 'BizBond' ? Math.floor(h.investmentAmount / 1000) : 1} Shares)
                           </span>
                         </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {holdings.length > 0 && (
              <div className="p-4 text-center border-t border-[#1C2538] bg-[#0A0F17] mt-auto">
                <button className="text-xs font-bold text-[#81D7B4] hover:underline">View all certificates →</button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* CERTIFICATE MODAL */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCert(null)}>
          <div 
            className="relative w-full max-w-3xl bg-[#0F1825] border-2 border-[#81D7B4] rounded-xl shadow-[0_0_50px_rgba(129,215,180,0.15)] p-2 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              ref={certificateRef}
              className="border border-[#81D7B4]/40 p-8 md:p-12 rounded-lg relative overflow-hidden flex flex-col items-center text-center"
            >
              
              {/* Background watermark/logo */}
              <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
                <HiOutlineShieldCheck className="w-96 h-96" />
              </div>

              {/* Close Button */}
              <button 
                id="cert-close-btn"
                onClick={() => setSelectedCert(null)}
                className="absolute top-4 right-4 text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors z-10 bg-[#1A2538] p-2 rounded-full border border-[#2C3E5D]"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>

              <h1 className="text-3xl md:text-5xl font-serif text-[#81D7B4] mb-2 font-black tracking-widest uppercase z-10 mt-6" style={{ fontFamily: 'Georgia, serif' }}>
                Certificate of Ownership
              </h1>
              <p className="text-sm md:text-base text-[#7B8B9A] tracking-widest uppercase mb-10 z-10">
                Official Digital Record • BizMarket Protocol
              </p>

              <div className="space-y-6 max-w-xl mx-auto z-10 w-full">
                <p className="text-lg md:text-xl text-[#F9F9FB] leading-relaxed font-light">
                  This certifies that the wallet address <br/>
                  <span className="font-mono text-[#81D7B4] font-bold text-sm md:text-base bg-[#81D7B4]/10 px-3 py-1.5 rounded mt-3 inline-block border border-[#81D7B4]/20 break-all">
                    {publicKey?.toBase58()}
                  </span>
                </p>

                <p className="text-lg md:text-xl text-[#F9F9FB] leading-relaxed font-light">
                  is the registered owner of
                </p>

                <div className="bg-[#1A2538] border border-[#2C3E5D] rounded-xl p-6 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#81D7B4]"></div>
                  <h2 className="text-3xl md:text-4xl font-black text-[#F9F9FB] mb-1">
                    {selectedCert.instrument === 'BizYield' ? Math.floor(selectedCert.investmentAmount / 10) : 
                     selectedCert.instrument === 'BizCredit' ? Math.floor(selectedCert.investmentAmount / 100) : 
                     selectedCert.instrument === 'BizBond' ? Math.floor(selectedCert.investmentAmount / 1000) : 1} Units
                  </h2>
                  <p className="text-[#81D7B4] font-bold uppercase tracking-widest text-sm">
                    {selectedCert.instrument}
                  </p>
                  <p className="text-xs text-[#7B8B9A] mt-2">Valued at ${selectedCert.investmentAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>

                <p className="text-sm text-[#7B8B9A] leading-relaxed max-w-lg mx-auto">
                  Entitled to <span className="text-[#F9F9FB] font-bold">{selectedCert.entitlement}</span> yield paid <span className="text-[#F9F9FB] font-bold">{selectedCert.payoutFrequency.toLowerCase()}</span>. 
                  This digital certificate is irrefutably recorded and secured on the Solana blockchain.
                </p>
              </div>

              <div className="w-full flex justify-between items-end mt-16 border-t border-[#81D7B4]/20 pt-8 z-10">
                <div className="text-left w-1/3">
                  <p className="font-mono text-[10px] md:text-xs text-[#7B8B9A] mb-1 uppercase tracking-wider">Certificate No.</p>
                  <p className="font-bold text-[#F9F9FB] text-xs md:text-base">#BY-{selectedCert.serialNumber}</p>
                </div>
                
                <div className="text-center w-1/3">
                  <div className="w-24 md:w-32 border-b border-[#81D7B4] mx-auto mb-2 opacity-50"></div>
                  <p className="text-xl md:text-3xl text-[#81D7B4] font-bold italic" style={{ fontFamily: 'Georgia, serif' }}>BizMarket</p>
                  <p className="text-[8px] md:text-[10px] text-[#7B8B9A] uppercase tracking-widest mt-1">Authorized Issuer</p>
                </div>

                <div className="text-right w-1/3 flex flex-col items-end">
                  <div className="bg-white p-1.5 rounded-lg shadow-sm mb-3">
                    <QRCode 
                      value={`https://explorer.solana.com/address/${selectedCert.mintAddress}?cluster=devnet`} 
                      size={64} 
                    />
                  </div>
                  <p className="font-mono text-[10px] md:text-xs text-[#7B8B9A] mb-1 uppercase tracking-wider">Issue Date</p>
                  <p className="font-bold text-[#F9F9FB] text-xs md:text-base">{formatDate(selectedCert.purchaseDate)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div id="cert-action-btns" className="mt-8 z-10 flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={downloadCertificate}
                  className="text-xs font-bold text-[#0F1825] bg-[#81D7B4] hover:bg-[#6BC4A0] transition-colors px-6 py-2.5 rounded-full shadow-lg flex items-center gap-2"
                >
                  <HiOutlineArrowDownTray className="w-4 h-4" />
                  Download Certificate
                </button>
                <a 
                  href={`https://explorer.solana.com/address/${selectedCert.mintAddress}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#81D7B4] hover:text-[#0F1825] transition-colors border border-[#81D7B4]/50 px-6 py-2.5 rounded-full hover:bg-[#81D7B4] inline-block shadow-lg"
                >
                  Verify on Solana Explorer →
                </a>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
