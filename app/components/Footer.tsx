'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaTelegramPlane } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const footerLinks = {
  product: [
    { name: 'Download', href: '#download' },
    { name: 'Security', href: '#security' },
    { name: 'Support', href: '#support' },
    { name: 'Feature Requests', href: '#features' }
  ],
  resources: [
    { name: 'Explore', href: '#explore' },
    { name: 'Learn', href: '#learn' },
    { name: 'Blog', href: '#blog' },
    { name: 'Docs', href: '#docs' }
  ],
  company: [
    { name: 'About', href: '#about' },
    { name: 'Terms', href: '#terms' },
    { name: 'Privacy', href: '#privacy' },
    { name: 'Careers', href: '#careers' },
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
    <footer className="relative overflow-hidden bg-[#f8fafa]">
      {/* Clean page background */}
      <div className="absolute inset-0 bg-[url('/grain-texture.png')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>

      {/* Subtle "BitSave" watermark centered within footer container */}
      <svg
        className="absolute left-0 bottom-[-2rem] w-full h-[40vh] pointer-events-none select-none z-0"
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.3) 80%, transparent 100%)',
          maskImage:
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.3) 80%, transparent 100%)'
        }}
      >
        <defs>
          <linearGradient id="footerWatermarkGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(17,24,39,0.10)" />
            <stop offset="50%" stopColor="rgba(31,41,55,0.08)" />
            <stop offset="100%" stopColor="rgba(17,24,39,0.10)" />
          </linearGradient>
        </defs>
        <text
          x="50%"
          textAnchor="middle"
          y="70%"
          dominantBaseline="middle"
          fill="url(#footerWatermarkGradient)"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', 'Noto Sans', Arial, 'Apple Color Emoji', 'Segoe UI Emoji'"
          fontSize="12"
          letterSpacing="0.02em"
          textLength="80"
          lengthAdjust="spacingAndGlyphs"
        >
          BitSave
        </text>
      </svg>

      {/* Card Footer (replicated layout) */}
      <div className="relative mx-auto max-w-6xl px-6 py-16 lg:px-8 z-10">
        <div className="rounded-3xl bg-white ring-1 ring-gray-200/60 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.25)] p-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image src="/bitsavelogo.png" alt="BitSave" width={120} height={32} className="h-8 w-auto" />
              </div>
              <p className="text-xs text-gray-500 leading-snug max-w-[600px]">
                Give Tomorrow a Soft Landing
                Breathe Easier, Save with BitSave

              </p>
              <div className="mt-6 flex items-center gap-4 text-gray-600">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="p-2 rounded-full border border-gray-200/70 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md transition-all"
                  >
                    <span className="sr-only">{item.name}</span>
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns grouped right */}
            <div className="md:col-span-3 flex justify-end">
              <div className="grid grid-cols-3 gap-10 w-full max-w-[560px] justify-items-start">
                {/* Product */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Product</h3>
                  <ul role="list" className="mt-6 space-y-3">
                    {footerLinks.product.map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm text-gray-600 hover:text-gray-900">
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
                  <ul role="list" className="mt-6 space-y-3">
                    {footerLinks.resources.map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm text-gray-600 hover:text-gray-900">
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Company */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Company</h3>
                  <ul role="list" className="mt-6 space-y-3">
                    {footerLinks.company.map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm text-gray-600 hover:text-gray-900">
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-8 border-t border-gray-200" />

          {/* Bottom row */}
          <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs leading-5 text-gray-500">© {new Date().getFullYear()} BitSave. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-gray-500">
              <Link href="#privacy" className="hover:underline">Privacy Policy</Link>
              <Link href="#terms" className="hover:underline">Terms of Service</Link>
              <Link href="#cookies" className="hover:underline">Cookies Settings</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}