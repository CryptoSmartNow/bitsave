'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

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
    <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center p-6 overflow-hidden relative font-sans">

      {/* Layered background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(129,215,180,0.12) 0%, transparent 70%)',
            transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
            transition: 'transform 0.8s ease-out',
          }}
        />
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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/20 mb-12">
          <div className="w-1.5 h-1.5 rounded-full bg-[#81D7B4] animate-pulse" />
          <span className="text-xs font-bold text-[#81D7B4] tracking-widest uppercase">Bitsave Protocol</span>
        </div>

        {/* Giant 404 */}
        <div className="relative mb-6 select-none">
          <div
            className="text-[clamp(100px,22vw,220px)] font-black leading-none tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #81D7B4 0%, rgba(129,215,180,0.3) 60%, transparent 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </div>
          {/* Glow behind */}
          <div
            className="absolute inset-0 flex items-center justify-center -z-10 blur-3xl opacity-20"
            style={{ color: '#81D7B4', fontSize: 'clamp(100px,22vw,220px)', fontWeight: 900 }}
          >
            404
          </div>
        </div>

        {/* Divider line */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-[#81D7B4]/40" />
          <div className="w-2 h-2 rounded-full bg-[#81D7B4]/60" />
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-[#81D7B4]/40" />
        </div>

        {/* Heading & description */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-md mx-auto mb-12">
          The page you're looking for has drifted into the void. It may have moved, been removed, or never existed.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
          <Link
            href="/"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0a0f0d] font-bold rounded-xl transition-all duration-200 shadow-[0_0_30px_rgba(129,215,180,0.25)] hover:shadow-[0_0_40px_rgba(129,215,180,0.4)]"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            Go to Dashboard
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Info strip */}
        <div className="inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
          <div className="w-8 h-8 rounded-lg bg-[#81D7B4]/15 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-[#81D7B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            Think this is a mistake?{' '}
            <a href="mailto:support@bitsave.io" className="text-[#81D7B4] hover:underline font-medium">
              Contact support
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}