'use client'

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useOptimizedDisconnect } from '../../lib/useOptimizedDisconnect';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import NetworkConnectionUI from '../../components/NetworkConnectionUI';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk', 
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
  const connectButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isConnected) {
      const timer = setTimeout(() => {
        if (connectButtonRef.current && !isConnected) {
          const button = connectButtonRef.current.querySelector('button');
          if (button) {
            button.click();
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, mounted]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768; 
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [pathname]); 

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    return path !== '/dashboard' && pathname.startsWith(path);
  };

  return (
    <div className={`${spaceGrotesk.variable} font-sans min-h-screen bg-[#f2f2f2] text-gray-800 overflow-x-hidden`}>
      {/* Sidebar - Detached Floating Design */}
      <div className={`fixed top-4 left-4 h-[calc(100vh-2rem)] transition-all duration-300 ease-in-out z-50 ${
        sidebarCollapsed ? '-translate-x-[calc(100%+2rem)] md:translate-x-0 md:w-16' : 'translate-x-0 w-60'
      }`}>
        
        {/* Main Sidebar Container with Liquid Glass Effect */}
        <div className="h-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl overflow-hidden relative">
          {/* Gradient Overlay for Depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-white/10 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/5 via-transparent to-white/10 pointer-events-none"></div>
          
          {/* Inner Glass Layer */}
          <div className="absolute inset-[1px] bg-white/30 backdrop-blur-sm rounded-[15px] pointer-events-none"></div>
          
          {/* Content Container */}
          <div className="relative h-full flex flex-col">
            {/* Toggle button for collapsed sidebar - positioned above logo */}
            {sidebarCollapsed && (
              <div className="flex justify-center pt-3 pb-2">
                <button 
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-white/30 rounded-xl transition-all duration-200 min-h-[32px] min-w-[32px] flex items-center justify-center backdrop-blur-sm border border-white/20 hover:border-white/40 hover:shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-gray-700">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-[#81D7B4] via-[#6BC7A0] to-[#5AB896] rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                {!sidebarCollapsed && (
                  <div className="ml-3">
                    <h1 className="text-xl font-bold text-gray-800 leading-tight">BitSave</h1>
                    <p className="text-xs text-gray-600/80 leading-tight">Smart Savings</p>
                  </div>
                )}
              </div>
              
              {!sidebarCollapsed && (
                <button 
                  onClick={toggleSidebar}
                  className="hidden md:flex p-2 hover:bg-white/30 rounded-xl transition-all duration-200 min-h-[36px] min-w-[36px] items-center justify-center backdrop-blur-sm border border-white/20 hover:border-white/40 hover:shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-gray-700">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
            </div>
        
            {/* Navigation Section */}
            <div className="flex-1 overflow-y-auto py-4 px-3">
              <Link href="/dashboard" className={`group flex items-center ${sidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'} mb-2 rounded-xl mx-1 transition-all duration-300 ${
                isActive('/dashboard') 
                  ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                  : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
              }`}>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 22V12h6v10" />
                  </svg>
                  {isActive('/dashboard') && (
                    <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                  )}
                </div>
                {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">Dashboard</span>}
              </Link>
          
               <Link href="/dashboard/plans" className={`group flex items-center ${sidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'} mb-2 rounded-xl mx-1 transition-all duration-300 ${
                 isActive('/dashboard/plans') 
                   ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                   : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
               }`}>
                 <div className="relative">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                   {isActive('/dashboard/plans') && (
                     <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                   )}
                 </div>
                 {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">My Plans</span>}
               </Link>
          
          {/* Withdrawal tab hidden - route will return 404 */}
          {/* <Link href="/dashboard/withdraw" className={`flex items-center px-4 py-3 mb-2 rounded-lg mx-2 ${
            isActive('/dashboard/withdraw') 
              ? 'bg-[#81D7B4]/20 text-[#81D7B4]' 
              : 'hover:bg-gray-100/60 text-gray-600 hover:text-gray-800 transition-colors'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            {!sidebarCollapsed && <span className="ml-3">Withdraw</span>}
          </Link> */}
          
               <Link href="/dashboard/activity" className={`group flex items-center ${sidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'} mb-2 rounded-xl mx-1 transition-all duration-300 ${
                 isActive('/dashboard/activity') 
                   ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                   : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
               }`}>
                 <div className="relative">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12s-1.536-.219-2.121-.659c-1.172-.879-1.172-2.303 0-3.182C10.93 7.28 12.829 7.28 14 8.159L14.879 8.818"/>
                   </svg>
                   {isActive('/dashboard/activity') && (
                     <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                   )}
                 </div>
                 {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">Earn $BTS</span>}
               </Link>
               
               <Link href="/dashboard/social" className={`group flex items-center ${sidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'} mb-2 rounded-xl mx-1 transition-all duration-300 ${
                 isActive('/dashboard/social') 
                   ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                   : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
               }`}>
                 <div className="relative">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                   </svg>
                   {isActive('/dashboard/social') && (
                     <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                   )}
                 </div>
                 {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">Savvy Space</span>}
               </Link>
          
               <Link href="/dashboard/leaderboard" className={`group flex items-center ${sidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'} mb-2 rounded-xl mx-1 transition-all duration-300 ${
                 isActive('/dashboard/leaderboard') 
                   ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                   : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
               }`}>
                 <div className="relative">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                   </svg>
                   {isActive('/dashboard/leaderboard') && (
                     <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                   )}
                 </div>
                 {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">Leaderboard</span>}
               </Link>
               
               <Link href="/dashboard/referrals" className={`group flex items-center ${sidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'} mb-2 rounded-xl mx-1 transition-all duration-300 ${
                 isActive('/dashboard/referrals') 
                   ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                   : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
               }`}>
                 <div className="relative">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                   </svg>
                   {isActive('/dashboard/referrals') && (
                     <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                   )}
                 </div>
                 {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">Referrals</span>}
               </Link>
               
               <Link href="/dashboard/create-savings" className={`group flex items-center ${sidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'} mb-2 rounded-xl mx-1 transition-all duration-300 ${
                 isActive('/dashboard/create-savings') 
                   ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                   : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
               }`}>
                 <div className="relative">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4v16m8-8H4" />
                   </svg>
                   {isActive('/dashboard/create-savings') && (
                     <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                   )}
                 </div>
                 {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">Create Plan</span>}
               </Link>

               <Link href="/dashboard/settings" className={`group flex items-center ${sidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'} mb-2 rounded-xl mx-1 transition-all duration-300 ${
                 isActive('/dashboard/settings') 
                   ? 'bg-gradient-to-r from-[#81D7B4]/30 to-[#6BC7A0]/20 text-[#2D5A4A] shadow-lg backdrop-blur-sm border border-[#81D7B4]/30' 
                   : 'hover:bg-white/40 text-gray-700 hover:text-gray-900 hover:shadow-md hover:backdrop-blur-sm hover:border hover:border-white/40 transform hover:scale-[1.02]'
               }`}>
                 <div className="relative">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                   {isActive('/dashboard/settings') && (
                     <div className="absolute -inset-1 bg-[#81D7B4]/20 rounded-lg blur-sm"></div>
                   )}
                 </div>
                 {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">Settings</span>}
               </Link>
             </div>
        
             {/* Bottom Section */}
             <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 bg-white/10 backdrop-blur-sm">
               <button 
                 onClick={() => {
                   // Immediate UI feedback and disconnect
                   disconnect();
                 }}
                 disabled={isDisconnecting}
                 className={`group w-full flex items-center ${sidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-4 py-3'} text-gray-700 hover:text-gray-900 hover:bg-white/30 rounded-xl transition-all duration-300 disabled:opacity-50 backdrop-blur-sm border border-white/20 hover:border-white/40 hover:shadow-lg transform hover:scale-[1.02]`}
               >
                 {isDisconnecting ? (
                   <svg className="animate-spin w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                 ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                   </svg>
                 )}
                 {!sidebarCollapsed && (
                   <span className="ml-3 text-sm font-medium truncate">
                     {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                   </span>
                 )}
               </button>
               
               {/* Version number */}
               <div className="mt-3 text-center">
                 <span className="text-xs text-gray-600/80 font-medium leading-tight">
                   {!sidebarCollapsed ? 'Version V1.1.0' : 'V1.1.0'}
                 </span>
               </div>
             </div>
           </div>
         </div>
       </div>

        {/* Mobile sidebar toggle button */}
        <div className="fixed top-4 right-4 z-50 md:hidden">
          <button 
            onClick={toggleSidebar}
            className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 hover:bg-white/30 hover:shadow-xl transition-all duration-300 min-h-[48px] min-w-[48px] flex items-center justify-center transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-gray-700">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </button>
        </div>



        {/* Main Content */}
        <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} ml-0 overflow-x-hidden`}>
        
        {mounted ? (
          isConnected ? (
            <div className="animate-fadeIn">
              {children}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
          </div>
        )}
      </div>

      {/* RainbowKit Connect Button - Hidden but available for modal triggering */}
      {!isConnected && mounted && (
        <div ref={connectButtonRef} className="fixed top-4 right-4 z-50 opacity-0 pointer-events-none">
          <ConnectButton />
        </div>
      )}
      
      {/* Enhanced Network Connection UI for unconnected users */}
      {!isConnected && mounted && (
        <div className="fixed inset-0 bg-white z-40 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
              <NetworkConnectionUI
                onDisconnect={() => disconnect()}
                showNetworkInfo={true}
                className=""
              />
              
              {/* Navigation back to home */}
              <div className="text-center mt-8">
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Home</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}