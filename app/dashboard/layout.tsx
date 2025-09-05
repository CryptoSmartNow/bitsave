'use client'

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useOptimizedDisconnect } from '../../lib/useOptimizedDisconnect';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import GoogleTranslate from '../../components/GoogleTranslate';
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
      // Auto-trigger the connect button after a short delay
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
      {/* Sidebar - responsive for mobile with translucent effect */}
      <div className={`fixed h-full bg-white/70 backdrop-blur-xl border-r border-gray-200/50 shadow-lg transition-all duration-300 z-50 ${sidebarCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-64'}`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-200/30">
          {!sidebarCollapsed && <span className="text-2xl font-bold text-gray-800">BitSave</span>}
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-lg hover:bg-gray-100/70 transition-colors md:block hidden"
          >
            {sidebarCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Sidebar content with modern icons */}
        <div className="py-6">
          <Link href="/dashboard" className={`flex items-center px-4 py-3 mb-2 rounded-lg mx-2 ${
            isActive('/dashboard') 
              ? 'bg-[#81D7B4]/20 text-[#81D7B4]' 
              : 'hover:bg-gray-100/60 text-gray-600 hover:text-gray-800 transition-colors'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 22V12h6v10" />
            </svg>
            {!sidebarCollapsed && <span className="ml-3">Dashboard</span>}
          </Link>
          
          <Link href="/dashboard/plans" className={`flex items-center px-4 py-3 mb-2 rounded-lg mx-2 ${
            isActive('/dashboard/plans') 
              ? 'bg-[#81D7B4]/20 text-[#81D7B4]' 
              : 'hover:bg-gray-100/60 text-gray-600 hover:text-gray-800 transition-colors'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {!sidebarCollapsed && <span className="ml-3">My Plans</span>}
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
          
          <Link href="/dashboard/activity" className={`flex items-center px-4 py-3 mb-2 rounded-lg mx-2 ${
            isActive('/dashboard/activity') 
              ? 'bg-[#81D7B4]/20 text-[#81D7B4]' 
              : 'hover:bg-gray-100/60 text-gray-600 hover:text-gray-800 transition-colors'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {!sidebarCollapsed && <span className="ml-3">Earn More Points</span>}
          </Link>
          
          <Link href="/dashboard/social" className={`flex items-center px-4 py-3 mb-2 rounded-lg mx-2 ${
            isActive('/dashboard/social') 
              ? 'bg-[#81D7B4]/20 text-[#81D7B4]' 
              : 'hover:bg-gray-100/60 text-gray-600 hover:text-[#81D7B4]/80 transition-colors'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <circle cx="12" cy="12" r="4" strokeWidth="1.5"/>
              <ellipse cx="12" cy="12" rx="8" ry="2" strokeWidth="1.5" opacity="0.7"/>
              <ellipse cx="12" cy="12" rx="6.5" ry="1.5" strokeWidth="1" opacity="0.5"/>
            </svg>
            {!sidebarCollapsed && <span className="ml-3">Savvy Space</span>}
          </Link>
          
          <Link href="/dashboard/leaderboard" className={`flex items-center px-4 py-3 mb-2 rounded-lg mx-2 ${
            isActive('/dashboard/leaderboard') 
              ? 'bg-[#81D7B4]/20 text-[#81D7B4]' 
              : 'hover:bg-gray-100/60 text-gray-600 hover:text-gray-800 transition-colors'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 8v8m-8-5v5M4 9h16M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {!sidebarCollapsed && <span className="ml-3">Leaderboard</span>}
          </Link>
          
          <Link href="/dashboard/referrals" className={`flex items-center px-4 py-3 mb-2 rounded-lg mx-2 ${
            isActive('/dashboard/referrals') 
              ? 'bg-[#81D7B4]/20 text-[#81D7B4]' 
              : 'hover:bg-gray-100/60 text-gray-600 hover:text-gray-800 transition-colors'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {!sidebarCollapsed && <span className="ml-3">Referrals</span>}
          </Link>
          
          <Link href="/dashboard/create-savings" className={`flex items-center px-4 py-3 mb-2 rounded-lg mx-2 ${
            isActive('/dashboard/create-savings') 
              ? 'bg-[#81D7B4]/20 text-[#81D7B4]' 
              : 'hover:bg-gray-100/60 text-gray-600 hover:text-gray-800 transition-colors'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
            </svg>
            {!sidebarCollapsed && <span className="ml-3">Create Plan</span>}
          </Link>

          <Link href="/dashboard/settings" className={`flex items-center px-4 py-3 mb-2 rounded-lg mx-2 ${
            isActive('/dashboard/settings') 
              ? 'bg-[#81D7B4]/20 text-[#81D7B4]' 
              : 'hover:bg-gray-100/60 text-gray-600 hover:text-gray-800 transition-colors'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {!sidebarCollapsed && <span className="ml-3">Settings</span>}
          </Link>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/30">
          <button 
            onClick={() => {
              // Immediate UI feedback and disconnect
              disconnect();
            }}
            disabled={isDisconnecting}
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100/60 rounded-lg transition-colors disabled:opacity-50"
          >
            {isDisconnecting ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            )}
            {!sidebarCollapsed && (
              <span className="ml-3">
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </span>
            )}
          </button>
          
          {/* Version number */}
          <div className="mt-3 text-center">
            <span className="text-xs text-gray-400 font-medium">
              {!sidebarCollapsed ? 'Version V1.1.0' : 'V1.1.0'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile sidebar toggle button */}
      <div className="fixed top-16 right-4 z-50 md:hidden">
        <button 
          onClick={toggleSidebar}
          className="p-2 bg-white/80 backdrop-blur-lg rounded-lg shadow-md border border-gray-200/50"
        >
          {sidebarCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} ml-0 overflow-x-hidden`}>
        {/* Language Selector - Fixed position in top right with proper spacing */}
        <div className="fixed top-4 right-4 z-40">
          <GoogleTranslate />
        </div>
        
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