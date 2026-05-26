'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import { Exo } from 'next/font/google';

const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-exo',
});

export default function GoodbyePage() {
  return (
    <div className={`${exo.variable} font-sans min-h-screen flex flex-col items-center justify-center bg-[#F8FAF9] p-6 relative overflow-hidden`}>
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#81D7B4]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#81D7B4]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] w-full max-w-md p-10 text-center relative z-10 border border-gray-100">
        <div className="w-20 h-20 mx-auto mb-6 bg-[#F8FAF9] rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
          <Image src="/bitsavelogo.png" alt="BitSave" width={48} height={48} className="object-contain" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">You're logged out</h1>
        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
          Your wallet has been disconnected securely. We hope to see you saving again soon!
        </p>

        <div className="space-y-4">
          <Link href="/" className="w-full flex items-center justify-center gap-2 py-4 bg-[#81D7B4] hover:bg-opacity-90 text-white rounded-2xl font-bold shadow-[0_4px_15px_rgba(129,215,180,0.3)] transition-all transform hover:-translate-y-0.5">
            Return to Home <HiOutlineArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
