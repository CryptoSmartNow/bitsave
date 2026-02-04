'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/adminAuth';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  TrendingUp,
  Settings,
  LogOut,
  Shield,
  FileText,
  Activity,
  Database,
  User,
  X
} from 'lucide-react';

interface BizFiSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function BizFiSidebar({ isOpen = false, onClose }: BizFiSidebarProps) {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/bizfi/admin', icon: LayoutDashboard },
    { name: 'Businesses', href: '/bizfi/admin/businesses', icon: Users },
    { name: 'Chat', href: '/bizfi/admin/chat', icon: MessageSquare },
    { name: 'Analytics', href: '/bizfi/admin/analytics', icon: TrendingUp },
    { name: 'Reports', href: '/bizfi/admin/reports', icon: FileText },
    { name: 'Audit Logs', href: '/bizfi/admin/audit', icon: Activity },
    { name: 'Settings', href: '/bizfi/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1A2538] border-r border-[#7B8B9A]/20 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
        <div className="p-6 flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <Link href="/bizfi" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#81D7B4] flex items-center justify-center text-[#0F1825] shadow-lg shadow-[#81D7B4]/20 group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-lg font-bold text-[#F9F9FB] group-hover:text-[#81D7B4] transition-colors">
                  BizFi Admin
                </span>
                <span className="text-xs text-[#7B8B9A]">Management Portal</span>
              </div>
            </Link>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="md:hidden p-2 text-[#9BA8B5] hover:text-[#F9F9FB] hover:bg-[#0F1825] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1 flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                      ? 'bg-[#81D7B4]/10 text-[#81D7B4] border border-[#81D7B4]/20'
                      : 'text-[#9BA8B5] hover:bg-[#0F1825] hover:text-[#F9F9FB]'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#81D7B4]' : 'group-hover:text-[#81D7B4] transition-colors'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Stats */}
          <div className="mt-auto space-y-4">
            <div className="pt-4 border-t border-[#7B8B9A]/20">
              <div className="flex items-center gap-3 px-3 mb-4 py-2 bg-[#0F1825]/30 rounded-xl border border-[#7B8B9A]/5">
                <div className="w-9 h-9 rounded-full bg-[#81D7B4]/20 flex items-center justify-center text-[#81D7B4] shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-[#F9F9FB] truncate">{user?.username || 'Admin User'}</p>
                  <p className="text-[10px] text-[#7B8B9A] truncate uppercase tracking-wider font-semibold">{user?.role || 'Administrator'}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2 text-[#9BA8B5] hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors group text-sm"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
