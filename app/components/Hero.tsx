'use client';

import Image from 'next/image';
import { useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '@/utils/networkLogos';
import Link from 'next/link';
import { Lock, Gift, Globe, ArrowRight, Play, Wallet, ShieldCheck, TrendingUp, Zap } from 'lucide-react';

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
    { text: "Savings Completed", icon: TrendingUp, color: "bg-green-100", textColor: "text-green-600" },
    { text: "Rewards Claimed", icon: Gift, color: "bg-green-100", textColor: "text-green-600" },
    { text: "Auto-Compounded", icon: Lock, color: "bg-green-100", textColor: "text-green-600" }
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
      savingsLocked: '$12,450.00',
      floatingBadge: { text: 'High Yield', icon: TrendingUp }
    },
    {
      name: 'Celo',
      logo: ensureImageUrl(networkLogos['celo']?.logoUrl || networkLogos['celo']?.fallbackUrl || '/celo.png'),
      description: 'Mobile-first',
      tokens: ['USDGLO', 'cUSD', 'USDC'],
      accentColor: '#FCFF52',
      gradient: 'from-yellow-400 to-yellow-500',
      savingsLocked: '$8,320.50',
      floatingBadge: { text: 'Eco-Friendly', icon: Globe }
    },
    {
      name: 'Lisk',
      logo: ensureImageUrl(networkLogos['lisk']?.logoUrl || networkLogos['lisk']?.fallbackUrl || '/lisk-logo.png'),
      description: 'Ethereum L2',
      tokens: ['USDC'],
      accentColor: '#0842D4',
      gradient: 'from-[#81D7B4] to-[#6BC5A0]',
      savingsLocked: '$5,180.25',
      floatingBadge: { text: 'Low Fees', icon: Wallet }
    },
    {
      name: 'BSC',
      logo: ensureImageUrl(networkLogos['bsc']?.logoUrl || networkLogos['bsc']?.fallbackUrl || '/bsc.png'),
      description: 'Binance Smart Chain',
      tokens: ['USDC', 'USDT'],
      accentColor: '#F0B90B',
      gradient: 'from-yellow-400 to-yellow-600',
      savingsLocked: '$15,750.00',
      floatingBadge: { text: 'Popular', icon: TrendingUp }
    },
    {
      name: 'Avalanche',
      logo: '/avalanche-logo.svg',
      description: 'Fast & Low Cost',
      tokens: ['USDC', 'USDT'],
      accentColor: '#E84142',
      gradient: 'from-red-500 to-red-600',
      savingsLocked: '$9,940.75',
      floatingBadge: { text: 'Fast', icon: Zap }
    }
  ];

  return (
    <section className="relative w-full min-h-[100dvh] flex items-center justify-center pt-24 pb-12 overflow-hidden bg-white">
      
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#81D7B4]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#81D7B4]/10 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-[#81D7B4]/5 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[90rem] relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 sm:space-y-10">
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#81D7B4] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#81D7B4]"></span>
              </span>
              <span className="text-sm font-semibold text-gray-600 tracking-wide">Decentralized Savings Protocol</span>
            </motion.div>

            {/* Heading */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900 leading-[0.95]"
              >
                Give Tomorrow a<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0]">Soft Landing</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-xl text-gray-500 font-light leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                Your <span className="text-gray-900 font-medium">Onchain Savings Nest</span>. 
                Save securely, earn rewards, and build wealth across 
                <span className="inline-flex items-center align-middle mx-2 gap-1">
                  <Image src="/base.svg" alt="Base" width={20} height={20} className="w-5 h-5 object-contain" />
                  <Image src="/celo.png" alt="Celo" width={20} height={20} className="w-5 h-5 object-contain" />
                  <Image src="/lisk-logo.png" alt="Lisk" width={20} height={20} className="w-5 h-5 object-contain" />
                  <Image src="/bsc.png" alt="BSC" width={20} height={20} className="w-5 h-5 object-contain" />
                  <Image src="https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=025" alt="Avalanche" width={20} height={20} className="w-5 h-5 object-contain" />
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
                className="group w-full sm:w-auto px-8 py-4 bg-[#81D7B4] text-white font-semibold text-lg rounded-full hover:bg-[#6BC5A0] shadow-lg shadow-[#81D7B4]/25 hover:shadow-[#81D7B4]/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Start Saving Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://www.youtube.com/shorts/CWRQ7rgtHzU"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-semibold text-lg rounded-full border border-gray-200 hover:border-[#81D7B4] hover:text-[#81D7B4] transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
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
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-[#81D7B4]/10 text-[#81D7B4]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                Non-Custodial
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-[#81D7B4]/10 text-[#81D7B4]">
                  <Gift className="w-4 h-4" />
                </div>
                Reward Bearing
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-[#81D7B4]/10 text-[#81D7B4]">
                  <Globe className="w-4 h-4" />
                </div>
                Multi-Chain
              </div>
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
                      className="absolute inset-0 z-20"
                    >
                      {/* Card Body */}
                      <div className="w-full h-full bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] border border-white/60 p-8 flex flex-col relative overflow-hidden group">
                        
                        {/* Ambient Glow - Unified Brand Color */}
                        <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#81D7B4]/10 blur-[60px] rounded-full group-hover:bg-[#81D7B4]/20 transition-colors duration-700" />
                        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#81D7B4]/10 blur-[60px] rounded-full group-hover:bg-[#81D7B4]/20 transition-colors duration-700" />

                        {/* Floating Badge (Unique per chain) */}
                        <motion.div 
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute top-8 left-8 z-10"
                        >
                           <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm">
                              {chain.floatingBadge && (() => {
                                const Icon = chain.floatingBadge.icon;
                                return <Icon className="w-3 h-3 text-[#81D7B4]" />;
                              })()}
                              <span className="text-[10px] font-bold text-gray-600">{chain.floatingBadge?.text}</span>
                           </div>
                        </motion.div>

                        {/* Top Section: Logo (Chip removed) */}
                        <div className="relative flex justify-end items-start mb-12">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                             <Image src={chain.logo} alt={chain.name} width={20} height={20} className="object-contain" />
                             <span className="text-xs font-bold text-gray-700">{chain.name}</span>
                          </div>
                        </div>

                        {/* Middle Section: Balance & Rewards */}
                        <div className="relative flex-1 flex flex-col justify-center -mt-4">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Savings Locked</p>
                          <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-6">{chain.savingsLocked}</h2>
                          
                          {/* Rewards Box - Simplified & Unified */}
                          <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#81D7B4]/5 border border-[#81D7B4]/20">
                             <div className="flex flex-col">
                               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Rewards Earned</span>
                               <div className="flex items-baseline gap-1">
                                 <span className="text-lg font-bold text-gray-900">+450</span>
                                 <span className="text-xs font-bold text-[#81D7B4]">$BTS</span>
                               </div>
                             </div>
                             <div className="w-8 h-8 rounded-full bg-[#81D7B4] flex items-center justify-center text-white shadow-md shadow-[#81D7B4]/20">
                               <Gift className="w-4 h-4" />
                             </div>
                          </div>
                        </div>

                        {/* Bottom Section: Assets */}
                        <div className="relative mt-auto pt-8">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Assets</p>
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
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Status</p>
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

              {/* Decorative "Back" Cards - Refined */}
              <div className="absolute top-4 left-0 w-full h-full bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/40 shadow-xl -z-10 scale-[0.95] translate-y-4" />
              <div className="absolute top-8 left-0 w-full h-full bg-white/20 backdrop-blur-sm rounded-[2.5rem] border border-white/20 shadow-lg -z-20 scale-[0.90] translate-y-8" />

              {/* Floating Notification */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-8 top-20 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 z-30 hidden sm:flex items-center gap-3 min-w-[200px]"
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
                         <div className={`w-8 h-8 rounded-full ${notifications[notificationIndex].color} flex items-center justify-center ${notifications[notificationIndex].textColor}`}>
                            <NotificationIcon className="w-4 h-4" />
                         </div>
                         <div>
                            <p className="text-xs font-bold text-gray-900">{notifications[notificationIndex].text}</p>
                            <p className="text-[10px] text-gray-500">Just now</p>
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
