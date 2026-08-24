'use client';

import { 
  Award01Icon, UserMultipleIcon, Activity01Icon, SparklesIcon,
  BubbleChatIcon, PlayIcon, Notification01Icon, Calendar01Icon,
  ArrowRight01Icon, Rocket01Icon, Share01Icon, CheckmarkCircle02Icon
} from "hugeicons-react";
import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Component Widgets
import TrendingForumWidget from './components/TrendingForumWidget';
import SavvyFinanceVideos from './components/SavvyFinanceVideos';
import AnnouncementsWidget from './components/AnnouncementsWidget';
import CalendarWidget from './components/CalendarWidget';

const savvyFinanceVideos = [
  {
    id: 'daOztI1KsS8',
    title: 'BitSave Story & Vision',
    creator: 'BitSave Protocol',
    embedUrl: 'https://www.youtube.com/embed/daOztI1KsS8',
    url: 'https://www.youtube.com/watch?v=daOztI1KsS8',
    views: '1.2K',
    duration: '2:45'
  },
  {
    id: 'OG6NC_6_9Oo',
    title: 'DeFi is SaveFi - Vitalik Buterin\'s Low Risk DeFi',
    creator: 'BitSave Protocol',
    embedUrl: 'https://www.youtube.com/embed/OG6NC_6_9Oo',
    url: 'https://www.youtube.com/watch?v=OG6NC_6_9Oo',
    views: '850',
    duration: '3:12'
  },
  {
    id: 'BDQxf_fgsNo',
    title: 'How To Save On-Chain with BitSave.io',
    creator: 'BitSave Protocol',
    embedUrl: 'https://www.youtube.com/embed/BDQxf_fgsNo',
    url: 'https://www.youtube.com/watch?v=BDQxf_fgsNo',
    views: '2.1K',
    duration: '1:58'
  },
  {
    id: 'InTpwxsQkzs',
    title: 'How to Lock & Secure Your Funds on BitSave',
    creator: 'BitSave Protocol',
    embedUrl: 'https://www.youtube.com/embed/InTpwxsQkzs',
    url: 'https://www.youtube.com/watch?v=InTpwxsQkzs',
    views: '1.5K',
    duration: '4:20'
  }
];

export default function SavvySpacePage() {
  return (
    <div className="w-full font-sans min-h-screen pb-24">
      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-2 sm:px-4">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-instrument text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
              Savvy Space
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Community discussions, educational resources, protocol updates, and events.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/forum"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white dark:bg-[#161616] border border-gray-200/70 dark:border-white/10 text-xs font-bold text-gray-800 dark:text-gray-200 hover:border-[#81D7B4] transition-all shadow-xs"
            >
              <BubbleChatIcon className="w-4 h-4 text-[#81D7B4]" />
              <span>Community Forum</span>
            </Link>
            <Link
              href="/dashboard/activity"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#81D7B4] text-white font-bold text-xs hover:opacity-90 transition-all shadow-xs"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>Earn $BTS</span>
            </Link>
          </div>
        </div>

        {/* Wrapped CTA Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#121212] to-[#1c1c1c] p-6 sm:p-10 border border-gray-800 dark:border-white/10 shadow-lg mb-10 group"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-[#81D7B4]/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#81D7B4]/15 transition-all duration-700"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#81D7B4]/15 border border-[#81D7B4]/30 text-[#81D7B4] text-[10px] font-black uppercase tracking-widest mb-3">
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>Protocol Analytics</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-instrument mb-3 leading-tight">
                Your Savings, <span className="text-[#81D7B4]">Wrapped.</span>
              </h2>
              <p className="text-gray-300 dark:text-gray-400 text-sm leading-relaxed mb-5">
                Explore your lifetime on-chain savings journey, consistency milestones, earned protocol yields, and shareable statistics.
              </p>

              <div className="flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300">
                  <CheckmarkCircle02Icon className="w-3.5 h-3.5 text-[#81D7B4]" />
                  <span>Verified On-Chain</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300">
                  <Award01Icon className="w-3.5 h-3.5 text-[#81D7B4]" />
                  <span>Yield Metrics</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300">
                  <Share01Icon className="w-3.5 h-3.5 text-[#81D7B4]" />
                  <span>Shareable Badges</span>
                </span>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0">
              <Link
                href="/dashboard/wrapped"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#81D7B4] hover:bg-[#6BC5A0] text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-[#81D7B4]/25 hover:shadow-xl hover:shadow-[#81D7B4]/35"
              >
                <span>View My Wrapped</span>
                <ArrowRight01Icon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Main Grid: Left 8 Columns & Right 4 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Trending Forum Discussions */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <TrendingForumWidget />
            </motion.div>

            {/* Mobile / Tablet View of Announcements & Calendar */}
            <div className="flex flex-col gap-6 lg:hidden">
              <AnnouncementsWidget />
              <CalendarWidget />
            </div>

            {/* Educational Videos Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight font-instrument flex items-center gap-2.5">
                    <span className="w-2.5 h-7 bg-[#81D7B4] rounded-full"></span>
                    Savvy Finance Videos
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5 ml-5">
                    Master on-chain savings and decentralized yield strategies.
                  </p>
                </div>
              </div>

              <Suspense fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-56 bg-gray-100 dark:bg-white/5 rounded-3xl animate-pulse" />
                  ))}
                </div>
              }>
                <SavvyFinanceVideos videos={savvyFinanceVideos} />
              </Suspense>
            </section>

          </div>

          {/* Sidebar Column (4 cols) - Desktop */}
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-6">
            
            {/* Announcements Widget */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <AnnouncementsWidget />
            </motion.div>

            {/* Community Calendar Widget */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <CalendarWidget />
            </motion.div>

          </div>

        </div>

      </div>
    </div>
  );
}
