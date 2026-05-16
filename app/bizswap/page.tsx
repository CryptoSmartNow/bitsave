import Image from 'next/image';
import Link from 'next/link';
import {
  HiOutlineArrowRight, HiOutlineArrowUpRight, HiOutlineChartBar,
  HiOutlineCurrencyDollar, HiOutlineLockClosed, HiOutlineClock,
  HiOutlineCheckCircle, HiOutlineShieldCheck, HiOutlineDocumentText,
  HiOutlineUsers, HiOutlineScale, HiOutlineBuildingLibrary,
} from 'react-icons/hi2';

export default function BizSwapLandingPage() {
  const payoutSchedule = [
    { week: 'W1', date: 'Jun 8', amount: '$8.67' },
    { week: 'W2', date: 'Jun 15', amount: '$8.67' },
    { week: 'W3', date: 'Jun 22', amount: '$8.67' },
    { week: 'W4', date: 'Jun 29', amount: '$8.67' },
    { week: 'W5', date: 'Jul 6', amount: '$8.67' },
    { week: 'W6', date: 'Jul 13', amount: '$8.67' },
    { week: 'W7', date: 'Jul 20', amount: '$8.67' },
    { week: 'W8', date: 'Jul 27', amount: '$8.67' },
    { week: 'W9', date: 'Aug 3', amount: '$8.67' },
    { week: 'W10', date: 'Aug 10', amount: '$8.67' },
    { week: 'W11', date: 'Aug 17', amount: '$8.67' },
    { week: 'W12', date: 'Aug 24', amount: '$8.67' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">

      {/* NAV */}
      <nav className="border-b border-gray-100 sticky top-0 z-50 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <Image src="/bitsavelogo.png" alt="BitSave" width={110} height={36} className="object-contain" priority />
              <span className="text-gray-300 font-light text-lg">/</span>
              <span className="text-gray-900 font-bold text-sm tracking-wide">BIZSWAP</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
              <a href="#instrument" className="hover:text-gray-900 transition-colors">The Instrument</a>
              <a href="#mechanics" className="hover:text-gray-900 transition-colors">Mechanics</a>
              <a href="#schedule" className="hover:text-gray-900 transition-colors">Payout Schedule</a>
              <a href="#phases" className="hover:text-gray-900 transition-colors">Market Phases</a>
            </div>
            <Link href="/bizswap/app" className="flex items-center gap-2 px-5 py-2.5 bg-[#81D7B4] hover:bg-[#6bc9a6] text-white text-sm font-bold rounded-lg transition-all shadow-sm">
              Access Market <HiOutlineArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO — finance terminal style */}
      <section className="border-b border-gray-100 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4] animate-pulse"></span>
                <span className="text-xs font-bold text-[#81D7B4] uppercase tracking-widest">Primary Issuance Live · May 16 – May 30</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight mb-5">
                BizShares<br />
                <span className="text-[#81D7B4]">Debt Instrument</span>
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
                A structured fixed-yield debt instrument issued via the BizSwap protocol. Acquire BizShares at a fixed price, receive automated weekly payouts for 12 weeks.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/bizswap/app" className="flex items-center gap-2 px-6 py-3 bg-[#81D7B4] hover:bg-[#6bc9a6] text-white font-bold rounded-lg text-sm transition-all shadow-sm">
                  Acquire BizShares <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
                <a href="#mechanics" className="px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-50 transition-all">
                  Read Prospectus
                </a>
              </div>
            </div>

            {/* Right — instrument data card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Instrument Overview</span>
                <span className="text-xs font-bold text-[#81D7B4] bg-[#81D7B4]/10 px-2 py-0.5 rounded">BZSHR-2026-Q2</span>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { label: 'Instrument Type', value: 'Fixed-Yield Debt' },
                  { label: 'Issuance Price', value: '$100.00 USDC' },
                  { label: 'Gross Yield', value: '4.00% per quarter' },
                  { label: 'Weekly Distribution', value: '$8.67 USDC / share' },
                  { label: 'Distribution Schedule', value: '12 consecutive Sundays' },
                  { label: 'Issuance Hard Cap', value: '1,000 BizShares' },
                  { label: 'Total Capital Target', value: '$100,000 USDC' },
                  { label: 'Primary Window', value: 'May 16 – May 30, 2026' },
                  { label: 'Liquidity Phase', value: 'June 1, 2026 onwards' },
                  { label: 'Transfer Restriction', value: 'Locked during primary phase' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center px-6 py-3 hover:bg-gray-50 transition-colors">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-[#81D7B4]/5 border-t border-[#81D7B4]/10">
                <Link href="/bizswap/app" className="flex items-center justify-center gap-2 w-full py-3 bg-[#81D7B4] hover:bg-[#6bc9a6] text-white text-sm font-bold rounded-lg transition-all">
                  Acquire BizShares <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KEY STATS TICKER */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { label: 'Issue Price', value: '$100', sub: 'USDC per share' },
              { label: 'Quarterly Yield', value: '4.00%', sub: 'Gross return' },
              { label: 'Weekly Payout', value: '$8.67', sub: 'Per share held' },
              { label: 'Total Issuance', value: '1,000', sub: 'BizShares (hard cap)' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="py-6 px-8 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTRUMENT MECHANICS */}
      <section id="mechanics" className="py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs font-bold text-[#81D7B4] uppercase tracking-widest mb-2">§ 01 — Instrument Structure</p>
            <h2 className="text-3xl font-black text-gray-900">Capital Management Strategy</h2>
            <p className="text-gray-500 mt-3 max-w-2xl">Full transparency on capital deployment to fund the 12-week payout obligation across the Q2 2026 cycle.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="md:col-span-3 bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <HiOutlineBuildingLibrary className="w-5 h-5 text-[#81D7B4]" />
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Capital Deployment Flow</span>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Total Capital Raised</div>
                  <div className="text-3xl font-black text-gray-900 mb-1">$100,000</div>
                  <div className="text-sm text-gray-500">1,000 shares × $100 USDC</div>
                  <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-[#81D7B4] h-1.5 rounded-full w-full"></div>
                  </div>
                </div>
                <div className="bg-white border border-[#81D7B4]/30 rounded-lg p-5">
                  <div className="text-xs font-bold text-[#81D7B4] uppercase tracking-wider mb-3">Months 1–2 Reserve</div>
                  <div className="text-3xl font-black text-gray-900 mb-1">$69,334</div>
                  <div className="text-sm text-gray-500">May–June payout guarantee fund locked on-chain</div>
                  <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-[#81D7B4] h-1.5 rounded-full" style={{ width: '69.3%' }}></div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Month 3 Yield Pool</div>
                  <div className="text-3xl font-black text-gray-900 mb-1">$30,667</div>
                  <div className="text-sm text-gray-500">Active yield generation to cover August obligation</div>
                  <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: '30.7%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#81D7B4]/5 border border-[#81D7B4]/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineChartBar className="w-5 h-5 text-[#81D7B4]" />
                <span className="text-sm font-bold text-gray-700">Best Case Scenario</span>
                <span className="ml-auto text-xs font-bold text-[#81D7B4] bg-[#81D7B4]/10 px-2 py-0.5 rounded">+15.3% Return on Pool</span>
              </div>
              <p className="text-2xl font-black text-gray-900 mb-1">+$15,333 <span className="text-sm font-medium text-gray-500">protocol profit</span></p>
              <p className="text-sm text-gray-500">July yield pool generates $46,000+ covering the $34,667 obligation with $11.3k surplus.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineScale className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-bold text-gray-700">Worst Case Scenario</span>
                <span className="ml-auto text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">+6.1% Return on Pool</span>
              </div>
              <p className="text-2xl font-black text-gray-900 mb-1">+$6,133 <span className="text-sm font-medium text-gray-500">protocol profit</span></p>
              <p className="text-sm text-gray-500">July yield pool generates $40,800, covering full obligation with $6.1k surplus retained.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PAYOUT SCHEDULE TABLE */}
      <section id="schedule" className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs font-bold text-[#81D7B4] uppercase tracking-widest mb-2">§ 02 — Distribution Schedule</p>
            <h2 className="text-3xl font-black text-gray-900">12-Week Payout Calendar</h2>
            <p className="text-gray-500 mt-3 max-w-2xl">Every Sunday at 12:00 PM UTC, a snapshot captures all BizShare holders. $8.67 USDC is automatically distributed per share.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Week</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Date</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Distribution / Share</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Total Pool (1,000 shares)</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Cumulative / Share</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payoutSchedule.map(({ week, date, amount }, i) => {
                  const cumulative = ((i + 1) * 8.67).toFixed(2);
                  const pool = ((i + 1) * 8670).toLocaleString();
                  const isUpcoming = i < 3;
                  return (
                    <tr key={week} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-gray-900">{week}</td>
                      <td className="px-6 py-3.5 text-gray-600">2026 {date}</td>
                      <td className="px-6 py-3.5 font-bold text-[#81D7B4]">{amount}</td>
                      <td className="px-6 py-3.5 text-gray-600">${pool} USDC</td>
                      <td className="px-6 py-3.5 font-bold text-gray-900">${cumulative}</td>
                      <td className="px-6 py-3.5">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${isUpcoming ? 'bg-[#81D7B4]/10 text-[#81D7B4]' : 'bg-gray-100 text-gray-400'}`}>
                          {isUpcoming ? 'Upcoming' : 'Scheduled'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td colSpan={2} className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Total</td>
                  <td className="px-6 py-3.5 font-black text-gray-900">$104.04</td>
                  <td className="px-6 py-3.5 font-black text-gray-900">$104,040 USDC</td>
                  <td colSpan={2} className="px-6 py-3.5 text-xs text-gray-400">4% gross yield over 12 weeks</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* MARKET PHASES */}
      <section id="phases" className="py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs font-bold text-[#81D7B4] uppercase tracking-widest mb-2">§ 03 — Market Lifecycle</p>
            <h2 className="text-3xl font-black text-gray-900">Two-Phase Market Structure</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#81D7B4] text-white text-xs font-black flex items-center justify-center">1</span>
                  <span className="font-bold text-gray-900">Primary Issuance</span>
                </div>
                <span className="text-xs font-bold bg-[#81D7B4]/10 text-[#81D7B4] px-3 py-1 rounded-full">May 16 – May 30</span>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">A fixed-window, fixed-price issuance of 1,000 BizShares. All shares are minted at exactly $100 USDC. <code className="text-xs bg-[#81D7B4]/10 text-[#81D7B4] px-1.5 py-0.5 rounded">transfer()</code> is disabled during this phase to prevent OTC leakage and price distortion.</p>
                <div className="divide-y divide-gray-50">
                  {[
                    ['Mechanism', 'Fixed-price primary issuance'],
                    ['Price', '$100.00 USDC per share'],
                    ['Hard Cap', '1,000 BizShares'],
                    ['Anti-Whale', 'Per-wallet limits enforced'],
                    ['Transferability', 'Locked (non-transferable)'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2.5 text-sm">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-bold text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full border-2 border-[#81D7B4] text-[#81D7B4] text-xs font-black flex items-center justify-center">2</span>
                  <span className="font-bold text-gray-900">Secondary Market (LP Pool)</span>
                </div>
                <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">From June 1</span>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">Post-issuance, BizSwap opens a Liquidity Pool for secondary trading. Holders requiring early exit may liquidate at a 10% haircut ($90 USDC). Liquidity Providers earn 2% on every swap facilitated.</p>
                <div className="divide-y divide-gray-50">
                  {[
                    ['Mechanism', 'AMM Liquidity Pool'],
                    ['Emergency Exit Price', '$90.00 USDC (−10% haircut)'],
                    ['LP Earn Rate', '2% fee per swap'],
                    ['Transferability', 'Enabled (June 1 onward)'],
                    ['Pool Currency', 'USDC'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2.5 text-sm">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-bold text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RISK & COMPLIANCE */}
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-bold text-[#81D7B4] uppercase tracking-widest mb-2">§ 04 — Risk Disclosure</p>
            <h2 className="text-3xl font-black text-gray-900">Protocol Safeguards</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: HiOutlineShieldCheck, title: 'On-Chain Reserve', desc: 'Months 1–2 payouts are pre-funded directly on the smart contract at issuance.' },
              { icon: HiOutlineLockClosed, title: 'Transfer Lock', desc: 'Transfers disabled during primary phase to prevent price manipulation.' },
              { icon: HiOutlineDocumentText, title: 'Shelf-Life Expiry', desc: 'Each BizShare carries an on-chain expiry_date. Expired shares stop accruing yield automatically.' },
              { icon: HiOutlineUsers, title: 'Anti-Whale Cap', desc: 'Per-wallet acquisition limits enforced at the contract level to maintain fair distribution.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <Icon className="w-6 h-6 text-[#81D7B4] mb-3" />
                <h4 className="font-bold text-gray-900 text-sm mb-2">{title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#81D7B4]/10 border border-[#81D7B4]/20 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4] animate-pulse"></span>
            <span className="text-xs font-bold text-[#81D7B4] uppercase tracking-widest">Issuance Window Open</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4">Acquire BizShares</h2>
          <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">Join the primary issuance before the May 30th closing. Pay via crypto, ChainRails cross-chain, or direct bank transfer.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/bizswap/app" className="flex items-center gap-2 px-8 py-4 bg-[#81D7B4] hover:bg-[#6bc9a6] text-white font-bold rounded-lg transition-all shadow-md text-sm">
              Access BizSwap Market <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
            <a href="#mechanics" className="px-8 py-4 border border-gray-200 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-50 transition-all">
              Read Full Prospectus
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-8 max-w-lg mx-auto leading-relaxed">
            <HiOutlineShieldCheck className="inline w-3 h-3 mr-1" />
            BizShares are yield-bearing on-chain instruments issued by the Bitsave Protocol. Participation constitutes agreement to the instrument terms. Past performance does not guarantee future results.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Image src="/bitsavelogo.png" alt="BitSave" width={90} height={28} className="object-contain opacity-60" />
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">BizSwap</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 Bitsave Protocol · BZSHR-2026-Q2 · All rights reserved.</p>
          <div className="flex gap-6 text-xs text-gray-400 font-medium">
            <a href="#mechanics" className="hover:text-gray-700">Instrument Terms</a>
            <a href="#schedule" className="hover:text-gray-700">Payout Schedule</a>
            <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
