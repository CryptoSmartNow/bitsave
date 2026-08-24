'use client';

import { 
  Activity01Icon, Tick01Icon, UserMultipleIcon, BarChartIcon, 
  Dollar01Icon, LockKeyIcon, EyeIcon, Award01Icon, Rocket01Icon, 
  Share01Icon, Copy01Icon, SparklesIcon, CheckmarkCircle02Icon,
  NewTwitterIcon, TelegramIcon, HelpCircleIcon
} from "hugeicons-react";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReferrals } from '@/lib/useReferrals';
import { PageShimmer } from '@/components/ShimmerLoading';
import { useAccount } from 'wagmi';
import { useSavingsData } from '@/hooks/useSavingsData';
import Link from 'next/link';

export default function ReferralsPage() {
  const { address, isConnected } = useAccount();
  const { referralData, loading: referralsLoading, error, generateReferralCode, refreshReferralData } = useReferrals();
  const { savingsData, isLoading: savingsLoading } = useSavingsData();

  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setToastMessage('📋 Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleGenerateCode = async () => {
    await generateReferralCode();
    await refreshReferralData();
  };

  const totalSavings = parseFloat(savingsData?.totalLocked?.replace(/[^0-9.-]+/g, '') || '0') || 0;
  const isSavingsUnlocked = totalSavings >= 5;
  const isLoading = !mounted || (referralsLoading && !referralData && !error) || savingsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[60vh]">
        <PageShimmer className="pt-10" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full bg-white dark:bg-[#161616] rounded-3xl p-8 sm:p-10 text-center shadow-lg border border-gray-200/70 dark:border-white/10 relative overflow-hidden">
           <div className="w-16 h-16 bg-[#81D7B4]/15 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#81D7B4]">
             <UserMultipleIcon className="w-8 h-8" />
           </div>
           <h2 className="text-2xl font-black text-gray-900 dark:text-white font-instrument mb-2">Connect Wallet</h2>
           <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Connect your wallet to access your custom referral link and track your referral rewards.</p>
        </div>
      </div>
    );
  }

  const referralLink = referralData?.referralLink || `https://bitsave.io/ref/${address ? address.slice(2, 8) : 'savvy'}`;
  const tweetText = `I'm building financial discipline with @bitsaveprotocol! 🚀 Save in stablecoins and earn protocol rewards. Join with my referral link:`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(referralLink)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(tweetText)}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${tweetText} ${referralLink}`)}`;

  return (
    <div className="w-full font-sans min-h-screen pb-24 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-[99999] bg-[#81D7B4] text-white font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-white/30"
          >
            <SparklesIcon className="w-5 h-5 text-white" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-2 sm:px-4">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-instrument text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
            Referrals
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Invite friends to save on BitSave and earn $BTS points and protocol rewards.
          </p>
        </div>

        {/* Savings Activation Banner (if under $5) */}
        {!isSavingsUnlocked && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <LockKeyIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                  Activate Referral Multiplier
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Save at least <span className="font-bold text-gray-900 dark:text-white">$5.00</span> in any plan to activate maximum point multipliers for every referred friend.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-[#81D7B4] text-white font-bold text-xs rounded-xl hover:opacity-90 transition-all shadow-xs shrink-0 whitespace-nowrap"
            >
              Start Saving Now
            </Link>
          </motion.div>
        )}

        {/* Generate Link Prompt (if not yet generated) */}
        {!referralData?.referralCode && !referralData ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#161616] rounded-3xl p-8 sm:p-12 text-center border border-gray-200/70 dark:border-white/10 shadow-sm relative overflow-hidden mb-10"
          >
            <div className="w-16 h-16 bg-[#81D7B4]/15 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#81D7B4]">
              <Share01Icon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white font-instrument mb-2">
              Generate Your Referral Link
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
              Create your unique referral link to start earning <span className="font-bold text-[#81D7B4]">5 points</span> for every friend who creates their first savings plan.
            </p>
            <button
              onClick={handleGenerateCode}
              className="px-8 py-3 bg-[#81D7B4] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-xs cursor-pointer text-sm"
            >
              Generate Referral Link
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            
            {/* Top Row: Referral Link Card & Featured Reward */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Referral Link & Social Sharing */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-8 border border-gray-200/70 dark:border-white/10 shadow-sm relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#81D7B4]/15 flex items-center justify-center text-[#81D7B4]">
                      <Share01Icon className="w-5 h-5" />
                    </div>
                    <h2 className="font-instrument text-xl font-black text-gray-900 dark:text-white">
                      Your Referral Link
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Share this unique link to your community, friends, or socials to earn protocol rewards.
                  </p>
                  
                  {/* Link Input & Copy Button */}
                  <div className="flex flex-col sm:flex-row items-stretch gap-2.5 mb-6">
                    <div className="flex-1 bg-gray-50 dark:bg-[#121212] border border-gray-200/70 dark:border-white/10 rounded-2xl px-4 py-3.5 text-gray-800 dark:text-gray-200 font-mono text-xs sm:text-sm truncate select-all flex items-center">
                      {referralLink}
                    </div>
                    <button
                      onClick={() => copyToClipboard(referralLink)}
                      className={`px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                        copied
                          ? 'bg-[#81D7B4] text-white'
                          : 'bg-[#81D7B4] text-white hover:opacity-90'
                      }`}
                    >
                      {copied ? (
                        <>
                          <CheckmarkCircle02Icon className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy01Icon className="w-4 h-4" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Direct One-Click Social Share Buttons */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2.5">
                    Fast Share
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    <a
                      href={twitterShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200/60 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white transition-colors"
                    >
                      <NewTwitterIcon className="w-3.5 h-3.5" />
                      <span>Share on X</span>
                    </a>
                    <a
                      href={telegramShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200/60 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white transition-colors"
                    >
                      <TelegramIcon className="w-3.5 h-3.5" />
                      <span>Telegram</span>
                    </a>
                    <a
                      href={whatsappShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200/60 dark:border-white/10 text-xs font-bold text-gray-900 dark:text-white transition-colors"
                    >
                      <span>💬 WhatsApp</span>
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Total Rewards Card */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-8 border border-gray-200/70 dark:border-white/10 shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#81D7B4]/15 text-[#81D7B4] flex items-center justify-center mb-4">
                  <Award01Icon className="w-7 h-7" />
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Total Rewards Earned
                </h3>
                <div className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white font-instrument">
                  {referralData?.stats?.totalRewards || 0} <span className="text-lg text-[#81D7B4] font-bold">PTS</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  +5 Points per new active savings plan
                </p>
              </motion.div>

            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              {[
                { 
                  title: 'Total Clicks', 
                  value: referralData?.stats?.totalVisits || 0, 
                  icon: EyeIcon, 
                  desc: 'Unique visitor clicks on your link' 
                },
                { 
                  title: 'Plans Created', 
                  value: referralData?.stats?.totalConversions || 0, 
                  icon: Rocket01Icon, 
                  desc: 'Friends who deposited into savings' 
                },
                { 
                  title: 'Conversion Rate', 
                  value: `${referralData?.stats?.conversionRate || '0.00'}%`, 
                  icon: BarChartIcon, 
                  desc: 'Percentage of clicks that saved' 
                }
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="bg-white dark:bg-[#161616] p-6 rounded-3xl border border-gray-200/70 dark:border-white/10 shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-[#81D7B4]/15 text-[#81D7B4]">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {stat.title}
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white font-instrument mb-1">
                    {stat.value}
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    {stat.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Referral Activity Table */}
            <div className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Activity01Icon className="w-5 h-5 text-[#81D7B4]" />
                  <h2 className="font-instrument text-lg font-black text-gray-900 dark:text-white">
                    Recent Referral Activity
                  </h2>
                </div>
                <span className="text-xs font-bold text-gray-400">
                  {referralData?.recentVisits?.length || 0} events
                </span>
              </div>

              {referralData?.recentVisits && referralData.recentVisits.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {referralData.recentVisits.map((visit: any, index: number) => (
                    <div 
                      key={index} 
                      className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          visit.converted 
                            ? 'bg-[#81D7B4]/15 text-[#81D7B4]' 
                            : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                        }`}>
                          {visit.converted ? <Tick01Icon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                            {visit.converted ? 'New Savings Plan Created' : 'Referral Link Clicked'}
                          </p>
                          <p className="text-[11px] font-mono text-gray-400">
                            {visit.visitorWalletAddress
                              ? `${visit.visitorWalletAddress.slice(0, 6)}...${visit.visitorWalletAddress.slice(-4)}`
                              : 'Anonymous Visitor'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                          {new Date(visit.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {visit.converted && (
                          <span className="text-[11px] font-bold text-[#81D7B4] bg-[#81D7B4]/10 border border-[#81D7B4]/20 px-2.5 py-0.5 rounded-full">
                            +5 PTS
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-gray-200/50 dark:border-white/5">
                    <Share01Icon className="w-6 h-6 text-gray-400" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">No Referral Activity Yet</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">Share your referral link on social media or with friends to start earning $BTS points!</p>
                </div>
              )}
            </div>

            {/* How It Works Explainer */}
            <div className="bg-gray-50 dark:bg-white/[0.02] rounded-3xl p-6 sm:p-8 border border-gray-200/60 dark:border-white/5">
              <h3 className="font-instrument text-lg font-black text-gray-900 dark:text-white mb-4">
                How Referral Rewards Work
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-[#161616] rounded-2xl border border-gray-200/60 dark:border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-[#81D7B4]/15 text-[#81D7B4] font-black text-xs flex items-center justify-center mb-2.5">
                    1
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-1">Share Your Link</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    Send your referral link to friends or post on your social accounts.
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-[#161616] rounded-2xl border border-gray-200/60 dark:border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-[#81D7B4]/15 text-[#81D7B4] font-black text-xs flex items-center justify-center mb-2.5">
                    2
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-1">Friend Saves On-Chain</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    When your friend creates their first savings plan on any of the 5 supported networks.
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-[#161616] rounded-2xl border border-gray-200/60 dark:border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-[#81D7B4]/15 text-[#81D7B4] font-black text-xs flex items-center justify-center mb-2.5">
                    3
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-1">Earn Protocol Points</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    Receive 5 $BTS points per friend and climb the protocol leaderboard tiers.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}