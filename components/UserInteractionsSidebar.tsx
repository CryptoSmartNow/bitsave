'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/adminAuth';
import { 
  AlertTriangle, 
  Activity, 
  Users, 
  Database,
  Shield, 
  Menu,
  X,
  LogOut
} from 'lucide-react';

export type SidebarState = 'closed' | 'collapsed' | 'open';

interface NavigationItem {
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

const defaultNavigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    icon: Activity,
    href: '/user-interactions',
    description: 'User activity tracking & metrics'
  },
  {
    name: 'Error Analysis',
    icon: AlertTriangle,
    href: '/user-interactions/error-analysis',
    description: 'System error monitoring & analysis'
  },
  {
    name: 'User Interaction',
    icon: Users,
    href: '/user-interactions/interactions',
    description: 'User interaction analytics & insights'
  },
  {
    name: 'Contract Data',
    icon: Database,
    href: '/user-interactions/contract-data',
    description: 'TVL and contract metrics across networks'
  }
];

export default function UserInteractionsSidebar({ 
  sidebarState, 
  setSidebarState, 
  navigationItems = defaultNavigationItems 
}: UserInteractionsSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  const isOpen = sidebarState === 'open';
  const isCollapsed = sidebarState === 'collapsed';
  const isClosed = sidebarState === 'closed';

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      // Desktop: toggle between open and collapsed
      setSidebarState(sidebarState === 'open' ? 'collapsed' : 'open');
    } else {
      // Mobile: toggle between open and closed
      setSidebarState(sidebarState === 'open' ? 'closed' : 'open');
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarState('closed')}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 288,
          x: isClosed ? -300 : 0,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed left-4 top-4 bottom-4 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-xl z-50 lg:translate-x-0 ${isClosed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}`}
      >
        <div className={`flex flex-col h-full ${isCollapsed ? 'p-3' : 'p-6'}`}>
          {/* Header */}
          <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-4' : 'justify-between'} mb-8`}>
            {isCollapsed ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 relative flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <Image 
                    src="/bitsavelogo.png" 
                    alt="Bitsave" 
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 relative flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
                    <Image 
                      src="/bitsavelogo.png" 
                      alt="Bitsave" 
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <h2 className="text-base lg:text-lg font-bold text-slate-800 leading-tight">Interactions Dashboard</h2>
                    <p className="text-[10px] lg:text-xs text-slate-500 font-medium">Control Center</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleSidebar}
                    className="hidden lg:block p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setSidebarState('closed')}
                    className="lg:hidden p-2 text-gray-600 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-4'} py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-[#81D7B4] text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} ${isCollapsed ? 'mx-auto' : 'mr-3'} transition-all duration-200`} />
                  {!isCollapsed && (
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${
                        isActive 
                          ? 'text-white/90' 
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}>{item.description}</div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`mt-auto pt-6 border-t border-gray-200 ${isCollapsed ? 'flex justify-center' : ''}`}>
            {isCollapsed ? (
              <button 
                onClick={logout}
                className="w-10 h-10 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center group transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-500" />
              </button>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3 text-gray-400">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-slate-700">Secure Access</div>
                    <div className="text-xs text-slate-500">Admin authenticated</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-red-50 rounded-lg group transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}