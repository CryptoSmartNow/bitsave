'use client';

import { Menu01Icon } from "hugeicons-react";
import { useState } from 'react';
import UserInteractionsSidebar, { SidebarState, defaultUserInteractionsNav } from '@/components/UserInteractionsSidebar';
import { AuthProvider, useAuth } from '@/lib/adminAuth';
import UserInteractionsLoginForm from './components/UserInteractionsLoginForm';

function UserInteractionsLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarState, setSidebarState] = useState<SidebarState>('open');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#070b14] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#81D7B4] border-t-transparent"></div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <UserInteractionsLoginForm />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-[#060a12] text-gray-900 dark:text-white font-sans selection:bg-[#81D7B4] selection:text-white">
      <UserInteractionsSidebar 
        sidebarState={sidebarState} 
        setSidebarState={setSidebarState}
        navigationItems={defaultUserInteractionsNav}
      />

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarState('open')}
        className={`lg:hidden fixed left-4 top-4 z-40 p-2.5 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg text-gray-700 dark:text-gray-200 hover:text-[#81D7B4] hover:border-[#81D7B4]/50 transition-all duration-200 cursor-pointer ${
          sidebarState === 'open' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Open Navigation Menu"
      >
        <Menu01Icon className="w-5 h-5" />
      </button>
      
      <div 
        className={`transition-all duration-300 ease-in-out min-h-screen ${
          sidebarState === 'open' ? 'lg:pl-[310px]' : sidebarState === 'collapsed' ? 'lg:pl-[104px]' : ''
        }`}
      >
        <main className="p-4 pt-16 md:p-6 md:pt-6 lg:p-8 lg:pt-8 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function UserInteractionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <UserInteractionsLayoutInner>{children}</UserInteractionsLayoutInner>
    </AuthProvider>
  );
}