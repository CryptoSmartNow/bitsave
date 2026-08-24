'use client';

import { 
  Alert02Icon, 
  Activity01Icon, 
  UserMultipleIcon, 
  DashboardSquare01Icon, 
  FlashIcon, 
  Shield01Icon, 
  Cancel01Icon, 
  Logout01Icon,
  SidebarLeft01Icon
} from "hugeicons-react";
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/adminAuth';

export type SidebarState = 'closed' | 'collapsed' | 'open';

export interface NavigationItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
}

interface UserInteractionsSidebarProps {
  sidebarState: SidebarState;
  setSidebarState: (state: SidebarState) => void;
  navigationItems?: NavigationItem[];
}

export const defaultUserInteractionsNav: NavigationItem[] = [
  {
    name: 'Overview',
    icon: DashboardSquare01Icon,
    href: '/user-interactions',
    description: 'Protocol health & metrics'
  },
  {
    name: 'Analytics',
    icon: Activity01Icon,
    href: '/user-interactions/analytics',
    description: 'Volume & interaction charts'
  },
  {
    name: 'Error Logs',
    icon: Alert02Icon,
    href: '/user-interactions/errors',
    description: 'Diagnostics & error tracker'
  },
  {
    name: 'User Management',
    icon: UserMultipleIcon,
    href: '/user-interactions/users',
    description: 'Wallets & activity profiles'
  },
  {
    name: 'BizSwap',
    icon: DashboardSquare01Icon,
    href: '/user-interactions/bizswap',
    description: 'RWA & swap analytics'
  },
  {
    name: 'Live Stream',
    icon: FlashIcon,
    href: '/user-interactions/real-time',
    description: 'Real-time telemetry feed'
  }
];

export default function UserInteractionsSidebar({ 
  sidebarState, 
  setSidebarState, 
  navigationItems = defaultUserInteractionsNav 
}: UserInteractionsSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  const isOpen = sidebarState === 'open';
  const isCollapsed = sidebarState === 'collapsed';
  const isClosed = sidebarState === 'closed';

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarState(sidebarState === 'open' ? 'collapsed' : 'open');
    } else {
      setSidebarState(sidebarState === 'open' ? 'closed' : 'open');
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarState('closed')}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 84 : 290,
          x: isClosed ? -320 : 0,
        }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
        className={`fixed left-4 top-4 bottom-4 bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-2xl rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-2xl z-50 lg:translate-x-0 ${isClosed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}`}
      >
        <div className={`flex flex-col h-full ${isCollapsed ? 'p-3.5' : 'p-5'}`}>
          {/* Header */}
          <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-3' : 'justify-between'} pb-5 border-b border-gray-100 dark:border-white/5 mb-4`}>
            {isCollapsed ? (
              <div className="flex flex-col items-center space-y-3">
                <Link href="/dashboard" className="w-11 h-11 relative flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200/70 dark:border-white/10 overflow-hidden shadow-xs hover:border-[#81D7B4] transition-colors">
                  <Image 
                    src="/bitsavelogo.png" 
                    alt="Bitsave" 
                    width={28} 
                    height={28} 
                    className="object-contain" 
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </Link>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Expand Sidebar"
                >
                  <SidebarLeft01Icon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link href="/dashboard" className="flex items-center space-x-3 group">
                  <div className="w-10 h-10 relative flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200/70 dark:border-white/10 overflow-hidden shrink-0 shadow-xs group-hover:border-[#81D7B4] transition-colors">
                    <Image 
                      src="/bitsavelogo.png" 
                      alt="Bitsave" 
                      width={26} 
                      height={26} 
                      className="object-contain"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-900 dark:text-white leading-tight font-display flex items-center gap-1.5">
                      <span>Interactions</span>
                      <span className="px-1.5 py-0.2 bg-[#81D7B4]/20 text-[#1c4b38] dark:text-[#81D7B4] rounded text-[9px] font-mono font-bold">OPS</span>
                    </h2>
                    <p className="text-[11px] text-gray-400 font-medium">Observability Center</p>
                  </div>
                </Link>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={toggleSidebar}
                    className="hidden lg:flex p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Collapse Sidebar"
                  >
                    <SidebarLeft01Icon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSidebarState('closed')}
                    className="lg:hidden p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                    title="Close Sidebar"
                  >
                    <Cancel01Icon className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-0.5 custom-scrollbar">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'px-3.5 py-3'} rounded-2xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-[#81D7B4] text-white font-bold shadow-md shadow-[#81D7B4]/25' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${isCollapsed ? 'mx-auto' : 'mr-3'} shrink-0 transition-transform group-hover:scale-105`} />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{item.name}</div>
                      <div className={`text-[10.5px] truncate font-medium ${
                        isActive 
                          ? 'text-white/80' 
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer Security / Logout */}
          <div className={`mt-auto pt-4 border-t border-gray-100 dark:border-white/5 ${isCollapsed ? 'flex justify-center' : ''}`}>
            {isCollapsed ? (
              <button 
                onClick={logout}
                className="w-10 h-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center transition-colors cursor-pointer"
                title="Log Out Session"
              >
                <Logout01Icon className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <Shield01Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-900 dark:text-white truncate">Admin Session</div>
                    <div className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active & Secure
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Log Out"
                >
                  <Logout01Icon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}