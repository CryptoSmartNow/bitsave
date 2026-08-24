'use client';

import React, { useEffect, useState } from 'react';
import { 
  Home01Icon, 
  Wallet01Icon, 
  CheckmarkCircle01Icon, 
  ArrowRight01Icon, 
  LockIcon,
  SparklesIcon,
  Sun01Icon,
  Moon02Icon
} from "hugeicons-react";
import Link from 'next/link';
import Image from 'next/image';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

const SUPPORTED_CHAINS = [
  { name: 'Base', logo: '/base-logo.svg' },
  { name: 'Celo', logo: '/celo.png' },
  { name: 'Lisk', logo: '/lisk-logo.png' },
  { name: 'BSC', logo: '/bsc.png' },
  { name: 'Avalanche', logo: '/avalanche-logo.svg' },
];

export default function GoodbyePage() {
  const { login, authenticated, ready } = usePrivy();
  const { isConnected } = useAccount();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If user reconnects, automatically redirect to dashboard
  useEffect(() => {
    if (ready && (authenticated || isConnected)) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, isConnected, router]);

  const handleConnectAgain = () => {
    login();
  };

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAF9] dark:bg-[#070B11] p-4 sm:p-8 relative overflow-hidden transition-colors duration-500 font-sans selection:bg-[#81D7B4]/30">
      
      {/* ── Background Glow & Grid Aesthetics ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Glowing radial gradient orbs */}
        <div 
          className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full blur-[140px] opacity-25 dark:opacity-20 transition-all duration-700" 
          style={{ background: 'radial-gradient(circle, #81D7B4 0%, rgba(129,215,180,0.1) 70%, transparent 100%)' }} 
        />
        <div 
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full blur-[140px] opacity-20 dark:opacity-15 transition-all duration-700" 
          style={{ background: 'radial-gradient(circle, #38BDF8 0%, rgba(129,215,180,0.1) 70%, transparent 100%)' }} 
        />

        {/* Subtle grid mesh overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(rgba(129, 215, 180, 0.8) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* ── Top Bar / Header ── */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between relative z-20 py-2">
        <Link href="/" className="flex items-center group">
          <Image
            src="/bitsavelogo.png"
            alt="BitSave logo"
            width={140}
            height={40}
            priority
            className="h-8 w-auto sm:h-9 transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Theme toggle & Home shortcut */}
        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="w-10 h-10 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#81D7B4] dark:hover:text-[#81D7B4] hover:border-[#81D7B4]/40 transition-all shadow-sm cursor-pointer"
              title="Toggle Theme"
            >
              {isDark ? <Sun01Icon className="w-4 h-4" /> : <Moon02Icon className="w-4 h-4" />}
            </button>
          )}

          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-[#81D7B4] dark:hover:text-[#81D7B4] hover:border-[#81D7B4]/40 transition-all shadow-sm"
          >
            <Home01Icon className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* ── Main Hero Card ── */}
      <main className="w-full flex items-center justify-center py-6 sm:py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[500px] bg-white/85 dark:bg-[#101725]/85 backdrop-blur-2xl rounded-[2.75rem] border border-white/80 dark:border-white/10 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_80px_-16px_rgba(0,0,0,0.5)] p-7 sm:p-10 relative overflow-hidden text-center"
        >
          {/* Subtle card top glow highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#81D7B4] to-transparent opacity-80" />

          {/* Central Logo & Disconnect Status Icon */}
          <div className="relative mx-auto mb-6 flex items-center justify-center">
            {/* Animated outer aura pulse */}
            <div className="absolute inset-0 rounded-full bg-[#81D7B4]/20 animate-ping opacity-25" style={{ animationDuration: '3s' }} />
            
            <div className="px-6 py-3.5 rounded-[1.75rem] bg-gradient-to-b from-white to-[#F0FDF8] dark:from-[#182436] dark:to-[#0F1724] border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-lg relative z-10">
              <Image 
                src="/bitsavelogo.png" 
                alt="BitSave Logo" 
                width={140} 
                height={40} 
                className="h-9 w-auto object-contain" 
                priority 
              />
            </div>

            {/* Checkmark indicator badge */}
            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#81D7B4] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(129,215,180,0.5)] border-2 border-white dark:border-[#101725] z-20">
              <CheckmarkCircle01Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
          </div>

          {/* Security Status Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-[#81D7B4] text-[11px] font-bold tracking-wide uppercase mb-3">
            <LockIcon className="w-3.5 h-3.5 text-[#81D7B4]" />
            <span>Session Safely Ended</span>
          </div>

          {/* Headline with Instrument Serif typography */}
          <h1 className="text-3xl sm:text-4xl text-gray-900 dark:text-white font-instrument tracking-tight leading-tight mb-2.5">
            You are now <span className="italic text-[#81D7B4]">Disconnected</span>
          </h1>

          <p className="text-[14px] sm:text-[14.5px] text-gray-500 dark:text-gray-400 font-normal leading-relaxed mb-7 max-w-sm mx-auto">
            Your wallet session has been cleared. Your smart contract vaults remain locked and earning yield safely on-chain.
          </p>

          {/* ── Multi-Chain Connectivity Strip ── */}
          <div className="mb-7 p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Supported EVM Chains</span>
              <span className="text-[10.5px] font-semibold text-[#81D7B4] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4]"></span>
                Unified Connect
              </span>
            </div>
            <div className="flex items-center justify-between gap-1.5">
              {SUPPORTED_CHAINS.map(chain => (
                <div 
                  key={chain.name} 
                  className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-white dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/5 shadow-xs hover:border-[#81D7B4]/40 transition-colors"
                >
                  <Image src={chain.logo} alt={chain.name} width={18} height={18} className="w-4 h-4 object-contain" />
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate w-full">{chain.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Call To Action Buttons ── */}
          <div className="space-y-3">
            <button
              onClick={handleConnectAgain}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-gradient-to-r from-[#81D7B4] via-[#74CEAB] to-[#5DBF99] hover:from-[#74CEAB] hover:to-[#50B28C] text-white font-black text-[15px] rounded-2xl shadow-[0_10px_25px_-5px_rgba(129,215,180,0.4)] hover:shadow-[0_14px_30px_-5px_rgba(129,215,180,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group"
            >
              <Wallet01Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
              <span>Connect Wallet Again</span>
              <ArrowRight01Icon className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform text-white" strokeWidth={2.5} />
            </button>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gray-100/90 dark:bg-white/[0.06] hover:bg-gray-200/90 dark:hover:bg-white/[0.1] text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-white/10 rounded-2xl font-bold text-sm transition-all"
            >
              <Home01Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* ── Footer / Trust Badges ── */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-2 text-xs text-gray-400 dark:text-gray-500 relative z-20 py-2">
        <p>© {new Date().getFullYear()} BitSave Protocol. Non-custodial crypto savings.</p>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-[#81D7B4] transition-colors">Home</Link>
          <span>•</span>
          <Link href="/dashboard" className="hover:text-[#81D7B4] transition-colors">Dashboard</Link>
          <span>•</span>
          <a href="https://x.com/bitsave_" target="_blank" rel="noopener noreferrer" className="hover:text-[#81D7B4] transition-colors">
            Twitter / X
          </a>
        </div>
      </footer>
    </div>
  );
}
