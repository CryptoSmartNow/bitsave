'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [mounted, setMounted] = useState(false);
  const [errorCode, setErrorCode] = useState('500');
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Error code animation
    const codes = ['500', '5XX', 'ERR', '💥', '🔥'];
    let index = 0;
    const interval = setInterval(() => {
      setErrorCode(codes[index % codes.length]);
      index++;
    }, 1500);

    // Shake animation trigger
    const shakeInterval = setInterval(() => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(shakeInterval);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  const wittyMessages = [
    "Oops! Our servers are having a crypto meltdown. 📉",
    "500: Internal Server Error. Even our code needs a coffee break! ☕",
    "Something went wrong! Our hamsters powering the servers took a nap. 🐹",
    "Error 500: The blockchain gods are not pleased today. 🌩️",
    "Server crashed harder than Luna Classic. But we'll bounce back! 🚀",
    "Our servers are experiencing some technical difficulties. Unlike your portfolio, this will recover quickly! 📈"
  ];

  const randomMessage = wittyMessages[Math.floor(Math.random() * wittyMessages.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fee2e2] via-[#fef3c7] to-[#fde68a] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-1000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Animated error code */}
        <div className={`relative mb-8 ${isShaking ? 'animate-shake' : ''}`}>
          <h1 className="text-8xl md:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 select-none">
            {errorCode}
          </h1>
          <div className="absolute inset-0 text-8xl md:text-[10rem] font-black text-red-300 opacity-30 blur-sm">
            500
          </div>
        </div>

        {/* Error message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Internal Server Error
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {randomMessage}
          </p>
        </div>

        {/* Animated warning icons */}
        <div className="flex justify-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-white font-bold text-xl">⚠️</span>
          </div>
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center animate-bounce animation-delay-200">
            <span className="text-white font-bold text-xl">🔧</span>
          </div>
          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce animation-delay-400">
            <span className="text-white font-bold text-xl">⚡</span>
          </div>
        </div>

        {/* Error details (if available) */}
        {error.message && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700 font-mono">
              <span className="font-semibold">Error:</span> {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                <span className="font-semibold">Digest:</span> {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={reset}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            🔄 Try Again
          </button>
          <Link
            href="/"
            className="px-8 py-4 bg-white text-red-500 font-semibold rounded-xl border-2 border-red-500 hover:bg-red-500 hover:text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            🏠 Back to Safety
          </Link>
        </div>

        {/* Technical support info */}
        <div className="mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-red-200 shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-2">What happened?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Our servers encountered an unexpected error. Our team has been automatically notified and is working on a fix.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-sm">
            <span className="text-gray-500">Need help?</span>
            <a 
              href="mailto:support@bitsave.io" 
              className="text-red-500 hover:text-red-600 font-medium underline"
            >
              Contact Support
            </a>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-6 flex justify-center items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">System Status: Investigating</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}