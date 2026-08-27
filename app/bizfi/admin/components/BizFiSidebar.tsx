'use client';

import {
  DashboardSquare01Icon,
  Building04Icon,
  Message02Icon,
  ArrowUpRight01Icon,
  Settings01Icon,
  Logout01Icon,
  Shield01Icon,
  File01Icon,
  Activity01Icon,
  UserIcon,
  Cancel01Icon
} from "hugeicons-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/adminAuth';

interface BizFiSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function BizFiSidebar({ isOpen = false, onClose }: BizFiSidebarProps) {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/bizfi/admin', icon: DashboardSquare01Icon },
    { name: 'Businesses', href: '/bizfi/admin/businesses', icon: Building04Icon },
    { name: 'Chat Support', href: '/bizfi/admin/chat', icon: Message02Icon },
    { name: 'Analytics', href: '/bizfi/admin/analytics', icon: ArrowUpRight01Icon },
    { name: 'Reports', href: '/bizfi/admin/reports', icon: File01Icon },
    { name: 'Audit Logs', href: '/bizfi/admin/audit', icon: Activity01Icon },
    { name: 'Settings', href: '/bizfi/admin/settings', icon: Settings01Icon },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#070A0F]/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0F1825] border-r border-[#7B8B9A]/20 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 flex-1 flex flex-col h-full overflow-hidden">
          {/* Header & Logo */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/bizfi" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#81D7B4] flex items-center justify-center text-[#0F1825] shadow-lg shadow-[#81D7B4]/20 group-hover:scale-105 transition-transform font-black">
                <Shield01Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-lg font-black text-[#F9F9FB] group-hover:text-[#81D7B4] transition-colors leading-tight">
                  BizFi Admin
                </span>
                <span className="text-[11px] font-semibold text-[#7B8B9A] uppercase tracking-wider">
                  Management Portal
                </span>
              </div>
            </Link>
            
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="md:hidden p-2 text-[#9BA8B5] hover:text-[#F9F9FB] hover:bg-[#1A2538] rounded-xl transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <Cancel01Icon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <p className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-wider px-3 mb-2">
              Main Menu
            </p>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/bizfi/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-sm font-bold ${
                    isActive
                      ? 'bg-[#81D7B4]/15 text-[#81D7B4] border border-[#81D7B4]/30 shadow-xs'
                      : 'text-[#9BA8B5] hover:bg-[#1A2538]/70 hover:text-[#F9F9FB] border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#81D7B4]' : 'text-[#7B8B9A] group-hover:text-[#81D7B4] transition-colors'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Sign Out */}
          <div className="mt-auto space-y-3 pt-4 border-t border-[#7B8B9A]/20">
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#1A2538]/70 rounded-2xl border border-[#7B8B9A]/20">
              <div className="w-9 h-9 rounded-xl bg-[#81D7B4]/20 flex items-center justify-center text-[#81D7B4] shrink-0 font-bold">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="text-xs font-bold text-[#F9F9FB] truncate">{user?.username || 'Admin User'}</p>
                <p className="text-[10px] text-[#81D7B4] font-semibold uppercase tracking-wider truncate">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors text-xs font-bold border border-red-500/15 cursor-pointer active:scale-98"
            >
              <Logout01Icon className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
