'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaTelegramPlane } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { ArrowRight } from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Security', href: '#security' },
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' }
  ],
  resources: [
    { name: 'Blog', href: '/blog' },
    { name: 'Docs', href: 'https://docs.bitsave.finance' },
    { name: 'FAQ', href: '#faq' }
  ],
  company: [
    { name: 'About', href: '#' },
    { name: 'Terms', href: '#' },
    { name: 'Privacy', href: '#' }
  ]
};

const socialLinks = [
  {
    name: 'X',
    href: 'https://x.com/bitsaveprotocol',
    icon: <FaXTwitter className="w-5 h-5" />
  },
  {
    name: 'Telegram',
    href: 'https://t.me/+YimKRR7wAkVmZGRk',
    icon: <FaTelegramPlane className="w-5 h-5" />
  }
];

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    setEmail('');
  };

  return (
    <footer className="relative bg-white pt-16 md:pt-24 pb-12 overflow-hidden border-t border-gray-100">
      
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-[#81D7B4]/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              <Image src="/bitsavelogo.png" alt="BitSave" width={140} height={40} className="h-9 w-auto" />
            </Link>
            <p className="text-gray-500 leading-relaxed max-w-sm">
              The decentralized savings protocol helping you build wealth across multiple chains with ease and security.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#81D7B4] hover:text-white transition-all duration-300"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Product */}
            <div>
              <h3 className="font-bold text-gray-900 mb-6">Product</h3>
              <ul className="space-y-4">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-500 hover:text-[#81D7B4] transition-colors text-sm font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-bold text-gray-900 mb-6">Resources</h3>
              <ul className="space-y-4">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    {link.name === 'Docs' ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#81D7B4] transition-colors text-sm font-medium">
                        {link.name}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-gray-500 hover:text-[#81D7B4] transition-colors text-sm font-medium">
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold text-gray-900 mb-6">Company</h3>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-500 hover:text-[#81D7B4] transition-colors text-sm font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter - Simplified */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-bold text-gray-900 mb-6">Stay Updated</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4] transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 p-1.5 bg-[#81D7B4] text-white rounded-lg hover:bg-[#6BC5A0] transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Subscribe to our newsletter for the latest updates.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Bitsave Protocol. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></span>
            All Systems Operational
          </div>
        </div>
      </div>
    </footer>
  );
}
