'use client';

import React, { useState } from 'react';
import { Home01Icon, Calendar01Icon, Notification01Icon, Cancel01Icon, Briefcase01Icon, TextIcon, Clock01Icon, CalculatorIcon, Settings01Icon, Add01Icon, GiftIcon, Menu01Icon } from "hugeicons-react";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { BizSwapAuthButton } from '@/components/BizSwapAuthButton';

const NAV_LINKS = [
  { name: 'Dashboard', href: '/bizswap/dashboard', icon: Home01Icon },
  { name: 'Holdings', href: '/bizswap/dashboard/holdings', icon: Briefcase01Icon },
  { name: 'Payment Calendar', href: '/bizswap/dashboard/calendar', icon: Calendar01Icon },
  { name: 'Payment History', href: '/bizswap/dashboard/history', icon: Clock01Icon },
  { name: 'My Certificates', href: '/bizswap/dashboard/certificates', icon: TextIcon },
  { name: 'Alerts', href: '/bizswap/dashboard/alerts', icon: Notification01Icon },
  { name: 'Yield Calculator', href: '/bizswap/dashboard/calculator', icon: CalculatorIcon },
];

export default function BizSwapDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { publicKey } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#070A0F] text-[#F9F9FB] font-sans overflow-hidden">
      
      {/* OVERLAY FOR MOBILE */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0F17] border-r border-[#1C2538] flex flex-col h-full transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 md:p-6 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <Image src="/bitsavelogo.png" alt="BizMarket" width={80} height={24} className="object-contain" />
            <span className="text-[8px] font-black tracking-widest text-[#81D7B4] uppercase px-1 py-0.5 bg-[#81D7B4]/10 rounded">Market</span>
          </div>
          <button className="md:hidden text-[#7B8B9A] hover:text-[#F9F9FB] p-1 shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
            <Cancel01Icon className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  isActive 
                    ? 'bg-[#1C2538] text-[#F9F9FB]' 
                    : 'text-[#7B8B9A] hover:bg-[#1C2538]/50 hover:text-[#F9F9FB]'
                }`}
              >
                <link.icon className={`w-5 h-5 ${isActive ? 'text-[#81D7B4]' : 'text-[#7B8B9A]'}`} />
                {link.name}
              </Link>
            );
          })}
          
          {/* Mobile Only Quick Links */}
          <div className="md:hidden mt-2 space-y-1">
            <Link href="/bizswap/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#7B8B9A] hover:bg-[#1C2538]/50 hover:text-[#F9F9FB] transition-colors">
              <Settings01Icon className="w-5 h-5 text-[#7B8B9A]" />
              Settings
            </Link>
          </div>
          
          <div className="pt-8 pb-4">
            <span className="px-4 text-[10px] font-bold text-[#4B5A75] uppercase tracking-widest">Quick Actions</span>
          </div>
          
          <Link href="/bizswap/app" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#81D7B4] bg-[#81D7B4]/10 hover:bg-[#81D7B4]/20 transition-colors border border-[#81D7B4]/20">
            <Add01Icon className="w-5 h-5" />
            Buy More
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#7B8B9A] hover:bg-[#1C2538]/50 transition-colors opacity-50 cursor-not-allowed text-left mt-1">
            <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">C</div>
            Claim Yield
          </button>
        </nav>

        <div className="p-4 border-t border-[#1C2538]">
          <div className="bg-gradient-to-r from-[#1C2538] to-[#0A0F17] p-4 rounded-xl border border-[#2C3E5D]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-[#81D7B4]">Refer & Earn</p>
                <p className="text-xs text-[#7B8B9A] mt-1">Invite friends, earn rewards</p>
              </div>
              <GiftIcon className="w-5 h-5 text-[#81D7B4]" />
            </div>
            <button className="mt-3 text-xs font-bold text-white hover:text-[#81D7B4] transition-colors">Invite Now →</button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0A0F17]">
        
        {/* HEADER */}
        <header className="h-20 px-4 md:px-8 flex items-center justify-between border-b border-[#1C2538] flex-shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 -ml-2 text-[#7B8B9A] hover:text-[#F9F9FB] rounded-lg hover:bg-[#1C2538] transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu01Icon className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-[#F9F9FB]">Welcome back, Savvy 👋</h1>
              <p className="text-sm text-[#7B8B9A] mt-0.5">Here's your portfolio at a glance.</p>
            </div>
            <div className="sm:hidden">
               <h1 className="text-lg font-black text-[#F9F9FB]">Portfolio</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="bizswap-wallet-wrapper">
              <BizSwapAuthButton connectText="Connect Solana" style={{ height: '36px', fontSize: '13px', borderRadius: '0.75rem', fontWeight: 'bold' }} />
            </div>
            <Link href="/bizswap/dashboard/alerts" className="hidden md:flex relative w-10 h-10 rounded-xl bg-[#1C2538] border border-[#2C3E5D] items-center justify-center text-[#7B8B9A] hover:text-[#F9F9FB] hover:bg-[#2C3E5D] transition-colors cursor-pointer active:scale-95">
              <Notification01Icon className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#81D7B4] rounded-full text-[#0A0F17] text-[9px] font-bold flex items-center justify-center">3</span>
            </Link>
            <Link href="/bizswap/dashboard/settings" className="hidden md:flex w-10 h-10 rounded-xl bg-[#1C2538] border border-[#2C3E5D] items-center justify-center text-[#7B8B9A] hover:text-[#F9F9FB] hover:bg-[#2C3E5D] transition-colors cursor-pointer active:scale-95">
              <Settings01Icon className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
