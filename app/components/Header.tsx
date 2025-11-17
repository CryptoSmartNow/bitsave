'use client'
import { useState, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LanguageSelector from '@/components/LanguageSelector';
import { FiMenu, FiX } from 'react-icons/fi';

const Header = memo(function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };



  return (
    <header className="fixed top-4 left-4 right-4 z-50 bg-white/30 backdrop-blur-md px-6 py-4 mx-auto max-w-6xl rounded-xl shadow-sm border border-[#81D7B4]/10">      
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/bitsavelogo.png"
            alt="BitSave logo"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority={false}
          />
        </Link>
        
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-700 hover:text-[#81D7B4] transition-colors">Home</Link>
          <Link href="/#how-it-works" className="text-gray-700 hover:text-[#81D7B4] transition-colors">How It Works</Link>
          <Link href="/#security" className="text-gray-700 hover:text-[#81D7B4] transition-colors">Security</Link>
          <Link href="/#features" className="text-gray-700 hover:text-[#81D7B4] transition-colors">Features</Link>
          <Link href="/blog" className="text-gray-700 hover:text-[#81D7B4] transition-colors">Blog</Link>
          <Link href="/#faq" className="text-gray-700 hover:text-[#81D7B4] transition-colors">FAQ</Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <LanguageSelector />
          <Link 
            href="/dashboard"
            prefetch={false}
            className="bg-[#81D7B4] text-white hidden md:flex items-center justify-center rounded-lg px-6 py-2.5 font-medium transition-all duration-300 hover:shadow-lg"
          >
            Open App
          </Link>
          <button className="md:hidden text-gray-700" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-4 px-2 mt-4 bg-white/90 backdrop-blur-lg rounded-lg border border-[#81D7B4]/10 shadow-md">
          <nav className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className="px-4 py-2 text-gray-700 hover:bg-[#81D7B4]/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/#how-it-works" 
              className="px-4 py-2 text-gray-700 hover:bg-[#81D7B4]/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              href="/#security" 
              className="px-4 py-2 text-gray-700 hover:bg-[#81D7B4]/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Security
            </Link>
            <Link 
              href="/#features" 
              className="px-4 py-2 text-gray-700 hover:bg-[#81D7B4]/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/blog" 
              className="px-4 py-2 text-gray-700 hover:bg-[#81D7B4]/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              href="/#faq" 
              className="px-4 py-2 text-gray-700 hover:bg-[#81D7B4]/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="mx-4">
               <Link 
                 href="/dashboard"
                 prefetch={true}
                 onClick={() => setMobileMenuOpen(false)}
                 className="bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] text-white flex items-center justify-center rounded-lg px-6 py-2.5 font-medium transition-all duration-300 hover:shadow-lg w-full"
               >
                 Open App
               </Link>
             </div>
          </nav>
        </div>
      )}
    </header>
  );
})

export default Header;