'use client';

import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ 
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
      twitter: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>,
      farcaster: <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 10.5C21.5 9.67157 20.8284 9 20 9H12C11.1716 9 10.5 9.67157 10.5 10.5V21.5C10.5 22.3284 11.1716 23 12 23H20C20.8284 23 21.5 22.3284 21.5 21.5V10.5Z" fill="currentColor"/><path d="M16 13.5C17.3807 13.5 18.5 14.6193 18.5 16C18.5 17.3807 17.3807 18.5 16 18.5C14.6193 18.5 13.5 17.3807 13.5 16C13.5 14.6193 14.6193 13.5 16 13.5Z" fill="white"/></svg>,
      email: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>,
      tweet: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
      cast: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      referral: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.5a9 9 0 0118 0" /></svg>,
      streak: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
      calendar: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    }
    return icons[icon] || null
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-white via-[#81D7B4]/5 to-white ${spaceGrotesk.variable} font-sans`}>
      {/* Enhanced Background Elements with Neomorphism */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs with glassmorphism */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-[#81D7B4]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-[#81D7B4]/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-bl from-purple-400/8 to-pink-400/8 rounded-full blur-2xl animate-pulse delay-500"></div>
        
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{
          backgroundImage: `url('/noise.jpg')`,
          backgroundSize: '200px 200px',
          backgroundRepeat: 'repeat'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-10">
        {/* Earn $BTS Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-20"
        >
          {/* Neomorphic container with enhanced glassmorphism */}
          <div className="relative bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-[#81D7B4]/20 shadow-[0_8px_32px_0_rgba(129,215,180,0.15)] overflow-hidden">
            {/* Enhanced background patterns */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/8 via-[#81D7B4]/4 to-[#81D7B4]/2"></div>
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#81D7B4]/15 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-[#81D7B4]/10 to-transparent rounded-full blur-2xl"></div>
            
            {/* Inner shadow for neomorphism */}
            <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] bg-gradient-to-br from-white/30 to-white/10 pointer-events-none"></div>
            
            <div className="relative p-4 sm:p-6 md:p-8 lg:p-16">
              <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#81D7B4] via-[#6BC5A0] to-[#5AB08A] bg-clip-text text-transparent mb-4 sm:mb-6 tracking-tight"
                >
                  Earn $BTS
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-base sm:text-lg md:text-xl text-[#2D7A5A] max-w-3xl mx-auto leading-relaxed"
                >
                  Complete these tasks to earn points and unlock exclusive rewards in the BitSave ecosystem
                </motion.p>
              </div>

              {/* Todo List Layout */}
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
                      <div className={`relative bg-white/95 backdrop-blur-sm rounded-2xl border transition-all duration-300 p-3 sm:p-4 md:p-6 ${
                        task.isCompleted 
                          ? 'border-[#81D7B4]/50 shadow-[0_4px_20px_rgba(129,215,180,0.2)] bg-gradient-to-r from-[#81D7B4]/8 to-white/95' 
                          : 'border-[#81D7B4]/20 shadow-[0_2px_10px_rgba(129,215,180,0.08)] hover:border-[#81D7B4]/40 hover:shadow-[0_4px_20px_rgba(129,215,180,0.15)]'
                      } group-hover:-translate-y-1`}>
                        
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
                                    ? 'bg-[#81D7B4]/25 text-[#81D7B4] shadow-lg' 
                                    : 'bg-[#81D7B4]/10 text-[#5AB08A] group-hover:bg-[#81D7B4]/20 group-hover:text-[#81D7B4] shadow-md'
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
                                className={`font-bold text-base mb-1 transition-all duration-300 ${
                                  task.isCompleted 
                                    ? 'text-[#2D7A5A] line-through decoration-[#81D7B4]/50' 
                                    : 'text-[#3A8B63] group-hover:text-[#2D7A5A]'
                                }`}
                                whileHover={{ x: 2 }}
                              >
                                {task.title}
                              </motion.h3>
                              <p className={`text-xs leading-relaxed transition-colors duration-300 ${
                                task.isCompleted 
                                  ? 'text-[#5AB08A]' 
                                  : 'text-[#6BC5A0] group-hover:text-[#5AB08A]'
                              }`}>
                                {task.description}
                              </p>
                            </div>
                          </div>

                          {/* Points and Status Row */}
                          <div className="flex items-center justify-between gap-2 ml-8">
                            <div className="flex items-center gap-2">
                              <motion.div
                                className={`font-bold text-sm transition-all duration-300 ${
                                  task.isCompleted 
                                    ? 'text-[#2D7A5A]' 
                                    : 'text-[#5AB08A] group-hover:text-[#2D7A5A]'
                                }`}
                                whileHover={{ scale: 1.05 }}
                              >
                                +{task.points} {task.points > 1 ? 'pts' : 'pt'}
                              </motion.div>

                              <motion.div
                                className={`px-2 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                                  task.isCompleted 
                                    ? 'text-[#2D7A5A] bg-[#81D7B4]/25 border border-[#81D7B4]/40' 
                                    : 'text-[#5AB08A] bg-[#81D7B4]/10 border border-[#81D7B4]/20 group-hover:text-[#2D7A5A] group-hover:bg-[#81D7B4]/20 group-hover:border-[#81D7B4]/30'
                                }`}
                                whileHover={{ scale: 1.05 }}
                              >
                                {task.isCompleted ? 'Done' : 'To Do'}
                              </motion.div>
                            </div>

                            <motion.div 
                              className={`p-1.5 rounded-lg transition-all duration-300 ${
                                task.isCompleted 
                                  ? 'text-[#81D7B4] bg-[#81D7B4]/10' 
                                  : 'text-gray-400 group-hover:text-[#81D7B4] group-hover:bg-[#81D7B4]/10'
                              }`}
                              whileHover={{ x: 3, scale: 1.1 }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
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
                                  ? 'bg-[#81D7B4]/25 text-[#81D7B4] shadow-lg' 
                                  : 'bg-[#81D7B4]/10 text-[#5AB08A] group-hover:bg-[#81D7B4]/20 group-hover:text-[#81D7B4] shadow-md'
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
                                  className={`font-bold text-lg mb-2 transition-all duration-300 ${
                                    task.isCompleted 
                                      ? 'text-[#2D7A5A] line-through decoration-[#81D7B4]/50' 
                                      : 'text-[#3A8B63] group-hover:text-[#2D7A5A]'
                                  }`}
                                  whileHover={{ x: 2 }}
                                >
                                  {task.title}
                                </motion.h3>
                                <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                                  task.isCompleted 
                                    ? 'text-[#5AB08A]' 
                                    : 'text-[#6BC5A0] group-hover:text-[#5AB08A]'
                                }`}>
                                  {task.description}
                                </p>
                              </div>

                              {/* Points and Status */}
                              <div className="flex items-center gap-4 flex-shrink-0">
                                <motion.div
                                  className={`font-bold text-lg transition-all duration-300 ${
                                    task.isCompleted 
                                      ? 'text-[#2D7A5A]' 
                                      : 'text-[#5AB08A] group-hover:text-[#2D7A5A]'
                                  }`}
                                  whileHover={{ scale: 1.05 }}
                                >
                                  +{task.points} {task.points > 1 ? 'pts' : 'pt'}
                                </motion.div>

                                <motion.div
                                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                                    task.isCompleted 
                                      ? 'text-[#2D7A5A] bg-[#81D7B4]/25 border border-[#81D7B4]/40' 
                                      : 'text-[#5AB08A] bg-[#81D7B4]/10 border border-[#81D7B4]/20 group-hover:text-[#2D7A5A] group-hover:bg-[#81D7B4]/20 group-hover:border-[#81D7B4]/30'
                                  }`}
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {task.isCompleted ? 'Completed' : 'To Do'}
                                </motion.div>

                                <motion.div 
                                  className={`p-2 rounded-lg transition-all duration-300 ${
                                    task.isCompleted 
                                      ? 'text-[#81D7B4] bg-[#81D7B4]/10' 
                                      : 'text-gray-400 group-hover:text-[#81D7B4] group-hover:bg-[#81D7B4]/10'
                                  }`}
                                  whileHover={{ x: 3, scale: 1.1 }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                  </svg>
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