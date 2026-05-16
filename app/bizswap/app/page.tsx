'use client';
import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { HiOutlineInformationCircle, HiOutlineClock, HiOutlineCurrencyDollar, HiOutlineChartBar, HiOutlineArrowLeft } from 'react-icons/hi2';
import Link from 'next/link';
import { useBizSwap } from '@/hooks/useBizSwap';
import { formatTokenAmount } from '@/lib/bizswap-contracts';
// ── Shared components ─────────────────────────────────
const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center px-5 py-3 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-bold text-gray-900">{value}</span>
  </div>
);

const Panel = ({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
    <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{title}</span>
      {badge && <span className="text-xs font-bold text-[#81D7B4] bg-[#81D7B4]/10 px-2 py-0.5 rounded">{badge}</span>}
    </div>
    {children}
  </div>
);

const inputCls = "w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#81D7B4] outline-none text-gray-900 font-bold text-base transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

export default function BizSwapPage() {
  const { address } = useAccount();
  const biz = useBizSwap();

  const [activeTab, setActiveTab] = useState<'primary' | 'secondary'>('primary');
  const [buyAmount, setBuyAmount] = useState('1');
  const [sellAmount, setSellAmount] = useState('1');
  const [txStep, setTxStep] = useState<'idle' | 'approving' | 'buying' | 'claiming' | 'selling'>('idle');

  // Derived values from hook — fall back to safe defaults when contract not deployed
  const totalShares = Number(biz.maxSupplyShares) || 1000;
  const availableShares = Number(biz.availableShares) || totalShares;
  const soldShares = Number(biz.totalSoldShares) || 0;
  const sharePrice = biz.salePricePerShare > 0n ? Number(biz.salePricePerShare) / 1e6 : 100;
  const progressPct = totalShares > 0 ? (soldShares / totalShares) * 100 : 0;
  const saleActive = biz.sale.isActive;
  const userBalance = Number(biz.holdings.balance) / 1e18 || 0;
  const pendingYield = biz.pendingYieldFormatted;
  const payoutPerShare = biz.payoutPerShareFormatted;

  const endTimeDate = biz.sale.endTime > 0n
    ? new Date(Number(biz.sale.endTime) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'May 30, 2026';

  // ── Buy flow: approve → buy ─────────────────────────────
  const handleBuy = useCallback(async () => {
    const qty = parseInt(buyAmount);
    if (!qty || qty < 1) { toast.error('Enter a valid amount.'); return; }
    if (qty > availableShares) { toast.error(`Only ${availableShares} shares available.`); return; }

    const amount = BigInt(qty);
    const actualPrice = biz.salePricePerShare > 0n ? biz.salePricePerShare : BigInt(100 * 1e6);
    const cost = amount * actualPrice;
    if (biz.usdcBalance < cost) { toast.error('Insufficient USDC balance.'); return; }

    try {
      // Check if approval is needed
      if (biz.needsSaleApproval(amount)) {
        setTxStep('approving');
        const approveTx = await biz.approveSale(amount);
        toast.loading('Approving USDC...', { id: 'biz-approve' });
        // Wait briefly for confirmation (wagmi handles this via useWaitForTransactionReceipt)
        await new Promise(r => setTimeout(r, 3000));
        toast.dismiss('biz-approve');
      }

      setTxStep('buying');
      toast.loading('Placing order...', { id: 'biz-buy' });
      await biz.buy(amount);
      await new Promise(r => setTimeout(r, 3000));
      toast.dismiss('biz-buy');
      toast.success(`Acquired ${qty} BizShares!`);
      biz.refetch();
    } catch (err: any) {
      toast.dismiss('biz-approve');
      toast.dismiss('biz-buy');
      const msg = err?.shortMessage || err?.message || 'Transaction failed';
      toast.error(msg);
    } finally {
      setTxStep('idle');
    }
  }, [buyAmount, availableShares, biz]);

  // ── Claim yield ─────────────────────────────────────────
  const handleClaim = useCallback(async () => {
    if (biz.holdings.pendingYield === 0n) { toast.error('No yield to claim.'); return; }
    try {
      setTxStep('claiming');
      toast.loading('Claiming yield...', { id: 'biz-claim' });
      await biz.claimYield();
      await new Promise(r => setTimeout(r, 3000));
      toast.dismiss('biz-claim');
      toast.success(`Claimed ${pendingYield} USDC!`);
      biz.refetch();
    } catch (err: any) {
      toast.dismiss('biz-claim');
      toast.error(err?.shortMessage || 'Claim failed');
    } finally {
      setTxStep('idle');
    }
  }, [biz, pendingYield]);

  // ── Sell (secondary exit) ───────────────────────────────
  const handleSell = useCallback(async () => {
    const qty = parseInt(sellAmount);
    if (!qty || qty < 1) { toast.error('Enter a valid amount.'); return; }
    if (qty > userBalance) { toast.error('Insufficient shares.'); return; }

    try {
      const amount = BigInt(qty);
      setTxStep('approving');
      toast.loading('Approving shares...', { id: 'biz-sell-approve' });
      await biz.approveLpSell(amount);
      await new Promise(r => setTimeout(r, 3000));
      toast.dismiss('biz-sell-approve');

      setTxStep('selling');
      toast.loading('Exiting position...', { id: 'biz-sell' });
      await biz.sell(amount);
      await new Promise(r => setTimeout(r, 3000));
      toast.dismiss('biz-sell');
      toast.success(`Exited ${qty} BizShares!`);
      biz.refetch();
    } catch (err: any) {
      toast.dismiss('biz-sell-approve');
      toast.dismiss('biz-sell');
      toast.error(err?.shortMessage || 'Exit failed');
    } finally {
      setTxStep('idle');
    }
  }, [sellAmount, userBalance, biz]);

  const isBusy = txStep !== 'idle';



  const weeklyPayout = payoutPerShare !== '0.00' ? payoutPerShare : '8.67';
  const totalReturn = payoutPerShare !== '0.00'
    ? (parseFloat(payoutPerShare) * Number(biz.totalCycles || 12n)).toFixed(2)
    : '104.04';

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      {/* NAV */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between h-14 items-center">
          <div className="flex items-center gap-3">
            <Link href="/bizswap" className="text-gray-400 hover:text-gray-700 transition-colors">
              <HiOutlineArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-gray-200">|</span>
            <Image src="/bitsavelogo.png" alt="BitSave" width={100} height={32} className="object-contain" priority />
            <span className="text-gray-200">/</span>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">BizSwap Market</span>
          </div>
          <div className="flex items-center gap-3">
            {address && (
              <span className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            )}
            <Link href="/dashboard" className="text-xs font-bold px-4 py-2 bg-[#81D7B4] hover:bg-[#6bc9a6] text-white rounded-lg transition-all">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* TICKER */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-8 py-3 overflow-x-auto">
            {[
              ['Instrument', 'BZSHR-2026-Q2'],
              ['Issue Price', `$${sharePrice.toFixed(2)} USDC`],
              ['Gross Yield', '4.00% / Qtr'],
              ['Weekly Dist.', `$${weeklyPayout} / share`],
              ['Available', `${availableShares.toLocaleString()} / ${totalShares.toLocaleString()}`],
              ['Closes', endTimeDate],
            ].map(([l, v]) => (
              <div key={l} className="shrink-0">
                <span className="text-xs text-gray-400 block">{l}</span>
                <span className={`text-xs font-black ${l === 'Gross Yield' ? 'text-[#81D7B4]' : 'text-gray-900'}`}>{v}</span>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${saleActive ? 'bg-[#81D7B4] animate-pulse' : 'bg-gray-300'}`}></span>
              <span className={`text-xs font-bold ${saleActive ? 'text-[#81D7B4]' : 'text-gray-400'}`}>
                {saleActive ? 'Primary Issuance Live' : 'Issuance Closed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">BizShares Market</h1>
          <p className="text-sm text-gray-500 mt-1">Fixed-yield debt instrument · BZSHR-2026-Q2 · Bitsave Protocol</p>
        </div>

        {/* TABS */}
        <div className="flex border-b border-gray-200 mb-8">
          {(['primary', 'secondary'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === tab ? 'border-[#81D7B4] text-[#81D7B4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab === 'primary' ? 'Primary Issuance' : 'Secondary Market'}
              {tab === 'secondary' && <span className="text-[10px] font-bold bg-[#81D7B4]/10 text-[#81D7B4] px-2 py-0.5 rounded-full">LP Pool</span>}
            </button>
          ))}
        </div>

        {/* PRIMARY */}
        {activeTab === 'primary' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-5">
              <Panel title="Instrument Terms" badge="Primary Phase">
                <Row label="Issue Price" value={`$${sharePrice.toFixed(2)} USDC`} />
                <Row label="Gross Yield" value="4.00% per quarter" />
                <Row label="Weekly Distribution" value={`$${weeklyPayout} USDC per share`} />
                <Row label="Payout Frequency" value="Every Sunday · 12:00 PM UTC" />
                <Row label="Instrument Shelf Life" value={`${Number(biz.totalCycles || 12n)} Weeks from issuance`} />
                <Row label="Total Return" value={`$${totalReturn} per share`} />
              </Panel>

              <Panel title="Order Entry">
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Number of BizShares</label>
                    <div className="relative">
                      <input type="number" min="1" max={availableShares} value={buyAmount}
                        onChange={e => setBuyAmount(e.target.value)} className={inputCls} disabled={isBusy} />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
                        <button onClick={() => setBuyAmount('1')} className="px-2.5 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-500">MIN</button>
                        <button onClick={() => setBuyAmount(String(availableShares))} className="px-2.5 py-1 bg-[#81D7B4]/10 border border-[#81D7B4]/20 rounded text-xs font-bold text-[#81D7B4]">MAX</button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-lg">
                    <div className="flex justify-between px-4 py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Unit Price</span>
                      <span className="text-sm font-bold text-gray-900">${sharePrice.toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between px-4 py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Quantity</span>
                      <span className="text-sm font-bold text-gray-900">{parseInt(buyAmount || '0')} shares</span>
                    </div>
                    <div className="flex justify-between px-4 py-3 bg-white rounded-b-lg">
                      <span className="text-sm font-bold text-gray-700">Total Cost</span>
                      <span className="text-base font-black text-gray-900">${(parseInt(buyAmount || '0') * sharePrice).toLocaleString()} USDC</span>
                    </div>
                  </div>
                  {address && (
                    <p className="text-xs text-gray-400">Your USDC balance: <strong className="text-gray-600">{biz.usdcBalanceFormatted} USDC</strong></p>
                  )}
                  <button onClick={handleBuy} disabled={isBusy || !buyAmount || parseInt(buyAmount) < 1 || parseInt(buyAmount) > availableShares}
                    className="w-full py-3.5 bg-[#81D7B4] hover:bg-[#6bc9a6] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg font-bold text-sm transition-all shadow-sm">
                    {isBusy && txStep === 'approving' ? 'Approving USDC...'
                      : isBusy && txStep === 'buying' ? 'Placing Order...'
                      : `Place Order — ${buyAmount || 0} BizShare${parseInt(buyAmount || '0') !== 1 ? 's' : ''}`}
                  </button>
                  <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                    <HiOutlineInformationCircle className="w-3.5 h-3.5" /> Closes {endTimeDate} or when cap is reached.
                  </p>
                </div>
              </Panel>
            </div>

            <div className="lg:col-span-5 space-y-5">
              <Panel title="Issuance Progress">
                <div className="p-5">
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-2xl font-black text-gray-900">{soldShares.toLocaleString()} <span className="text-sm font-bold text-gray-400">issued</span></span>
                    <span className="text-sm font-bold text-gray-400">{availableShares.toLocaleString()} remaining</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-[#81D7B4] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mb-4">
                    <span>0</span><span>{progressPct.toFixed(1)}% issued</span><span>{totalShares.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#81D7B4]/5 border border-[#81D7B4]/20 rounded-lg px-3 py-2.5">
                    <HiOutlineClock className="w-4 h-4 text-[#81D7B4] shrink-0" />
                    <p className="text-xs font-bold text-gray-700">Primary window closes {endTimeDate}</p>
                  </div>
                </div>
              </Panel>

              <Panel title="My Holdings">
                {userBalance === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <HiOutlineChartBar className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-400">No Holdings</p>
                    <p className="text-xs text-gray-400 mt-1">Place an order to acquire BizShares.</p>
                  </div>
                ) : (
                  <>
                    <Row label="BizShares Held" value={`${Math.floor(userBalance)} shares`} />
                    <Row label="Portfolio Value" value={`$${(userBalance * sharePrice).toFixed(2)} USDC`} />
                    <Row label="Unclaimed Yield" value={`$${pendingYield} USDC`} />
                    <Row label="Payout per Share" value={`$${payoutPerShare} / week`} />
                    <Row label="Current Cycle" value={`${Number(biz.holdings.currentCycle)} of ${Number(biz.totalCycles || 12n)}`} />
                    {biz.holdings.pendingYield > 0n && (
                      <div className="px-5 py-3 border-t border-gray-100">
                        <button onClick={handleClaim} disabled={isBusy}
                          className="w-full py-2.5 bg-[#81D7B4] hover:bg-[#6bc9a6] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg font-bold text-sm transition-all">
                          {txStep === 'claiming' ? 'Claiming...' : `Claim $${pendingYield} USDC`}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </Panel>
            </div>
          </div>
        )}

        {/* ECOSYSTEM FLOW */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Protocol Ecosystem Flow</span>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-stretch gap-4">
              {[
                { step: '01', label: 'Capital Raised', sub: `$${(totalShares * sharePrice).toLocaleString()} USDC target`, teal: true },
                { step: '02', label: 'Capital Deployed', sub: 'Reserve + yield pool split', teal: false },
                { step: '03', label: 'Weekly Payout', sub: `$${weeklyPayout} USDC per share · every Sunday`, teal: false },
                { step: '04', label: 'Instrument Expires', sub: `After ${Number(biz.totalCycles || 12n)} payouts · share retired`, teal: false },
              ].map(({ step, label, sub, teal }, i) => (
                <React.Fragment key={step}>
                  {i > 0 && <div className="text-gray-300 font-black text-xl hidden md:flex items-center px-1">→</div>}
                  <div className={`flex-1 rounded-xl p-5 text-center ${teal ? 'bg-[#81D7B4]' : 'bg-gray-50 border border-gray-100'}`}>
                    <p className={`text-xs font-black uppercase tracking-widest mb-1 ${teal ? 'text-white/60' : 'text-gray-400'}`}>{step}</p>
                    <p className={`text-sm font-black mb-0.5 ${teal ? 'text-white' : 'text-gray-900'}`}>{label}</p>
                    <p className={`text-xs ${teal ? 'text-white/70' : 'text-gray-400'}`}>{sub}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* SECONDARY */}
        {activeTab === 'secondary' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
            <div className="lg:col-span-7 space-y-5">
              <Panel title="Secondary Market — LP Pool" badge={saleActive ? 'Opens after primary' : 'Open'}>
                <div className="p-5">
                  <div className="flex gap-3 bg-[#81D7B4]/5 border border-[#81D7B4]/20 rounded-lg p-4 mb-5">
                    <HiOutlineInformationCircle className="w-5 h-5 text-[#81D7B4] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-1">Exit Fee Applied</p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Liquidating prior to expiry incurs a fixed fee of ${formatTokenAmount(biz.lp.fixedSellFee, 6, 2)} USDC per share. Accrued yield is forfeited.
                      </p>
                    </div>
                  </div>
                  <div className="border border-gray-100 rounded-lg mb-5">
                    <Row label="Exit Fee per Share" value={`$${formatTokenAmount(biz.lp.fixedSellFee, 6, 2)} USDC`} />
                    <Row label="Payout Currency" value="USDC" />
                    <Row label="Settlement" value="Instant (on-chain)" />
                    <Row label="Accrued Yield" value="Forfeited on exit" />
                  </div>
                  {userBalance === 0 ? (
                    <div className="py-6 text-center">
                      <HiOutlineChartBar className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-400">No BizShares to Exit</p>
                      <p className="text-xs text-gray-400 mt-1">Acquire BizShares in the Primary Issuance tab first.</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shares to Liquidate</label>
                      <div className="relative mb-4">
                        <input type="number" min="1" max={Math.floor(userBalance)} value={sellAmount}
                          onChange={e => setSellAmount(e.target.value)} className={inputCls} disabled={isBusy} />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <button onClick={() => setSellAmount(String(Math.floor(userBalance)))} className="px-2.5 py-1 bg-[#81D7B4]/10 border border-[#81D7B4]/20 rounded text-xs font-bold text-[#81D7B4]">MAX</button>
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-lg mb-4">
                        <div className="flex justify-between px-4 py-3 border-b border-gray-100">
                          <span className="text-sm text-gray-500">Shares Exiting</span>
                          <span className="text-sm font-bold text-gray-900">{parseInt(sellAmount || '0')}</span>
                        </div>
                        <div className="flex justify-between px-4 py-3 bg-white rounded-b-lg">
                          <span className="text-sm font-bold text-gray-700">You Receive</span>
                          <span className="text-base font-black text-gray-900">
                            ${((parseInt(sellAmount || '0') * sharePrice) - (parseInt(sellAmount || '0') * Number(biz.lp.fixedSellFee) / 1e6)).toLocaleString()} USDC
                          </span>
                        </div>
                      </div>
                      <button onClick={handleSell} disabled={isBusy || !sellAmount || parseInt(sellAmount) < 1 || parseInt(sellAmount) > userBalance}
                        className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg font-bold text-sm transition-all shadow-sm">
                        {isBusy ? 'Processing...' : `Confirm Exit — ${sellAmount || 0} Share${parseInt(sellAmount || '0') !== 1 ? 's' : ''}`}
                      </button>
                    </div>
                  )}
                </div>
              </Panel>
            </div>

            <div className="lg:col-span-5 space-y-5">
              <Panel title="Liquidity Provider Panel">
                <div className="p-5">
                  <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                    Deposit USDC to facilitate emergency exits. Earn <strong className="text-gray-900">{Number(biz.lp.feePercent) / 100}%</strong> on every exit swap.
                  </p>
                  <div className="border border-gray-100 rounded-lg mb-5">
                    <Row label="Your LP Position" value="—" />
                    <Row label="Accrued Swap Fees" value="—" />
                    <Row label="Fee Rate" value={`${Number(biz.lp.feePercent) / 100}% per exit`} />
                    <Row label="Pool Currency" value="USDC" />
                  </div>
                  <div className="space-y-2">
                    <button className="w-full py-3 bg-[#81D7B4] hover:bg-[#6bc9a6] text-white rounded-lg font-bold text-sm transition-all shadow-sm">Add Liquidity</button>
                    <button disabled className="w-full py-3 bg-gray-50 text-gray-400 border border-gray-100 rounded-lg font-bold text-sm cursor-not-allowed">Claim Fees</button>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
