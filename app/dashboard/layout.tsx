'use client'

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useOptimizedDisconnect } from '../../lib/useOptimizedDisconnect';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Exo } from 'next/font/google';
import CustomConnectButton from '@/components/CustomConnectButton';
import { HiOutlineHome, HiOutlineDocumentText, HiOutlineCurrencyDollar, HiOutlineUserGroup, HiOutlineTrophy, HiOutlineUserPlus, HiOutlinePlus, HiOutlineCog, HiOutlineArrowRightOnRectangle, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineChevronDown, HiOutlineUsers, HiOutlineBanknotes } from 'react-icons/hi2';
import { Bot } from 'lucide-react';
import SavvyBotWidget from '@/components/SavvyBotWidget';
import { FiMenu as FiMenuIcon, FiX as FiXIcon } from 'react-icons/fi';
import LanguageSelector from '@/components/LanguageSelector';


// Removed custom network connection UI in favor of RainbowKit modal-only

const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-exo',
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    main: true,
    community: false,
    preferences: false
  });
  const { ready, authenticated, user } = usePrivy();
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { disconnect, isDisconnecting } = useOptimizedDisconnect();
  const router = useRouter();
  const pathname = usePathname();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Compute common address
  const activeAddress = wagmiAddress || user?.wallet?.address;

  // Use Privy's authenticated state or Wagmi connection state
  // Show as connected if either Privy is authenticated or Wagmi is connected
  const isConnected = ready && (authenticated || isWagmiConnected);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setSidebarCollapsed(true);
      }
    }
  }, [pathname]);

  const toggleSidebar = () => {
    // Allow toggling regardless of breakpoint; UI controls are already responsive.
    setSidebarCollapsed((prev) => !prev);
  };

  const handleMobileNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    return path !== '/dashboard' && pathname.startsWith(path);
  };

  return (
    <div className={`${exo.variable} font-sans min-h-screen dashboard-page text-gray-800 overflow-x-hidden`}>
      {/* Sidebar - Mobile drawer with overlay and solid background; transparent on desktop */}
      {isConnected && (
        <>
          {/* Mobile overlay when drawer is open */}
          {!sidebarCollapsed && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 md:hidden"
              onClick={toggleSidebar}
            />
          )}

          <div className={`fixed inset-y-0 left-0 h-full transition-transform duration-300 ease-in-out z-50 ${sidebarCollapsed ? '-translate-x-full md:translate-x-0 w-[260px] md:w-[260px]' : 'translate-x-0 w-[260px] md:w-[260px]'
            }`}>

            {/* Main Sidebar Container — solid white, clean border */}
            <div className="h-full bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.01)] flex flex-col">

              {/* Logo */}
              <div className="flex items-center justify-start px-8 pt-8 pb-6">
                <Image
                  src="/bitsavelogo.png"
                  alt="Bitsave logo"
                  width={140}
                  height={40}
                  className="h-8 w-auto hover:opacity-80 transition-opacity"
                  priority
                />
              </div>

              {/* Primary Action */}
              <div className="px-5 mb-4">
                <Link href="/dashboard/create-savings" onClick={handleMobileNavClick} className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#81D7B4] hover:bg-opacity-90 text-white rounded-2xl font-bold shadow-[0_4px_15px_rgba(129,215,180,0.3)] transition-all transform hover:-translate-y-0.5">
                  <HiOutlinePlus className="w-5 h-5" strokeWidth={2.5} />
                  <span>Create Plan</span>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-1.5 custom-scrollbar">
                
                {/* Main Menu Dropdown */}
                <div className="mb-2">
                  <button onClick={() => toggleSection('main')} className="w-full flex items-center justify-between px-3 pt-2 pb-1 bg-transparent hover:bg-gray-50 rounded-lg group transition-colors">
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-600 uppercase tracking-widest transition-colors">Main Menu</span>
                    {expandedSections.main ? <HiOutlineChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" /> : <HiOutlineChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />}
                  </button>
                  {expandedSections.main && (
                    <div className="mt-1 space-y-1.5 ml-2 pl-2 border-l-2 border-gray-100">
                      <Link href="/dashboard" onClick={handleMobileNavClick} className={`group flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm transition-all duration-200 ${isActive('/dashboard')
                        ? 'bg-[#F8FAF9] text-black font-bold border border-[#81D7B4]/20 shadow-sm'
                        : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                        }`}>
                        <div className={`p-1.5 rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-white/20 text-white' : 'bg-transparent text-gray-400 group-hover:text-gray-600'}`}>
                          <HiOutlineHome className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <span>Dashboard</span>
                      </Link>

                      <Link href="/dashboard/plans" onClick={handleMobileNavClick} className={`group flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm transition-all duration-200 ${isActive('/dashboard/plans')
                        ? 'bg-[#81D7B4] text-white font-bold border border-[#81D7B4] shadow-[0_4px_12px_rgba(129,215,180,0.3)]'
                        : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                        }`}>
                        <div className={`p-1.5 rounded-lg transition-colors ${isActive('/dashboard/plans') ? 'bg-white/20 text-white' : 'bg-transparent text-gray-400 group-hover:text-gray-600'}`}>
                          <HiOutlineDocumentText className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <span>My Plans</span>
                      </Link>

                      <Link href="/dashboard/group-savings" onClick={handleMobileNavClick} className={`group flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm transition-all duration-200 ${isActive('/dashboard/group-savings')
                        ? 'bg-[#81D7B4] text-white font-bold border border-[#81D7B4] shadow-[0_4px_12px_rgba(129,215,180,0.3)]'
                        : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                        }`}>
                        <div className={`p-1.5 rounded-lg transition-colors ${isActive('/dashboard/group-savings') ? 'bg-white/20 text-white' : 'bg-transparent text-gray-400 group-hover:text-gray-600'}`}>
                          <HiOutlineUsers className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <span>Group Savings</span>
                      </Link>

                      <Link href="/dashboard/savvy-bot" onClick={handleMobileNavClick} className={`group flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm transition-all duration-200 ${isActive('/dashboard/savvy-bot')
                        ? 'bg-[#81D7B4] text-white font-bold border border-[#81D7B4] shadow-[0_4px_12px_rgba(129,215,180,0.3)]'
                        : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                        }`}>
                        <div className={`p-1.5 rounded-lg transition-colors ${isActive('/dashboard/savvy-bot') ? 'bg-white/20 text-white' : 'bg-transparent text-gray-400 group-hover:text-gray-600'}`}>
                          <Bot className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <span>Savvy Bot</span>
                      </Link>

                      <Link href="/dashboard/ramp" onClick={handleMobileNavClick} className={`group flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm transition-all duration-200 ${isActive('/dashboard/ramp')
                        ? 'bg-[#81D7B4] text-white font-bold border border-[#81D7B4] shadow-[0_4px_12px_rgba(129,215,180,0.3)]'
                        : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                        }`}>
                        <div className={`p-1.5 rounded-lg transition-colors ${isActive('/dashboard/ramp') ? 'bg-white/20 text-white' : 'bg-transparent text-gray-400 group-hover:text-gray-600'}`}>
                          <HiOutlineBanknotes className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <span>On/Off Ramp</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Community & Rewards Dropdown */}
                <div className="mb-2">
                  <button onClick={() => toggleSection('community')} className="w-full flex items-center justify-between px-3 pt-4 pb-1 bg-transparent hover:bg-gray-50 rounded-lg group transition-colors">
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-600 uppercase tracking-widest transition-colors">Community & Rewards</span>
                    {expandedSections.community ? <HiOutlineChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" /> : <HiOutlineChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />}
                  </button>
                  {expandedSections.community && (
                    <div className="mt-1 space-y-1.5 ml-2 pl-2 border-l-2 border-gray-100">
                      <Link href="/dashboard/leaderboard" onClick={handleMobileNavClick} className={`group flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm transition-all duration-200 ${isActive('/dashboard/leaderboard')
                        ? 'bg-[#81D7B4] text-white font-bold border border-[#81D7B4] shadow-[0_4px_12px_rgba(129,215,180,0.3)]'
                        : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                        }`}>
                        <div className={`p-1.5 rounded-lg transition-colors ${isActive('/dashboard/leaderboard') ? 'bg-white/20 text-white' : 'bg-transparent text-gray-400 group-hover:text-gray-600'}`}>
                          <HiOutlineTrophy className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <span>Leaderboard</span>
                      </Link>

                      <Link href="/dashboard/activity" onClick={handleMobileNavClick} className={`group flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm transition-all duration-200 ${isActive('/dashboard/activity')
                        ? 'bg-[#81D7B4] text-white font-bold border border-[#81D7B4] shadow-[0_4px_12px_rgba(129,215,180,0.3)]'
                        : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                        }`}>
                        <div className={`p-1.5 rounded-lg transition-colors ${isActive('/dashboard/activity') ? 'bg-white/20 text-white' : 'bg-transparent text-gray-400 group-hover:text-gray-600'}`}>
                          <HiOutlineCurrencyDollar className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <span>Earn $BTS</span>
                      </Link>

                      <Link href="/dashboard/referrals" onClick={handleMobileNavClick} className={`group flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm transition-all duration-200 ${isActive('/dashboard/referrals')
                        ? 'bg-[#81D7B4] text-white font-bold border border-[#81D7B4] shadow-[0_4px_12px_rgba(129,215,180,0.3)]'
                        : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                        }`}>
                        <div className={`p-1.5 rounded-lg transition-colors ${isActive('/dashboard/referrals') ? 'bg-white/20 text-white' : 'bg-transparent text-gray-400 group-hover:text-gray-600'}`}>
                          <HiOutlineUserPlus className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <span>Referrals</span>
                      </Link>

                      <Link href="/dashboard/social" onClick={handleMobileNavClick} className={`group flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm transition-all duration-200 ${isActive('/dashboard/social')
                        ? 'bg-[#81D7B4] text-white font-bold border border-[#81D7B4] shadow-[0_4px_12px_rgba(129,215,180,0.3)]'
                        : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                        }`}>
                        <div className={`p-1.5 rounded-lg transition-colors ${isActive('/dashboard/social') ? 'bg-white/20 text-white' : 'bg-transparent text-gray-400 group-hover:text-gray-600'}`}>
                          <HiOutlineUserGroup className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <span>Savvy Space</span>
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Preferences Dropdown */}
                <div className="mb-2">
                  <button onClick={() => toggleSection('preferences')} className="w-full flex items-center justify-between px-3 pt-4 pb-1 bg-transparent hover:bg-gray-50 rounded-lg group transition-colors">
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-600 uppercase tracking-widest transition-colors">Preferences</span>
                    {expandedSections.preferences ? <HiOutlineChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" /> : <HiOutlineChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />}
                  </button>
                  {expandedSections.preferences && (
                    <div className="mt-1 space-y-1.5 ml-2 pl-2 border-l-2 border-gray-100">
                      <Link href="/dashboard/settings" onClick={handleMobileNavClick} className={`group flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm transition-all duration-200 ${isActive('/dashboard/settings')
                        ? 'bg-[#81D7B4] text-white font-bold border border-[#81D7B4] shadow-[0_4px_12px_rgba(129,215,180,0.3)]'
                        : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                        }`}>
                        <div className={`p-1.5 rounded-lg transition-colors ${isActive('/dashboard/settings') ? 'bg-white/20 text-white' : 'bg-transparent text-gray-400 group-hover:text-gray-600'}`}>
                          <HiOutlineCog className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <span>Settings</span>
                      </Link>
                    </div>
                  )}
                </div>
              </nav>

              {/* Bottom Section */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => { disconnect(); }}
                  disabled={isDisconnecting}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 bg-white border border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50 shadow-sm"
                >
                  {isDisconnecting ? (
                    <svg className="animate-spin w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <HiOutlineArrowRightOnRectangle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span>{isDisconnecting ? 'Disconnecting...' : 'Disconnect'}</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile sidebar toggle button */}
      {isConnected && (
        <div className="fixed right-4 top-4 z-[100] md:hidden">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSidebar(); }}
            className="p-2.5 rounded-xl transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center bg-white shadow-md border border-gray-200"
            aria-label={sidebarCollapsed ? 'Open menu' : 'Close menu'}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? (
              <FiMenuIcon className="w-5 h-5 text-gray-700" />
            ) : (
              <FiXIcon className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      )}

      {/* Mobile Language Selector: Fixed top-right (left of menu) - Root Level */}
      {mounted && isConnected && (
        <div className="md:hidden fixed top-4 right-[72px] z-30 w-[100px]">
          <LanguageSelector />
        </div>
      )}



      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${isConnected ? 'md:ml-[260px]' : 'md:ml-0'} ml-0 overflow-x-hidden relative min-h-screen bg-[#F8FAF9]`}>

        {mounted && isConnected && (
          <>
            {/* Desktop Language Selector: Absolute top-right */}
            <div className="hidden md:block absolute top-6 right-8 z-30 w-[140px]">
              <LanguageSelector />
            </div>
          </>
        )}

        {mounted ? (
          isConnected ? (
            <div className="mt-20 md:mt-8 px-4 sm:px-6 lg:px-10 pb-12">
              {(() => {
                const pageTitles: Record<string, string> = {
                  '/dashboard': 'Dashboard',
                  '/dashboard/activity': 'Activity',
                  '/dashboard/referrals': 'Referrals',
                  '/dashboard/leaderboard': 'Leaderboard',
                  '/dashboard/social': 'Savvy Space',
                  '/dashboard/settings': 'Settings',
                  '/dashboard/plans': 'Savings Plans',
                  '/dashboard/withdraw': 'Withdraw',
                  '/dashboard/tradfi': 'TradFi',
                  '/dashboard/create-savings': 'Create Plan',
                  '/dashboard/group-savings': 'Group Savings',
                  '/dashboard/savvy-bot': 'Savvy Bot',
                  '/dashboard/ramp': 'On/Off Ramp',
                };
                const title = pageTitles[pathname];
                if (!title) return null;
                // Exclude displaying the title on dashboard home since we already have "Good morning, User"
                if (pathname === '/dashboard') return null;
                return (
                  <div className="mb-8 pl-1">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
                  </div>
                );
              })()}
              <div className="w-full relative z-10">
                {children}
              </div>
              <SavvyBotWidget />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4 text-center">
              <div className="w-24 h-24 relative mb-2">
                <Image src="/bitsavelogo.png" alt="BitSave" fill className="object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
                <p className="text-gray-500 max-w-md mx-auto">Please connect your wallet to access your BitSave dashboard and manage your savings.</p>
              </div>
              <CustomConnectButton />
            </div>
          )
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full shadow-lg"></div>
          </div>
        )}
      </div>
    </div>
  );
}
