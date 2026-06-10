'use client';

import { TelegramIcon, YoutubeIcon, TwitterIcon, ArrowRight01Icon } from "hugeicons-react";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NewsletterEmbed from './NewsletterEmbed';

const footerLinks = {
  product: [
    { name: 'SaveFi', href: '/' },
    { name: 'BizFi', href: '/bizfi' },
    { name: 'BizFun', href: '/bizfun' },
    { name: 'BizSwap', href: '/bizswap' }
  ],
  resources: [
    { name: 'Blog', href: '/blog' },
    { name: 'SaveFi Docs', href: '/docs' },
    { name: 'BizFi Docs', href: 'https://bizfi.mintlify.app/' },
    { name: 'FAQ', href: '#faq' }
  ]
};

const socialLinks = [
  {
    name: 'Cancel',
    href: 'https://x.com/bitsaveprotocol',
    icon: <TwitterIcon className="w-5 h-5" />
  },
  {
    name: 'Telegram',
    href: 'https://t.me/+YimKRR7wAkVmZGRk',
    icon: <TelegramIcon className="w-5 h-5" />
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@bitsaveprotocol',
    icon: <YoutubeIcon className="w-5 h-5" />
  }
];

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <footer className="section-lazy relative bg-white pt-16 md:pt-24 pb-12 overflow-hidden border-t border-gray-100">

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
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gradient-to-br hover:from-[#81D7B4] hover:to-[#5fb392] hover:text-white hover:shadow-lg hover:shadow-[#81D7B4]/20 hover:scale-110 transition-all duration-300"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Product */}
            <div>
              <h3 className="font-display font-bold text-gray-900 mb-6">Product</h3>
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
              <h3 className="font-display font-bold text-gray-900 mb-6">Resources</h3>
              <ul className="space-y-4">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('http') ? (
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

            {/* Newsletter */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-display font-bold text-gray-900 mb-6">Newsletter</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Get smarter with your money. Subscribe to <span className="font-semibold text-gray-900">The art of Savviness</span> for strategies to build growth.
              </p>
              <form 
                action="https://bitsaveprotocol.substack.com/subscribe" 
                method="get" 
                target="_blank"
                className="relative flex items-center"
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  className="w-full pl-4 pr-12 py-3 rounded-xl text-sm font-medium focus:outline-none bg-gray-50/50 border border-gray-100 text-gray-900 focus:border-[#81D7B4] focus:bg-white placeholder:text-gray-400 transition-all shadow-sm"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 w-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#81D7B4] to-[#5fb392] text-white shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300"
                >
                  <ArrowRight01Icon className="w-5 h-5" />
                </button>
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
