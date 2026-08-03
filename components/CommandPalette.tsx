'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search01Icon, Home01Icon, UserMultipleIcon, BotIcon, Money01Icon, 
  Award01Icon, Dollar01Icon, UserAdd01Icon, Settings01Icon,
  PiggyBankIcon, BubbleChatIcon
} from 'hugeicons-react';

const DASHBOARD_ROUTES = [
  { name: 'Home', path: '/dashboard', icon: Home01Icon },
  { name: 'My Savings', path: '/dashboard/plans', icon: PiggyBankIcon },
  { name: 'Group Savings', path: '/dashboard/group-savings', icon: UserMultipleIcon },
  { name: 'Savvy Bot', path: '/dashboard/savvy-bot', icon: BotIcon },
  { name: 'On/Off Ramp', path: '/dashboard/ramp', icon: Money01Icon },
  { name: 'Leaderboard', path: '/dashboard/leaderboard', icon: Award01Icon },
  { name: 'Earn $BTS', path: '/dashboard/activity', icon: Dollar01Icon },
  { name: 'Referrals', path: '/dashboard/referrals', icon: UserAdd01Icon },
  { name: 'Savvy Space', path: '/dashboard/social', icon: UserMultipleIcon },
  { name: 'Forum', path: '/dashboard/forum', icon: BubbleChatIcon },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings01Icon },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const filteredRoutes = DASHBOARD_ROUTES.filter((route) =>
    route.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      // Timeout ensures the input is rendered before focusing
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // Handle Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredRoutes.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredRoutes.length > 0) {
          const selectedRoute = filteredRoutes[selectedIndex];
          router.push(selectedRoute.path);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredRoutes, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#121212] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden transform transition-all">
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-white/10">
          <Search01Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 px-4 text-base text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Search commands, pages, or routes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-mono text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredRoutes.length === 0 ? (
            <div className="py-14 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found for <span className="font-semibold text-gray-900 dark:text-white">"{search}"</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Navigation
              </div>
              {filteredRoutes.map((route, idx) => {
                const Icon = route.icon;
                const isSelected = idx === selectedIndex;
                
                return (
                  <button
                    key={route.path}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors cursor-pointer outline-none ${
                      isSelected 
                        ? 'bg-[#81D7B4] text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    onClick={() => {
                      router.push(route.path);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                    <span className="font-medium">{route.name}</span>
                    {isSelected && (
                      <span className="ml-auto flex items-center text-xs opacity-75">
                        Press Enter to go
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
