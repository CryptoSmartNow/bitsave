'use client';

import { LockIcon, GiftIcon, GlobeIcon, ArrowRight01Icon, PlayIcon, Wallet01Icon, Shield01Icon, ArrowUpRight01Icon, FlashIcon, Link01Icon } from "hugeicons-react";
import Image from 'next/image';
import { useEffect, useState, memo, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '@/utils/networkLogos';
import Link from 'next/link';

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
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [notificationIndex, setNotificationIndex] = useState(0);

  const notifications = [
    { text: "Savings Completed", icon: ArrowUpRight01Icon, color: "bg-emerald-50", textColor: "text-emerald-600" },
    { text: "Rewards Claimed", icon: GiftIcon, color: "bg-emerald-50", textColor: "text-emerald-600" },
    { text: "Auto-Compounded", icon: LockIcon, color: "bg-emerald-50", textColor: "text-emerald-600" }
  ];

  useEffect(() => {
    fetchMultipleNetworkLogos(['base', 'celo', 'lisk', 'bsc'])
      .then(setNetworkLogos)
      .catch(() => { });
  }, []);

  // Auto-rotate the hero cards and notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % 5);
      setNotificationIndex((prev) => (prev + 1) % notifications.length);
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

  return (
    <section ref={containerRef} className="relative w-full h-auto lg:h-[150vh] bg-white">
      <motion.div 
        style={{ opacity: contentOpacity, scale: contentScale }} 
        className="relative lg:sticky top-0 min-h-screen lg:h-[100vh] w-full flex items-start lg:items-center justify-center pt-32 sm:pt-40 lg:pt-0 pb-16 lg:pb-12 overflow-visible lg:overflow-hidden origin-top"
      >

      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 mesh-gradient pointer-events-none" />

      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 dot-pattern pointer-events-none opacity-60" />

      {/* Ambient Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#81D7B4]/8 rounded-full blur-[150px] will-change-transform" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#5fb392]/8 rounded-full blur-[120px] will-change-transform" />
        <div className="absolute top-[30%] left-[15%] w-48 h-48 bg-[#81D7B4]/5 rounded-full blur-[80px] will-change-transform" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[90rem] relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Column: Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 sm:space-y-10 relative z-20">

            {/* Announcement Pill */}
            <Link href="/bizswap" passHref>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-gray-200 shadow-sm text-gray-800 text-sm font-bold tracking-wide hover:bg-white/80 transition-colors cursor-pointer group"
              >
                <div className="px-2 py-0.5 rounded-full bg-[#81D7B4]/20 text-[#2D5A4A] text-xs font-black uppercase tracking-widest border border-[#81D7B4]/30">New</div>
                BizSwap: Real World Assets on Solana
                <ArrowRight01Icon className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform text-[#5fb392]" />
              </motion.div>
            </Link>

            {/* Heading */}
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-[2.75rem] leading-[1.05] sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-black tracking-tighter text-[#0A0F17]"
              >
                Your Crypto <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-[#81D7B4] via-[#6BC5A0] to-[#5fb392] bg-clip-text text-transparent sm:whitespace-nowrap">Savings Protocol</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-[1.05rem] sm:text-xl lg:text-2xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0 tracking-tight"
              >
                Save your <span className="text-gray-900 font-black">Stable Coins</span>.
                Lock your Crypto. Build Wealth on Bitsave That Stops You From Rugging Yourself across
                <span className="inline-flex items-center align-middle mx-1.5 sm:mx-2.5 gap-1.5 p-1 sm:p-1.5 rounded-xl bg-gray-50 border border-gray-100 shadow-inner">
                  <Image src="/base-square-logo.svg" alt="Base" width={20} height={20} className="w-5 h-5 object-contain" />
                  <Image src="/celo.png" alt="Celo" width={20} height={20} className="w-5 h-5 object-contain" />
                  <Image src="/lisk-logo.png" alt="Lisk" width={20} height={20} className="w-5 h-5 object-contain" />
                  <Image src="/bsc.png" alt="BSC" width={20} height={20} className="w-5 h-5 object-contain" />
                  <Image src="/avalanche-logo.svg" alt="Avalanche" width={20} height={20} className="w-5 h-5 object-contain" />
                </span>
                networks.
              </motion.p>
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-row w-full sm:w-auto gap-2 sm:gap-4 relative z-20 pt-2 justify-center lg:justify-start"
            >
              <Link
                href="/dashboard/create-savings"
                className="group flex-1 sm:flex-none px-3 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] text-white font-bold text-xs sm:text-lg rounded-full hover:from-[#6BC5A0] hover:to-[#5fb392] transition-all hover:-translate-y-1 flex items-center justify-center gap-1.5 sm:gap-2.5 shadow-[0_8px_20px_rgba(129,215,180,0.3)] shimmer-btn glow-pulse"
              >
                Start Saving Now
                <ArrowRight01Icon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://youtu.be/BDQxf_fgsNo"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-1 sm:flex-none px-3 py-3 sm:px-8 sm:py-4 bg-white/60 backdrop-blur-md text-gray-800 font-bold text-xs sm:text-lg rounded-full hover:bg-white hover:border-gray-300 border border-gray-200 transition-all flex items-center justify-center gap-1.5 sm:gap-2.5 shadow-sm"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#81D7B4]/20 flex items-center justify-center text-[#2D5A4A]">
                  <PlayIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current group-hover:scale-110 transition-transform" />
                </div>
                Watch Demo
              </a>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-6 flex flex-row flex-wrap justify-center lg:justify-start gap-4 sm:gap-8 text-sm font-bold text-gray-500"
            >
              {[
                { icon: Shield01Icon, label: "Non-Custodial", desc: "Your keys, your crypto" },
                { icon: GiftIcon, label: "Reward Bearing", desc: "Earn while you save" },
                { icon: Link01Icon, label: "Multi-Chain", desc: "Omnichain liquidity" }
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3 group/feature cursor-default">
                  <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm text-gray-600 group-hover/feature:bg-white group-hover/feature:border-[#81D7B4]/30 group-hover/feature:text-[#5fb392] group-hover/feature:scale-105 transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-black tracking-tight text-gray-800">{label}</span>
                    <span className="text-[11px] font-semibold text-gray-400 tracking-wide">{desc}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Visuals */}
          <div className="relative h-[350px] sm:h-[450px] lg:h-[700px] w-full flex items-center justify-center lg:justify-end perspective-1000 mt-8 lg:mt-0">

            {/* Card Stack Container */}
            <div className="relative w-full max-w-[340px] aspect-[3/4] md:max-w-[380px]">
              <AnimatePresence mode="wait">
                {chains.map((chain, index) => {
                  if (index !== activeCardIndex) return null;

                  return (
                    <motion.div
                      key={chain.name}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.05, y: -20 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute inset-0 z-20 will-change-transform"
                    >
                      {/* Card Body */}
                      <div className="w-full h-full bg-white/70 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.05)] border border-white/80 p-8 flex flex-col relative overflow-hidden group">

                        {/* Sheen reflection overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/5 to-transparent opacity-60 pointer-events-none rounded-[2.5rem]" />

                        {/* Ambient Glow */}
                        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br opacity-30 blur-[60px] rounded-full transition-opacity duration-700" style={{ backgroundImage: `linear-gradient(to bottom right, transparent, ${chain.accentColor})` }} />
                        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr opacity-20 blur-[60px] rounded-full transition-opacity duration-700" style={{ backgroundImage: `linear-gradient(to top right, transparent, ${chain.accentColor})` }} />

                        {/* Noise overlay for premium physical feel (much more visible) */}
                        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

                        {/* Floating Badge (Unique per chain) */}
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute top-8 left-8 z-10"
                        >
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-white shadow-sm backdrop-blur-md">
                            {chain.floatingBadge && (() => {
                              const Icon = chain.floatingBadge.icon;
                              return <Icon className="w-3.5 h-3.5" style={{ color: chain.accentColor }} />;
                            })()}
                            <span className="text-[10px] font-black text-gray-800 tracking-widest uppercase">{chain.floatingBadge?.text}</span>
                          </div>
                        </motion.div>

                        {/* Top Section: Logo */}
                        <div className="relative flex justify-end items-start mb-12 z-10">
                          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-gray-100 shadow-sm">
                            <Image src={chain.logo} alt={chain.name} width={20} height={20} className="object-contain" />
                            <span className="text-xs font-black text-gray-800 tracking-wide">{chain.name}</span>
                          </div>
                        </div>

                        {/* Middle Section: Balance & Rewards */}
                        <div className="relative flex-1 flex flex-col justify-center -mt-4 z-10">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 font-display">Total Savings Locked</p>
                          <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-6 font-display">{chain.savingsLocked}</h2>

                          {/* Rewards Box */}
                          <div className="flex items-center justify-between py-4 px-5 rounded-2xl bg-white/50 border border-white shadow-sm backdrop-blur-md">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Rewards Earned</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-gray-900 tracking-tight font-display">+450</span>
                                <span className="text-xs font-black text-gray-500">$BTS</span>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-md">
                              <GiftIcon className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {/* Bottom Section: Assets */}
                        <div className="relative mt-auto pt-8 z-10">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2.5">Assets</p>
                              <div className="flex items-center -space-x-2">
                                {chain.tokens.map((token, i) => (
                                  <div key={token} className="w-8 h-8 rounded-full bg-gray-900 border-2 border-white shadow-sm flex items-center justify-center text-[9px] font-black text-white z-10 relative">
                                    {token[0]}
                                  </div>
                                ))}
                                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-400 z-0 relative">
                                  +
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2">Status</p>
                              <div className="flex items-center gap-1.5 text-xs font-black text-gray-900">
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: chain.accentColor }} />
                                Active
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Decorative "Back" Cards */}
              <div className="absolute top-4 left-0 w-full h-full bg-white/30 backdrop-blur-md rounded-[2.5rem] border border-white/30 shadow-xl -z-10 scale-[0.95] translate-y-4" />
              <div className="absolute top-8 left-0 w-full h-full bg-white/15 backdrop-blur-sm rounded-[2.5rem] border border-white/15 shadow-lg -z-20 scale-[0.90] translate-y-8" />

              {/* Floating Notification */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-8 top-20 glass-card bg-white/90 p-3.5 rounded-2xl shadow-xl border border-white/50 z-30 hidden sm:flex items-center gap-3 min-w-[200px] will-change-transform"
              >
                <AnimatePresence mode="wait">
                  {(() => {
                    const NotificationIcon = notifications[notificationIndex].icon;
                    return (
                      <motion.div
                        key={notificationIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-3 w-full"
                      >
                        <div className={`w-9 h-9 rounded-full ${notifications[notificationIndex].color} flex items-center justify-center ${notifications[notificationIndex].textColor}`}>
                          <NotificationIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{notifications[notificationIndex].text}</p>
                          <p className="text-[10px] text-gray-400 font-medium">Just now</p>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
      </motion.div>
    </section>
  );
});

export default Hero;
