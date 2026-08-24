'use client';

import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { 
  Copy01Icon, Tick02Icon, SparklesIcon, 
  Share01Icon, Award01Icon, Calendar01Icon, 
  Coins01Icon, Wallet01Icon, Target01Icon,
  Cancel01Icon, LockIcon, ArrowRight01Icon,
  PlusSignIcon, PiggyBankIcon, Shield01Icon,
  UserMultipleIcon, BubbleChatIcon, BotIcon,
  Dollar01Icon, FireIcon, StarIcon
} from 'hugeicons-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useAvatar } from '@/hooks/useAvatar';
import { useSavingsData } from '@/hooks/useSavingsData';
import { useENSData } from '@/hooks/useENSData';

const AVATARS = [
  '/avatars/bitsave-1.png',
  '/avatars/bitsave-2.png',
  '/avatars/bitsave-3.png',
  '/avatars/bitsave-4.png',
  '/avatars/bitsave-5.png',
  '/avatars/bitsave-6.png'
];

export default function ProfilePage() {
  const { user } = usePrivy();
  const { address: wagmiAddress } = useAccount();
  const { avatar: selectedAvatar, changeAvatar: setSelectedAvatar } = useAvatar();
  const { savingsData } = useSavingsData();
  
  const activeAddress = (wagmiAddress || user?.wallet?.address || '').toLowerCase();
  const { ensName, hasENS } = useENSData(activeAddress);

  const [savvyName, setSavvyName] = useState<string | null>(null);
  const [memberSinceYear, setMemberSinceYear] = useState<number>(new Date().getFullYear());
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [groupVaultsCount, setGroupVaultsCount] = useState<number>(0);
  const [forumPostsCount, setForumPostsCount] = useState<number>(0);

  // Fetch real Savvy Name, Group Vaults & Forum Activity from APIs
  useEffect(() => {
    const fetchUserData = async () => {
      if (!activeAddress) return;
      try {
        // Savvy name & registration
        const res = await fetch(`/api/users/savvy?walletAddress=${activeAddress}`);
        if (res.ok) {
          const data = await res.json();
          if (data.savvyName) setSavvyName(data.savvyName);
          if (data.createdAt) {
            const date = new Date(data.createdAt);
            if (!isNaN(date.getFullYear())) setMemberSinceYear(date.getFullYear());
          }
        }

        // Group vaults
        const groupRes = await fetch(`/api/savings/group?walletAddress=${activeAddress}`);
        if (groupRes.ok) {
          const groupData = await groupRes.json();
          if (Array.isArray(groupData.vaults)) {
            setGroupVaultsCount(groupData.vaults.length);
          }
        }

        // Forum posts by user
        const forumRes = await fetch(`/api/forum?userAddress=${activeAddress}`);
        if (forumRes.ok) {
          const forumData = await forumRes.json();
          if (Array.isArray(forumData.posts)) {
            setForumPostsCount(forumData.posts.length);
          }
        }
      } catch (e) {
        console.error('Failed to fetch profile details', e);
      }
    };
    fetchUserData();
  }, [activeAddress]);

  const copyToClipboard = async () => {
    if (activeAddress) {
      try {
        await navigator.clipboard.writeText(activeAddress);
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white dark:bg-[#161616] shadow-xl rounded-2xl pointer-events-auto flex p-4 border border-gray-200/70 dark:border-white/10`}>
            <div className="flex items-center gap-3 w-full">
               <div className="w-9 h-9 rounded-xl bg-[#81D7B4]/15 flex items-center justify-center shrink-0">
                  <Tick02Icon className="w-5 h-5 text-[#81D7B4]" />
               </div>
               <div className="flex-1">
                 <p className="text-xs font-bold text-gray-900 dark:text-white">Address Copied!</p>
                 <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{activeAddress.slice(0, 6)}...{activeAddress.slice(-4)} is now in your clipboard</p>
               </div>
            </div>
          </div>
        ), { duration: 3000, position: 'bottom-center' });
      } catch (err) {
        console.error('Failed to copy address: ', err);
      }
    }
  };

  const handleShareProfile = () => {
    const displayName = savvyName ? `@${savvyName}` : `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`;
    const text = encodeURIComponent(
      `Check out my Web3 savings profile on @bitsaveprotocol! 🎯 Saving with discipline and earning $BTS rewards on SaveFi 💰\n\nJoin me on https://bitsave.io`
    );
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank');
  };

  // Real statistics calculations
  const totalLockedNum = parseFloat(savingsData?.totalLocked || '0');
  const activePlansCount = savingsData?.currentPlans?.length || 0;
  const completedPlansCount = savingsData?.completedPlans?.length || 0;
  const totalPlansCount = activePlansCount + completedPlansCount;

  // Tier calculation
  const getSaverTier = () => {
    if (totalLockedNum >= 1000) return 'Whale Saver';
    if (totalLockedNum >= 250) return 'Pro Saver';
    if (totalPlansCount > 0) return 'Active Saver';
    return 'Starter';
  };

  // 12 Comprehensive Dynamic Achievements
  const achievements = [
    { 
      id: 1, 
      category: 'Identity',
      title: 'Early Adopter', 
      icon: Award01Icon, 
      unlocked: !!activeAddress, 
      desc: 'Connected your Web3 wallet and joined the BitSave decentralized savings ecosystem.' 
    },
    { 
      id: 2, 
      category: 'Identity',
      title: 'Savvy Name Pioneer', 
      icon: SparklesIcon, 
      unlocked: !!savvyName, 
      desc: savvyName ? `Secured @${savvyName} as your unique SaveFi username.` : 'Claim a custom .savvy username in Settings for easy peer recognition.' 
    },
    { 
      id: 3, 
      category: 'Savings',
      title: 'First Vault Created', 
      icon: Target01Icon, 
      unlocked: totalPlansCount > 0, 
      desc: totalPlansCount > 0 ? 'Successfully created and locked funds in your first time-locked savings vault.' : 'Create your very first time-locked savings plan to start saving.' 
    },
    { 
      id: 4, 
      category: 'Savings',
      title: 'Discipline Champion', 
      icon: Shield01Icon, 
      unlocked: (savingsData?.currentPlans || []).some(p => (p.penaltyPercentage || 0) > 0) || completedPlansCount > 0, 
      desc: 'Enforced an early withdrawal penalty (5%–20%) to build unbreakable financial discipline.' 
    },
    { 
      id: 5, 
      category: 'Milestones',
      title: 'Century Saver ($100+)', 
      icon: Dollar01Icon, 
      unlocked: totalLockedNum >= 100, 
      desc: totalLockedNum >= 100 ? `Locked over $100 across your decentralized savings vaults.` : 'Accumulate at least $100 in total locked savings.' 
    },
    { 
      id: 6, 
      category: 'Milestones',
      title: 'Grand Saver ($1,000+)', 
      icon: StarIcon, 
      unlocked: totalLockedNum >= 1000, 
      desc: totalLockedNum >= 1000 ? `Reached $1,000+ in total locked decentralized savings.` : 'Reach $1,000 in total locked crypto savings across all vaults.' 
    },
    { 
      id: 7, 
      category: 'Savings',
      title: 'Maturity Master', 
      icon: FireIcon, 
      unlocked: completedPlansCount > 0, 
      desc: completedPlansCount > 0 ? `Completed ${completedPlansCount} savings plan${completedPlansCount > 1 ? 's' : ''} to 100% maturity without penalty.` : 'Complete a time-locked savings plan all the way to its maturity date.' 
    },
    { 
      id: 8, 
      category: 'Savings',
      title: 'Multi-Vault Stacker', 
      icon: Coins01Icon, 
      unlocked: totalPlansCount >= 2, 
      desc: totalPlansCount >= 2 ? `Maintained ${totalPlansCount} distinct savings plans for different goals.` : 'Create 2 or more savings plans for diversified financial milestones.' 
    },
    { 
      id: 9, 
      category: 'Savings',
      title: 'SaveFi Portfolio (3+ Plans)', 
      icon: PiggyBankIcon, 
      unlocked: totalPlansCount >= 3, 
      desc: totalPlansCount >= 3 ? `Built a comprehensive SaveFi portfolio with ${totalPlansCount} savings vaults.` : 'Create 3 or more savings plans to unlock full portfolio management.' 
    },
    { 
      id: 10, 
      category: 'Social',
      title: 'Circle Saver (Group Vaults)', 
      icon: UserMultipleIcon, 
      unlocked: groupVaultsCount > 0, 
      desc: groupVaultsCount > 0 ? `Participating in ${groupVaultsCount} Shared Group Vault${groupVaultsCount > 1 ? 's' : ''} with friends.` : 'Create or join a Group Savings vault to save toward shared goals.' 
    },
    { 
      id: 11, 
      category: 'Community',
      title: 'Community Voice', 
      icon: BubbleChatIcon, 
      unlocked: forumPostsCount > 0, 
      desc: forumPostsCount > 0 ? `Authored ${forumPostsCount} discussion thread${forumPostsCount > 1 ? 's' : ''} in the BitSave Forum.` : 'Start a discussion thread or reply to fellow savers in the Forum.' 
    },
    { 
      id: 12, 
      category: 'AI Assistant',
      title: 'Savvy Bot Scholar', 
      icon: BotIcon, 
      unlocked: typeof window !== 'undefined' ? (localStorage.getItem('savvy_bot_interacted') === 'true' || !!savvyName) : false, 
      desc: 'Consulted Savvy Bot or tested your financial knowledge in the AI quiz.' 
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const primaryPlan = savingsData?.currentPlans?.[0] || null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative z-10 font-sans pb-24 px-2 sm:px-4">
      {/* Background radial aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#81D7B4]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your on-chain identity, avatar, and track your verified SaveFi milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            onClick={() => setIsAchievementsModalOpen(true)} 
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-white/5 text-[#81D7B4] border border-gray-200/70 dark:border-white/10 font-bold rounded-2xl hover:border-[#81D7B4] transition-all text-xs cursor-pointer shadow-xs"
          >
            <Award01Icon className="w-4 h-4" />
            <span>Achievements</span>
            <span className="px-1.5 py-0.2 bg-[#81D7B4]/15 rounded-md text-[10px] font-black">
              {unlockedCount}/{achievements.length}
            </span>
          </button>
          
          <button 
            onClick={handleShareProfile} 
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#81D7B4] hover:opacity-90 text-white font-bold rounded-2xl shadow-xs transition-all text-xs cursor-pointer"
          >
            <Share01Icon className="w-4 h-4" />
            <span>Share Profile</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-8 border border-gray-200/70 dark:border-white/10 shadow-sm relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 mb-8">
          {/* Avatar with Glow Ring */}
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-[#81D7B4] to-[#6BC5A0] p-1 shadow-lg shadow-[#81D7B4]/20 relative shrink-0">
              <div className="w-full h-full rounded-[1.4rem] overflow-hidden relative bg-white dark:bg-[#121212]">
                <Image src={selectedAvatar} alt="Current Avatar" fill className="object-cover" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-[#81D7B4] text-white flex items-center justify-center shadow-md">
              <SparklesIcon className="w-4 h-4" />
            </div>
          </div>

          {/* User Details */}
          <div className="text-center md:text-left flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white font-instrument tracking-tight">
                    {savvyName ? `@${savvyName}` : (activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : 'Connected Saver')}
                  </h2>

                  {savvyName ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-[#81D7B4]/15 text-[#81D7B4] border border-[#81D7B4]/30 rounded-lg flex items-center gap-1">
                      <Tick02Icon className="w-3 h-3" /> .savvy
                    </span>
                  ) : (
                    <Link 
                      href="/dashboard/settings" 
                      className="text-[11px] font-bold px-2 py-0.5 bg-gray-100 dark:bg-white/10 hover:bg-[#81D7B4]/20 hover:text-[#81D7B4] text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
                    >
                      + Claim .savvy
                    </Link>
                  )}

                  {hasENS && ensName && (
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg font-mono">
                      {ensName}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 px-3 py-1 rounded-xl flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></span>
                    {activeAddress ? `${activeAddress.slice(0, 10)}...${activeAddress.slice(-8)}` : 'No wallet connected'}
                  </span>
                  
                  {activeAddress && (
                    <button 
                      onClick={copyToClipboard} 
                      className="w-7 h-7 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-[#81D7B4]/15 text-gray-400 hover:text-[#81D7B4] border border-gray-200/70 dark:border-white/10 transition-colors cursor-pointer"
                      title="Copy Address"
                    >
                      <Copy01Icon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-end gap-2">
                <Link
                  href="/dashboard/settings"
                  className="px-3.5 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200/70 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl transition-all"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* 4 Real Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="bg-gray-50/70 dark:bg-white/[0.02] rounded-2xl p-3.5 border border-gray-100 dark:border-white/5 text-center sm:text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Account Tier</p>
                <p className="text-sm sm:text-base font-black text-gray-900 dark:text-white font-instrument">{getSaverTier()}</p>
              </div>

              <div className="bg-gray-50/70 dark:bg-white/[0.02] rounded-2xl p-3.5 border border-gray-100 dark:border-white/5 text-center sm:text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Member Since</p>
                <p className="text-sm sm:text-base font-black text-gray-900 dark:text-white font-instrument">{memberSinceYear}</p>
              </div>

              <div className="bg-gray-50/70 dark:bg-white/[0.02] rounded-2xl p-3.5 border border-gray-100 dark:border-white/5 text-center sm:text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Active Vaults</p>
                <p className="text-sm sm:text-base font-black text-gray-900 dark:text-white font-instrument">
                  {activePlansCount} {activePlansCount === 1 ? 'Vault' : 'Vaults'}
                </p>
              </div>

              <div className="bg-gray-50/70 dark:bg-white/[0.02] rounded-2xl p-3.5 border border-gray-100 dark:border-white/5 text-center sm:text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total Saved</p>
                <p className="text-sm sm:text-base font-black text-[#81D7B4] font-instrument">
                  ${totalLockedNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Choose Avatar Section */}
        <div className="pt-6 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
              Choose Avatar
            </h3>
            <span className="text-[11px] text-gray-400 font-medium">Click to set profile avatar</span>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
            {AVATARS.map((avatar, idx) => {
              const isSelected = selectedAvatar === avatar;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedAvatar(avatar);
                    toast.success('Avatar updated!');
                  }}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden transition-all cursor-pointer ${
                    isSelected 
                      ? 'ring-3 ring-[#81D7B4] ring-offset-2 ring-offset-white dark:ring-offset-[#161616] scale-105 shadow-md' 
                      : 'border border-gray-200/70 dark:border-white/10 opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  <Image src={avatar} alt={`Avatar option ${idx + 1}`} fill className="object-cover" />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-[#81D7B4] rounded-full flex items-center justify-center text-white shadow-xs">
                      <Tick02Icon className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Grid: Active Goal + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Goal Spotlight Card */}
        <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 border border-gray-200/70 dark:border-white/10 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-instrument text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#81D7B4] rounded-full"></span>
              Active Goal Spotlight
            </h3>
            {primaryPlan && (
              <span className="px-2 py-0.5 bg-[#81D7B4]/15 text-[#81D7B4] rounded-lg text-[10px] font-bold">
                {primaryPlan.tokenName || 'Crypto'}
              </span>
            )}
          </div>

          {primaryPlan ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-black text-gray-900 dark:text-white font-instrument mb-1">
                  {primaryPlan.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Calendar01Icon className="w-3.5 h-3.5 text-[#81D7B4]" />
                  <span>Target: {new Date(primaryPlan.maturityTime * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  <span>{primaryPlan.currentAmount} {primaryPlan.tokenName} Saved</span>
                  <span className="text-[#81D7B4]">{primaryPlan.targetAmount} {primaryPlan.tokenName} Target</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#81D7B4] rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.max(5, primaryPlan.progress || 0))}%` }}
                  />
                </div>
              </div>

              <Link
                href="/dashboard/plans"
                className="w-full py-3 bg-[#81D7B4] hover:opacity-90 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all mt-4"
              >
                <Coins01Icon className="w-4 h-4" />
                <span>Manage in My Savings</span>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#81D7B4]/15 text-[#81D7B4] flex items-center justify-center mx-auto">
                <PiggyBankIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">No Active Vaults</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                  Create your first time-locked plan to begin building disciplined savings on-chain.
                </p>
              </div>
              <Link
                href="/dashboard/create-savings"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#81D7B4] hover:opacity-90 text-white font-bold rounded-2xl text-xs shadow-xs transition-all cursor-pointer"
              >
                <PlusSignIcon className="w-4 h-4" />
                <span>Create a Plan</span>
              </Link>
            </div>
          )}
        </div>

        {/* Real Savings Activity List */}
        <div className="lg:col-span-2 bg-white dark:bg-[#161616] rounded-3xl p-6 border border-gray-200/70 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-instrument text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#81D7B4] rounded-full"></span>
              Your Savings Plans ({totalPlansCount})
            </h3>
            <Link 
              href="/dashboard/plans" 
              className="text-xs font-bold text-[#81D7B4] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight01Icon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activePlansCount > 0 ? (
            <div className="space-y-3">
              {savingsData.currentPlans.slice(0, 3).map((plan) => (
                <div 
                  key={plan.id} 
                  className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 flex items-center justify-center shrink-0 text-[#81D7B4]">
                      <PiggyBankIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">{plan.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Locked: <span className="font-bold text-gray-700 dark:text-gray-300">{plan.currentAmount} {plan.tokenName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      {plan.progress}% Complete
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Matures: {new Date(plan.maturityTime * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <Coins01Icon className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300">No savings activity yet</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Your active time-locked plans and deposits will appear here.</p>
            </div>
          )}
        </div>

      </div>

      {/* Web3 Achievements Modal */}
      <AnimatePresence>
        {isAchievementsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-xs" 
              onClick={() => setIsAchievementsModalOpen(false)} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#161616] w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-gray-200/70 dark:border-white/10 flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white font-instrument flex items-center gap-2">
                      <Award01Icon className="w-5 h-5 text-[#81D7B4]" />
                      <span>Web3 SaveFi Achievements</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#81D7B4]/15 text-[#81D7B4] text-[11px] font-black">
                      {unlockedCount} / {achievements.length} Unlocked
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Earn on-chain badges by unlocking discipline and savings milestones on BitSave.
                  </p>
                </div>
                <button 
                  onClick={() => setIsAchievementsModalOpen(false)} 
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <Cancel01Icon className="w-4 h-4" />
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                        achievement.unlocked 
                          ? 'border-[#81D7B4]/30 bg-[#81D7B4]/5 shadow-xs' 
                          : 'border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] opacity-60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        achievement.unlocked 
                          ? 'bg-[#81D7B4] text-white shadow-xs' 
                          : 'bg-gray-200 dark:bg-white/10 text-gray-400'
                      }`}>
                        {achievement.unlocked ? (
                          <achievement.icon className="w-5 h-5" />
                        ) : (
                          <LockIcon className="w-4 h-4" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-gray-900 dark:text-white text-xs truncate">
                            {achievement.title}
                          </h4>
                          {achievement.unlocked && (
                            <Tick02Icon className="w-3.5 h-3.5 text-[#81D7B4] shrink-0" />
                          )}
                        </div>
                        <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
                          {achievement.category}
                        </span>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                          {achievement.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex items-center justify-between shrink-0">
                <p className="text-[11px] text-gray-400 font-medium">
                  Achievements update in real-time as you save & engage.
                </p>
                <button
                  onClick={() => setIsAchievementsModalOpen(false)}
                  className="px-4 py-2 bg-[#81D7B4] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
