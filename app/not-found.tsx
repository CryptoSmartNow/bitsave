'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f9f6] to-[#e8f5f0] flex items-center justify-center p-6 overflow-hidden relative">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#81D7B4] rounded-full opacity-5 blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#81D7B4] rounded-full opacity-5 blur-3xl animate-float-slower"></div>
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Clean 404 with visual hierarchy */}
        <div className="mb-6">
          <div className="inline-block relative">
            <h1 className="text-[10rem] md:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-[#81D7B4] via-[#81D7B4] to-[#81D7B4] leading-none tracking-tight">
              404
            </h1>
            {/* Subtle shadow effect */}
            <div className="absolute inset-0 text-[10rem] md:text-[14rem] font-black text-[#81D7B4] opacity-10 blur-sm -z-10 translate-x-2 translate-y-2">
              404
            </div>
          </div>
        </div>

        {/* Clear message hierarchy */}
        <div className="mb-10 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Page Not Found
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Minimalist icon */}
        <div className="mb-10 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-[#81D7B4] rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-500">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-[#81D7B4] rounded-2xl blur-xl opacity-20 animate-pulse-slow"></div>
          </div>
        </div>

        {/* Clean action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/"
            className="group px-8 py-4 bg-[#81D7B4] text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-[#81D7B4]/20 transform hover:-translate-y-1 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="group px-8 py-4 bg-white text-[#81D7B4] font-semibold rounded-xl border-2 border-[#81D7B4] hover:bg-[#81D7B4] hover:text-white hover:border-[#81D7B4] transform hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-xl"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Go to Dashboard
            </span>
          </Link>
        </div>

        {/* Info card with brand colors */}
        <div className="p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#81D7B4]/30 shadow-xl max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-[#81D7B4] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Need Help?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                If you believe this is an error, please contact our support team or return to the homepage.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(30px, -30px) scale(1.05);
          }
        }
        @keyframes float-slower {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-20px, 20px) scale(1.03);
          }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 10s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}