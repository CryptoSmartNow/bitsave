'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useReferrals } from '@/lib/useReferrals';
import { motion } from 'framer-motion';
import Link from 'next/link';

function useDeviceTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isDark;
}

export default function ReferralPage() {
  const params = useParams();
  const { address } = useAccount();
  const { trackReferralVisit, markReferralConversion } = useReferrals();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isTracked, setIsTracked] = useState(false);
  
  const isDark = useDeviceTheme();

  useEffect(() => {
    if (params.code && typeof params.code === 'string') {
      setReferralCode(params.code);
    }
  }, [params.code]);

  useEffect(() => {
    if (referralCode && !isTracked) {
      trackReferralVisit(referralCode);
      setIsTracked(true);
      const clean = referralCode.trim().toUpperCase();
      localStorage.setItem('pendingReferralCode', clean);
      localStorage.setItem('bizswapPendingReferralCode', clean);
      localStorage.setItem('bitsave_referral_code', clean);
    }
  }, [referralCode, isTracked, trackReferralVisit]);

  useEffect(() => {
    if (address && referralCode) {
      markReferralConversion(referralCode);
    }
  }, [address, referralCode, markReferralConversion]);

  return (
    <div className={`min-h-screen transition-colors duration-700 relative overflow-hidden ${isDark ? 'bg-[#0f172a] text-white' : 'bg-[#f8fafc] text-slate-900'} font-outfit`}>
      
      {/* Grainy Noise Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay z-[1]" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} 
      />

      {/* Background Tints */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[140px] transition-colors duration-700 ${isDark ? 'bg-[#81D7B4]/20' : 'bg-[#81D7B4]/30'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[140px] transition-colors duration-700 ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/20'}`} />
      </div>

      {/* Neobrutalist Network Blobs in Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        
        {/* Base Neobrutalist Blob (Top Left) */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} 
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-[10%] left-[5%] md:left-[15%] opacity-30 dark:opacity-20"
        >
          <div className="relative">
            <div className="absolute top-2 left-2 w-28 h-28 bg-black rounded-full" />
            <div className="w-28 h-28 bg-white border-4 border-black rounded-full flex items-center justify-center relative z-10 p-4">
              <img src="/base-logo.png" alt="Base" className="w-full h-full object-contain" />
            </div>
          </div>
        </motion.div>

        {/* Celo Neobrutalist Blob (Top Right) */}
        <motion.div 
          animate={{ y: [0, 25, 0], rotate: [0, -8, 0] }} 
          transition={{ repeat: Infinity, duration: 11, ease: "easeInOut", delay: 1.5 }}
          className="absolute top-[15%] right-[5%] md:right-[15%] opacity-30 dark:opacity-20 hidden sm:block"
        >
          <div className="relative">
            <div className="absolute top-2 left-2 w-24 h-24 bg-black rounded-[1.5rem]" />
            <div className="w-24 h-24 bg-white border-4 border-black rounded-[1.5rem] flex items-center justify-center relative z-10 p-3">
              <img src="/celo.png" alt="Celo" className="w-full h-full object-contain" />
            </div>
          </div>
        </motion.div>

        {/* Avalanche Neobrutalist Blob (Bottom Left) */}
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 9, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-[15%] left-[5%] md:left-[15%] opacity-30 dark:opacity-20 hidden sm:block"
        >
          <div className="relative">
            <div className="absolute top-2 left-2 w-20 h-20 bg-black rounded-3xl transform -rotate-12" />
            <div className="w-20 h-20 bg-white border-4 border-black rounded-3xl transform -rotate-12 flex items-center justify-center relative z-10 p-3">
              <img src="/avalanche-logo.svg" alt="Avalanche" className="w-full h-full object-contain" />
            </div>
          </div>
        </motion.div>

        {/* Lisk Neobrutalist Blob (Bottom Center) */}
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }} 
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[5%] left-[45%] md:left-[50%] opacity-30 dark:opacity-20 hidden md:block"
        >
          <div className="relative">
            <div className="absolute top-2 left-2 w-20 h-20 bg-black rounded-full" />
            <div className="w-20 h-20 bg-white border-4 border-black rounded-full flex items-center justify-center relative z-10 p-3">
              <img src="/lisk.png" alt="Lisk" className="w-full h-full object-contain" />
            </div>
          </div>
        </motion.div>

        {/* BSC Neobrutalist Blob (Bottom Right) */}
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }} 
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[5%] md:right-[15%] opacity-30 dark:opacity-20"
        >
          <div className="relative">
            <div className="absolute top-2 left-2 w-28 h-28 bg-black rounded-[2rem] transform rotate-12" />
            <div className="w-28 h-28 bg-white border-4 border-black rounded-[2rem] transform rotate-12 flex items-center justify-center shadow-inner relative z-10 overflow-hidden p-4">
              <img src="/bsc.png" alt="Binance Smart Chain" className="w-full h-full object-contain" />
            </div>
          </div>
        </motion.div>

      </div>

      <div className="container mx-auto px-6 py-20 relative z-20 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto text-center"
        >
          {/* Header */}
          <div className="mb-12 relative z-10 w-full min-h-[50vh] flex flex-col items-center justify-center pt-10">
            
            {/* Scattered Feature Pills (Professional Neobrutalist Style) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <motion.div 
                animate={{ y: [0, -8, 0], rotate: [-6, -4, -6] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute -top-[10%] md:top-[0%] left-[0%] md:left-[10%] px-6 py-2.5 rounded-full border-[3px] border-black bg-[#81D7B4] shadow-[4px_4px_0_0_#000] flex items-center justify-center"
              >
                <span className="font-bold text-black text-sm md:text-base tracking-wide">Earn Rewards</span>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0], rotate: [6, 8, 6] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                className="absolute top-[15%] md:top-[10%] right-[-5%] md:right-[5%] px-6 py-2.5 rounded-full border-[3px] border-black bg-[#81D7B4] shadow-[4px_4px_0_0_#000] flex items-center justify-center"
              >
                <span className="font-bold text-black text-sm md:text-base tracking-wide">Multi-Chain</span>
              </motion.div>

              <motion.div 
                animate={{ y: [0, -10, 0], rotate: [-3, -1, -3] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[-10%] md:bottom-[-5%] left-[10%] md:left-[25%] px-6 py-2.5 rounded-full border-[3px] border-black bg-[#81D7B4] shadow-[4px_4px_0_0_#000] flex items-center justify-center"
              >
                <span className="font-bold text-black text-sm md:text-base tracking-wide">Goal-Based</span>
              </motion.div>
            </div>

            <div className="relative z-10 inline-block pointer-events-none">
              <h1 className="font-instrument text-6xl md:text-[5.5rem] font-black mb-6 tracking-tight leading-[1.1]">
                Welcome to <br className="md:hidden" />
                <span className="text-[#81D7B4]">
                  BitSave
                </span>
              </h1>
            </div>

            <p className={`relative z-10 text-xl md:text-3xl mb-6 transition-colors duration-700 max-w-2xl mx-auto font-bold pointer-events-none ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              The multi-chain protocol for stablecoin savings.
            </p>
            <p className={`relative z-10 text-lg md:text-xl transition-colors duration-700 max-w-2xl mx-auto font-medium pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Earn rewards, swap cross-chain seamlessly, and reach your financial goals.
            </p>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 relative z-20"
          >
            <Link
              href={referralCode?.startsWith('BIZ') ? `/bizswap/buy?ref=${referralCode}` : "/dashboard"}
              className="w-full sm:w-auto inline-flex items-center justify-center px-12 py-5 bg-[#81D7B4] text-slate-900 font-black text-xl rounded-2xl hover:bg-[#6ec2a0] hover:scale-[1.02] active:scale-95 transition-all duration-300 border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a]"
            >
              {referralCode?.startsWith('BIZ') ? 'Explore BizSwap Yields' : 'Get Started Now'}
              <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <Link
              href="/#features"
              className={`w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 font-bold text-xl rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-600 text-slate-200 hover:bg-slate-700' 
                  : 'bg-white/80 border-slate-300 text-slate-800 hover:bg-slate-50'
              }`}
            >
              Learn More
            </Link>
          </motion.div>

          {/* Social Media Links */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className={`max-w-2xl mx-auto rounded-[2rem] p-8 transition-all duration-700 backdrop-blur-2xl border-2 shadow-2xl ${
              isDark 
                ? 'bg-slate-900/50 border-slate-700' 
                : 'bg-white/60 border-slate-200'
            }`}
          >
            <h3 className={`font-instrument text-2xl font-bold mb-6 text-center transition-colors duration-700 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
              Join Our Community
            </h3>
            
            <div className="flex justify-center gap-8">
              {/* Telegram */}
              <a
                href="https://t.me/+YimKRR7wAkVmZGRk"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-16 h-16 flex items-center justify-center rounded-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] border-2 ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:bg-blue-600 hover:border-blue-700 text-white' : 'bg-white border-slate-300 hover:bg-blue-600 hover:border-blue-700 text-blue-500 hover:text-white'
                }`}
                aria-label="Join our Telegram"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com/bitsaveprotocol"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-16 h-16 flex items-center justify-center rounded-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] border-2 ${
                  isDark ? 'bg-slate-800 border-slate-600 hover:bg-black hover:border-black text-white' : 'bg-white border-slate-300 hover:bg-black hover:border-black text-slate-800 hover:text-white'
                }`}
                aria-label="Follow us on X"
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </motion.div>
          
        </motion.div>
      </div>
    </div>
  );
}