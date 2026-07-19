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
    <footer className="relative bg-[#f8fafc] pt-24 pb-4 md:pb-8 overflow-hidden">

      {/* Background Texture for the main wrapper */}
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.5 }}></div>

      <div className="w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] max-w-[120rem] mx-auto relative z-10">
        
        {/* Detached Floating Island - Ultra Wide */}
        <div className="relative bg-white/80 backdrop-blur-3xl border border-slate-200/80 rounded-[3rem] lg:rounded-[4rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.04)] pt-12 md:pt-20 px-8 md:px-16 lg:px-24 flex flex-col">
          
          {/* Subtle inner glowing gradient */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#81D7B4]/10 blur-[120px] rounded-full pointer-events-none mix-blend-multiply" />
          <div className="absolute bottom-1/2 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none mix-blend-multiply" />
          
          {/* Top Banner inside Footer */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 pb-16 mb-16 border-b border-slate-100 relative z-20">
            <div className="max-w-2xl text-center lg:text-left">
              <h2 className="font-instrument text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-4">
                Ready to take <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5fb392] to-[#81D7B4] drop-shadow-sm">control?</span>
              </h2>
              <p className="text-slate-500 text-lg md:text-xl font-medium">
                Join thousands of users building sustainable wealth on-chain with zero compromise.
              </p>
            </div>
            <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row gap-4">
              <Link 
                href="/docs" 
                className="px-8 py-4 bg-transparent border border-slate-300 text-slate-800 rounded-full font-bold hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-sm flex items-center justify-center gap-2 group"
              >
                Read Docs
                <ArrowRight01Icon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 mb-20 relative z-20">

            {/* Brand Column */}
            <div className="lg:col-span-5 space-y-8 pr-0 lg:pr-16">
              <Link href="/" className="inline-block group">
                <Image 
                  src="/bitsavelogo.png" 
                  alt="BitSave" 
                  width={180} 
                  height={50} 
                  className="h-12 w-auto group-hover:opacity-80 transition-opacity" 
                />
              </Link>
              <p className="text-slate-500 leading-relaxed text-lg max-w-md font-medium">
                The decentralized savings protocol helping you build wealth across multiple chains with uncompromising security and ease.
              </p>
              <div className="flex items-center gap-4 pt-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#81D7B4] hover:text-white hover:border-[#81D7B4] hover:shadow-[0_15px_30px_rgba(129,215,180,0.3)] hover:-translate-y-1 transition-all duration-300 group"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 lg:gap-8">
              {/* Product */}
              <div>
                <h3 className="font-instrument text-2xl font-bold text-slate-900 mb-8 tracking-tight border-b border-slate-100 pb-4 inline-block">Product</h3>
                <ul className="space-y-5">
                  {footerLinks.product.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-slate-500 hover:text-[#5fb392] transition-all text-base font-medium flex items-center gap-3 group">
                        <span className="w-6 h-[1px] bg-slate-200 group-hover:bg-[#81D7B4] group-hover:w-8 transition-all" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="font-instrument text-2xl font-bold text-slate-900 mb-8 tracking-tight border-b border-slate-100 pb-4 inline-block">Resources</h3>
                <ul className="space-y-5">
                  {footerLinks.resources.map((link) => (
                    <li key={link.name}>
                      {link.href.startsWith('http') ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#5fb392] transition-all text-base font-medium flex items-center gap-3 group">
                          <span className="w-6 h-[1px] bg-slate-200 group-hover:bg-[#81D7B4] group-hover:w-8 transition-all" />
                          {link.name}
                        </a>
                      ) : (
                        <Link href={link.href} className="text-slate-500 hover:text-[#5fb392] transition-all text-base font-medium flex items-center gap-3 group">
                          <span className="w-6 h-[1px] bg-slate-200 group-hover:bg-[#81D7B4] group-hover:w-8 transition-all" />
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div className="sm:col-span-2 md:col-span-1">
                <h3 className="font-instrument text-2xl font-bold text-slate-900 mb-8 tracking-tight border-b border-slate-100 pb-4 inline-block">Newsletter</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed font-medium">
                  Subscribe to <span className="font-bold text-slate-900">The art of Savviness</span> for strategies to build growth.
                </p>
                <form 
                  action="https://bitsaveprotocol.substack.com/subscribe" 
                  method="get" 
                  target="_blank"
                  className="relative flex items-center group"
                >
                  <input
                    type="email"
                    name="email"
                    placeholder="Your email address"
                    className="w-full pl-6 pr-14 py-4 rounded-[1.5rem] text-sm font-medium focus:outline-none bg-slate-50/80 border border-slate-200 text-slate-900 focus:border-[#81D7B4] focus:bg-white placeholder:text-slate-400 transition-all shadow-inner hover:bg-slate-50"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 w-12 flex items-center justify-center rounded-[1.2rem] bg-slate-900 text-white shadow-sm hover:bg-[#81D7B4] hover:shadow-[0_8px_16px_rgba(129,215,180,0.3)] transition-all duration-300"
                  >
                    <ArrowRight01Icon className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom Bar Info */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16 relative z-20">
            <p className="text-sm text-slate-500 font-medium">
              © {new Date().getFullYear()} Bitsave Protocol. All rights reserved.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">Terms of Service</Link>
              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#81D7B4] shadow-[0_0_8px_#81D7B4] animate-pulse"></span>
                Systems Operational
              </div>
            </div>
          </div>

          {/* MASSIVE OUTLINE BITSAVE TEXT */}
          <div className="w-full relative z-10 flex items-center justify-center -mb-[3%] md:-mb-[6%] lg:-mb-[8%] overflow-hidden pointer-events-none select-none">
            <h1 
              className="font-instrument font-bold tracking-tight uppercase leading-none"
              style={{
                fontSize: 'clamp(5rem, 25vw, 30rem)',
                WebkitTextStroke: '1.5px #e2e8f0', // The outline thickness and color
                color: 'transparent' // Make the inside transparent
              }}
            >
              BITSAVE
            </h1>
          </div>

        </div>
      </div>
    </footer>
  );
}
