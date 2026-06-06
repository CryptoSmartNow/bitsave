'use client';

import { Activity01Icon, Home01Icon } from "hugeicons-react";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Exo } from 'next/font/google';

const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-exo',
});

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`${exo.variable} font-sans min-h-screen bg-[#F8FAF9] flex items-center justify-center p-6 overflow-hidden relative`}>
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(129,215,180,0.15) 0%, transparent 70%)',
            transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
            transition: 'transform 0.8s ease-out',
          }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(129,215,180,0.1) 0%, transparent 70%)',
            transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px)`,
            transition: 'transform 1s ease-out',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
        
        {/* 3D Illustration */}
        <div className="relative w-72 h-72 sm:w-96 sm:h-96 mb-8 hover:scale-105 transition-transform duration-700 ease-out drop-shadow-xl"
             style={{
               transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)`,
             }}>
          <Image 
            src="/error_404.png" 
            alt="Page Not Found Illustration" 
            fill 
            className="object-contain mix-blend-multiply opacity-90 rounded-3xl"
            priority
          />
        </div>

        {/* Brand chip */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm mb-6">
          <div className="w-2 h-2 rounded-full bg-[#81D7B4] shadow-[0_0_8px_rgba(129,215,180,0.8)]" />
          <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Error 404</span>
        </div>

        {/* Heading & description */}
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-5 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto mb-10 font-medium">
          The page you're looking for has drifted into the void. It may have moved, been removed, or never existed.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
          <Link
            href="/"
            className="group w-full flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-[#81D7B4] hover:bg-opacity-90 text-white font-bold rounded-2xl transition-all duration-200 shadow-[0_8px_20px_rgba(129,215,180,0.25)] hover:-translate-y-0.5"
          >
            <Home01Icon className="w-5 h-5" />
            Return Home
          </Link>
          <Link
            href="/dashboard"
            className="group w-full flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 shadow-sm hover:-translate-y-0.5"
          >
            Dashboard
            <Activity01Icon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  );
}