'use client';

import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  UserCircleIcon, Copy01Icon, Tick02Icon, SparklesIcon, 
  Tick01Icon, Share01Icon, Award01Icon, Calendar01Icon, 
  Coins01Icon, Wallet01Icon, Target01Icon, Video01Icon,
  Cancel01Icon, LockIcon
} from 'hugeicons-react';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAvatar } from '@/hooks/useAvatar';

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
  const { publicKey } = useWallet();
  const { avatar: selectedAvatar, changeAvatar: setSelectedAvatar } = useAvatar();

  const [activeTab, setActiveTab] = useState('Overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);

  const achievements = [
    { id: 1, title: 'Early Adopter', icon: Award01Icon, unlocked: true, desc: 'Joined during the beta phase.' },
    { id: 2, title: 'Top 10% Saver', icon: Coins01Icon, unlocked: true, desc: 'Consistent saving streak for 3 months.' },
    { id: 3, title: 'DeFi Degen', icon: Wallet01Icon, unlocked: true, desc: 'Connected multiple Web3 wallets.' },
    { id: 4, title: 'First Vault', icon: Target01Icon, unlocked: false, desc: 'Create your first Bitsave vault.' },
    { id: 5, title: 'Diamond Hands', icon: Tick02Icon, unlocked: false, desc: 'Hold savings without withdrawal for a year.' },
    { id: 6, title: 'Social Butterfly', icon: Share01Icon, unlocked: false, desc: 'Share your profile on X (Twitter).' },
  ];

  const activeAddress = publicKey?.toBase58() || wagmiAddress || user?.wallet?.address;

  const copyToClipboard = async () => {
    if (activeAddress) {
      try {
        await navigator.clipboard.writeText(activeAddress);
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white dark:bg-[#1a1a1a] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10 p-4 border-l-4 border-l-[#81D7B4]`}>
            <div className="flex items-center gap-4 w-full">
               <div className="w-10 h-10 rounded-full bg-[#81D7B4]/10 flex items-center justify-center shrink-0">
                  <Tick01Icon className="w-5 h-5 text-[#81D7B4]" />
               </div>
               <div className="flex-1">
                 <p className="text-[14px] font-bold text-gray-900 dark:text-white">Address Copied!</p>
                 <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{activeAddress.slice(0, 6)}...{activeAddress.slice(-4)} is now in your clipboard</p>
               </div>
            </div>
          </div>
        ), { duration: 3000, position: 'bottom-center' });
      } catch (err) {
        console.error('Failed to copy address: ', err);
      }
    }
  };

  const handleShare = () => {
    toast.success("Profile link copied!");
  };

  // Mock data for charts
  const weeklyData = [
    { day: 'S', value: 40, active: false },
    { day: 'M', value: 75, active: true, color: 'bg-[#1c4b38]' },
    { day: 'T', value: 65, active: true, color: 'bg-[#81D7B4]' },
    { day: 'W', value: 90, active: true, color: 'bg-[#1c4b38]' },
    { day: 'T', value: 50, active: false },
    { day: 'F', value: 45, active: false },
    { day: 'S', value: 60, active: false },
  ];

  const recentTransactions = [
    { id: 1, name: 'DeFi Summer Vault', action: 'Deposit via Polygon', status: 'Completed', color: 'bg-[#81D7B4]/20 text-[#81D7B4]' },
    { id: 2, name: 'Emergency Fund', action: 'Auto-save transfer', status: 'In Progress', color: 'bg-yellow-500/20 text-yellow-500' },
    { id: 3, name: 'ETH Staking', action: 'Yield Harvest', status: 'Pending', color: 'bg-gray-500/20 text-gray-400' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 relative z-10 font-sans pb-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#81D7B4]/10 to-transparent rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            My Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Manage your identity and track your web3 savings</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsAchievementsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-[#81D7B4]/10 text-[#81D7B4] border border-[#81D7B4]/20 font-bold rounded-xl hover:bg-[#81D7B4]/20 transition-colors shadow-sm">
            <Award01Icon className="w-4 h-4" />
            Achievements
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-gray-900/10">
            <Share01Icon className="w-4 h-4" />
            Share Profile
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-[2rem] p-8 border border-gray-200/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
          <div className="w-32 h-32 rounded-full flex-shrink-0 bg-gradient-to-br from-[#81D7B4] to-[#6BC5A0] p-1 shadow-xl">
            <div className="w-full h-full rounded-full overflow-hidden relative bg-white dark:bg-[#1a1a1a]">
              <Image src={selectedAvatar} alt="Current Avatar" fill className="object-cover" />
            </div>
          </div>
          <div className="text-center md:text-left flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                  {user?.email?.address?.split('@')[0] || (activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : 'Connected Saver')}
                  <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-md font-mono flex items-center gap-1">
                    .eth
                  </span>
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mt-2">
                  <span className="text-[#81D7B4] font-mono text-sm bg-[#81D7B4]/10 border border-[#81D7B4]/20 px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></span>
                    {activeAddress ? `${activeAddress.slice(0, 8)}...${activeAddress.slice(-6)}` : 'No wallet connected'}
                  </span>
                  {activeAddress && (
                    <button onClick={copyToClipboard} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-[#81D7B4] hover:bg-[#81D7B4]/10 transition-all">
                      <Copy01Icon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Web3 Badges */}
              <div className="flex items-center justify-center md:justify-end gap-3 mt-4 md:mt-0">
                 <div 
                    className="flex flex-col items-center justify-center w-14 h-14 bg-[#81D7B4]/10 border border-[#81D7B4]/30 rounded-xl shadow-sm tooltip-trigger relative group"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(129,215,180,0.05) 4px, rgba(129,215,180,0.05) 6px)' }}
                 >
                    <Award01Icon className="w-6 h-6 text-[#81D7B4]" />
                    <span className="absolute -bottom-8 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Early Adopter</span>
                 </div>
                 <div 
                    className="flex flex-col items-center justify-center w-14 h-14 bg-gray-900/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm tooltip-trigger relative group"
                    style={{ backgroundImage: 'radial-gradient(circle at center, rgba(129,215,180,0.1) 1px, transparent 1px)', backgroundSize: '4px 4px' }}
                 >
                    <Coins01Icon className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                    <span className="absolute -bottom-8 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Top 10% Saver</span>
                 </div>
                 <div 
                    className="flex flex-col items-center justify-center w-14 h-14 bg-[#1c4b38]/10 border border-[#1c4b38]/30 rounded-xl shadow-sm tooltip-trigger relative group"
                    style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(28,75,56,0.1) 3px, rgba(28,75,56,0.1) 5px)' }}
                 >
                    <Wallet01Icon className="w-6 h-6 text-[#1c4b38] dark:text-[#6BC5A0]" />
                    <span className="absolute -bottom-8 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">DeFi Degen</span>
                 </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
               <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 shadow-sm text-center md:text-left">
                  <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider mb-1">Account Level</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">Starter</p>
               </div>
               <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 shadow-sm text-center md:text-left">
                  <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider mb-1">Member Since</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">2024</p>
               </div>
               <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 shadow-sm text-center md:text-left">
                  <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider mb-1">Total Vaults</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">3 Active</p>
               </div>
               <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 shadow-sm text-center md:text-left">
                  <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider mb-1">Total Saved</p>
                  <p className="text-lg font-bold text-[#81D7B4]">$12,450.00</p>
               </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200/50 dark:border-white/10">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-opacity-80">Choose your Avatar</h3>
          <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
            {AVATARS.map((avatar, idx) => (
              <motion.button 
                key={idx}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedAvatar(avatar)}
                className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden transition-all duration-300 ${selectedAvatar === avatar ? 'ring-4 ring-[#81D7B4] ring-offset-4 ring-offset-white dark:ring-offset-[#121212] shadow-xl' : 'border border-gray-200 dark:border-white/10 shadow-sm opacity-70 hover:opacity-100'}`}
              >
                <div className="absolute inset-0 bg-white dark:bg-[#1a1a1a]">
                   <Image src={avatar} alt={`Avatar ${idx+1}`} fill className="object-cover" />
                </div>
                {selectedAvatar === avatar && (
                  <div className="absolute top-2 right-2 w-5 h-5 md:w-6 md:h-6 bg-[#81D7B4] rounded-full flex items-center justify-center shadow-md">
                    <Tick02Icon className="w-3 h-3 md:w-4 md:h-4 text-white" strokeWidth={3} />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Analytics Dashboard Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Savings Analytics Chart */}
        <div className="md:col-span-2 bg-white/60 dark:bg-[#1a1a1a]/80 backdrop-blur-2xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/5 shadow-sm flex flex-col justify-between">
           <div className="flex justify-between items-start mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Savings Analytics</h3>
              <select className="bg-transparent border border-gray-200 dark:border-white/10 rounded-lg text-sm px-3 py-1 text-gray-600 dark:text-gray-300 outline-none">
                 <option>This Week</option>
                 <option>This Month</option>
              </select>
           </div>
           
           <div className="flex items-end justify-between h-48 px-2">
              {weeklyData.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end">
                   {d.active && d.value > 60 && (
                      <div className="text-[10px] font-bold text-[#81D7B4] bg-[#81D7B4]/10 px-2 py-0.5 rounded-full mb-1">
                        {d.value}%
                      </div>
                   )}
                   <div className="h-32 flex flex-col justify-end w-10 sm:w-12">
                     <div 
                        className={`w-full rounded-full transition-all duration-500 ease-out flex-shrink-0`}
                        style={{ 
                           height: `${d.value}%`,
                           background: d.active ? '' : 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(129,215,180,0.15) 4px, rgba(129,215,180,0.15) 6px)',
                           border: d.active ? 'none' : '1px solid rgba(129,215,180,0.2)'
                        }}
                     >
                        {d.active && (
                           <div className={`w-full h-full rounded-full ${d.color} shadow-[inset_0_4px_12px_rgba(255,255,255,0.1)]`} />
                        )}
                     </div>
                   </div>
                   <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-1">{d.day}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Reminders / Active Goal */}
        <div className="bg-white/60 dark:bg-[#1a1a1a]/80 backdrop-blur-2xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/5 shadow-sm relative overflow-hidden flex flex-col justify-between">
           {/* Wavy Background Pattern */}
           <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
             <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M0,150 C150,250 250,50 400,150 L400,400 L0,400 Z" fill="url(#wave-grad)" />
               <path d="M0,220 C150,320 250,120 400,220 L400,400 L0,400 Z" fill="url(#wave-grad)" opacity="0.6" />
               <defs>
                 <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="#81D7B4" stopOpacity="0.15" />
                   <stop offset="100%" stopColor="#1c4b38" stopOpacity="0.05" />
                 </linearGradient>
               </defs>
             </svg>
           </div>
           
           <div className="relative z-10">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Active Goal</h3>
             <h4 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[#81D7B4] to-[#1c4b38] leading-tight">
               Buy a Tesla<br/>Model 3
             </h4>
             <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 flex items-center gap-2 font-medium">
                <Calendar01Icon className="w-4 h-4 text-[#81D7B4]" /> Target: Dec 2026
             </p>
           </div>
           
           <div className="relative z-10 mt-auto pt-6">
              <div className="mb-5">
                <div className="flex justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                  <span>$12,450 Saved</span>
                  <span className="text-[#81D7B4]">$40,000 Target</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                   <div className="h-full bg-gradient-to-r from-[#1c4b38] to-[#81D7B4] rounded-full shadow-[0_0_10px_rgba(129,215,180,0.5)]" style={{ width: '31%' }}></div>
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-[#1c4b38] to-[#25634a] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-[#81D7B4]/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                 <Target01Icon className="w-5 h-5" />
                 Fund Goal
              </button>
           </div>
        </div>

        {/* Recent Transactions list */}
        <div className="md:col-span-2 bg-white/60 dark:bg-[#1a1a1a]/80 backdrop-blur-2xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/5 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Deposits</h3>
              <button className="text-[#81D7B4] text-sm font-bold bg-[#81D7B4]/10 px-4 py-1.5 rounded-full hover:bg-[#81D7B4]/20 transition-colors">
                View All
              </button>
           </div>
           
           <div className="space-y-4">
              {recentTransactions.map((tx) => (
                 <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                          <Image src={`/avatars/bitsave-${tx.id}.png`} alt="tx" width={32} height={32} className="rounded-full" />
                       </div>
                       <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{tx.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Action: <span className="font-medium text-gray-700 dark:text-gray-300">{tx.action}</span></p>
                       </div>
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${tx.color.replace('text-', 'border-')}`}>
                       {tx.status}
                    </span>
                 </div>
              ))}
           </div>
        </div>

        {/* Project Progress (Half Donut) */}
        <div className="bg-white/60 dark:bg-[#1a1a1a]/80 backdrop-blur-2xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/5 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
           <h3 className="text-lg font-bold text-gray-900 dark:text-white w-full text-left mb-4">Total Progress</h3>
           
           <div className="relative w-[200px] h-[100px] mt-4">
              {/* Background dashed track */}
              <svg className="w-full h-full" viewBox="0 0 200 100">
                <path 
                   d="M 10,100 A 90,90 0 0,1 190,100" 
                   fill="none" 
                   stroke="rgba(129,215,180,0.2)" 
                   strokeWidth="20" 
                   strokeLinecap="round"
                   strokeDasharray="4 6"
                />
                {/* Foreground solid track (progress) */}
                <path 
                   d="M 10,100 A 90,90 0 0,1 190,100" 
                   fill="none" 
                   stroke="#1c4b38" 
                   strokeWidth="20" 
                   strokeLinecap="round"
                   strokeDasharray="282.74"
                   strokeDashoffset={282.74 - (282.74 * 0.41)}
                   className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                 <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tighter">41%</h2>
                 <p className="text-[10px] text-[#81D7B4] font-bold uppercase tracking-wider mt-1">Funded</p>
              </div>
           </div>
           
           <div className="flex gap-4 mt-8 w-full justify-center border-t border-gray-100 dark:border-white/10 pt-4">
              <div className="flex items-center gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-[#81D7B4]"></div>
                 <span className="text-[11px] text-gray-500 font-medium">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-[#1c4b38]"></div>
                 <span className="text-[11px] text-gray-500 font-medium">In Progress</span>
              </div>
           </div>
        </div>

      </motion.div>

      {/* Achievements Modal */}
      <AnimatePresence>
         {isAchievementsModalOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAchievementsModalOpen(false)}></div>
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 10 }}
               className="bg-white/90 dark:bg-[#1a1a1a]/95 backdrop-blur-2xl w-full max-w-2xl rounded-[2rem] shadow-2xl relative z-10 overflow-hidden border border-gray-200/50 dark:border-white/10"
             >
               <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-transparent to-[#81D7B4]/5">
                 <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <Award01Icon className="w-6 h-6 text-[#81D7B4]" />
                      Web3 Achievements
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Unlock badges by reaching savings milestones and engaging with Bitsave.</p>
                 </div>
                 <button onClick={() => setIsAchievementsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors shrink-0">
                   <Cancel01Icon className="w-5 h-5" />
                 </button>
               </div>
               
               <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {achievements.map(achievement => (
                        <div key={achievement.id} className={`p-5 rounded-2xl border ${achievement.unlocked ? 'border-[#81D7B4]/30 bg-[#81D7B4]/5 shadow-sm shadow-[#81D7B4]/5' : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 opacity-70 grayscale-[0.2]'} flex gap-4 transition-all hover:scale-[1.02] cursor-default`}>
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${achievement.unlocked ? 'bg-gradient-to-br from-[#81D7B4] to-[#1c4b38] text-white shadow-md' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}>
                              {achievement.unlocked ? (
                                <achievement.icon className="w-6 h-6" />
                              ) : (
                                <LockIcon className="w-5 h-5" />
                              )}
                           </div>
                           <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                 {achievement.title}
                                 {achievement.unlocked && <Tick02Icon className="w-4 h-4 text-[#81D7B4]" />}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{achievement.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
             </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
