'use client';

import { useState, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Exo } from 'next/font/google';
import {
  HiOutlineEnvelope,
  HiOutlineCalendar,
  HiOutlineFire,
  HiOutlineMegaphone,
  HiOutlineHashtag,
  HiOutlineUserPlus,
  HiOutlineArrowRight,
  HiOutlineTrophy,
  HiOutlineStar,
  HiOutlineCurrencyDollar,
  HiOutlineLockClosed,
  HiOutlineCheckCircle
} from 'react-icons/hi2';

const exo = Exo({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
});

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  isCompleted: boolean;
  href: string;
  icon: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: 'social' | 'saving' | 'referral';
}

// Mock data for demonstration - reset state for new user
const MOCK_USER_DATA = {
  hasSavingsPlan: false,
  hasConnectedX: false,
  hasConnectedFarcaster: false,
  hasEmail: false,
  userPoints: 0,
  level: 1,
  nextLevelPoints: 100,
  rank: 0,
  referralLink: 'https://bitsave.io/ref/123xyz',
};

const MOCK_LEADERBOARD: any[] = [];

export default function ActivityPage() {
  const [userData] = useState(MOCK_USER_DATA);
  const [activeTab, setActiveTab] = useState<'all' | 'social' | 'saving'>('all');

  const tasks: Task[] = [
    {
      id: 'tweet_after_saving',
      title: 'Tweet after Saving',
      description: 'Share your savings milestone with the world.',
      points: 1,
      isCompleted: false,
      href: '/dashboard/create-savings',
      icon: 'tweet',
      difficulty: 'easy',
      category: 'social'
    },
    {
      id: 'connect_x',
      title: 'Connect X (Twitter)',
      description: 'Link your X account to unlock social quests.',
      points: 1,
      isCompleted: false,
      href: '/dashboard/settings',
      icon: 'twitter',
      difficulty: 'easy',
      category: 'social'
    },
    {
      id: 'connect_farcaster',
      title: 'Connect Farcaster',
      description: 'Join the onchain conversation.',
      points: 1,
      isCompleted: false,
      href: '/dashboard/settings',
      icon: 'farcaster',
      difficulty: 'medium',
      category: 'social'
    },
    {
      id: 'add_email',
      title: 'Add Email Address',
      description: 'Stay updated with important alerts.',
      points: 1,
      isCompleted: false,
      href: '/dashboard/settings',
      icon: 'email',
      difficulty: 'easy',
      category: 'social'
    },
    {
      id: 'tweet_about_bitsave',
      title: 'Shoutout on X',
      description: 'Tell your friends about BitSave.',
      points: 5,
      isCompleted: false,
      href: `https://twitter.com/intent/tweet?text=Exploring%20the%20world%20of%20DeFi%20savings%20with%20@bitsaveprotocol!%20%23SaveFi%20%23Web3&url=${userData.referralLink}`,
      icon: 'tweet',
      difficulty: 'easy',
      category: 'social'
    },
    {
      id: 'referral_signup',
      title: 'Refer a Friend',
      description: 'Earn huge points for every friend who joins.',
      points: 5,
      isCompleted: false,
      href: '/dashboard/settings',
      icon: 'referral',
      difficulty: 'hard',
      category: 'referral'
    },
    {
      id: 'complete_plan',
      title: 'Complete a Plan',
      description: 'Finish a savings plan successfully.',
      points: 10,
      isCompleted: false,
      href: '/dashboard/plans',
      icon: 'streak',
      difficulty: 'hard',
      category: 'saving'
    },
    {
      id: 'weekly_saving',
      title: '4-Week Streak',
      description: 'Save consistently for 4 weeks.',
      points: 10,
      isCompleted: false,
      href: '/dashboard/plans',
      icon: 'calendar',
      difficulty: 'medium',
      category: 'saving'
    },
  ];

  const TaskIcon = ({ icon }: { icon: string }) => {
    const icons: { [key: string]: ReactNode } = {
      twitter: <HiOutlineHashtag className="w-6 h-6" />,
      farcaster: <HiOutlineMegaphone className="w-6 h-6" />,
      email: <HiOutlineEnvelope className="w-6 h-6" />,
      tweet: <HiOutlineHashtag className="w-6 h-6" />,
      cast: <HiOutlineMegaphone className="w-6 h-6" />,
      referral: <HiOutlineUserPlus className="w-6 h-6" />,
      streak: <HiOutlineFire className="w-6 h-6" />,
      calendar: <HiOutlineCalendar className="w-6 h-6" />,
    };
    return icons[icon] || <HiOutlineMegaphone className="w-6 h-6" />
  }

  const filteredTasks = activeTab === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === activeTab || (activeTab === 'social' && t.category === 'referral'));

  const progressPercentage = (userData.userPoints / userData.nextLevelPoints) * 100;

  return (
    <div className={`${exo.variable} font-sans min-h-screen bg-gray-50/50 pb-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8 md:mb-12 text-center md:text-left">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
          >
            Rewards Playground
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 max-w-2xl"
          >
            Complete quests, earn $BTS, and climb the leaderboard to unlock exclusive rewards.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Column: Stats & Leaderboard */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* User Stats Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-[#81D7B4]/10 border border-[#81D7B4]/20 relative overflow-hidden w-full"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#81D7B4]/20 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Current Level</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 pr-4">
                    <span className="text-xl font-extrabold text-gray-900 whitespace-nowrap">Level {userData.level}</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#81D7B4] to-[#6BC4A0] flex items-center justify-center text-white shadow-lg shadow-[#81D7B4]/30 flex-shrink-0">
                  <HiOutlineTrophy className="w-6 h-6" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2 flex justify-between text-sm font-medium">
                <span className="text-[#2D5A4A]">{userData.userPoints} $BTS</span>
                <span className="text-gray-400">{userData.nextLevelPoints} $BTS</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#81D7B4] to-[#4FB38B] rounded-full shadow-[0_0_10px_rgba(129,215,180,0.5)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 text-center">
                  <div className="text-gray-400 text-xs font-bold uppercase mb-1">Rank</div>
                  <div className="text-xl font-bold text-gray-900">#{userData.rank}</div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 text-center">
                  <div className="text-gray-400 text-xs font-bold uppercase mb-1">Quests</div>
                  <div className="text-xl font-bold text-gray-900">{tasks.filter(t => t.isCompleted).length}/{tasks.length}</div>
                </div>
              </div>
            </motion.div>

            {/* Mini Leaderboard */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <HiOutlineStar className="w-5 h-5 text-yellow-500" />
                  Top Earners
                </h3>
                {MOCK_LEADERBOARD.length > 0 && (
                  <Link href="#" className="text-xs font-bold text-[#81D7B4] hover:underline">View All</Link>
                )}
              </div>
              
              <div className="space-y-4">
                {MOCK_LEADERBOARD.length > 0 ? (
                  MOCK_LEADERBOARD.map((user, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${user.name === 'You' ? 'bg-[#81D7B4]/10 border border-[#81D7B4]/20' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full ${idx < 3 ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500'}`}>
                          {user.rank}
                        </div>
                        <div className="text-sm font-medium text-gray-900 font-mono">{user.name}</div>
                      </div>
                      <div className="text-sm font-bold text-gray-600">{user.points} $BTS</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <p>No earning activity</p>
                    <p className="text-xs mt-1">Be the first to earn $BTS!</p>
                  </div>
                )}
              </div>
            </motion.div>

          </div>

          {/* Right Column: Quests */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {['all', 'social', 'saving'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${
                    activeTab === tab 
                      ? 'bg-[#81D7B4] text-white shadow-lg shadow-[#81D7B4]/30' 
                      : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                  }`}
                >
                  {tab} Quests
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode='popLayout'>
                {filteredTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group"
                  >
                    <Link href={task.href} target={task.href.startsWith('http') ? '_blank' : '_self'}>
                      <div className={`h-full bg-white rounded-2xl border-2 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden ${
                        task.isCompleted 
                          ? 'border-gray-100 opacity-75 grayscale-[0.5]' 
                          : 'border-transparent hover:border-[#81D7B4]/50 shadow-sm'
                      }`}>
                        {/* Difficulty Badge */}
                        {!task.isCompleted && (
                          <div className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border ${
                            task.difficulty === 'easy' ? 'bg-green-50 text-green-600 border-green-100' :
                            task.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                            'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {task.difficulty}
                          </div>
                        )}

                        {task.isCompleted && (
                          <div className="absolute top-4 right-4 text-[#81D7B4]">
                            <HiOutlineCheckCircle className="w-6 h-6" />
                          </div>
                        )}
                        
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                            task.isCompleted ? 'bg-gray-100 text-gray-400' : 'bg-[#81D7B4]/10 text-[#2D5A4A]'
                          }`}>
                            <TaskIcon icon={task.icon} />
                          </div>
                        </div>

                        <h3 className={`font-bold text-lg mb-2 ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 min-h-[40px]">
                          {task.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2">
                            <HiOutlineCurrencyDollar className={`w-4 h-4 ${task.isCompleted ? 'text-gray-400' : 'text-yellow-500'}`} />
                            <span className={`font-bold ${task.isCompleted ? 'text-gray-400' : 'text-gray-900'}`}>
                              {task.points} $BTS
                            </span>
                          </div>
                          
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            task.isCompleted ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 text-gray-400 group-hover:bg-[#81D7B4] group-hover:text-white'
                          }`}>
                            <HiOutlineArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Locked/Future Content Teaser - Redesigned Light Version */}
            <div className="bg-white rounded-3xl p-8 text-center relative overflow-hidden group cursor-pointer border-2 border-[#81D7B4]/20 hover:border-[#81D7B4]/50 transition-all shadow-sm hover:shadow-lg">
              {/* Accent Edges */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#81D7B4]/20 to-transparent rounded-br-full -ml-4 -mt-4"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#81D7B4]/20 to-transparent rounded-tl-full -mr-4 -mb-4"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#81D7B4]/10 flex items-center justify-center mb-4 border border-[#81D7B4]/20">
                  <HiOutlineLockClosed className="w-8 h-8 text-[#81D7B4]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">More Quests Coming Soon</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  We're preparing new challenges for you to earn more rewards. Stay tuned!
                </p>
                <button className="px-6 py-2 rounded-full bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold text-sm transition-all shadow-md shadow-[#81D7B4]/20">
                  Coming Soon
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
