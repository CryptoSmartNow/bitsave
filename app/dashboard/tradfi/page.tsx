"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useENSData } from "@/hooks/useENSData";
import { HiOutlineArrowRight, HiOutlineChartBar, HiOutlineCurrencyDollar, HiOutlineArrowTrendingUp, HiOutlineChartPie, HiOutlineBellAlert, HiOutlineBriefcase } from "react-icons/hi2";
import { Exo } from "next/font/google";

const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-exo',
});

export default function TradFiComingSoon() {
  const router = useRouter();
  const { address } = useAccount();
  const { ensName, getDisplayName, hasENS } = useENSData();
  const [displayName, setDisplayName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDisplayName(getDisplayName());
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [getDisplayName]);

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (email.trim()) {
      alert('Subscribed with: ' + email);
      setEmail('');
    }
  };

  if (!mounted) {
    return (
      <div className={`${exo.variable} font-sans min-h-screen bg-[#F7FCFA] flex items-center justify-center`}>
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
      </div>
    );
  }

  const features = [
    {
      icon: HiOutlineChartBar,
      title: "Real-Time Market Data",
      description: "Access live stock prices, market trends, and comprehensive financial data with advanced charting tools.",
      color: "#81D7B4"
    },
    {
      icon: HiOutlineCurrencyDollar,
      title: "Smart Order Execution",
      description: "Intelligent order routing for optimal pricing and fast execution across multiple exchanges.",
      color: "#81D7B4"
    },
    {
      icon: HiOutlineChartPie,
      title: "Smart Portfolio Builder",
      description: "AI-powered portfolio recommendations based on your risk tolerance and investment goals.",
      color: "#81D7B4"
    },
    {
      icon: HiOutlineArrowTrendingUp,
      title: "Advanced Analytics",
      description: "Track performance, analyze trends, and get actionable insights to optimize your investment strategy.",
      color: "#81D7B4"
    },
    {
      icon: HiOutlineBellAlert,
      title: "Smart Alerts & Notifications",
      description: "Get notified about price movements, earnings reports, and market opportunities in real-time.",
      color: "#81D7B4"
    },
    {
      icon: HiOutlineBriefcase,
      title: "Crypto + Stocks Unified",
      description: "Manage your entire investment portfolio - stocks, ETFs, and crypto - all in one platform.",
      color: "#81D7B4"
    }
  ];

  return (
    <div className={`${exo.variable} font-sans min-h-screen bg-[#F7FCFA] text-gray-800 relative overflow-x-hidden`}>
      {/* Decorative background elements - pointer-events-none to prevent blocking clicks */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#81D7B4]/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#81D7B4]/15 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#81D7B4]/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="relative z-10 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                  Welcome back 👋
                </h1>
              </div>
              <p className="ml-3 sm:ml-4 text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 font-medium">
                {displayName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'User')}
                {hasENS && ensName && (
                  <span className="ml-2 inline-flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                    <span className="mr-1">⟠</span>
                    ENS: {ensName}
                  </span>
                )}
              </p>
            </div>
            {/* Pill Tabs */}
            <div className="inline-flex items-center bg-gray-50 border border-gray-200 rounded-full p-1.5 sm:p-2 gap-2 sm:gap-3 md:gap-4 relative z-20">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push('/dashboard');
                }}
                className="px-4 sm:px-5 md:px-6 lg:px-7 py-1.5 sm:py-2 md:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-semibold transition-colors duration-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer relative z-10"
              >
                SaveFi
              </button>
              <button
                type="button"
                disabled
                className="px-4 sm:px-5 md:px-6 lg:px-7 py-1.5 sm:py-2 md:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-semibold transition-colors duration-200 bg-white text-[#4A9B7A] cursor-default relative z-10"
              >
                TradFi
              </button>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-white/50 backdrop-blur-sm rounded-3xl animate-pulse border border-white/60"></div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 md:space-y-8"
              >
                {/* Hero Section with Glassmorphism */}
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="relative group overflow-hidden"
                >
                  <div className="relative bg-white/20 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-[0_20px_60px_rgba(129,215,180,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] p-8 md:p-12 overflow-hidden">
                    {/* Animated orbs - pointer-events-none - using solid brand colors */}
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#81D7B4]/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000 pointer-events-none"></div>
                    <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#81D7B4]/25 rounded-full blur-3xl group-hover:scale-105 transition-transform duration-1000 pointer-events-none"></div>
                    
                    <div className="relative z-10 max-w-4xl mx-auto text-center">
                      {/* Stock Chart Icon - Trading themed */}
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6 rounded-full bg-[#81D7B4] shadow-[0_8px_32px_rgba(129,215,180,0.4)]"
                      >
                        <HiOutlineChartBar className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                      </motion.div>
                      
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 tracking-tight"
                      >
                        Stock Trading
                        <span className="block mt-2 text-[#81D7B4]">
                          Coming Soon
                        </span>
                      </motion.h1>
                      
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
                      >
                        Trade stocks, ETFs, and options alongside your crypto portfolio. Access real-time market data, advanced charting, and intelligent portfolio management in one powerful platform.
                      </motion.p>

                      {/* Coming Soon Badge */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#81D7B4]/20 backdrop-blur-sm rounded-full border border-[#81D7B4]/30"
                      >
                        <div className="w-2 h-2 bg-[#81D7B4] rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-gray-700">Launching Q1 2026</span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                >
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          delay: 0.3 + (index * 0.1), 
                          duration: 0.5,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ 
                          y: -8, 
                          scale: 1.02,
                          transition: { duration: 0.3 }
                        }}
                        className="group relative overflow-hidden"
                      >
                        <div className="relative h-full bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border-2 border-[#81D7B4] shadow-[0_8px_32px_rgba(129,215,180,0.18),inset_0_1px_0_rgba(255,255,255,0.7)] p-6 sm:p-8 hover:shadow-[0_12px_40px_rgba(129,215,180,0.3)] hover:border-[#81D7B4] transition-all duration-300 cursor-default">
                          {/* Solid color background on hover - pointer-events-none */}
                          <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none rounded-2xl sm:rounded-3xl"
                            style={{ backgroundColor: '#81D7B4' }}
                          ></div>
                          
                          {/* Floating orb - pointer-events-none */}
                          <div 
                            className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-all duration-500 pointer-events-none"
                            style={{ backgroundColor: '#81D7B4' }}
                          ></div>
                          
                          <div className="relative z-10">
                            {/* Icon - solid brand color */}
                            <div 
                              className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mb-4 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.07)] group-hover:scale-110 transition-transform duration-300"
                              style={{ backgroundColor: '#81D7B4' }}
                            >
                              <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            
                            {/* Content */}
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#81D7B4] transition-colors duration-300">
                              {feature.title}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Subscription Section with Enhanced Design */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="relative group overflow-hidden"
                >
                  <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl border-2 border-white/40 shadow-[0_20px_60px_rgba(129,215,180,0.15),inset_0_1px_0_rgba(255,255,255,0.6)] p-8 md:p-12 overflow-hidden">
                    {/* Animated orbs - pointer-events-none - using solid brand colors */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#81D7B4]/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000 pointer-events-none"></div>
                    <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-[#81D7B4]/25 rounded-full blur-3xl group-hover:scale-105 transition-transform duration-1000 pointer-events-none"></div>
                    
                    <div className="relative z-10 max-w-2xl mx-auto text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                        className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-[#81D7B4] shadow-[0_8px_32px_rgba(129,215,180,0.4)]"
                      >
                        <HiOutlineChartPie className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Be the First to Trade
                      </h2>
                      <p className="text-base sm:text-lg text-gray-600 mb-8">
                        Get early access to stock trading and revolutionize your investment strategy with SaveFi.
                      </p>
                      
                      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 relative z-20">
                        <div className="flex-1 relative z-10">
                          <input 
                            type="email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              e.stopPropagation();
                              setEmail(e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Enter your email address"
                            required
                            className="w-full px-6 py-4 bg-white/60 backdrop-blur-sm border-2 border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#81D7B4] focus:border-[#81D7B4] transition-all duration-300 text-gray-900 placeholder-gray-500 cursor-text"
                          />
                        </div>
                        <motion.button 
                          type="submit"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-8 py-4 bg-[#81D7B4] text-white rounded-2xl font-semibold shadow-[0_8px_32px_rgba(129,215,180,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] hover:bg-[#6BC4A0] hover:shadow-[0_12px_40px_rgba(129,215,180,0.5)] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer relative z-10"
                        >
                          <span>Subscribe</span>
                          <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
