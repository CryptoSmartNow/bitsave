'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineComputerDesktop,
  HiChevronDown
} from 'react-icons/hi2';

interface ThemeSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'segmented' | 'icon-only';
}

export default function ThemeSelector({ className = '', variant = 'dropdown' }: ThemeSelectorProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!mounted) {
    return (
      <div className={`w-32 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`} />
    );
  }

  const themes = [
    { id: 'light', name: 'Light', icon: HiOutlineSun },
    { id: 'dark', name: 'Dark', icon: HiOutlineMoon },
    { id: 'system', name: 'System', icon: HiOutlineComputerDesktop },
  ];

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const currentTheme = themes.find(t => t.id === theme) || themes[0];

  // Icon-only variant for compact navigation
  if (variant === 'icon-only') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#81D7B4] transition-all duration-200 group backdrop-blur-sm"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={`Current theme: ${currentTheme.name}`}
        >
          <currentTheme.icon className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-[#81D7B4] transition-colors" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden ring-1 ring-black/5"
            >
              <div className="p-1" role="listbox">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      handleThemeChange(t.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${theme === t.id
                      ? 'bg-[#81D7B4]/10 text-[#81D7B4]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    role="option"
                    aria-selected={theme === t.id}
                  >
                    <t.icon className={`w-5 h-5 ${theme === t.id ? 'text-[#81D7B4]' : 'text-gray-500 dark:text-gray-400'}`} />
                    {t.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (variant === 'segmented') {
    return (
      <div className={`flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ${className}`}>
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => handleThemeChange(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${theme === t.id
              ? 'bg-white dark:bg-gray-700 text-[#81D7B4] shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
              }`}
            aria-label={`Select ${t.name} theme`}
          >
            <t.icon className="w-5 h-5" />
            <span className="hidden sm:inline">{t.name}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-sm hover:border-[#81D7B4] transition-all duration-200 group"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2">
          <currentTheme.icon className="w-5 h-5 text-[#81D7B4]" />
          <span className="text-gray-700 dark:text-gray-200 font-medium capitalize">
            {currentTheme.name}
          </span>
        </div>
        <HiChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} group-hover:text-[#81D7B4]`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-full sm:w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden ring-1 ring-black/5"
          >
            <div className="p-1" role="listbox">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    handleThemeChange(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${theme === t.id
                    ? 'bg-[#81D7B4]/10 text-[#81D7B4]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  role="option"
                  aria-selected={theme === t.id}
                >
                  <t.icon className={`w-5 h-5 ${theme === t.id ? 'text-[#81D7B4]' : 'text-gray-500 dark:text-gray-400'}`} />
                  {t.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
