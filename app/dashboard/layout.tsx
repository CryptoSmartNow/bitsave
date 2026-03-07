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
import { HiOutlineHome, HiOutlineDocumentText, HiOutlineCurrencyDollar, HiOutlineUserGroup, HiOutlineTrophy, HiOutlineUserPlus, HiOutlinePlus, HiOutlineCog, HiOutlineArrowRightOnRectangle, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
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
  const { ready, authenticated, user } = usePrivy();
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { disconnect, isDisconnecting } = useOptimizedDisconnect();
  const router = useRouter();
  const pathname = usePathname();

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

          <div className={`fixed inset-y-0 left-0 h-full transition-transform duration-300 ease-in-out z-50 ${sidebarCollapsed ? '-translate-x-full md:translate-x-0 w-[260px] md:w-[240px]' : 'translate-x-0 w-[260px] md:w-[240px]'
            }`}>

            {/* Main Sidebar Container — solid white, clean border */}
            <div className="h-full bg-white border-r border-gray-200 flex flex-col">

              {/* Logo */}
              <div className="flex items-center justify-center px-5 pt-6 pb-4">
                <Image
                  src="/bitsavelogo.png"
                  alt="Bitsave logo"
                  width={140}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              </div>

              {/* Divider */}
              <div className="mx-5 border-b border-gray-100" />

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
                <Link href="/dashboard" onClick={handleMobileNavClick} className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/dashboard')
                  ? 'bg-gray-50 text-gray-900 border-l-2 border-[#81D7B4] -ml-px'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <HiOutlineHome className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>Dashboard</span>
                </Link>

                <Link href="/dashboard/create-savings" onClick={handleMobileNavClick} className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/dashboard/create-savings')
                  ? 'bg-[#81D7B4]/8 text-[#2D5A4A] border-l-2 border-[#81D7B4] -ml-px'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <HiOutlinePlus className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>Create Plan</span>
                </Link>

                <Link href="/dashboard/plans" onClick={handleMobileNavClick} className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/dashboard/plans')
                  ? 'bg-gray-50 text-gray-900 border-l-2 border-[#81D7B4] -ml-px'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <HiOutlineDocumentText className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>My Plans</span>
                </Link>

                <Link href="/dashboard/leaderboard" onClick={handleMobileNavClick} className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/dashboard/leaderboard')
                  ? 'bg-gray-50 text-gray-900 border-l-2 border-[#81D7B4] -ml-px'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <HiOutlineTrophy className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>Leaderboard</span>
                </Link>

                <Link href="/dashboard/activity" onClick={handleMobileNavClick} className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/dashboard/activity')
                  ? 'bg-gray-50 text-gray-900 border-l-2 border-[#81D7B4] -ml-px'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <HiOutlineCurrencyDollar className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>Earn $BTS</span>
                </Link>

                <Link href="/dashboard/referrals" onClick={handleMobileNavClick} className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/dashboard/referrals')
                  ? 'bg-gray-50 text-gray-900 border-l-2 border-[#81D7B4] -ml-px'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <HiOutlineUserPlus className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>Referrals</span>
                </Link>

                {/* Divider before secondary */}
                <div className="!my-3 mx-1 border-b border-gray-100" />

                <Link href="/dashboard/social" onClick={handleMobileNavClick} className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/dashboard/social')
                  ? 'bg-gray-50 text-gray-900 border-l-2 border-[#81D7B4] -ml-px'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <HiOutlineUserGroup className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>Savvy Space</span>
                </Link>

                <Link href="/dashboard/settings" onClick={handleMobileNavClick} className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/dashboard/settings')
                  ? 'bg-gray-50 text-gray-900 border-l-2 border-[#81D7B4] -ml-px'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <HiOutlineCog className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>Settings</span>
                </Link>
              </nav>

              {/* Bottom Section */}
              <div className="px-3 pb-4 pt-2 border-t border-gray-100">
                <button
                  onClick={() => { disconnect(); }}
                  disabled={isDisconnecting}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {isDisconnecting ? (
                    <svg className="animate-spin w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <HiOutlineArrowRightOnRectangle className="w-[18px] h-[18px] flex-shrink-0" />
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
      <div className={`transition-all duration-300 ease-in-out ${isConnected ? 'md:ml-[240px]' : 'md:ml-0'} ml-0 overflow-x-hidden relative min-h-screen bg-[#F9FAFB]`}>

        {mounted && isConnected && (
          <>
            {/* Desktop Language Selector: Absolute top-right */}
            <div className="hidden md:block absolute top-5 right-6 z-30 w-[140px]">
              <LanguageSelector />
            </div>
          </>
        )}

        {mounted ? (
          isConnected ? (
            <div className="mt-16 md:mt-6 px-4 sm:px-6 lg:px-8 pb-6">
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
                };
                const title = pageTitles[pathname];
                if (!title) return null;
                return (
                  <div className="mb-6">
                    <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                  </div>
                );
              })()}
              <div className="w-full relative z-10">
                {children}
              </div>
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
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
}