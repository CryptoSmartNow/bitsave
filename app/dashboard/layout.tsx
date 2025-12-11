'use client'

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useOptimizedDisconnect } from '../../lib/useOptimizedDisconnect';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Exo } from 'next/font/google';
import CustomConnectButton from '@/components/CustomConnectButton';
import { HiOutlineHome, HiOutlineDocumentText, HiOutlineCurrencyDollar, HiOutlineUserGroup, HiOutlineTrophy, HiOutlineUserPlus, HiOutlinePlus, HiOutlineCog, HiOutlineArrowRightOnRectangle, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { FiMenu, FiX } from 'react-icons/fi';
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
  const { isConnected } = useAccount();
  const { disconnect, isDisconnecting } = useOptimizedDisconnect();
  const router = useRouter();
  const pathname = usePathname();

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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={toggleSidebar}
            />
          )}

          <div className={`fixed inset-y-0 left-0 h-screen transition-transform duration-300 ease-in-out z-50 ${
            sidebarCollapsed ? '-translate-x-full md:translate-x-0 w-[280px] xs:w-[320px] sm:w-[360px] md:w-60' : 'translate-x-0 w-[280px] xs:w-[320px] sm:w-[360px] md:w-60'
          }`}>

          {/* Main Sidebar Container - solid on mobile, transparent on desktop */}
          <div className="h-full m-2 xs:m-3 sm:m-4 rounded-2xl relative bg-white/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-0 border border-gray-200 md:border-0 shadow-2xl md:shadow-none">
          
          {/* Content Container */}
          <div className="relative h-full flex flex-col">
            {/* Toggle button for collapsed sidebar - positioned above logo */}
            {sidebarCollapsed && (
              <div className="flex justify-center pt-3 pb-2 md:hidden">
                <button 
                  onClick={toggleSidebar}
                  className="p-2 rounded-xl transition-all duration-200 min-h-[32px] min-w-[32px] flex items-center justify-center"
                  aria-label="Open sidebar"
                >
                  <FiMenu className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            )}
            
            {/* Sidebar Header */}
            <div className="flex items-center justify-center p-3 xs:p-4 mb-6 xs:mb-8">
              <div className="flex items-center justify-center w-full">
                <Image
                  src="/bitsavelogo.png"
                  alt="Bitsave logo"
                  width={180}
                  height={48}
                  className="h-9 w-auto md:h-11"
                  priority
                />
              </div>
              
              {!sidebarCollapsed && (
                <button 
                  onClick={toggleSidebar}
                  className="hidden p-2 rounded-xl transition-all duration-200 min-h-[36px] min-w-[36px] items-center justify-center"
                >
                  <HiOutlineChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
              )}
            </div>

            {/* Navigation Section */}
            <div className="flex-1 overflow-y-auto pt-8 xs:pt-10 sm:pt-12 pb-4 px-2 xs:px-3 sm:px-3 mb-4">
              <Link href="/dashboard" onClick={handleMobileNavClick} className={`group flex items-center ${sidebarCollapsed ? 'px-3 py-4 justify-center' : 'px-3 xs:px-4 py-3 xs:py-4'} mb-1 xs:mb-2 rounded-xl mx-1 transition-all duration-300 ${
                isActive('/dashboard') 
                  ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                  : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
              }`}>
                <div className="relative">
                  <HiOutlineHome className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  {isActive('/dashboard') && (
                    <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                  )}
                </div>
                {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">Dashboard</span>}
              </Link>

               <Link href="/dashboard/plans" onClick={handleMobileNavClick} className={`group flex items-center ${sidebarCollapsed ? 'px-3 py-4 justify-center' : 'px-3 xs:px-4 py-3 xs:py-4'} mb-1 xs:mb-2 rounded-xl mx-1 transition-all duration-300 ${
                 isActive('/dashboard/plans') 
                   ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                   : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
               }`}>
                 <div className="relative">
                   <HiOutlineDocumentText className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                   {isActive('/dashboard/plans') && (
                     <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                   )}
                 </div>
                 {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">My Plans</span>}
               </Link>

               <Link href="/dashboard/withdraw" onClick={handleMobileNavClick} className={`group flex items-center ${sidebarCollapsed ? 'px-3 py-4 justify-center' : 'px-3 xs:px-4 py-3 xs:py-4'} mb-1 xs:mb-2 rounded-xl mx-1 transition-all duration-300 ${
                 isActive('/dashboard/withdraw') 
                   ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                   : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
               }`}>
                 <div className="relative">
                   <HiOutlineArrowRightOnRectangle className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                   {isActive('/dashboard/withdraw') && (
                     <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                   )}
                 </div>
                 {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">Withdraw</span>}
               </Link>

     
          
               <Link href="/dashboard/activity" onClick={handleMobileNavClick} className={`group flex items-center ${sidebarCollapsed ? 'px-3 py-4 justify-center' : 'px-3 xs:px-4 py-3 xs:py-4'} mb-1 xs:mb-2 rounded-xl mx-1 transition-all duration-300 ${
                 isActive('/dashboard/activity') 
                   ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                   : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
               }`}>
                 <div className="relative">
                   <HiOutlineCurrencyDollar className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                   {isActive('/dashboard/activity') && (
                     <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                   )}
                 </div>
                 {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">Earn $BTS</span>}
               </Link>

               <Link href="/dashboard/social" onClick={handleMobileNavClick} className={`group flex items-center ${sidebarCollapsed ? 'px-3 py-4 justify-center' : 'px-3 xs:px-4 py-3 xs:py-4'} mb-1 xs:mb-2 rounded-xl mx-1 transition-all duration-300 ${
                 isActive('/dashboard/social') 
                   ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                   : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
               }`}>
                 <div className="relative">
                   <HiOutlineUserGroup className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                   {isActive('/dashboard/social') && (
                     <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                   )}
                 </div>
                 {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">Savvy Space</span>}
               </Link>

               <Link href="/dashboard/leaderboard" onClick={handleMobileNavClick} className={`group flex items-center ${sidebarCollapsed ? 'px-3 py-4 justify-center' : 'px-3 xs:px-4 py-3 xs:py-4'} mb-1 xs:mb-2 rounded-xl mx-1 transition-all duration-300 ${
                 isActive('/dashboard/leaderboard') 
                   ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                   : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
               }`}>
                 <div className="relative">
                   <HiOutlineTrophy className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                   {isActive('/dashboard/leaderboard') && (
                     <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                   )}
                 </div>
                 {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">Leaderboard</span>}
               </Link>

               <Link href="/dashboard/referrals" onClick={handleMobileNavClick} className={`group flex items-center ${sidebarCollapsed ? 'px-3 py-4 justify-center' : 'px-3 xs:px-4 py-3 xs:py-4'} mb-1 xs:mb-2 rounded-xl mx-1 transition-all duration-300 ${
                 isActive('/dashboard/referrals') 
                   ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                   : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
               }`}>
                 <div className="relative">
                   <HiOutlineUserPlus className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                   {isActive('/dashboard/referrals') && (
                     <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                   )}
                 </div>
                 {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">Referrals</span>}
               </Link>

               <Link href="/dashboard/create-savings" onClick={handleMobileNavClick} className={`group flex items-center ${sidebarCollapsed ? 'px-3 py-4 justify-center' : 'px-3 xs:px-4 py-3 xs:py-4'} mb-1 xs:mb-2 rounded-xl mx-1 transition-all duration-300 ${
                 isActive('/dashboard/create-savings') 
                   ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                   : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
              }`}>
                 <div className="relative">
                   <HiOutlinePlus className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                   {isActive('/dashboard/create-savings') && (
                     <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                   )}
                 </div>
                 {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">Create Plan</span>}
               </Link>

               <Link href="/dashboard/settings" onClick={handleMobileNavClick} className={`group flex items-center ${sidebarCollapsed ? 'px-3 py-4 justify-center' : 'px-3 xs:px-4 py-3 xs:py-4'} mb-1 xs:mb-2 rounded-xl mx-1 transition-all duration-300 ${
                 isActive('/dashboard/settings') 
                   ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                   : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
               }`}>
                 <div className="relative">
                   <HiOutlineCog className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                   {isActive('/dashboard/settings') && (
                     <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                   )}
                 </div>
                 {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">Settings</span>}
               </Link>
             </div>
        
            {/* Bottom Section - background removed */}
            <div className="p-3 xs:p-4 bg-transparent mt-auto pt-2">
               <button 
                 onClick={() => {
                   // Immediate UI feedback and disconnect
                   disconnect();
                 }}
                 disabled={isDisconnecting}
                 className={`group w-full flex items-center ${sidebarCollapsed ? 'px-3 py-4 justify-center' : 'px-3 xs:px-4 py-3 xs:py-4'} text-gray-700 hover:text-gray-900 rounded-xl transition-all duration-300 disabled:opacity-50 transform hover:scale-[1.02]`}
                >
                 {isDisconnecting ? (
                   <svg className="animate-spin w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                 ) : (
                   <HiOutlineArrowRightOnRectangle className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                 )}
                 {!sidebarCollapsed && (
                   <span className="ml-3 text-sm font-medium truncate">
                     {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                   </span>
                 )}
               </button>
               
               {/* Version number */}
               <div className="mt-2 text-center">
               <span className="text-xs text-gray-600/80 font-medium leading-tight">
                 {!sidebarCollapsed ? 'Version V1.1.0' : 'V1.1.0'}
               </span>
              </div>
            </div>
            {/* End Content Container */}
          </div>
          {/* End Main Sidebar Container */}
        </div>
          {/* End Fixed Sidebar Wrapper */}
          </div>
        </>
      )}

        {/* Mobile sidebar toggle button - Fixed position */}
        {isConnected && (
          <div className="fixed right-4 top-4 z-[100] md:hidden">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSidebar(); }}
              className="p-3 rounded-2xl transition-all duration-300 min-h-[48px] min-w-[48px] flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200"
              aria-label={sidebarCollapsed ? 'Open menu' : 'Close menu'}
              aria-expanded={!sidebarCollapsed}
            >
              {sidebarCollapsed ? (
                <FiMenu className="w-6 h-6 text-gray-800" />
              ) : (
                <FiX className="w-6 h-6 text-gray-800" />
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
        <div className={`transition-all duration-300 ease-in-out ${isConnected ? 'md:ml-64' : 'md:ml-0'} ml-0 overflow-x-hidden relative min-h-screen`}>
            
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
            <div className="mt-20 md:mt-14 px-3 sm:px-4 md:px-6 lg:px-8 pb-0">
              {(() => {
                const pageTitles: Record<string, string> = {
                  '/dashboard': 'Dashboard Overview',
                  '/dashboard/activity': 'Activity',
                  '/dashboard/referrals': 'Referrals',
                  '/dashboard/leaderboard': 'Leaderboard',
                  '/dashboard/social': 'Savvy Space',
                  '/dashboard/settings': 'Settings',
                  '/dashboard/plans': 'Savings Plans',
                  '/dashboard/withdraw': 'Withdraw',
                  '/dashboard/tradfi': 'TradFi',
                  '/dashboard/create-savings': 'Create Savings',
                };
                const title = pageTitles[pathname];
                if (!title) return null;
                return (
                  <div className="w-full text-center mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl font-medium text-gray-900">{title}</h1>
                  </div>
                );
              })()}
              <div className="dashboard-container w-full bg-white rounded-tl-[20px] overflow-hidden relative z-10">
                {children}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#81D7B4] to-[#66C4A3] rounded-2xl flex items-center justify-center shadow-lg mb-2">
                 <HiOutlineTrophy className="w-8 h-8 text-white" />
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
      
      {/* Modal-only connection experience: no custom overlay or network UI */}
    </div>
  );
}