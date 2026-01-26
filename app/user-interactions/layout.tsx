'use client';

import { useState } from 'react';
import UserInteractionsSidebar, { SidebarState } from '@/components/UserInteractionsSidebar';
import { AuthProvider, useAuth } from '@/lib/adminAuth';
import UserInteractionsLoginForm from './components/UserInteractionsLoginForm';
import { 
  Activity, 
  AlertTriangle, 
  Users, 
  LayoutDashboard, 
  Zap,
  Menu
} from 'lucide-react';

function UserInteractionsLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarState, setSidebarState] = useState<SidebarState>('open');
  const { user, loading } = useAuth();

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      href: '/user-interactions',
      description: 'Overview & Health'
    },
    {
      name: 'Analytics',
      icon: Activity,
      href: '/user-interactions/analytics',
      description: 'User & System Metrics'
    },
    {
      name: 'Error Logs',
      icon: AlertTriangle,
      href: '/user-interactions/errors',
      description: 'Bug Tracking & Diagnostics'
    },
    {
      name: 'User Management',
      icon: Users,
      href: '/user-interactions/users',
      description: 'Search & Profiles'
    },
    {
      name: 'Real-time',
      icon: Zap,
      href: '/user-interactions/real-time',
      description: 'Live Activity Feed'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FDFC] via-white to-[#F0F9FF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81D7B4]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <UserInteractionsLoginForm />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans selection:bg-[#81D7B4] selection:text-white">
      <UserInteractionsSidebar 
        sidebarState={sidebarState} 
        setSidebarState={setSidebarState}
        navigationItems={navigationItems}
      />

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarState('open')}
        className={`lg:hidden fixed left-4 top-4 z-40 p-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm text-slate-600 hover:text-[#81D7B4] hover:border-[#81D7B4]/50 transition-all duration-200 ${
          sidebarState === 'open' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Open Menu"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <div 
        className={`transition-all duration-300 ease-in-out min-h-screen ${
          sidebarState === 'open' ? 'lg:pl-72' : sidebarState === 'collapsed' ? 'lg:pl-20' : ''
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