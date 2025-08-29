'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [glitchText, setGlitchText] = useState('404');

  useEffect(() => {
    setMounted(true);
    
    // Glitch effect for 404 text
    const glitchChars = ['4', '0', '4', '?', '!', '#', '@', '%'];
    const interval = setInterval(() => {
      const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
      setGlitchText(prev => {
        const chars = prev.split('');
        const randomIndex = Math.floor(Math.random() * chars.length);
        chars[randomIndex] = randomChar;
        return chars.join('');
      });
      
      setTimeout(() => setGlitchText('404'), 100);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null;
  }

  const wittyMessages = [
    "Oops! This page went on a crypto adventure and never came back.",
    "404: Page not found. Unlike your savings, this one didn't compound.",
    "This page is as missing as your keys after a bull run.",
    "Error 404: Page is probably SaveFi farming somewhere.",
    "Page not found. It's probably staking in another dimension."
  ];

  const randomMessage = wittyMessages[Math.floor(Math.random() * wittyMessages.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2f2f2] via-[#e8f5f0] to-[#d4f1e8] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#81D7B4] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#6bc4a1] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-[#4ade80] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Glitch 404 */}
        <div className="relative mb-8">
          <h1 className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#81D7B4] to-[#4ade80] select-none">
            {glitchText}
          </h1>
          <div className="absolute inset-0 text-9xl md:text-[12rem] font-black text-red-500 opacity-20 animate-pulse">
            404
          </div>
        </div>

        {/* Witty message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {randomMessage}
          </p>
        </div>

        {/* Animated crypto icons */}
        <div className="flex justify-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-[#81D7B4] rounded-full flex items-center justify-center animate-bounce">
            <span className="text-white font-bold text-xl">₿</span>
          </div>
          <div className="w-12 h-12 bg-[#6bc4a1] rounded-full flex items-center justify-center animate-bounce animation-delay-200">
            <span className="text-white font-bold text-xl">Ξ</span>
          </div>
          <div className="w-12 h-12 bg-[#4ade80] rounded-full flex items-center justify-center animate-bounce animation-delay-400">
            <span className="text-white font-bold text-xl">$</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="px-8 py-4 bg-gradient-to-r from-[#81D7B4] to-[#6bc4a1] text-white font-semibold rounded-xl hover:from-[#6bc4a1] to-[#4ade80] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            🏠 Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-white text-[#81D7B4] font-semibold rounded-xl border-2 border-[#81D7B4] hover:bg-[#81D7B4] hover:text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            📊 Go to Dashboard
          </Link>
        </div>

        {/* Fun fact */}
        <div className="mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#81D7B4]/20 shadow-lg">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-[#81D7B4]">Fun Fact:</span> While you&apos;re here, your BitSave account is still earning BTS Tokens! 🚀
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}