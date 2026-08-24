'use client';

import {
  Home01Icon, Activity01Icon, Dollar01Icon, UserMultipleIcon, Award01Icon,
  UserAdd01Icon, PlusSignIcon, Settings01Icon, Logout01Icon, ArrowDown01Icon,
  Money01Icon, BotIcon, Menu01Icon, Cancel01Icon, Search01Icon, SparklesIcon,
  Notification01Icon, MessageQuestionIcon, CustomerServiceIcon, FavouriteIcon,
  UserCircleIcon, PiggyBankIcon, BubbleChatIcon, ArrowUpDownIcon,
} from "hugeicons-react";
import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useTheme } from 'next-themes';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useOptimizedDisconnect } from '../../lib/useOptimizedDisconnect';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import CustomConnectButton from '@/components/CustomConnectButton';
import SavvyBotWidget from '@/components/SavvyBotWidget';
import LanguageSelector from '@/components/LanguageSelector';
import NetworkDetection from '@/components/NetworkDetection';
import { PageShimmer } from '@/components/ShimmerLoading';
import { syncPendingTransactions } from '@/utils/transactionSync';
import CommandPalette from '@/components/CommandPalette';
import { useAvatar } from '@/hooks/useAvatar';

// ─── Nav item list ────────────────────────────────────────────────────────────
const mainLinks = [
  { href: '/dashboard',              label: 'Home',          icon: Home01Icon },
  { href: '/dashboard/plans',        label: 'My Savings',    icon: PiggyBankIcon },
  { href: '/dashboard/group-savings',label: 'Group Savings', icon: UserMultipleIcon },
  { href: '/dashboard/savvy-bot',    label: 'Savvy Bot',     icon: BotIcon },
  { href: '/dashboard/ramp',         label: 'On/Off Ramp',   icon: Money01Icon },
];

const communityLinks = [
  { href: '/dashboard/leaderboard',  label: 'Leaderboard',   icon: Award01Icon },
  { href: '/dashboard/activity',     label: 'Earn $BTS',     icon: Dollar01Icon },
  { href: '/dashboard/referrals',    label: 'Referrals',     icon: UserAdd01Icon },
  { href: '/dashboard/social',       label: 'Savvy Space',   icon: UserMultipleIcon },
  { href: '/dashboard/forum',        label: 'Forum',         icon: BubbleChatIcon },
  { href: '/dashboard/settings',     label: 'Settings',      icon: Settings01Icon },
  { href: '/feedback',               label: 'Help & Feedback', icon: MessageQuestionIcon },
];

// ─── Single nav link ──────────────────────────────────────────────────────────
function NavLink({ href, label, Icon, active, onClick }: {
  href: string; label: string; Icon: any; active: boolean; onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 ${
        active
          ? 'bg-[#81D7B4] text-white font-semibold shadow-sm'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
      }`}
    >
      <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={active ? 2.2 : 1.8} />
      <span>{label}</span>
    </Link>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ pathname, onNavClick }: { pathname: string; onNavClick?: () => void }) {
  const { theme, setTheme, systemTheme } = useTheme();
  const { user } = usePrivy();
  const { address: wagmiAddress } = useAccount();
  const { disconnect, isDisconnecting } = useOptimizedDisconnect();
  const activeAddress = wagmiAddress || user?.wallet?.address;
  const { avatar } = useAvatar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string, event: React.MouseEvent) => {
    const applyTheme = () => {
      setTheme(newTheme);
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
      }
    };

    if (!document.startViewTransition) {
      applyTheme();
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    document.documentElement.style.setProperty('--click-x', `${x}px`);
    document.documentElement.style.setProperty('--click-y', `${y}px`);

    document.startViewTransition(() => {
      flushSync(() => {
        // Synchronously update the DOM to prevent lag and ensure the view transition captures the correct new state immediately
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
        document.documentElement.style.colorScheme = newTheme;
        applyTheme();
      });
    });
  };

  const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) : 'light';

  // Force theme application when theme changes (from KI)
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const effectiveTheme = theme === 'system' ? systemTheme : theme;

    root.classList.remove('light', 'dark');

    if (effectiveTheme) {
      root.classList.add(effectiveTheme);
    }
  }, [theme, systemTheme, mounted]);

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#121212]/60 dark:backdrop-blur-xl overflow-hidden transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Logo */}
      <div className="flex items-center px-5 pt-6 pb-5 flex-shrink-0">
        <Image src="/bitsavelogo.png" alt="Bitsave" width={120} height={32} className="h-[30px] w-auto" priority />
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5 min-h-0">
        {/* Main links */}
        {mainLinks.map(({ href, label, icon: Icon }) => (
          <NavLink key={href} href={href} label={label} Icon={Icon} active={isActive(href)} onClick={onNavClick} />
        ))}

        {/* Divider */}
        <div className="my-3 border-t border-gray-100 dark:border-white/10" />

        {/* Community links */}
        {communityLinks.map(({ href, label, icon: Icon }) => (
          <NavLink key={href} href={href} label={label} Icon={Icon} active={isActive(href)} onClick={onNavClick} />
        ))}
      </nav>

      {/* Bottom section — fixed at bottom */}
      <div className="px-3 pt-2 pb-4 border-t border-gray-50 dark:border-white/10 flex-shrink-0 space-y-0.5">
        <Link
          href="/dashboard/profile"
          className="flex items-center justify-between w-full p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Image src={avatar} alt="Avatar" width={40} height={40} className="w-10 h-10 rounded-xl object-cover bg-gray-50 dark:bg-[#1a1a1a]" />
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {user?.email?.address?.split('@')[0] || activeAddress ? `${activeAddress?.slice(0, 6)}...` : 'Connected'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {user?.email?.address || (activeAddress ? `${activeAddress.slice(-4)}` : 'Saver')}
              </span>
            </div>
          </div>
        </Link>

        <button
          onClick={() => disconnect()}
          disabled={isDisconnecting}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-full text-[13.5px] font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150 text-left cursor-pointer"
        >
          <Logout01Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.8} />
          <span>{isDisconnecting ? 'Disconnecting...' : 'Disconnect'}</span>
        </button>

        {/* Light / Dark toggle */}
        <div className="pt-2 px-1">
          <div className="flex items-center bg-gray-100 dark:bg-[#1a1a1a] rounded-full p-1">
            <button 
              onClick={(e) => handleThemeChange('light', e)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-[12.5px] transition-all ${
                currentTheme === 'light'
                  ? 'bg-white dark:bg-gray-700 shadow-sm font-semibold text-gray-900 dark:text-[#81D7B4]' 
                  : 'font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Light
            </button>
            <button 
              onClick={(e) => handleThemeChange('dark', e)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-[12.5px] transition-all ${
                currentTheme === 'dark'
                  ? 'bg-white dark:bg-gray-700 shadow-sm font-semibold text-gray-900 dark:text-[#81D7B4]' 
                  : 'font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Dark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [showAiWidget, setShowAiWidget] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { ready, authenticated, user, login } = usePrivy();
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { disconnect, isDisconnecting } = useOptimizedDisconnect();
  const pathname = usePathname();

  const { avatar } = useAvatar();
  const activeAddress = wagmiAddress || user?.wallet?.address;
  const isConnected = ready && (authenticated || isWagmiConnected);

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);



  useEffect(() => {
    setMounted(true);
    syncPendingTransactions();

    // Check saved preference for AI widget
    const savedShowAiWidget = localStorage.getItem('showAiWidget');
    if (savedShowAiWidget === 'false') {
      setShowAiWidget(false);
    }

    // Listen for toggle from settings
    const handleToggleAiWidget = (e: CustomEvent) => {
      setShowAiWidget(e.detail.show);
    };
    window.addEventListener('toggleAiWidget', handleToggleAiWidget as EventListener);
    return () => window.removeEventListener('toggleAiWidget', handleToggleAiWidget as EventListener);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette on Cmd+K (Mac) or Ctrl+K (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Page title map
  const pageTitles: Record<string, string> = {
    '/dashboard':               'Welcome back',
    '/dashboard/plans':         'My Savings',
    '/dashboard/activity':      'Activity',
    '/dashboard/referrals':     'Referrals',
    '/dashboard/leaderboard':   'Leaderboard',
    '/dashboard/social':        'Savvy Space',
    '/dashboard/forum':         'Forum',
    '/dashboard/settings':      'Settings',
    '/dashboard/profile':       'My Profile',
    '/dashboard/feedback':      'Help & Feedback',
    '/dashboard/create-savings':'Create Plan',
    '/dashboard/group-savings': 'Group Savings',
    '/dashboard/savvy-bot':     'Savvy Bot',
    '/dashboard/ramp':          'On/Off Ramp',
    '/dashboard/withdraw':      'Withdraw',
  };
  const pageTitle = pageTitles[pathname] || 'Dashboard';

  return (
    <div
      className="h-screen flex overflow-hidden bg-gray-50 dark:bg-[#0a0a0a] transition-colors"
      style={{
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Radial brand tint overlays */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{
        background: [
          'radial-gradient(ellipse 70% 50% at 70% 0%, rgba(129,215,180,0.09) 0%, transparent 65%)',
          'radial-gradient(ellipse 50% 40% at 5% 100%, rgba(129,215,180,0.06) 0%, transparent 60%)',
        ].join(', ')
      }} />
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar — desktop: sticky column; mobile: slide-in drawer ── */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-40 w-[280px]
          md:static md:flex md:flex-shrink-0 md:translate-x-0
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/*
          On desktop: the sidebar sits inside the outer flex row, no overlap possible.
          We give it margin + border-radius so it looks like a floating card.
        */}
        <div className="
          w-[280px] h-full md:h-[calc(100vh-32px)]
          md:my-4 md:ml-4
          md:rounded-2xl md:shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:md:shadow-none
          md:border md:border-gray-100/80 dark:md:border-white/10
          overflow-hidden
        ">
          <Sidebar pathname={pathname} onNavClick={() => setSidebarOpen(false)} />
        </div>
      </aside>

      {/* ── Main area (header + scrollable content) ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Top header — no box, floats directly on the page background ── */}
        <header className="flex-shrink-0 flex items-center justify-between px-3.5 sm:px-6 md:px-8 pt-3 sm:pt-4 pb-2 sticky top-0 z-20" style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'transparent',
        }}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-1.5 sm:p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu01Icon className="w-5 h-5" />
            </button>
            <h1 className="text-[22px] sm:text-[28px] md:text-[34px] lg:text-[36px] text-gray-900 dark:text-gray-50 tracking-tight font-instrument truncate whitespace-nowrap leading-tight" style={{ fontWeight: 400 }}>{pageTitle}</h1>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 shrink-0">
            {/* Create Plan Button — Visible and noticeable on all screens */}
            <Link
              href="/dashboard/create-savings"
              className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] hover:from-[#6BC5A0] hover:to-[#5bb08f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-[0_4px_14px_rgba(129,215,180,0.35)] hover:shadow-[0_6px_20px_rgba(129,215,180,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex-shrink-0"
            >
              <PlusSignIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={2.5} />
              <span className="hidden sm:inline">Create Plan</span>
              <span className="sm:hidden">Create</span>
            </Link>

            {/* Search — desktop only */}
            <div className="relative hidden lg:flex items-center cursor-text" onClick={() => setIsCommandPaletteOpen(true)}>
              <Search01Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                readOnly
                placeholder="Search or jump to..."
                className="w-[240px] pl-10 pr-14 py-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-full text-[13px] text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/40 focus:border-[#81D7B4] transition cursor-text"
              />
              <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded text-[10px] text-gray-400 font-mono">⌘K</kbd>
            </div>

            {/* Settings */}
            <Link
              href="/dashboard/settings"
              title="Settings"
              className="w-8 h-8 rounded-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-[#81D7B4] dark:hover:text-[#81D7B4] hover:bg-gray-100 dark:hover:bg-white/10 transition shrink-0"
            >
              <Settings01Icon className="w-4 h-4" />
            </Link>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title="Notifications"
                className="relative w-8 h-8 rounded-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-[#81D7B4] dark:hover:text-[#81D7B4] hover:bg-gray-100 dark:hover:bg-white/10 transition shrink-0"
              >
                <Notification01Icon className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-orange-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-[1.5px] border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-white dark:bg-[#161616] border border-gray-100 dark:border-white/10 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
                  }}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-bold text-gray-900 dark:text-white">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => setUnreadCount(0)}
                        className="text-[11.5px] font-semibold text-[#81D7B4] hover:text-[#6BC5A0] transition"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 py-3 max-h-72 overflow-y-auto">
                    {/* Notification 1 */}
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100/80 dark:hover:bg-white/10 transition flex items-start gap-3 text-left">
                      <div className="w-8 h-8 rounded-full bg-[#81D7B4]/15 flex items-center justify-center shrink-0 mt-0.5">
                        <SparklesIcon className="w-4 h-4 text-[#81D7B4]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-gray-900 dark:text-white leading-snug">Multi-chain Vaults Active</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">Live across Base, Celo, Lisk, Avalanche & BSC</p>
                        <span className="text-[9.5px] text-gray-400 font-medium mt-1 inline-block">Just now</span>
                      </div>
                    </div>

                    {/* Notification 2 */}
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100/80 dark:hover:bg-white/10 transition flex items-start gap-3 text-left">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <PiggyBankIcon className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-gray-900 dark:text-white leading-snug">Savings Plan Completed</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">Your savings plan has matured successfully</p>
                        <span className="text-[9.5px] text-gray-400 font-medium mt-1 inline-block">2 hours ago</span>
                      </div>
                    </div>

                    {/* Notification 3 */}
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100/80 dark:hover:bg-white/10 transition flex items-start gap-3 text-left">
                      <div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Activity01Icon className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-gray-900 dark:text-white leading-snug">Interest & Rewards Ready</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">Earn $BTS and interest on your locked crypto</p>
                        <span className="text-[9.5px] text-gray-400 font-medium mt-1 inline-block">1 day ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-white/5 text-center">
                    <Link
                      href="/dashboard/activity"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[12px] font-bold text-[#81D7B4] hover:text-[#6BC5A0] inline-flex items-center gap-1 transition"
                    >
                      View all activity & rewards ↗
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile pill */}
            <Link
              href="/dashboard/profile"
              className="hidden sm:flex items-center gap-2 pl-1.5 pr-3.5 py-1 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-white/10 flex-shrink-0">
                <Image src={avatar} alt="Avatar" width={28} height={28} className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[12px] font-semibold text-gray-900 dark:text-gray-100">
                  {user?.email?.address?.split('@')[0] || (activeAddress ? `${activeAddress.slice(0, 4)}...${activeAddress.slice(-4)}` : 'Connected')}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Saver</span>
              </div>
            </Link>
          </div>
        </header>

        {/* ── Scrollable page content ── */}
        <main className="flex-1 overflow-y-auto">
          {mounted ? (
            <>
              <NetworkDetection />
              <div className="px-3.5 sm:px-6 lg:px-8 pt-2 pb-6 sm:pb-8 max-w-[1600px] mx-auto w-full">
                {children}
              </div>
              {showAiWidget && <SavvyBotWidget />}
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[60vh]">
              <PageShimmer />
            </div>
          )}
        </main>
      </div>

      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </div>
  );
}
