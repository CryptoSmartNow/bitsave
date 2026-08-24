'use client';

import React, { useEffect, useState } from 'react';
import { 
  Home01Icon, 
  Wallet01Icon, 
  ArrowRight01Icon, 
  Sun01Icon, 
  Moon02Icon,
  HelpCircleIcon,
  LockIcon,
  ArrowLeft01Icon
} from "hugeicons-react";
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Rubik_Glitch } from 'next/font/google';

const rubikGlitch = Rubik_Glitch({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export default function NotFound() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAF9] dark:bg-[#070B11] p-4 sm:p-6 md:p-10 relative overflow-hidden transition-colors duration-500 font-sans selection:bg-[#81D7B4]/30">
      
      {/* ── Ambient Background Lighting & Wavy Vector Topography ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Top Glow Orb */}
        <div 
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[140px] opacity-75 dark:opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(129,215,180,0.35) 0%, rgba(56,189,248,0.15) 50%, transparent 70%)' }}
        />
        {/* Bottom Right Glow Orb */}
        <div 
          className="absolute -bottom-[20%] right-[-10%] w-[650px] h-[650px] rounded-full blur-[130px] opacity-50 dark:opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(129,215,180,0.25) 0%, transparent 70%)' }}
        />

        {/* ── Organic Random Wavy Curves Background ── */}
        <svg 
          className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="wave-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#81D7B4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#81D7B4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="wave-cyan" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#81D7B4" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Flowing Wave Line 1 */}
          <path
            d="M-100,180 C240,320 480,40 760,190 C1040,340 1260,110 1550,220"
            fill="none"
            stroke="url(#wave-emerald)"
            strokeWidth="2"
            strokeDasharray="6 8"
          />
          {/* Flowing Wave Line 2 */}
          <path
            d="M-50,380 C320,120 590,520 920,290 C1250,60 1380,460 1600,340"
            fill="none"
            stroke="url(#wave-emerald)"
            strokeWidth="2.5"
          />
          {/* Flowing Wave Line 3 */}
          <path
            d="M-80,620 C220,780 540,410 860,670 C1180,930 1360,540 1580,720"
            fill="none"
            stroke="url(#wave-cyan)"
            strokeWidth="1.8"
            strokeDasharray="4 6"
          />
          {/* Flowing Wave Line 4 */}
          <path
            d="M0,820 C360,650 680,880 1020,710 C1360,540 1480,830 1650,760"
            fill="none"
            stroke="url(#wave-emerald)"
            strokeWidth="2"
          />
          {/* Flowing Diagonal Wave 5 */}
          <path
            d="M100,-50 C300,350 650,480 950,260 C1250,40 1400,600 1500,950"
            fill="none"
            stroke="url(#wave-cyan)"
            strokeWidth="1.5"
            strokeDasharray="8 12"
          />
        </svg>

        {/* Subtle Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(rgba(129, 215, 180, 0.9) 1px, transparent 1px)`,
            backgroundSize: '36px 36px'
          }}
        />
      </div>

      {/* ── Top Header Navigation ── */}
      <header className="relative z-20 w-full max-w-5xl mx-auto flex items-center justify-between py-2 sm:py-4">
        <Link href="/" className="flex items-center group">
          <Image
            src="/bitsavelogo.png"
            alt="BitSave logo"
            width={140}
            height={36}
            priority
            className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border border-gray-200/80 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#81D7B4] dark:hover:text-[#81D7B4] hover:border-[#81D7B4]/40 transition-all shadow-sm cursor-pointer"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun01Icon className="w-4 h-4 text-amber-400" /> : <Moon02Icon className="w-4 h-4 text-slate-700" />}
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border border-gray-200/80 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:border-[#81D7B4]/40 transition-all shadow-sm"
          >
            <Home01Icon className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* ── Main 404 Hero (Direct Page Canvas) ── */}
      <main className="relative z-10 w-full max-w-3xl mx-auto my-auto py-10 sm:py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* 1. 404 Numerical Piece with Center Vault & Balanced Glitch Effect */}
          <div className="relative my-4 select-none flex items-center justify-center">
            {/* Ambient Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full bg-[#81D7B4]/20 dark:bg-[#81D7B4]/15 blur-3xl" />
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-5 text-8xl sm:text-9xl md:text-[145px] font-black tracking-tight leading-none">
              {/* First Glitch 4 with clear readability */}
              <span 
                className={`${rubikGlitch.className} text-transparent bg-clip-text bg-gradient-to-b from-gray-950 via-gray-800 to-gray-500 dark:from-white dark:via-slate-100 dark:to-slate-400 drop-shadow-md hover:scale-105 transition-transform duration-300`}
                style={{
                  textShadow: isDark 
                    ? '1.5px 0 #81D7B4, -1.5px 0 rgba(56,189,248,0.7)' 
                    : '1px 0 rgba(16,185,129,0.5), -1px 0 rgba(14,165,233,0.4)',
                  letterSpacing: '0.02em',
                }}
              >
                4
              </span>
              
              {/* Central Vault / Lock */}
              <motion.div 
                whileHover={{ scale: 1.06, rotate: 3 }}
                className="relative mx-1 sm:mx-3 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-white via-white/80 to-[#81D7B4]/20 dark:from-[#151f2e] dark:via-[#0e1624] dark:to-teal-500/10 border border-[#81D7B4]/40 dark:border-[#81D7B4]/30 flex items-center justify-center shadow-xl dark:shadow-2xl dark:shadow-[#81D7B4]/10 group"
              >
                <LockIcon className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 text-emerald-600 dark:text-[#81D7B4] transition-transform duration-300 group-hover:rotate-12" strokeWidth={2} />
              </motion.div>

              {/* Second Glitch 4 with clear readability */}
              <span 
                className={`${rubikGlitch.className} text-transparent bg-clip-text bg-gradient-to-b from-gray-950 via-gray-800 to-gray-500 dark:from-white dark:via-slate-100 dark:to-slate-400 drop-shadow-md hover:scale-105 transition-transform duration-300`}
                style={{
                  textShadow: isDark 
                    ? '-1.5px 0 #81D7B4, 1.5px 0 rgba(56,189,248,0.7)' 
                    : '-1px 0 rgba(16,185,129,0.5), 1px 0 rgba(14,165,233,0.4)',
                  letterSpacing: '0.02em',
                }}
              >
                4
              </span>
            </div>
          </div>

          {/* 3. Headline with Typographic Contrast */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-outfit text-gray-900 dark:text-white tracking-tight leading-tight mt-6 mb-4 max-w-2xl">
            This vault appears to be{' '}
            <span className="font-instrument italic font-normal text-emerald-600 dark:text-[#81D7B4]">
              locked or missing
            </span>
          </h1>

          {/* 4. Descriptive Subtext */}
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed mb-8 font-sans">
            The page you're searching for was never minted, has moved to another block, or is locked in an inactive smart contract.
          </p>

          {/* 5. Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mx-auto mb-10">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex-1 py-4 px-8 rounded-2xl text-sm font-bold transition-all duration-300 bg-[#81D7B4] hover:bg-[#6BC5A0] active:scale-[0.98] text-white shadow-lg shadow-[#81D7B4]/25 hover:shadow-[#81D7B4]/40 inline-flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Wallet01Icon className="w-4 h-4 text-white transition-transform group-hover:-translate-y-0.5" />
              <span>Go to Dashboard</span>
              <ArrowRight01Icon className="w-4 h-4 text-white transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto py-4 px-8 rounded-2xl text-sm font-semibold transition-all duration-200 bg-white/80 dark:bg-white/[0.05] hover:bg-gray-100 dark:hover:bg-white/[0.1] text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-white/10 inline-flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md shadow-sm"
            >
              <ArrowLeft01Icon className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* 6. Telegram Community Assistance Strip */}
          <div className="w-full max-w-lg p-3.5 sm:p-4 rounded-2xl bg-white/60 dark:bg-white/[0.02] backdrop-blur-md border border-gray-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-400 font-sans shadow-sm">
            <span className="flex items-center gap-2 text-center sm:text-left">
              <HelpCircleIcon className="w-4 h-4 text-emerald-600 dark:text-[#81D7B4] shrink-0" />
              <span>Need help or looking for a lost vault?</span>
            </span>
            <a
              href="https://t.me/bitsaveprotocol/2"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-700 dark:text-[#81D7B4] hover:underline inline-flex items-center gap-1.5 shrink-0 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 transition-all hover:bg-emerald-500/15"
            >
              <span>Ask on Telegram</span>
              <ArrowRight01Icon className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto py-4 text-center text-xs text-gray-400 dark:text-gray-500 font-sans">
        <p>© {new Date().getFullYear()} BitSave Protocol. Multi-chain decentralized locked savings.</p>
      </footer>
    </div>
  );
}