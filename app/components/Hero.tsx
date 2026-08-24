'use client';

import { LockIcon, GiftIcon, GlobeIcon, ArrowRight01Icon, PlayIcon, Wallet01Icon, Shield01Icon, ArrowUpRight01Icon, FlashIcon, Link01Icon } from "hugeicons-react";
import Image from 'next/image';
import { useEffect, useState, memo, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '@/utils/networkLogos';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePrivy, useLogin } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';

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
  const router = useRouter();
  const { authenticated, ready } = usePrivy();
  const { isConnected } = useAccount();
  const { login: privyLogin } = useLogin({
    onComplete: () => {
      router.push('/dashboard');
    },
  });
  const { scrollYProgress } = useScroll();

  const contentOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.9]);
  const contentScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.98]);

  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const handleStartSaving = () => {
    if (ready && (authenticated || isConnected)) {
      router.push('/dashboard');
    } else {
      privyLogin();
    }
  };

  useEffect(() => {
    fetchMultipleNetworkLogos(['base', 'celo', 'lisk', 'bsc'])
      .then(setNetworkLogos)
      .catch(() => { });
  }, []);

  // Auto-rotate the hero cards
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const chains = [
    {
      name: 'Base',
      logo: '/base-logo.svg',
      description: 'Coinbase L2',
      tokens: ['USDC', 'USDGLO'],
      accentColor: '#0052FF',
      gradient: 'from-[#81D7B4] to-[#6BC5A0]',
      savingsLocked: '$512,450.00',
      floatingBadge: { text: 'High Yield', icon: ArrowUpRight01Icon }
    },
    {
      name: 'Celo',
      logo: ensureImageUrl(networkLogos['celo']?.logoUrl || networkLogos['celo']?.fallbackUrl || '/celo.png'),
      description: 'Mobile-first',
      tokens: ['USDGLO', 'cUSD', 'USDC'],
      accentColor: '#FCFF52',
      gradient: 'from-yellow-400 to-yellow-500',
      savingsLocked: '$308,320.50',
      floatingBadge: { text: 'Eco-Friendly', icon: GlobeIcon }
    },
    {
      name: 'Lisk',
      logo: ensureImageUrl(networkLogos['lisk']?.logoUrl || networkLogos['lisk']?.fallbackUrl || '/lisk-logo.png'),
      description: 'Ethereum L2',
      tokens: ['USDC'],
      accentColor: '#0842D4',
      gradient: 'from-[#81D7B4] to-[#6BC5A0]',
      savingsLocked: '$500,180.25',
      floatingBadge: { text: 'Low Fees', icon: Wallet01Icon }
    },
    {
      name: 'BSC',
      logo: ensureImageUrl(networkLogos['bsc']?.logoUrl || networkLogos['bsc']?.fallbackUrl || '/bsc.png'),
      description: 'Binance Smart Chain',
      tokens: ['USDC', 'USDT'],
      accentColor: '#F0B90B',
      gradient: 'from-yellow-400 to-yellow-600',
      savingsLocked: '$415,750.00',
      floatingBadge: { text: 'Popular', icon: ArrowUpRight01Icon }
    },
    {
      name: 'Avalanche',
      logo: '/avalanche-logo.svg',
      description: 'Fast & Low Cost',
      tokens: ['USDC', 'USDT'],
      accentColor: '#E84142',
      gradient: 'from-red-500 to-red-600',
      savingsLocked: '$209,940.75',
      floatingBadge: { text: 'Fast', icon: FlashIcon }
    }
  ];

  // Sparsed positions for background tokens that stay clear of typography
  const tokenPositions = [
    { top: '10%', left: '4%', size: '110px' },   // Top Left
    { top: '78%', left: '8%', size: '130px' },   // Bottom Left
    { top: '12%', left: '86%', size: '120px' },  // Top Right
    { top: '8%', left: '58%', size: '110px' },   // Top Center
    { top: '82%', left: '44%', size: '115px' },  // Center Bottom
  ];

  return (
    <section className="relative w-full min-h-[90vh] bg-gradient-to-br from-[#81D7B4]/10 via-white to-[#81D7B4]/5 overflow-hidden flex flex-col justify-center pt-32 lg:pt-40 pb-20 z-0">
      
      {/* Background Sparsed Neobrutalist Tokens */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-75 blur-[0.5px]">
          {chains.map((chain, index) => {
            const pos = tokenPositions[index];
            return (
              <motion.div
                key={chain.name}
                animate={{
                  y: [0, -15, 0],
                  rotateZ: [-3, 3, -3],
                }}
                transition={{ 
                  duration: 6 + (index % 3), 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: index * 0.5
                }}
                className="absolute flex items-center justify-center rounded-full bg-white border-[4px] border-gray-900"
                style={{ 
                  top: pos.top, 
                  left: pos.left, 
                  width: pos.size, 
                  height: pos.size,
                  boxShadow: `6px 10px 0px ${chain.accentColor}, 6px 10px 0px 4px #111`
                }}
              >
                {/* Inner Coin Rim */}
                <div className="w-[85%] h-[85%] rounded-full border-2 border-gray-100 flex items-center justify-center bg-white shadow-[inset_0_4px_15px_rgba(0,0,0,0.05)]">
                  <Image 
                    src={chain.logo} 
                    alt={chain.name} 
                    width={80} 
                    height={80} 
                    className="w-[45%] h-[45%] object-contain drop-shadow-sm relative z-10" 
                  />
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* Liquid Glass Overlay */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 pointer-events-none" />

      <motion.div 
        style={{ opacity: contentOpacity, scale: contentScale }} 
        className="relative w-full flex items-center justify-center origin-top z-30"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[90rem]">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left Column: Content */}
            <div className="flex flex-col items-start text-left space-y-6 sm:space-y-8 relative z-20">
              
              {/* Heading */}
              <div className="space-y-2 max-w-2xl relative z-10">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="font-instrument tracking-tight text-[#111111] leading-none"
                >
                  <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-[3.65rem] xl:text-[4.15rem] text-[#111111] whitespace-nowrap font-normal">
                    Your Crypto Savings
                  </span>
                  <span 
                    className="block mt-1 sm:mt-2 text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.75rem] italic text-[#81D7B4] leading-tight font-normal" 
                  >
                    Protocol
                  </span>
                </motion.h1>
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-sm sm:text-base xl:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl tracking-normal relative z-10"
              >
                Save your <strong className="font-bold text-slate-900">Stable Coins</strong>. Lock your Crypto. Build Wealth on Bitsave That Stops You From Rugging Yourself across
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mx-2 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-sm align-middle relative -top-[1px]">
                  {chains.map(chain => (
                    <Image key={chain.name} src={chain.logo} alt={chain.name} width={16} height={16} priority className="w-4 h-4 object-contain rounded-[3px]" />
                  ))}
                </span>
                networks.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-row items-center gap-3 relative z-20 pt-2 w-full sm:w-auto"
              >
                <button
                  onClick={handleStartSaving}
                  className="group flex-1 sm:flex-none px-4 sm:px-6 py-3.5 bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] text-white font-black text-sm sm:text-base rounded-xl hover:from-[#6BC5A0] hover:to-[#5fb392] transition-all flex items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(129,215,180,0.3)] hover:shadow-[0_12px_25px_rgba(129,215,180,0.4)] hover:-translate-y-1 whitespace-nowrap cursor-pointer"
                >
                  <span>Start saving<span className="hidden sm:inline"> now</span></span>
                  <ArrowRight01Icon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="https://youtu.be/BDQxf_fgsNo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex-1 sm:flex-none px-4 sm:px-6 py-3.5 bg-white/50 backdrop-blur-sm text-[#111111] font-bold text-sm sm:text-base rounded-xl border border-gray-300 hover:border-gray-900 hover:bg-white transition-all flex items-center justify-center shadow-sm whitespace-nowrap"
                >
                  <span>See how<span className="hidden sm:inline"> it works</span></span>
                </a>
              </motion.div>

              {/* Feature Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="pt-4 sm:pt-6 flex flex-row flex-wrap items-center gap-3 sm:gap-4 relative z-10 w-full"
              >
                {[
                  { title: "Non-Custodial", sub: "Your keys, your crypto", icon: Shield01Icon },
                  { title: "Reward Bearing", sub: "Earn while you save", icon: GiftIcon },
                  { title: "Multi-Chain", sub: "Omnichain liquidity", icon: Link01Icon },
                ].map((feature, i) => (
                  <div key={i} className="flex-1 sm:flex-none min-w-[145px] flex items-center gap-3 bg-white/60 backdrop-blur-md px-3 py-2.5 rounded-2xl border border-white/60 shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition-all hover:bg-white/80 hover:-translate-y-0.5">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-[12px] sm:rounded-[14px] bg-white border border-gray-100 shadow-sm flex items-center justify-center text-slate-700">
                      <feature.icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col pr-1 overflow-hidden">
                      <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight truncate">{feature.title}</span>
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 mt-0.5 truncate">{feature.sub}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Column: Smooth Stacked Interactive Cards */}
            <div className="relative h-[350px] sm:h-[450px] lg:h-[650px] w-full flex items-center justify-center lg:justify-end perspective-1000 mt-6 lg:mt-0 z-20">

              {/* Card Stack Container */}
              <div className="relative w-full max-w-[330px] aspect-[3/4] md:max-w-[370px]">
                {chains.map((chain, index) => {
                  const relativeIndex = (index - activeCardIndex + chains.length) % chains.length;
                  const isVisible = relativeIndex < 3;

                  return (
                    <motion.div
                      key={chain.name}
                      initial={false}
                      animate={{ 
                        x: relativeIndex === 0 ? 0 : relativeIndex === 1 ? 14 : relativeIndex === 2 ? 28 : 0,
                        y: relativeIndex === 0 ? 0 : relativeIndex === 1 ? 16 : relativeIndex === 2 ? 32 : -20,
                        scale: relativeIndex === 0 ? 1 : relativeIndex === 1 ? 0.96 : relativeIndex === 2 ? 0.92 : 0.88,
                        rotateZ: relativeIndex === 0 ? 0 : relativeIndex === 1 ? -2 : relativeIndex === 2 ? -4 : 0,
                        zIndex: isVisible ? 30 - relativeIndex : 0,
                        opacity: relativeIndex === 0 ? 1 : relativeIndex === 1 ? 0.9 : relativeIndex === 2 ? 0.65 : 0,
                      }}
                      transition={{ 
                        duration: 0.85, 
                        ease: [0.25, 1, 0.5, 1]
                      }}
                      className="absolute inset-0 will-change-transform origin-center"
                    >
                      {/* Premium Light Frosted Glass Card Body */}
                      <div className="w-full h-full bg-white/40 backdrop-blur-[40px] rounded-[2rem] border border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)] p-8 flex flex-col relative overflow-hidden group transition-transform">

                        {/* Soft Ambient Inner Glow */}
                        <div 
                          className="absolute -top-32 -right-32 w-[150%] h-[150%] opacity-30 blur-[80px] rounded-full group-hover:opacity-50 transition-opacity duration-700 pointer-events-none" 
                          style={{ background: `radial-gradient(circle at 50% 50%, ${chain.accentColor}, transparent 60%)` }} 
                        />
                        
                        {/* Top Bar: Network Logo */}
                        <div className="relative z-10 flex justify-between items-center mb-10">
                          {/* Network Identity */}
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center p-2 border border-slate-100 shadow-sm">
                              <Image src={chain.logo} alt={chain.name} width={22} height={22} className="object-contain relative z-10" />
                            </div>
                            <span className="text-base font-black text-slate-800 tracking-tight">{chain.name}</span>
                          </div>
                        </div>

                        {/* Middle: TVL Data */}
                        <div className="relative z-10 flex-1 flex flex-col justify-center -mt-2">
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-3">
                            Total Savings Locked
                          </p>
                          <h2 className="text-[3.5rem] sm:text-6xl font-light text-slate-900 tracking-tighter mb-8 flex items-baseline gap-1 font-display">
                            {chain.savingsLocked.split('.')[0]}
                            {chain.savingsLocked.includes('.') && (
                              <span className="text-3xl text-slate-400 font-light tracking-tight">.{chain.savingsLocked.split('.')[1]}</span>
                            )}
                          </h2>

                          {/* Frosted Rewards Box */}
                          <div className="group/reward flex items-center justify-between py-3.5 px-5 rounded-2xl bg-white/50 border border-white shadow-[0_8px_20px_rgba(0,0,0,0.02)] transition-all hover:bg-white/80">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Rewards Accrued</span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-black text-[#6BC5A0] tracking-tight">+450</span>
                                <span className="text-xs font-bold text-slate-400">BTS</span>
                              </div>
                            </div>
                            <div className="w-11 h-11 rounded-[14px] bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#6BC5A0] group-hover/reward:scale-105 transition-transform">
                              <GiftIcon className="w-5 h-5" />
                            </div>
                          </div>
                        </div>

                        {/* Bottom: Assets & Status Line */}
                        <div className="relative z-10 mt-auto pt-8 flex justify-between items-end border-t border-slate-200/50">
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Supported Assets</p>
                            <div className="flex items-center -space-x-2">
                              {chain.tokens.map((token, i) => {
                                const tokenLogos: Record<string, string> = {
                                  'USDC': '/usdclogo.png',
                                  'USDGLO': '/usdglo.png',
                                  'cUSD': '/cusd.png',
                                  'USDT': '/usdt.png'
                                };
                                return (
                                  <div key={token} title={token} className="w-8 h-8 rounded-full bg-white border-2 border-white flex items-center justify-center z-10 relative shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden transition-transform hover:scale-110 hover:z-20 cursor-pointer">
                                    <Image src={tokenLogos[token] || '/default-network.png'} alt={token} width={32} height={32} className="w-full h-full object-cover" />
                                  </div>
                                );
                              })}
                              <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400 z-0 relative shadow-sm">
                                +
                              </div>
                            </div>
                          </div>
                          
                          {/* Live Status indicator */}
                          <div className="flex flex-col items-end">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Status</p>
                            <div className="flex items-center gap-2">
                              <div className="relative flex items-center justify-center">
                                <div className="absolute w-3 h-3 rounded-full animate-ping opacity-30" style={{ backgroundColor: chain.accentColor }} />
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chain.accentColor, boxShadow: `0 0 6px ${chain.accentColor}` }} />
                              </div>
                              <span className="text-xs font-black text-slate-800 tracking-wide">Active</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}


              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </section>
  );
});

export default Hero;
