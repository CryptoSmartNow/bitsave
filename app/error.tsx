'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Log error for debugging
    console.error('Error occurred:', error);
  }, [error]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#fef5f1] to-[#fee8e0] flex items-center justify-center p-6 overflow-hidden relative">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#ff6b6b] rounded-full opacity-5 blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#81D7B4] rounded-full opacity-5 blur-3xl animate-float-slower"></div>
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Clean 500 with visual hierarchy */}
        <div className="mb-6">
          <div className="inline-block relative">
            <h1 className="text-[10rem] md:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-[#81D7B4] via-[#ff6b6b] to-[#81D7B4] leading-none tracking-tight">
              500
            </h1>
            {/* Subtle shadow effect */}
            <div className="absolute inset-0 text-[10rem] md:text-[14rem] font-black text-[#ff6b6b] opacity-10 blur-sm -z-10 translate-x-2 translate-y-2">
              500
            </div>
          </div>
        </div>

        {/* Clear message hierarchy */}
        <div className="mb-10 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Internal Server Error
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto">
            Something went wrong on our end. We're working to fix it.
          </p>
        </div>

        {/* Minimalist icon */}
        <div className="mb-10 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-[#ff6b6b] rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-500">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-[#ff6b6b] rounded-2xl blur-xl opacity-20 animate-pulse-slow"></div>
          </div>
        </div>

        {/* Error details (if available) */}
        {error.message && (
          <div className="mb-10 p-5 bg-white/90 backdrop-blur-sm rounded-2xl border border-red-200/50 shadow-lg max-w-lg mx-auto">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mt-0.5">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Error Details</h3>
                <p className="text-xs text-gray-600 font-mono break-all leading-relaxed">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="font-semibold">ID:</span> {error.digest}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Clean action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={reset}
            className="group px-8 py-4 bg-gradient-to-r from-[#81D7B4] to-[#81D7B4] text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-[#81D7B4]/20 transform hover:-translate-y-1 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </span>
          </button>
          <Link
            href="/"
            className="group px-8 py-4 bg-white text-[#81D7B4] font-semibold rounded-xl border-2 border-[#81D7B4] hover:bg-[#81D7B4] hover:text-white hover:border-[#81D7B4] transform hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-xl"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </span>
          </Link>
        </div>

        {/* Support info card with brand colors */}
        <div className="p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#81D7B4]/30 shadow-xl max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-[#81D7B4] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Need Help?</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Our team has been notified and is working on a fix. If the problem persists, please contact support.
              </p>
              <a
                href="mailto:support@bitsave.io"
                className="inline-flex items-center gap-1 text-sm text-[#81D7B4] hover:text-[#66C4A3] font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-6 flex justify-center items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6b6b] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff6b6b]"></span>
          </div>
          <span className="text-sm text-gray-500 font-medium">Investigating Issue</span>
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