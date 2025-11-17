'use client';

import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
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
}

// Mock data for demonstration
const MOCK_USER_DATA = {
  hasSavingsPlan: true,
  hasConnectedX: true,
  hasConnectedFarcaster: true,
  hasEmail: true,
  userPoints: 0,
  referralLink: 'https://bitsave.io/ref/123xyz',
};

export default function ActivityPage() {
  const [userData] = useState(MOCK_USER_DATA);

  // Modern, neat points header
  const PointsHeader = () => (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-[#81D7B4]/30 bg-[#81D7B4]/10 shadow-sm px-5 py-4">
      <div className="h-8 w-8 rounded-xl bg-[#81D7B4] text-white flex items-center justify-center">
        <HiOutlineFire className="h-5 w-5" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs text-[#2D5A4A]">Points</span>
        <span className="text-2xl font-semibold tracking-tight text-[#2D5A4A]">{userData.userPoints}</span>
      </div>
    </div>
  );

  const tasks: Task[] = [
    {
      id: 'tweet_after_saving',
      title: 'Tweet after Saving',
      description: 'Get 1 point for the tweet you send after creating a new savings plan.',
      points: 1,
      isCompleted: false,
      href: '/dashboard/create-savings',
      icon: 'tweet',
    },
    {
      id: 'connect_x',
      title: 'Connect X (Twitter)',
      description: 'Link your X account to earn points and unlock social features.',
      points: 1,
      isCompleted: false,
      href: '/dashboard/settings',
      icon: 'twitter',
    },
    {
      id: 'connect_farcaster',
      title: 'Connect Farcaster',
      description: 'Link your Farcaster account for onchain perks and rewards.',
      points: 1,
      isCompleted: false,
      href: '/dashboard/settings',
      icon: 'farcaster',
    },
    {
      id: 'add_email',
      title: 'Add Email Address',
      description: 'Secure your account and get important notifications.',
      points: 1,
      isCompleted: false,
      href: '/dashboard/settings',
      icon: 'email',
    },
    {
      id: 'tweet_about_bitsave',
      title: 'Tweet about BitSave',
      description: 'Share your experience with BitSave on X.',
      points: 5,
      isCompleted: false,
      href: `https://twitter.com/intent/tweet?text=Exploring%20the%20world%20of%20DeFi%20savings%20with%20@bitsaveprotocol!%20%23SaveFi%20%23Web3&url=${userData.referralLink}`,
      icon: 'tweet',
    },
    {
      id: 'cast_about_bitsave',
      title: 'Cast about BitSave',
      description: 'Post about BitSave on Farcaster.',
      points: 5,
      isCompleted: false,
      href: `https://warpcast.com/~/compose?text=Exploring%20the%20world%20of%20DeFi%20savings%20with%20@bitsave!%20&embeds[]=${userData.referralLink}`,
      icon: 'cast',
    },
    {
      id: 'referral_signup',
      title: 'Refer a Friend',
      description: 'Earn points for every friend who signs up using your link.',
      points: 5,
      isCompleted: false,
      href: '/dashboard/settings',
      icon: 'referral',
    },
    {
      id: 'complete_plan',
      title: 'Complete a Savings Plan',
      description: 'Reach your savings goal to earn a streak bonus.',
      points: 10,
      isCompleted: false,
      href: '/dashboard/plans',
      icon: 'streak',
    },
    {
      id: 'weekly_saving',
      title: '4-Week Saving Streak',
      description: 'Save consistently every week for a month.',
      points: 10,
      isCompleted: false,
      href: '/dashboard/plans',
      icon: 'calendar',
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

  return (
    <div className={`${exo.variable} font-sans min-h-screen bg-white`}>
      {/* Background removed for a cleaner layout */}

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-10">
        {/* Earn $BTS Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-20"
        >
          {/* Clean container for hero section - removed background card */}
          <div className="relative px-2 sm:px-3 md:px-6 lg:px-8">
            <div className="relative">
              <div className="text-center mb-8 md:mb-12">
                <motion.h2 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-3xl md:text-5xl font-semibold text-[#81D7B4] tracking-tight"
                >
                  Earn $BTS
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
                >
                  Complete simple tasks to earn points and unlock rewards.
                </motion.p>
                <div className="mt-6">
                  <PointsHeader />
                </div>
              </div>

              {/* Tasks List */}
              <div className="max-w-4xl mx-auto space-y-4">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.1 * index,
                      ease: "easeOut"
                    }}
                    className="group"
                  >
                    <Link href={task.href || '#'} target={task.href?.startsWith('http') ? '_blank' : '_self'}>
                      <div className={`relative bg-white/90 backdrop-blur-sm rounded-xl border transition-all duration-300 p-4 md:p-5 ${
                        task.isCompleted 
                          ? 'border-[#81D7B4]/40 shadow-sm bg-[#81D7B4]/5' 
                          : 'border-gray-200/60 shadow-sm hover:border-[#81D7B4]/50 hover:shadow-md'
                      }`}>
                        
                        {/* Mobile Layout (Stacked) */}
                        <div className="block sm:hidden">
                          <div className="flex items-start gap-3 mb-3">
                            {/* Checkbox/Status Indicator */}
                            <div className="flex-shrink-0 mt-1">
                              <motion.div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                  task.isCompleted 
                                    ? 'bg-[#81D7B4] border-[#81D7B4] shadow-[0_2px_8px_rgba(129,215,180,0.4)]' 
                                    : 'border-[#81D7B4]/40 group-hover:border-[#81D7B4]/70 bg-white'
                                }`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {task.isCompleted && (
                                  <motion.svg 
                                    className="w-2.5 h-2.5 text-white" 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                                  >
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </motion.svg>
                                )}
                              </motion.div>
                            </div>

                            {/* Task Icon */}
                            <div className="flex-shrink-0">
                              <motion.div 
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                  task.isCompleted 
                                    ? 'bg-[#81D7B4]/20 text-[#2D5A4A] border border-[#81D7B4]/30 shadow-md' 
                                    : 'bg-white text-[#2D5A4A] border border-[#81D7B4]/30 group-hover:bg-[#81D7B4]/20 group-hover:text-[#2D5A4A] shadow-md'
                                }`}
                                whileHover={{ scale: 1.05, rotate: 2 }}
                              >
                                <div className="scale-75">
                                  <TaskIcon icon={task.icon} />
                                </div>
                              </motion.div>
                            </div>

                            {/* Task Title and Description */}
                            <div className="flex-1 min-w-0">
                              <motion.h3 
                                className={`font-medium text-base mb-1 transition-all duration-300 ${
                                  task.isCompleted 
                                    ? 'text-[#81D7B4] line-through decoration-[#81D7B4]/40' 
                                    : 'text-[#81D7B4]'
                                }`}
                                whileHover={{ x: 2 }}
                              >
                                {task.title}
                              </motion.h3>
                              <p className={`text-xs leading-relaxed transition-colors duration-300 ${
                                task.isCompleted 
                                  ? 'text-gray-500' 
                                  : 'text-gray-600'
                              }`}>
                                {task.description}
                              </p>
                            </div>
                          </div>

                          {/* Points and Status Row */}
                          <div className="flex items-center justify-between gap-2 ml-8">
                            <div className="flex items-center gap-2">
                              <motion.div
                                className={`font-semibold text-sm transition-all duration-300 ${
                                  task.isCompleted 
                                    ? 'text-gray-700' 
                                    : 'text-[#2D5A4A]'
                                }`}
                                whileHover={{ scale: 1.05 }}
                              >
                                +{task.points} {task.points > 1 ? 'pts' : 'pt'}
                              </motion.div>

                              <motion.div
                                className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                                  task.isCompleted 
                                    ? 'text-[#2D5A4A] bg-[#81D7B4]/15 border border-[#81D7B4]/30' 
                                    : 'text-[#2D5A4A] bg-[#81D7B4]/10 border border-[#81D7B4]/20'
                                }`}
                                whileHover={{ scale: 1.05 }}
                              >
                                {task.isCompleted ? 'Done' : 'To Do'}
                              </motion.div>
                            </div>

                            <motion.div 
                              className={`p-1.5 rounded-lg transition-all duration-300 ${
                                task.isCompleted 
                                  ? 'text-[#2D5A4A] bg-white border border-[#81D7B4]/30' 
                                  : 'text-[#2D5A4A] group-hover:bg-[#81D7B4]/20 group-hover:text-[#2D5A4A]'
                              }`}
                              whileHover={{ x: 3, scale: 1.1 }}
                            >
                              <HiOutlineArrowRight className="h-3 w-3" />
                            </motion.div>
                          </div>
                        </div>

                        {/* Desktop Layout (Horizontal) */}
                        <div className="hidden sm:flex items-center gap-3 sm:gap-4 md:gap-6">
                          {/* Checkbox/Status Indicator */}
                          <div className="flex-shrink-0">
                            <motion.div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                task.isCompleted 
                                  ? 'bg-[#81D7B4] border-[#81D7B4] shadow-[0_2px_8px_rgba(129,215,180,0.4)]' 
                                  : 'border-[#81D7B4]/40 group-hover:border-[#81D7B4]/70 bg-white'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {task.isCompleted && (
                                <motion.svg 
                                  className="w-3 h-3 text-white" 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                                >
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </motion.svg>
                              )}
                            </motion.div>
                          </div>

                          {/* Task Icon */}
                          <div className="flex-shrink-0">
                            <motion.div 
                              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                task.isCompleted 
                                  ? 'bg-[#81D7B4]/20 text-[#2D5A4A] border border-[#81D7B4]/30' 
                                  : 'bg-white text-[#2D5A4A] border border-[#81D7B4]/30 group-hover:bg-[#81D7B4]/20 group-hover:text-[#2D5A4A]'
                              }`}
                              whileHover={{ scale: 1.05, rotate: 2 }}
                            >
                              <TaskIcon icon={task.icon} />
                            </motion.div>
                          </div>

                          {/* Task Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <motion.h3 
                                  className={`font-medium text-lg mb-1 transition-all duration-300 ${
                                    task.isCompleted 
                                      ? 'text-[#81D7B4] line-through decoration-[#81D7B4]/40' 
                                      : 'text-[#81D7B4]'
                                  }`}
                                  whileHover={{ x: 2 }}
                                >
                                  {task.title}
                                </motion.h3>
                                <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                                  task.isCompleted 
                                    ? 'text-gray-500' 
                                    : 'text-gray-600'
                                }`}>
                                  {task.description}
                                </p>
                              </div>

                              {/* Points and Status */}
                              <div className="flex items-center gap-4 flex-shrink-0">
                                <motion.div
                                  className={`font-semibold text-base transition-all duration-300 ${
                                    task.isCompleted 
                                      ? 'text-gray-700' 
                                      : 'text-[#2D5A4A]'
                                  }`}
                                  whileHover={{ scale: 1.05 }}
                                >
                                  +{task.points} {task.points > 1 ? 'pts' : 'pt'}
                                </motion.div>

                                <motion.div
                                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                                    task.isCompleted 
                                      ? 'text-[#2D5A4A] bg-[#81D7B4]/15 border border-[#81D7B4]/30' 
                                      : 'text-[#2D5A4A] bg-[#81D7B4]/10 border border-[#81D7B4]/20'
                                  }`}
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {task.isCompleted ? 'Completed' : 'To Do'}
                                </motion.div>

                                <motion.div 
                                  className={`p-2 rounded-lg transition-all duration-300 ${
                                    task.isCompleted 
                                      ? 'text-[#2D5A4A] bg-white border border-[#81D7B4]/30' 
                                      : 'text-[#2D5A4A] group-hover:bg-[#81D7B4]/20 group-hover:text-[#2D5A4A]'
                                  }`}
                                  whileHover={{ x: 3, scale: 1.1 }}
                                >
                                  <HiOutlineArrowRight className="h-4 w-4" />
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              

            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}