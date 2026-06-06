'use client';

import { Wallet01Icon, Money01Icon, Shield01Icon, UserIcon, File01Icon, Refresh01Icon, Notification01Icon, Megaphone01Icon } from "hugeicons-react";
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '@solana/wallet-adapter-react';
import { Exo } from 'next/font/google';
import toast from 'react-hot-toast';

const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export default function BizSwapSettings() {
  const { address: wagmiAddress } = useAccount();
  const { user } = usePrivy();
  const { publicKey } = useWallet();
  
  const privySolanaWallet = user?.linkedAccounts?.find(
    (account) => account.type === 'wallet' && account.chainType === 'solana'
  ) as { address: string } | undefined;
  
  const address = publicKey?.toBase58() || privySolanaWallet?.address || wagmiAddress || user?.wallet?.address;

  const [mounted, setMounted] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'Investor Profile' | 'Payouts' | 'Auto-Invest' | 'Notifications'>('Investor Profile');
  const tabs = ['Investor Profile', 'Payouts', 'Auto-Invest', 'Notifications'] as const;

  // Settings states
  const [kycStatus, setKycStatus] = useState<'Unverified' | 'Pending' | 'Verified'>('Unverified');
  const [investorType, setInvestorType] = useState<'Retail' | 'Accredited'>('Retail');
  const [payoutCurrency, setPayoutCurrency] = useState<'USDC' | 'USDT' | 'DAI'>('USDC');
  const [autoReinvest, setAutoReinvest] = useState(false);
  const [yieldAlerts, setYieldAlerts] = useState(true);
  const [newListingAlerts, setNewListingAlerts] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        toast.success('Address copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy address');
      }
    }
  };

  const handleSaveSettings = () => {
    toast.success('BizSwap settings updated successfully!');
  };

  if (!mounted) return null;

  return (
    <div className={`${exo.variable} font-sans relative min-h-screen bg-[#0A0F17] overflow-hidden text-[#F9F9FB]`}>
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#F9F9FB] tracking-tight">BizSwap Settings</h1>
          <p className="text-[#7B8B9A] mt-2 font-medium">Manage your investor profile, yield payouts, and preferences.</p>
        </div>

        {/* Minimal Pill Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar mb-8 p-1.5 bg-[#1A2538] border border-[#2C3E5D] rounded-[1.2rem] w-full sm:w-fit max-w-full shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[14px] font-bold transition-all whitespace-nowrap tracking-wide ${selectedTab === tab ? 'bg-[#81D7B4] text-[#0A0F17] shadow-md' : 'text-[#7B8B9A] hover:text-[#F9F9FB] hover:bg-[#121A27]'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Container */}
        <div className="bg-[#1A2538] rounded-[2rem] border border-[#2C3E5D] shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden min-h-[500px]">
          
          {/* INVESTOR PROFILE TAB */}
          {selectedTab === 'Investor Profile' && (
            <div className="divide-y divide-[#2C3E5D]">
               <div className="p-6 sm:p-10">
                  <h2 className="text-xl font-bold text-[#F9F9FB] mb-6 tracking-tight">Wallet Connection</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[1.5rem] border border-[#2C3E5D] bg-[#0A0F17]">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#1A2538] flex items-center justify-center shadow-sm border border-[#2C3E5D] shrink-0">
                           <Wallet01Icon className="w-6 h-6 text-[#81D7B4]" />
                        </div>
                        <div className="overflow-hidden">
                           <p className="font-bold text-[#F9F9FB] text-[15px]">Connected Wallet</p>
                           <p className="text-[13px] text-[#7B8B9A] font-medium mt-0.5 font-mono truncate">{address || 'Not connected'}</p>
                        </div>
                     </div>
                     <button onClick={copyToClipboard} className="text-[13px] font-bold text-[#F9F9FB] bg-[#1A2538] border border-[#2C3E5D] px-5 py-2.5 rounded-xl hover:bg-[#121A27] transition-colors shadow-sm shrink-0">
                       Copy
                     </button>
                  </div>
               </div>

               <div className="p-6 sm:p-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-[#F9F9FB] tracking-tight">Identity & KYC</h2>
                      <p className="text-[#7B8B9A] text-[14px] mt-1 font-medium">Verification required for purchasing BizShares.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex items-center justify-between p-5 rounded-[1.5rem] border border-[#2C3E5D] bg-[#0A0F17]">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-[#1A2538] border border-[#2C3E5D] rounded-xl flex items-center justify-center">
                             <Shield01Icon className="w-6 h-6 text-[#F5A623]" />
                           </div>
                           <div>
                              <p className="font-bold text-[#F9F9FB] text-[15px]">KYC Status</p>
                              <p className="text-[13px] text-[#F5A623] font-bold mt-0.5">{kycStatus}</p>
                           </div>
                        </div>
                        <button className="text-[13px] font-bold text-[#0A0F17] bg-[#81D7B4] px-4 py-2 rounded-xl transition-colors hover:bg-[#6ec2a0]">
                          Verify Now
                        </button>
                     </div>

                     <div className="flex items-center justify-between p-5 rounded-[1.5rem] border border-[#2C3E5D] bg-[#0A0F17]">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-[#1A2538] border border-[#2C3E5D] rounded-xl flex items-center justify-center">
                             <UserIcon className="w-6 h-6 text-[#3B82F6]" />
                           </div>
                           <div>
                              <p className="font-bold text-[#F9F9FB] text-[15px]">Investor Type</p>
                              <p className="text-[13px] text-[#7B8B9A] font-medium mt-0.5">{investorType}</p>
                           </div>
                        </div>
                        <button className="text-[13px] font-bold text-[#3B82F6] hover:bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-4 py-2 rounded-xl transition-colors">
                          Upgrade
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* PAYOUTS TAB */}
          {selectedTab === 'Payouts' && (
            <div className="p-6 sm:p-10">
               <h2 className="text-xl font-bold text-[#F9F9FB] mb-2 tracking-tight">Yield Payout Preferences</h2>
               <p className="text-[#7B8B9A] text-[14px] mb-8 font-medium">Configure how you want to receive your business yields.</p>
               
               <div className="flex flex-col gap-4 max-w-2xl">
                 <div className="p-5 rounded-[1.5rem] border border-[#2C3E5D] bg-[#0A0F17]">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 rounded-full bg-[#1A2538] flex items-center justify-center shadow-sm border border-[#2C3E5D]">
                          <Money01Icon className="w-6 h-6 text-[#81D7B4]" />
                       </div>
                       <div>
                          <p className="font-bold text-[#F9F9FB] text-[15px]">Default Payout Stablecoin</p>
                          <p className="text-[13px] text-[#7B8B9A] font-medium mt-0.5">Yields will be converted to this asset.</p>
                       </div>
                    </div>
                    
                    <div className="flex gap-3">
                      {['USDC', 'USDT', 'DAI'].map((coin) => (
                        <button
                          key={coin}
                          onClick={() => setPayoutCurrency(coin as any)}
                          className={`flex-1 py-3 rounded-xl border font-bold transition-all ${
                            payoutCurrency === coin 
                              ? 'bg-[#81D7B4]/10 border-[#81D7B4] text-[#81D7B4]' 
                              : 'bg-[#1A2538] border-[#2C3E5D] text-[#7B8B9A] hover:border-[#4B5A75]'
                          }`}
                        >
                          {coin}
                        </button>
                      ))}
                    </div>
                 </div>

                 <div className="p-5 rounded-[1.5rem] border border-[#2C3E5D] bg-[#0A0F17] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-[#1A2538] flex items-center justify-center shadow-sm border border-[#2C3E5D]">
                          <File01Icon className="w-6 h-6 text-[#81D7B4]" />
                       </div>
                       <div>
                          <p className="font-bold text-[#F9F9FB] text-[15px]">Tax Documents</p>
                          <p className="text-[13px] text-[#7B8B9A] font-medium mt-0.5">Download yearly 1099 equivalents.</p>
                       </div>
                    </div>
                    <button className="text-[13px] font-bold text-[#81D7B4] hover:bg-[#81D7B4]/10 border border-[#81D7B4]/30 px-4 py-2 rounded-xl transition-colors">
                      Download
                    </button>
                 </div>
               </div>
               
               <div className="mt-8">
                 <button onClick={handleSaveSettings} className="px-8 py-3 bg-[#81D7B4] text-[#0A0F17] font-black rounded-xl hover:bg-[#6ec2a0] transition-colors">
                   Save Preferences
                 </button>
               </div>
            </div>
          )}

          {/* AUTO-INVEST TAB */}
          {selectedTab === 'Auto-Invest' && (
            <div className="p-6 sm:p-10">
               <div className="flex items-center justify-between mb-6">
                 <div>
                   <h2 className="text-xl font-bold text-[#F9F9FB] tracking-tight">Auto-Reinvest Yields</h2>
                   <p className="text-[#7B8B9A] text-[14px] mt-1 font-medium">Automatically compound your earnings into new BizShares.</p>
                 </div>
                 <div 
                   className="relative cursor-pointer"
                   onClick={() => setAutoReinvest(!autoReinvest)}
                 >
                   <div className={`w-12 h-6 rounded-full shadow-inner transition-colors ${autoReinvest ? 'bg-[#81D7B4]' : 'bg-[#2C3E5D]'}`}>
                      <div className={`w-5 h-5 bg-[#0A0F17] rounded-full shadow-md transform transition-transform translate-y-0.5 ${autoReinvest ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                   </div>
                 </div>
               </div>
               
               <div className={`p-6 rounded-[1.5rem] border transition-all ${autoReinvest ? 'border-[#81D7B4]/30 bg-[#81D7B4]/5' : 'border-[#2C3E5D] bg-[#0A0F17] opacity-50'}`}>
                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-12 h-12 rounded-full bg-[#1A2538] flex items-center justify-center border border-[#2C3E5D]">
                        <Refresh01Icon className="w-6 h-6 text-[#81D7B4]" />
                     </div>
                     <div>
                        <p className="font-bold text-[#F9F9FB] text-[15px]">Compounding Strategy</p>
                        <p className="text-[13px] text-[#7B8B9A] font-medium mt-0.5">Select where your automated yields will be allocated.</p>
                     </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 rounded-xl border border-[#2C3E5D] bg-[#1A2538] cursor-pointer hover:border-[#4B5A75]">
                      <input type="radio" name="strategy" defaultChecked className="w-4 h-4 accent-[#81D7B4]" disabled={!autoReinvest} />
                      <span className="font-bold text-[#F9F9FB]">Same Instrument (Default)</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 rounded-xl border border-[#2C3E5D] bg-[#1A2538] cursor-pointer hover:border-[#4B5A75]">
                      <input type="radio" name="strategy" className="w-4 h-4 accent-[#81D7B4]" disabled={!autoReinvest} />
                      <span className="font-bold text-[#F9F9FB]">BizYield Index (Diversified)</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 rounded-xl border border-[#2C3E5D] bg-[#1A2538] cursor-pointer hover:border-[#4B5A75]">
                      <input type="radio" name="strategy" className="w-4 h-4 accent-[#81D7B4]" disabled={!autoReinvest} />
                      <span className="font-bold text-[#F9F9FB]">Treasury / BizBond (Low Risk)</span>
                    </label>
                  </div>
               </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {selectedTab === 'Notifications' && (
            <div className="p-6 sm:p-10">
               <h2 className="text-xl font-bold text-[#F9F9FB] mb-2 tracking-tight">BizSwap Alerts</h2>
               <p className="text-[#7B8B9A] text-[14px] mb-8 font-medium">Manage notifications for your business investments.</p>
               
               <div className="space-y-4 max-w-2xl">
                 <div className="flex items-center justify-between p-5 rounded-[1.5rem] border border-[#2C3E5D] bg-[#0A0F17]">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-[#1A2538] flex items-center justify-center border border-[#2C3E5D]">
                          <Notification01Icon className="w-6 h-6 text-[#81D7B4]" />
                       </div>
                       <div>
                          <p className="font-bold text-[#F9F9FB] text-[15px]">Yield Distributions</p>
                          <p className="text-[13px] text-[#7B8B9A] font-medium mt-0.5">Get notified when you receive payouts.</p>
                       </div>
                    </div>
                    <div 
                       className="relative cursor-pointer"
                       onClick={() => setYieldAlerts(!yieldAlerts)}
                    >
                       <div className={`w-12 h-6 rounded-full shadow-inner transition-colors ${yieldAlerts ? 'bg-[#81D7B4]' : 'bg-[#2C3E5D]'}`}>
                          <div className={`w-5 h-5 bg-[#0A0F17] rounded-full shadow-md transform transition-transform translate-y-0.5 ${yieldAlerts ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center justify-between p-5 rounded-[1.5rem] border border-[#2C3E5D] bg-[#0A0F17]">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-[#1A2538] flex items-center justify-center border border-[#2C3E5D]">
                          <Megaphone01Icon className="w-6 h-6 text-[#81D7B4]" />
                       </div>
                       <div>
                          <p className="font-bold text-[#F9F9FB] text-[15px]">New Listings</p>
                          <p className="text-[13px] text-[#7B8B9A] font-medium mt-0.5">Alerts for new BizYield or BizCredit offerings.</p>
                       </div>
                    </div>
                    <div 
                       className="relative cursor-pointer"
                       onClick={() => setNewListingAlerts(!newListingAlerts)}
                    >
                       <div className={`w-12 h-6 rounded-full shadow-inner transition-colors ${newListingAlerts ? 'bg-[#81D7B4]' : 'bg-[#2C3E5D]'}`}>
                          <div className={`w-5 h-5 bg-[#0A0F17] rounded-full shadow-md transform transition-transform translate-y-0.5 ${newListingAlerts ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
