'use client';

import React, { useEffect, useState } from 'react';
import { 
  Home01Icon, 
  Wallet01Icon, 
  RefreshIcon, 
  AlertCircleIcon, 
  Sun01Icon, 
  Moon02Icon,
  Copy01Icon,
  Tick01Icon,
  HelpCircleIcon,
  ArrowRight01Icon,
  Shield01Icon,
  ArrowLeft01Icon
} from "hugeicons-react";
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Rubik_Glitch } from 'next/font/google';

const rubikGlitch = Rubik_Glitch({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.error('BitSave Application Error:', error);
  }, [error]);

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  const handleCopyError = () => {
    const errorReport = [
      `=== BitSave Error Diagnostic Report ===`,
      `Time: ${new Date().toISOString()}`,
      `URL: ${typeof window !== 'undefined' ? window.location.href : 'SSR'}`,
      `Error Name: ${error?.name || 'Error'}`,
      `Message: ${error?.message || 'Unknown exception'}`,
      `Digest: ${error?.digest || 'None (Client-side error)'}`,
      `User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}`,
      error?.stack ? `\nStack Trace:\n${error.stack}` : ''
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(errorReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      reset();
      setIsRetrying(false);
    }, 450);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAF9] dark:bg-[#070B11] p-4 sm:p-6 md:p-10 relative overflow-hidden transition-colors duration-500 font-sans selection:bg-rose-500/20">
      
      {/* ── Ambient Background Lighting & Wavy Vector Topography ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Top Rose/Red Glow Orb */}
        <div 
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[140px] opacity-65 dark:opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.3) 0%, rgba(129,215,180,0.15) 50%, transparent 70%)' }}
        />
        {/* Bottom Right Emerald Glow Orb */}
        <div 
          className="absolute -bottom-[20%] right-[-10%] w-[650px] h-[650px] rounded-full blur-[130px] opacity-40 dark:opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(129,215,180,0.2) 0%, transparent 70%)' }}
        />

        {/* ── Organic Random Wavy Curves Background ── */}
        <svg 
          className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="wave-rose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#81D7B4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="wave-amber" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FB7185" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#81D7B4" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Flowing Wave Line 1 */}
          <path
            d="M-100,160 C260,340 460,20 740,180 C1020,340 1280,90 1560,240"
            fill="none"
            stroke="url(#wave-rose)"
            strokeWidth="2"
            strokeDasharray="6 8"
          />
          {/* Flowing Wave Line 2 */}
          <path
            d="M-60,400 C300,140 610,540 940,270 C1270,40 1360,480 1620,320"
            fill="none"
            stroke="url(#wave-rose)"
            strokeWidth="2.5"
          />
          {/* Flowing Wave Line 3 */}
          <path
            d="M-90,640 C200,800 520,430 840,690 C1160,950 1380,520 1600,740"
            fill="none"
            stroke="url(#wave-amber)"
            strokeWidth="1.8"
            strokeDasharray="4 6"
          />
          {/* Flowing Wave Line 4 */}
          <path
            d="M0,840 C340,670 660,900 1000,730 C1340,560 1460,850 1680,780"
            fill="none"
            stroke="url(#wave-rose)"
            strokeWidth="2"
          />
          {/* Flowing Diagonal Wave 5 */}
          <path
            d="M80,-60 C280,330 630,460 930,240 C1230,20 1380,580 1480,960"
            fill="none"
            stroke="url(#wave-amber)"
            strokeWidth="1.5"
            strokeDasharray="8 12"
          />
        </svg>

        {/* Subtle Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(rgba(244, 63, 94, 0.7) 1px, transparent 1px)`,
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

      {/* ── Main Error Hero (Direct Page Canvas) ── */}
      <main className="relative z-10 w-full max-w-3xl mx-auto my-auto py-10 sm:py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* 1. 500 Numerical Piece with Center Shield & Balanced Glitch Effect */}
          <div className="relative my-4 select-none flex items-center justify-center">
            {/* Ambient Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full bg-rose-500/15 dark:bg-rose-500/10 blur-3xl" />
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-5 text-8xl sm:text-9xl md:text-[145px] font-black tracking-tight leading-none">
              {/* Glitch 5 with clear readability */}
              <span 
                className={`${rubikGlitch.className} text-transparent bg-clip-text bg-gradient-to-b from-gray-950 via-gray-800 to-gray-500 dark:from-white dark:via-slate-100 dark:to-slate-400 drop-shadow-md hover:scale-105 transition-transform duration-300`}
                style={{
                  textShadow: isDark 
                    ? '1.5px 0 #F43F5E, -1.5px 0 rgba(129,215,180,0.7)' 
                    : '1px 0 rgba(244,63,94,0.5), -1px 0 rgba(16,185,129,0.4)',
                  letterSpacing: '0.02em',
                }}
              >
                5
              </span>
              
              {/* Central Glowing Shield / Zero Badge */}
              <motion.div 
                whileHover={{ scale: 1.06, rotate: -3 }}
                className="relative mx-1 sm:mx-3 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-white via-white/80 to-rose-500/20 dark:from-[#1e131d] dark:via-[#160f1b] dark:to-rose-500/10 border border-rose-500/40 dark:border-rose-500/30 flex items-center justify-center shadow-xl dark:shadow-2xl dark:shadow-rose-500/10 group"
              >
                <Shield01Icon className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 text-rose-500 dark:text-rose-400 transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
              </motion.div>

              {/* Glitch 0 with clear readability */}
              <span 
                className={`${rubikGlitch.className} text-transparent bg-clip-text bg-gradient-to-b from-gray-950 via-gray-800 to-gray-500 dark:from-white dark:via-slate-100 dark:to-slate-400 drop-shadow-md hover:scale-105 transition-transform duration-300`}
                style={{
                  textShadow: isDark 
                    ? '-1.5px 0 #F43F5E, 1.5px 0 rgba(129,215,180,0.7)' 
                    : '-1px 0 rgba(244,63,94,0.5), 1px 0 rgba(16,185,129,0.4)',
                  letterSpacing: '0.02em',
                }}
              >
                0
              </span>
            </div>
          </div>

          {/* 2. Headline with Typographic Contrast */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-outfit text-gray-900 dark:text-white tracking-tight leading-tight mt-6 mb-4 max-w-2xl">
            Something went{' '}
            <span className="font-instrument italic font-normal text-rose-500 dark:text-rose-400">
              unexpectedly wrong
            </span>
          </h1>

          {/* 3. Descriptive Subtext */}
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed mb-8 font-sans">
            Our node encountered an execution glitch. Your onchain vaults and balances are completely secure and immutable.
          </p>

          {/* 4. Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mx-auto mb-8">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full sm:w-auto flex-1 py-4 px-8 rounded-2xl text-sm font-bold transition-all duration-300 bg-[#81D7B4] hover:bg-[#6BC5A0] active:scale-[0.98] text-white shadow-lg shadow-[#81D7B4]/25 hover:shadow-[#81D7B4]/40 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 group"
            >
              <RefreshIcon className={`w-4 h-4 text-white transition-transform ${isRetrying ? 'animate-spin' : 'group-hover:rotate-180 duration-500'}`} />
              <span>{isRetrying ? 'Reconnecting...' : 'Try Again'}</span>
            </button>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto py-4 px-8 rounded-2xl text-sm font-semibold transition-all duration-200 bg-white/80 dark:bg-white/[0.05] hover:bg-gray-100 dark:hover:bg-white/[0.1] text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-white/10 inline-flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md shadow-sm"
            >
              <Wallet01Icon className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </Link>
          </div>

          {/* 5. Technical Diagnostic Toggle Drawer */}
          <div className="w-full max-w-lg mb-8">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline underline-offset-4 cursor-pointer transition-colors"
            >
              {showDetails ? 'Hide Technical Diagnostics ▲' : 'View Diagnostic Info ▼'}
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mt-3"
                >
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-black/60 backdrop-blur-md border border-gray-200/80 dark:border-white/10 text-left text-xs font-mono text-gray-700 dark:text-gray-300 relative shadow-sm">
                    <button
                      onClick={handleCopyError}
                      className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 transition-all flex items-center gap-1.5 text-[11px] font-sans font-semibold cursor-pointer"
                    >
                      {copied ? <Tick01Icon className="w-3.5 h-3.5 text-emerald-500" /> : <Copy01Icon className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Report'}</span>
                    </button>
                    
                    <div className="space-y-2 pr-20">
                      <div>
                        <p className="font-bold text-rose-500 flex items-center gap-1.5 font-sans text-xs">
                          <AlertCircleIcon className="w-3.5 h-3.5" />
                          <span>{error?.name || 'Application Error'}</span>
                        </p>
                        <p className="break-all text-gray-800 dark:text-gray-200 font-mono text-[11px] mt-1 leading-relaxed">
                          {error?.message || 'Unexpected exception occurred during render or lifecycle.'}
                        </p>
                      </div>

                      {error?.digest && (
                        <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                          <p className="text-[10px] text-gray-400 font-sans font-bold">Server Log Digest ID:</p>
                          <p className="text-[11px] text-emerald-600 dark:text-[#81D7B4] font-mono select-all">
                            {error.digest}
                          </p>
                          <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                            (Search this digest hash in Vercel / server logs to locate the exact stack trace)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 7. Telegram Support Bar */}
          <div className="w-full max-w-lg p-3.5 sm:p-4 rounded-2xl bg-white/60 dark:bg-white/[0.02] backdrop-blur-md border border-gray-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-400 font-sans shadow-sm">
            <span className="flex items-center gap-2 text-center sm:text-left">
              <HelpCircleIcon className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
              <span>Need help resolving this issue?</span>
            </span>
            <a
              href="https://t.me/bitsaveprotocol/2"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1.5 shrink-0 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 transition-all hover:bg-rose-500/15"
            >
              <span>Chat with Devs</span>
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