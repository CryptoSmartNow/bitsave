'use client'
import { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LanguageSelector from '@/components/LanguageSelector';
import { FiMenu, FiX, FiArrowUpRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Features', href: '#features' },
  { name: 'BizFi', href: '#bizfi' },
  { name: 'Blog', href: '#blog' },
  { name: 'FAQ', href: '#faq' },
];

const Header = memo(function Header() {

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4' 
            : 'bg-transparent py-6'
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
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#81D7B4] transition-colors rounded-full hover:bg-gray-50 whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
            <Link 
              href="/docs" 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#81D7B4] transition-colors rounded-full hover:bg-gray-50 flex items-center gap-1 whitespace-nowrap"
            >
              Docs
              <FiArrowUpRight className="w-3 h-3" />
            </Link>
          </nav>
          
          {/* Right Actions */}
          <div className="hidden xl:flex items-center space-x-4">
            <LanguageSelector />
            <Link 
              href="/dashboard"
              prefetch={false}
              className="bg-[#81D7B4] hover:bg-[#6BC5A0] text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-[#81D7B4]/20 hover:shadow-[#81D7B4]/40 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
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
              <FiX className="w-7 h-7" />
            ) : (
              <FiMenu className="w-7 h-7" />
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
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-white xl:hidden flex flex-col pt-24 px-6 pb-8 overflow-y-auto"
          >
            <div className="flex flex-col space-y-2 mt-4">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                >
                  <Link 
                    href={link.href} 
                    className="block py-4 text-2xl font-bold text-gray-900 border-b border-gray-100 hover:text-[#81D7B4] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + navLinks.length * 0.05 }}
              >
                <a 
                href="/docs" 
                className="block py-4 text-2xl font-bold text-gray-900 border-b border-gray-100 hover:text-[#81D7B4] transition-colors flex items-center justify-between"
                onClick={() => setMobileMenuOpen(false)}
              >
                Docs
                <FiArrowUpRight className="w-5 h-5" />
              </a>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-auto pt-8 flex flex-col gap-4"
            >
              <Link 
                href="/dashboard"
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-[#81D7B4] text-white text-center text-lg font-bold py-4 rounded-2xl shadow-xl shadow-[#81D7B4]/20"
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
