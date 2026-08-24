'use client';

import { 
  Calendar01Icon, UserAdd01Icon, Award01Icon, Dollar01Icon, Tick01Icon, 
  NewTwitterIcon, Mail01Icon, Rocket01Icon, FireIcon, StarIcon, 
  TelegramIcon, Wallet01Icon, UserMultiple02Icon, Certificate01Icon,
  CheckmarkCircle02Icon, ArrowRight01Icon, SparklesIcon
} from "hugeicons-react";
import { useState, useEffect, ReactNode, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useSavingsData } from '@/hooks/useSavingsData';
import { useReferrals } from '@/lib/useReferrals';

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  isCompleted: boolean;
  href: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'social' | 'saving' | 'referral';
  isExternal?: boolean;
}

export default function ActivityPage() {
  const { address } = useAccount();
  const { user } = usePrivy();
  const { savingsData } = useSavingsData();
  const { referralData } = useReferrals();
  
  const [activeTab, setActiveTab] = useState<'all' | 'social' | 'saving' | 'referral'>('all');
  const [topEarners, setTopEarners] = useState<Array<{ name: string; rank: number; points: number; isCurrentUser: boolean }>>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [persistedQuests, setPersistedQuests] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Fetch completed quests from API & local storage
  useEffect(() => {
    if (!address) return;
    
    // Load optimistic cache from localStorage
    try {
      const local = localStorage.getItem(`bitsave_quests_${address.toLowerCase()}`);
      if (local) {
        setPersistedQuests(JSON.parse(local));
      }
    } catch {}

    // Fetch from MongoDB
    fetch(`/api/quests?walletAddress=${address.toLowerCase()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.completedQuests)) {
          setPersistedQuests(prev => [...new Set([...prev, ...data.completedQuests])]);
          try {
            localStorage.setItem(`bitsave_quests_${address.toLowerCase()}`, JSON.stringify(data.completedQuests));
          } catch {}
        }
      })
      .catch(() => {});
  }, [address]);

  // 2. Fetch Leaderboard & user rank
  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.slice(0, 5).map((u: any, idx: number) => {
            const isCurrent = address && u.useraddress?.toLowerCase() === address.toLowerCase();
            const displayName = u.savvyName 
              ? `@${u.savvyName}` 
              : isCurrent 
                ? 'You' 
                : `${u.useraddress.slice(0, 6)}...${u.useraddress.slice(-4)}`;
            
            const totalAmount = typeof u.totalamount === 'number' ? u.totalamount : parseFloat(u.totalamount || '0');
            return {
              name: displayName,
              rank: idx + 1,
              points: Math.floor(totalAmount * 10),
              isCurrentUser: !!isCurrent
            };
          });
          setTopEarners(formatted);

          if (address) {
            const userIndex = data.findIndex((u: any) => u.useraddress?.toLowerCase() === address.toLowerCase());
            if (userIndex !== -1) {
              setUserRank(userIndex + 1);
            } else {
              setUserRank(null);
            }
          }
        }
      })
      .catch(() => {});
  }, [address]);

  // 3. Automated On-Chain & Account Milestones Verification
  const hasSavingsPlan = useMemo(() => {
    return (savingsData.currentPlans && savingsData.currentPlans.length > 0) || 
           (savingsData.completedPlans && savingsData.completedPlans.length > 0) || 
           (savingsData.deposits && savingsData.deposits > 0);
  }, [savingsData]);

  const totalSavedNum = useMemo(() => {
    return parseFloat(savingsData.totalLocked?.replace(/[^0-9.-]+/g, '') || '0') || 0;
  }, [savingsData.totalLocked]);

  const hasSaved100 = totalSavedNum >= 100;
  
  const hasConnectedX = useMemo(() => {
    return !!(user?.twitter?.username || user?.linkedAccounts?.some((a: any) => a.type === 'twitter_oauth' || a.type === 'twitter'));
  }, [user]);

  const hasEmail = useMemo(() => {
    return !!(user?.email?.address || user?.linkedAccounts?.some((a: any) => a.type === 'email'));
  }, [user]);

  const hasCompletedPlan = useMemo(() => {
    return !!(savingsData.completedPlans && savingsData.completedPlans.length > 0);
  }, [savingsData.completedPlans]);

  const referralCount = referralData?.stats?.totalConversions || 0;
  const referralLink = referralData?.referralLink || `https://bitsave.io/ref/${address ? address.slice(2, 8) : 'savvy'}`;

  // Complete quest helper (persists to API & state)
  const handleCompleteQuest = async (questId: string, questTitle: string, questPoints: number) => {
    if (persistedQuests.includes(questId)) return;

    const updated = [...persistedQuests, questId];
    setPersistedQuests(updated);

    if (address) {
      try {
        localStorage.setItem(`bitsave_quests_${address.toLowerCase()}`, JSON.stringify(updated));
        await fetch('/api/quests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address.toLowerCase(), questId })
        });
      } catch {}
    }

    setToastMessage(`🎉 Quest Completed: +${questPoints} $BTS earned!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 4. Quests List Definition
  const tasks: Task[] = [
    {
      id: 'create_first_plan',
      title: 'Create your First Plan',
      description: 'Kick off your journey by creating a verified on-chain savings plan.',
      points: 5,
      isCompleted: hasSavingsPlan || persistedQuests.includes('create_first_plan'),
      href: '/dashboard',
      icon: 'wallet',
      difficulty: 'easy',
      category: 'saving',
      isExternal: false
    },
    {
      id: 'save_100_usd',
      title: 'Save your first $100',
      description: 'Hit the $100 milestone in your total active savings balance.',
      points: 15,
      isCompleted: hasSaved100 || persistedQuests.includes('save_100_usd'),
      href: '/dashboard/plans',
      icon: 'milestone',
      difficulty: 'medium',
      category: 'saving',
      isExternal: false
    },
    {
      id: 'complete_plan',
      title: 'Complete a Savings Plan',
      description: 'Reach maturity and complete a savings plan successfully.',
      points: 10,
      isCompleted: hasCompletedPlan || persistedQuests.includes('complete_plan'),
      href: '/dashboard/plans',
      icon: 'streak',
      difficulty: 'hard',
      category: 'saving',
      isExternal: false
    },
    {
      id: 'weekly_saving',
      title: '4-Week Streak',
      description: 'Save consistently across 4 separate weeks on any supported chain.',
      points: 10,
      isCompleted: persistedQuests.includes('weekly_saving') || (savingsData.deposits >= 2),
      href: '/dashboard/plans',
      icon: 'calendar',
      difficulty: 'medium',
      category: 'saving',
      isExternal: false
    },
    {
      id: 'connect_x',
      title: 'Connect X (Twitter)',
      description: 'Link your X profile to unlock community quests.',
      points: 1,
      isCompleted: hasConnectedX || persistedQuests.includes('connect_x'),
      href: '/dashboard/settings',
      icon: 'twitter',
      difficulty: 'easy',
      category: 'social',
      isExternal: false
    },
    {
      id: 'tweet_about_bitsave',
      title: 'Shoutout on X',
      description: 'Share BitSave with your followers and earn instant $BTS.',
      points: 5,
      isCompleted: persistedQuests.includes('tweet_about_bitsave'),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Building sustainable financial discipline with @bitsaveprotocol! 🚀 Save in stablecoins and earn real yield. #SaveFi #Web3')}&url=${encodeURIComponent(referralLink)}`,
      icon: 'tweet',
      difficulty: 'easy',
      category: 'social',
      isExternal: true
    },
    {
      id: 'tweet_after_saving',
      title: 'Tweet after Saving',
      description: 'Share your savings milestone with the world.',
      points: 1,
      isCompleted: (hasSavingsPlan && hasConnectedX) || persistedQuests.includes('tweet_after_saving'),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Just locked in another milestone on @bitsaveprotocol! 💰 Saving for my future on-chain. #BitSave')}&url=${encodeURIComponent(referralLink)}`,
      icon: 'tweet',
      difficulty: 'easy',
      category: 'social',
      isExternal: true
    },
    {
      id: 'join_telegram',
      title: 'Join our Telegram',
      description: 'Hang out with the BitSave community and get early alpha.',
      points: 2,
      isCompleted: persistedQuests.includes('join_telegram'),
      href: 'https://t.me/bitsave',
      icon: 'telegram',
      difficulty: 'easy',
      category: 'social',
      isExternal: true
    },
    {
      id: 'add_email',
      title: 'Add Email Address',
      description: 'Receive maturity notifications and monthly yield summaries.',
      points: 1,
      isCompleted: hasEmail || persistedQuests.includes('add_email'),
      href: '/dashboard/settings',
      icon: 'email',
      difficulty: 'easy',
      category: 'social',
      isExternal: false
    },
    {
      id: 'referral_signup',
      title: 'Refer a Friend',
      description: 'Earn $BTS rewards when a friend joins using your referral link.',
      points: 5,
      isCompleted: referralCount >= 1 || persistedQuests.includes('referral_signup'),
      href: '/dashboard/referrals',
      icon: 'referral',
      difficulty: 'medium',
      category: 'referral',
      isExternal: false
    },
    {
      id: 'refer_3_friends',
      title: 'Refer 3 Friends',
      description: 'Invite 3 savers to join the decentralized savings movement.',
      points: 30,
      isCompleted: referralCount >= 3 || persistedQuests.includes('refer_3_friends'),
      href: '/dashboard/referrals',
      icon: 'users',
      difficulty: 'hard',
      category: 'referral',
      isExternal: false
    },
    {
      id: 'buy_bizyield',
      title: 'Explore BizSwap & Yields',
      description: 'Discover additional yield strategies and certificate opportunities.',
      points: 50,
      isCompleted: persistedQuests.includes('buy_bizyield'),
      href: '/dashboard/ramp',
      icon: 'certificate',
      difficulty: 'hard',
      category: 'saving',
      isExternal: false
    }
  ];

  // 5. Total Computed $BTS Points & Accurate Level Progress
  const totalUserPoints = useMemo(() => {
    return tasks
      .filter(t => t.isCompleted)
      .reduce((sum, t) => sum + t.points, 0);
  }, [tasks]);

  const POINTS_PER_LEVEL = 25;
  const currentLevel = Math.floor(totalUserPoints / POINTS_PER_LEVEL) + 1;
  const pointsIntoCurrentLevel = totalUserPoints % POINTS_PER_LEVEL;
  const pointsToNextLevel = POINTS_PER_LEVEL - pointsIntoCurrentLevel;
  const levelProgressPercentage = Math.min(100, Math.round((pointsIntoCurrentLevel / POINTS_PER_LEVEL) * 100));
  const completedTasksCount = tasks.filter(t => t.isCompleted).length;

  const filteredTasks = activeTab === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === activeTab);

  const TaskIcon = ({ icon, className = "w-5 h-5" }: { icon: string, className?: string }) => {
    const icons: { [key: string]: ReactNode } = {
      twitter: <NewTwitterIcon className={className} />,
      telegram: <TelegramIcon className={className} />,
      email: <Mail01Icon className={className} />,
      tweet: <Rocket01Icon className={className} />,
      referral: <UserAdd01Icon className={className} />,
      streak: <FireIcon className={className} />,
      calendar: <Calendar01Icon className={className} />,
      wallet: <Wallet01Icon className={className} />,
      milestone: <Award01Icon className={className} />,
      certificate: <Certificate01Icon className={className} />,
      users: <UserMultiple02Icon className={className} />,
    };
    return icons[icon] || <StarIcon className={className} />;
  };

  return (
    <div className="w-full font-sans min-h-screen pb-24">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-[99999] bg-[#81D7B4] text-gray-900 font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-white/40"
          >
            <SparklesIcon className="w-5 h-5 text-gray-900 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-2 sm:px-4">
        
        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white font-instrument tracking-tight">
            Earn $BTS
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Complete quests, level up your saver profile, and earn $BTS reward points.
          </p>
        </div>

        {/* Full Width Hero Stats Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-[#121212] rounded-[32px] p-6 sm:p-10 shadow-sm border border-gray-200/70 dark:border-white/10 relative overflow-hidden w-full backdrop-blur-xl mb-10"
        >
          {/* Subtle Ambient Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/10 via-transparent to-[#4FB38B]/5 pointer-events-none"></div>
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#81D7B4]/15 rounded-full blur-[90px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 sm:gap-10">
            
            {/* Left: Level & Status */}
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[28px] bg-gradient-to-br from-[#81D7B4]/20 to-[#81D7B4]/5 border border-[#81D7B4]/30 flex items-center justify-center text-[#81D7B4] shadow-[0_0_25px_rgba(129,215,180,0.2)] shrink-0">
                <Award01Icon className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <span className="text-[10px] font-black text-[#81D7B4] uppercase tracking-[0.2em] block mb-1">
                  Current Status
                </span>
                <div className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white font-instrument tracking-tight mb-1">
                  Level {currentLevel}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Climb the ranks and unlock exclusive protocol rewards.
                </p>
              </div>
            </div>

            {/* Right: Progress & Stats */}
            <div className="flex-grow w-full md:max-w-md lg:max-w-xl">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#81D7B4] font-black text-2xl font-instrument">{totalUserPoints}</span>
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">$BTS Earned</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 font-bold text-xs">
                  {pointsToNextLevel} pts to Level {currentLevel + 1}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-gray-100 dark:bg-black/60 rounded-full overflow-hidden mb-5 border border-gray-200/60 dark:border-white/5 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgressPercentage}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#81D7B4] to-[#4FB38B] rounded-full shadow-[0_0_12px_rgba(129,215,180,0.5)]"
                />
              </div>

              <div className="flex gap-8 sm:gap-12">
                <div>
                  <div className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                    Global Rank
                  </div>
                  <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-white font-instrument">
                    {userRank ? `#${userRank}` : 'Unranked'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                    Quests Done
                  </div>
                  <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-white font-instrument">
                    {completedTasksCount} / {tasks.length}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                    Progress
                  </div>
                  <div className="text-lg sm:text-xl font-black text-[#81D7B4] font-instrument">
                    {levelProgressPercentage}%
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Split Layout: Quests (Left) & Top Earners Sidebar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-10">
          
          {/* Main Area: Quests */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white font-instrument">
                Active Quests
              </h2>
              <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-200/60 dark:border-white/5 overflow-x-auto">
                {(['all', 'social', 'saving', 'referral'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === tab 
                        ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-xs' 
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Quests Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <AnimatePresence mode='popLayout'>
                {filteredTasks.map((task, index) => {
                  const isDone = task.isCompleted;

                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                      className="group"
                    >
                      <div className={`h-full bg-white dark:bg-[#161616] rounded-3xl border p-5 sm:p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[220px] ${
                        isDone 
                          ? 'border-[#81D7B4]/30 dark:border-[#81D7B4]/20 bg-[#81D7B4]/[0.02] shadow-xs' 
                          : 'border-gray-200/70 dark:border-white/10 hover:border-[#81D7B4]/50 shadow-sm hover:shadow-md'
                      }`}>
                        
                        {/* Background Watermark */}
                        <div className="absolute -bottom-4 -right-4 opacity-[0.03] dark:opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-500 pointer-events-none rotate-12">
                          <TaskIcon icon={task.icon} className="w-36 h-36 text-black dark:text-white" />
                        </div>

                        <div>
                          {/* Top Row: Icon & Status */}
                          <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-colors ${
                              isDone 
                                ? 'bg-[#81D7B4]/10 text-[#81D7B4] border-[#81D7B4]/30' 
                                : 'bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border-gray-200/60 dark:border-white/10 group-hover:border-[#81D7B4]/40 group-hover:text-[#81D7B4]'
                            }`}>
                              <TaskIcon icon={task.icon} className="w-5 h-5" />
                            </div>
                            
                            {isDone ? (
                              <div className="flex items-center gap-1 bg-[#81D7B4]/15 text-[#2D5A4A] dark:text-[#81D7B4] px-2.5 py-1 rounded-full text-[11px] font-bold border border-[#81D7B4]/30">
                                <CheckmarkCircle02Icon className="w-3.5 h-3.5" />
                                <span>Completed</span>
                              </div>
                            ) : (
                              <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                                task.difficulty === 'easy' ? 'bg-[#81D7B4]/10 text-[#81D7B4] border-[#81D7B4]/20' :
                                task.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                                'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                              }`}>
                                {task.difficulty}
                              </div>
                            )}
                          </div>

                          {/* Middle: Title & Description */}
                          <div className="relative z-10 mb-4">
                            <h3 className={`font-bold text-base sm:text-lg mb-1 tracking-tight ${isDone ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                              {task.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                              {task.description}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Row: Points & Action Button */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5 relative z-10">
                          <div className="flex items-baseline gap-1">
                            <span className="font-instrument font-black text-2xl text-[#81D7B4]">{task.points}</span>
                            <span className="text-xs font-bold text-gray-400">$BTS</span>
                          </div>

                          {isDone ? (
                            <span className="text-xs font-bold text-[#81D7B4] flex items-center gap-1">
                              <Tick01Icon className="w-4 h-4" /> Earned
                            </span>
                          ) : (
                            <Link
                              href={task.href}
                              target={task.isExternal ? '_blank' : '_self'}
                              onClick={() => {
                                if (task.isExternal) {
                                  handleCompleteQuest(task.id, task.title, task.points);
                                }
                              }}
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#81D7B4] text-white font-bold text-xs hover:opacity-90 transition-all shadow-xs cursor-pointer"
                            >
                              <span>{task.isExternal ? 'Start Quest' : 'Go to Quest'}</span>
                              <ArrowRight01Icon className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar: Top Earners & Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Mini Leaderboard Card */}
            <motion.div 
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#121212] rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200/70 dark:border-white/10 w-full backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></span>
                  Top Earners
                </h3>
                <Link 
                  href="/dashboard/leaderboard" 
                  className="text-xs font-bold text-[#81D7B4] hover:underline"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-2">
                {topEarners.length > 0 ? (
                  topEarners.map((user, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                        user.isCurrentUser 
                          ? 'bg-[#81D7B4]/10 border border-[#81D7B4]/30' 
                          : 'bg-gray-50/70 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full shrink-0 ${
                          idx === 0 ? 'bg-[#81D7B4] text-white' : 
                          idx === 1 ? 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white' :
                          idx === 2 ? 'bg-amber-600/20 text-amber-700 dark:text-amber-300' :
                          'text-gray-400 dark:text-gray-500 bg-gray-200/50 dark:bg-white/5'
                        }`}>
                          {user.rank}
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                          {user.name}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-black text-[#81D7B4] shrink-0 pl-2">
                        {user.points.toLocaleString()} <span className="text-[10px] font-normal text-gray-400">pts</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                    <StarIcon className="w-7 h-7 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">No activity yet</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Monthly Community Info Card */}
            <div className="bg-white dark:bg-[#121212] rounded-3xl p-6 sm:p-7 border border-gray-200/70 dark:border-white/10 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 flex items-center justify-center text-[#81D7B4]">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rewards Tier</h4>
                  <h3 className="text-base font-black text-gray-900 dark:text-white font-instrument">$BTS Points</h3>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                $BTS points determine your tier in the protocol ecosystem. Earn points by creating savings plans, referring active savers, and participating in social quests.
              </p>

              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200/50 dark:border-white/5 flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                <span>Next Airdrop Snapshot</span>
                <span className="text-[#81D7B4] font-black">Monthly</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
