'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  AlertTriangle, 
  Activity, 
  Users, 
  Database,
  Settings, 
  Shield, 
  Menu,
  X
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
        className={`fixed left-4 top-4 bottom-4 bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl z-50 lg:translate-x-0 ${isClosed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}`}
      >
        <div className={`flex flex-col h-full ${isCollapsed ? 'p-3' : 'p-6'}`}>
          {/* Header */}
          <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-4' : 'justify-between'} mb-8`}>
            {isCollapsed ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] rounded-xl flex items-center justify-center">
                  <Settings className="w-7 h-7 text-white" />
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-300" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                    <p className="text-xs text-gray-300">Control Center</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleSidebar}
                    className="hidden lg:block p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-300" />
                  </button>
                  <button
                    onClick={() => setSidebarState('closed')}
                    className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
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
                      ? 'bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} ${isCollapsed ? 'mx-auto' : 'mr-3'} transition-all duration-200`} />
                  {!isCollapsed && (
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${
                        isActive 
                          ? 'text-white/80' 
                          : 'text-gray-400 group-hover:text-gray-300'
                      }`}>{item.description}</div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`mt-auto pt-6 border-t border-gray-700 ${isCollapsed ? 'flex justify-center' : ''}`}>
            {isCollapsed ? (
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
            ) : (
              <div className="flex items-center space-x-3 text-gray-400">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-300">Secure Access</div>
                  <div className="text-xs">Admin authenticated</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}