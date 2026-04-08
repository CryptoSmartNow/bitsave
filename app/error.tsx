'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.error('Error occurred:', error);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [error]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center p-6 overflow-hidden relative font-sans">

      {/* Layered background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Red-tinted top orb for error feel */}
        <div
          className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(248,113,113,0.1) 0%, transparent 70%)',
            transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
            transition: 'transform 0.8s ease-out',
          }}
        />
        {/* Brand green bottom orb */}
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(129,215,180,0.07) 0%, transparent 70%)',
            transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px)`,
            transition: 'transform 1s ease-out',
          }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(129,215,180,1) 1px, transparent 1px), linear-gradient(90deg, rgba(129,215,180,1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto text-center">

        {/* Brand chip */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-12">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs font-bold text-red-400 tracking-widest uppercase">System Error</span>
        </div>

        {/* Giant 500 */}
        <div className="relative mb-6 select-none">
          <div
            className="text-[clamp(100px,22vw,220px)] font-black leading-none tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, rgba(248,113,113,0.9) 0%, rgba(248,113,113,0.3) 50%, rgba(129,215,180,0.4) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            500
          </div>
          {/* Glow behind */}
          <div
            className="absolute inset-0 flex items-center justify-center -z-10 blur-3xl opacity-15"
            style={{ color: '#f87171', fontSize: 'clamp(100px,22vw,220px)', fontWeight: 900 }}
          >
            500
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-red-500/30" />
          <div className="w-2 h-2 rounded-full bg-red-400/60" />
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-red-500/30" />
        </div>

        {/* Heading & description */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
          Internal Server Error
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-md mx-auto mb-8">
          Something went wrong on our end. Our team has been notified and we're working on a fix.
        </p>

        {/* Error details toggle */}
        {error.message && (
          <div className="mb-10 max-w-lg mx-auto">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-400 transition-colors mx-auto mb-3 font-mono"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${showDetails ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showDetails ? 'Hide' : 'Show'} error details
            </button>
            {showDetails && (
              <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-left">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Error Log</span>
                </div>
                <p className="text-xs text-gray-500 font-mono break-all leading-loose">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-[10px] text-gray-600 mt-3 font-mono">
                    <span className="text-gray-500">digest:</span> {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
          <button
            onClick={reset}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0a0f0d] font-bold rounded-xl transition-all duration-200 shadow-[0_0_30px_rgba(129,215,180,0.2)] hover:shadow-[0_0_40px_rgba(129,215,180,0.35)]"
          >
            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
          <Link
            href="/"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Status + support strip */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-400" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Investigating issue</span>
          </div>

          {/* Support link */}
          <a
            href="mailto:support@bitsave.io"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-500 hover:text-[#81D7B4] transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Support
          </a>
        </div>

      </div>
    </div>
  );
}