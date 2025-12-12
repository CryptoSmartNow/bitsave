'use client';

import Image from 'next/image';
import { useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '@/utils/networkLogos';
import Link from 'next/link';
import { Lock, Gift, Globe, ArrowRight, Play, TrendingUp, Wallet } from 'lucide-react';

// Helper function
const ensureImageUrl = (url: string | undefined): string => {
  if (!url) return '/default-network.png'
  if (url.startsWith('/')) return url
  if (url.startsWith('//')) return `https:${url}`
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `/${url}`
  }
  return url
}

const Hero = memo(() => {
  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  useEffect(() => {
    fetchMultipleNetworkLogos(['base', 'celo', 'lisk'])
      .then(setNetworkLogos)
      .catch(() => { });
  }, []);

  // Auto-rotate the hero cards
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const chains = [
    {
      name: 'Base',
      logo: ensureImageUrl(networkLogos['base']?.logoUrl || networkLogos['base']?.fallbackUrl || '/base.svg'),
      description: 'Coinbase L2',
      tokens: ['USDC', 'USDGLO'],
      accentColor: '#0052FF',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Celo',
      logo: ensureImageUrl(networkLogos['celo']?.logoUrl || networkLogos['celo']?.fallbackUrl || '/celo.png'),
      description: 'Mobile-first',
      tokens: ['USDGLO', 'cUSD', 'USDC'],
      accentColor: '#FCFF52',
      gradient: 'from-yellow-400 to-yellow-500'
    },
    {
      name: 'Lisk',
      logo: ensureImageUrl(networkLogos['lisk']?.logoUrl || networkLogos['lisk']?.fallbackUrl || '/lisk-logo.png'),
      description: 'Ethereum L2',
      tokens: ['USDC'],
      accentColor: '#0842D4',
      gradient: 'from-indigo-500 to-indigo-600'
    }
  ];

  const countries = [
    { name: 'United States', flag: '🇺🇸' },
    { name: 'United Kingdom', flag: '🇬🇧' },
    { name: 'Germany', flag: '🇩🇪' },
    { name: 'France', flag: '🇫🇷' },
    { name: 'Japan', flag: '🇯🇵' },
    { name: 'Canada', flag: '🇨🇦' },
    { name: 'Australia', flag: '🇦🇺' },
    { name: 'Netherlands', flag: '🇳🇱' },
    { name: 'Singapore', flag: '🇸🇬' },
    { name: 'South Korea', flag: '🇰🇷' },
    { name: 'Brazil', flag: '🇧🇷' },
    { name: 'India', flag: '🇮🇳' },
    { name: 'Nigeria', flag: '🇳🇬' },
    { name: 'Kenya', flag: '🇰🇪' },
    { name: 'South Africa', flag: '🇿🇦' },
  ];

  return (
    <div className="relative pt-32 pb-12 sm:pt-40 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 max-w-[90rem] mx-auto">

      {/* Main Distinct Hero Container */}
      <div className="relative bg-white rounded-[2.5rem] sm:rounded-[3.5rem] border border-gray-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] overflow-hidden">

        {/* Subtle decorative background - very light/neat */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-gray-50/80 to-transparent" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#81D7B4]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-gray-50/50 to-transparent" />

          {/* Grid pattern overlay - extremely subtle */}
          <div className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: 'radial-gradient(#444 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
        </div>

        {/* Content Grid */}
        <div className="relative grid lg:grid-cols-2 gap-12 lg:gap-20 p-8 sm:p-12 lg:p-20 items-center z-10">

          {/* LEFT: Typography & CTAs */}
          <div className="text-center lg:text-left pt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 mb-8 mx-auto lg:mx-0"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#81D7B4] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#81D7B4]"></span>
              </span>
              <span className="text-sm font-semibold text-gray-600 tracking-wide">Decentralized Savings Protocol</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-8"
            >
              Give Tomorrow a<br />
              <span className="text-[#81D7B4]">Soft Landing</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-500 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0"
            >
              Your <span className="text-gray-900 font-medium">Onchain Savings Nest</span>.
              The SaveFi Protocol helping income earners save securely, earn rewards, and build wealth across
              <span className="inline-flex -bottom-1 relative mx-2">
                <img src="/base.svg" alt="" className="w-5 h-5 mx-0.5 opacity-60 grayscale hover:grayscale-0 transition-all" />
                <img src="/celo.png" alt="" className="w-5 h-5 mx-0.5 opacity-60 grayscale hover:grayscale-0 transition-all" />
                <img src="/lisk-logo.png" alt="" className="w-5 h-5 mx-0.5 opacity-60 grayscale hover:grayscale-0 transition-all" />
              </span>
              networks.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center"
            >
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-[#81D7B4] text-white font-semibold text-lg rounded-2xl hover:bg-[#6BC5A0] hover:shadow-lg hover:shadow-[#81D7B4]/30 transition-all hover:-translate-y-0.5 active:translate-y-0 text-center flex items-center justify-center gap-2"
              >
                Start Saving Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="https://www.youtube.com/shorts/CWRQ7rgtHzU"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-semibold text-lg rounded-2xl border border-gray-200 hover:bg-gray-50 hover:border-[#81D7B4] hover:text-[#81D7B4] transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                Watch Demo
              </a>
            </motion.div>

            {/* Feature Pills - Clean Row with Icons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex flex-wrap justify-center lg:justify-start gap-3"
            >
              {[
                { icon: <Lock className="w-4 h-4" />, text: 'Locked Savings' },
                { icon: <Gift className="w-4 h-4" />, text: 'Earn Rewards' },
                { icon: <Globe className="w-4 h-4" />, text: 'Multi-Chain' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium text-gray-600 hover:border-[#81D7B4]/30 hover:bg-[#81D7B4]/5 transition-colors cursor-default">
                  <span className="text-[#81D7B4]">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: Dynamic Fintech Visual */}
          <div className="relative h-[480px] lg:h-[600px] w-full flex items-center justify-center lg:justify-end perspective-1000">

            {/* Abstract Background Blotches behind cards */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-gray-100/50 via-white to-gray-100/50 rounded-full blur-3xl -z-10" />

            {/* Main Multi-Chain Card Stack */}
            <div className="relative w-full max-w-[400px] aspect-[3/4] md:max-w-[420px]">
              <AnimatePresence mode="wait">
                {chains.map((chain, index) => {
                  const isActive = index === activeCardIndex;
                  if (!isActive) return null;

                  return (
                    <motion.div
                      key={chain.name}
                      initial={{ opacity: 0, scale: 0.95, y: 20, rotateX: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                      exit={{ opacity: 0, scale: 1.05, y: -20, rotateX: -5 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="absolute inset-0 z-20"
                    >
                      <div className="w-full h-full bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8 flex flex-col overflow-hidden relative">
                        {/* Card Gradient Background - Subtle */}
                        <div className={`absolute top-0 left-0 w-full h-48 bg-gradient-to-b ${chain.gradient} opacity-[0.03]`} />

                        {/* Top: Network Header */}
                        <div className="relative flex justify-between items-start shrink-0">
                          <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Network</p>
                            <h3 className="text-3xl font-bold text-gray-900">{chain.name}</h3>
                          </div>
                          <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-lg flex items-center justify-center p-3">
                            <Image src={chain.logo} alt={chain.name} width={40} height={40} className="object-contain" />
                          </div>
                        </div>

                        {/* Middle: Stats Visualization */}
                        <div className="relative flex-1 flex items-center justify-center my-4 sm:my-6">
                          <div className="w-full p-5 bg-gray-50 rounded-3xl border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-sm font-medium text-gray-500">Available Assets</span>
                              <span className="text-xs font-bold px-2 py-1 bg-white rounded-lg border border-gray-200 text-gray-600">
                                {chain.tokens.length} Tokens
                              </span>
                            </div>
                            <div className="space-y-2.5">
                              {chain.tokens.slice(0, 3).map((token) => (
                                <div key={token} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-gray-200 shadow-sm">
                                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                    {token[0]}
                                  </div>
                                  <span className="font-semibold text-gray-800">{token}</span>
                                  <div className="ml-auto w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#81D7B4] w-2/3 rounded-full" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Bottom: Action */}
                        <div className="relative mt-auto shrink-0 pb-2">
                          <button
                            className="w-full py-4 rounded-2xl text-white font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all bg-[#81D7B4]"
                          >
                            <span>Start Saving on {chain.name}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <p className="text-center text-xs text-gray-400 mt-4 font-medium px-2">
                            {chain.description} • Secure & Decentralized
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Back Card Visuals (Context) */}
              <div className="absolute top-4 left-4 w-full h-full bg-white rounded-[2.5rem] border border-gray-100 shadow-xl opacity-40 scale-95 -z-10" />
              <div className="absolute top-8 left-8 w-full h-full bg-white rounded-[2.5rem] border border-gray-100 shadow-lg opacity-20 scale-90 -z-20" />

              {/* Floating Elements - "Fintech Feel" */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-12 top-20 bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-50 hidden sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4]">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Total Savings</p>
                    <p className="text-lg font-bold text-gray-900">$12,450.00</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -left-12 bottom-32 bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-50 hidden sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#81D7B4]/20 flex items-center justify-center text-[#81D7B4]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">$BTS Earned</p>
                    <p className="text-lg font-bold text-gray-900">500</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Footer: Trusted Conveyor */}
        <div className="border-t border-gray-100 bg-gray-50/30 backdrop-blur-sm relative py-8 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-4">
            <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest">Save From Anywhere in the World</p>
          </div>

          <div className="relative w-full overflow-hidden mask-fade-sides">
            <div className="flex animate-scroll-left space-x-8 w-max">
              {[...countries, ...countries, ...countries].map((country, index) => (
                <div
                  key={`${country.name}-${index}`}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors select-none"
                >
                  <span className="text-xl grayscale hover:grayscale-0 transition-all">{country.flag}</span>
                  <span className="text-sm font-bold">{country.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subtle Accents at edges */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-[3px] border-l-[3px] border-[#81D7B4]/20 rounded-tl-[2.5rem] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-[3px] border-r-[3px] border-[#81D7B4]/20 rounded-br-[2.5rem] pointer-events-none" />
      </div>

      <style jsx>{`
        .mask-fade-sides {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-scroll-left {
          animation: scroll-left 60s linear infinite;
        }
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
        // Force hardware acceleration for smoother animations
        .perspective-1000 {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
});

Hero.displayName = 'Hero';

export default Hero;