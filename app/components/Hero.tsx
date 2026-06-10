'use client';

import { LockIcon, GiftIcon, GlobeIcon, ArrowRight01Icon, PlayIcon, Wallet01Icon, Shield01Icon, ArrowUpRight01Icon, FlashIcon } from "hugeicons-react";
import Image from 'next/image';
import { useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      logo: '/base.svg',
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
    <section className="relative w-full min-h-[100dvh] flex items-center justify-center pt-24 pb-12 overflow-hidden bg-white">

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
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 sm:space-y-10">

            {/* Heading */}
            <div className="space-y-5">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-extrabold tracking-tight text-gray-900 leading-[1.05]"
              >
                Your Crypto<br />
                <span className="text-gradient-animated">Savings Protocol</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-xl text-gray-500 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0 tracking-[-0.01em]"
              >
                Save your <span className="text-gray-900 font-semibold">Stable Coins</span>.
                Lock your Crypto. Build Wealth on Bitsave That Stops You From Rugging Yourself across
                <span className="inline-flex items-center align-middle mx-2 gap-1.5">
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
              className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 relative z-20"
            >
              <Link
                href="/dashboard/create-savings"
                className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] text-white font-bold text-lg rounded-full hover:from-[#6BC5A0] hover:to-[#5fb392] transition-all hover:-translate-y-1 flex items-center justify-center gap-2.5 shimmer-btn glow-pulse"
              >
                Start Saving Now
                <ArrowRight01Icon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://youtu.be/BDQxf_fgsNo"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto px-8 py-4 glass-card text-gray-900 font-semibold text-lg rounded-full hover:border-[#81D7B4]/50 hover:text-[#5fb392] transition-all flex items-center justify-center gap-2.5 hover:shadow-lg"
              >
                <PlayIcon className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                Watch Demo
              </a>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-4 flex flex-wrap justify-center lg:justify-start gap-6 text-sm font-medium text-gray-500"
            >
              {[
                { icon: Shield01Icon, label: "Non-Custodial" },
                { icon: GiftIcon, label: "Reward Bearing" },
                { icon: GlobeIcon, label: "Multi-Chain" }
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 group/feature cursor-default">
                  <div className="p-2 rounded-xl bg-[#81D7B4]/8 text-[#81D7B4] group-hover/feature:bg-[#81D7B4]/15 group-hover/feature:scale-110 transition-all duration-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold tracking-wide">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Visuals */}
          <div className="relative h-[400px] sm:h-[500px] lg:h-[700px] w-full flex items-center justify-center lg:justify-end perspective-1000">

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
                      <div className="w-full h-full bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-white/50 p-8 flex flex-col relative overflow-hidden group">

                        {/* Animated Gradient Border Glow */}
                        <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{
                          background: 'linear-gradient(135deg, rgba(129,215,180,0.2), transparent, rgba(91,179,146,0.15))',
                          backgroundSize: '200% 200%',
                          animation: 'gradientBorder 4s ease infinite'
                        }} />

                        {/* Ambient Glow */}
                        <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#81D7B4]/8 blur-[60px] rounded-full group-hover:bg-[#81D7B4]/15 transition-colors duration-700" />
                        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#81D7B4]/6 blur-[60px] rounded-full group-hover:bg-[#81D7B4]/12 transition-colors duration-700" />

                        {/* Floating Badge (Unique per chain) */}
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute top-8 left-8 z-10"
                        >
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card shadow-sm">
                            {chain.floatingBadge && (() => {
                              const Icon = chain.floatingBadge.icon;
                              return <Icon className="w-3.5 h-3.5 text-[#81D7B4]" />;
                            })()}
                            <span className="text-[11px] font-bold text-gray-600 tracking-wide">{chain.floatingBadge?.text}</span>
                          </div>
                        </motion.div>

                        {/* Top Section: Logo */}
                        <div className="relative flex justify-end items-start mb-12">
                          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gray-50/80 border border-gray-100/80 backdrop-blur-sm">
                            <Image src={chain.logo} alt={chain.name} width={20} height={20} className="object-contain" />
                            <span className="text-xs font-bold text-gray-700 tracking-wide">{chain.name}</span>
                          </div>
                        </div>

                        {/* Middle Section: Balance & Rewards */}
                        <div className="relative flex-1 flex flex-col justify-center -mt-4">
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.15em] mb-1.5 font-display">Total Savings Locked</p>
                          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-6 font-display">{chain.savingsLocked}</h2>

                          {/* Rewards Box */}
                          <div className="flex items-center justify-between py-3.5 px-4 rounded-2xl bg-[#81D7B4]/5 border border-[#81D7B4]/15">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.12em] mb-0.5">Rewards Earned</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-lg font-extrabold text-gray-900 font-display">+450</span>
                                <span className="text-xs font-bold text-[#81D7B4]">$BTS</span>
                              </div>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#81D7B4] to-[#5fb392] flex items-center justify-center text-white shadow-lg shadow-[#81D7B4]/25">
                              <GiftIcon className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {/* Bottom Section: Assets */}
                        <div className="relative mt-auto pt-8">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] mb-2">Assets</p>
                              <div className="flex items-center -space-x-2">
                                {chain.tokens.map((token, i) => (
                                  <div key={token} className="w-8 h-8 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-gray-600 z-10 relative">
                                    {token[0]}
                                  </div>
                                ))}
                                <div className="w-8 h-8 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-400 z-0 relative">
                                  +
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] mb-1">Status</p>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-[#81D7B4]">
                                <div className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse" />
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
    </section>
  );
});

export default Hero;
