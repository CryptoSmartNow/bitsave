'use client';

import { Menu01Icon, Cancel01Icon, ArrowUpRight01Icon } from "hugeicons-react";
import { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import LanguageSelector from '@/components/LanguageSelector';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'How It Works', href: '/#how-it-works' },
  { name: 'Features', href: '/#features' },
  { name: 'Blog', href: '/#blog' },
  { name: 'Team', href: '/team' },
  { name: 'FAQ', href: '/#faq' },
];

const Header = memo(function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? 'bg-white/70 backdrop-blur-2xl backdrop-saturate-[180%] border-b border-gray-100/50 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
          : 'bg-transparent py-5'
          }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="relative z-50 flex items-center group">
            <div className="relative">
              <Image
                src="/bitsavelogo.png"
                alt="BitSave logo"
                width={140}
                height={40}
                className="h-8 w-auto sm:h-9 transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = (link.href === '/' || link.href.startsWith('/#')) 
                ? pathname === '/' 
                : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`nav-underline px-4 py-2 text-sm font-semibold transition-colors rounded-full hover:bg-gray-50/80 whitespace-nowrap tracking-wide ${isActive ? 'text-[#5fb392] bg-[#81D7B4]/10' : 'text-gray-600 hover:text-[#5fb392]'}`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Docs Dropdown */}
            <div className="relative group">
              <button
                className="nav-underline px-4 py-2 text-sm font-semibold text-gray-600 hover:text-[#5fb392] transition-colors rounded-full hover:bg-gray-50/80 flex items-center gap-1 whitespace-nowrap tracking-wide"
              >
                Docs
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[150px]">
                <div className="glass-card bg-white/90 rounded-xl shadow-xl shadow-gray-200/30 p-2 flex flex-col gap-1">
                  <Link
                    href="/docs"
                    className="flex justify-between items-center px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-[#5fb392] hover:bg-[#81D7B4]/8 rounded-lg transition-all"
                  >
                    SaveFi
                  </Link>
                  <a
                    href="https://bizfi.mintlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-between items-center px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-[#5fb392] hover:bg-[#81D7B4]/8 rounded-lg transition-all"
                  >
                    BizFi
                    <ArrowUpRight01Icon className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </nav>

          {/* Right Actions */}
          <div className="hidden xl:flex items-center space-x-4">
            <LanguageSelector />
            <Link
              href="/dashboard"
              prefetch={false}
              className="bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] hover:from-[#6BC5A0] hover:to-[#5fb392] text-white px-6 py-2.5 rounded-full font-bold transition-all duration-300 shadow-lg shadow-[#81D7B4]/20 hover:shadow-[#81D7B4]/40 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap shimmer-btn tracking-wide"
            >
              Launch App
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="xl:hidden relative z-50 p-2 text-gray-800 hover:text-[#81D7B4] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <Cancel01Icon className="w-7 h-7" />
            ) : (
              <Menu01Icon className="w-7 h-7" />
            )}
          </button>
        </div>
      </header>

      {/* Full Screen Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-40 bg-white xl:hidden flex flex-col pt-24 px-6 pb-8 overflow-y-auto"
          >
            <div className="flex flex-col space-y-2 mt-4">
              {navLinks.map((link, idx) => {
                const isActive = (link.href === '/' || link.href.startsWith('/#')) 
                  ? pathname === '/' 
                  : pathname?.startsWith(link.href);
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + idx * 0.06, type: "spring", damping: 20 }}
                  >
                    <Link
                      href={link.href}
                      className={`block py-4 text-2xl font-bold border-b border-gray-100 transition-colors font-display ${isActive ? 'text-[#81D7B4]' : 'text-gray-900 hover:text-[#81D7B4]'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + navLinks.length * 0.06, type: "spring", damping: 20 }}
                className="py-4 border-b border-gray-100"
              >
                <div className="text-xl font-bold text-gray-400 mb-3 flex items-center justify-between font-display">
                  Documentation
                </div>
                <div className="flex flex-col space-y-3 pl-4">
                  <Link
                    href="/docs"
                    className="text-lg font-semibold text-gray-900 hover:text-[#81D7B4] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    SaveFi Docs
                  </Link>
                  <a
                    href="https://bizfi.mintlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-gray-900 hover:text-[#81D7B4] transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    BizFi Docs
                    <ArrowUpRight01Icon className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", damping: 20 }}
              className="mt-auto pt-8 flex flex-col gap-4"
            >
              <Link
                href="/dashboard"
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] text-white text-center text-lg font-bold py-4 rounded-2xl shadow-xl shadow-[#81D7B4]/20 font-display"
              >
                Launch App
              </Link>
              <div className="flex justify-center py-4">
                <LanguageSelector />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
})

export default Header;
