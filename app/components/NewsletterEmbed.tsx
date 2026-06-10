'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface NewsletterEmbedProps {
  className?: string;
  theme?: 'light' | 'dark';
}

export default function NewsletterEmbed({ className = "", theme = 'dark' }: NewsletterEmbedProps) {
  const [email, setEmail] = useState('');
  
  const isDark = theme === 'dark';
  
  return (
    <div className={`w-full max-w-[480px] mx-auto ${className}`}>
      <form 
        action="https://bitsaveprotocol.substack.com/subscribe" 
        method="get" 
        target="_blank"
        className={`p-6 sm:p-8 rounded-3xl border text-center ${
          isDark 
            ? 'bg-[#1A2538] border-[#7B8B9A]/20 shadow-2xl' 
            : 'bg-[#F4F7FA] border-gray-100 shadow-md'
        }`}
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-[#0F1825] rounded-2xl flex items-center justify-center mb-4 overflow-hidden shadow-lg border border-[#7B8B9A]/20">
            <Image src="/bitsavelogo.png" alt="Bitsave Logo" width={32} height={32} className="object-contain" />
          </div>
          
          <h4 className={`text-2xl font-black tracking-tight mb-2 ${isDark ? 'text-[#F9F9FB]' : 'text-[#0F1825]'}`}>
            The art of Savviness
          </h4>
          
          <p className={`text-sm mb-3 font-medium leading-relaxed ${isDark ? 'text-[#9BA8B5]' : 'text-gray-600'}`}>
            Get smarter with your money; personal and business finance strategies to build growth.
          </p>
        </div>

        <div className="relative flex items-center">
          <input
            type="email"
            name="email"
            placeholder="Type your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full pl-4 pr-[110px] py-3.5 rounded-xl text-sm font-medium focus:outline-none transition-all ${
              isDark 
                ? 'bg-[#0F1825] border border-[#7B8B9A]/30 text-[#F9F9FB] focus:border-[#81D7B4] placeholder:text-[#7B8B9A]' 
                : 'bg-white border border-gray-200 text-[#0F1825] focus:border-[#0F1825] placeholder:text-gray-400 shadow-sm'
            }`}
            required
          />
          <button
            type="submit"
            className={`absolute right-1.5 top-1.5 bottom-1.5 px-5 font-bold rounded-lg text-sm transition-all flex items-center justify-center ${
              isDark
                ? 'bg-[#81D7B4] text-[#0F1825] hover:bg-[#6BC4A0] hover:scale-[0.98]'
                : 'bg-[#5B5B5B] text-white hover:bg-[#4A4A4A] hover:scale-[0.98]'
            }`}
          >
            Subscribe
          </button>
        </div>
        
        <p className={`text-[11px] mt-5 leading-tight ${isDark ? 'text-[#7B8B9A]/60' : 'text-gray-400'}`}>
          By subscribing you agree to Substack's <a href="#" className="underline hover:text-[#81D7B4] transition-colors">Terms of Use</a>, our <a href="#" className="underline hover:text-[#81D7B4] transition-colors">Privacy Policy</a> and our Information collection notice.
        </p>
      </form>
    </div>
  );
}
