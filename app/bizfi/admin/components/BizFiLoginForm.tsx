'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/adminAuth';
import { Shield01Icon, Alert01Icon, LockKeyIcon, ArrowRight01Icon } from 'hugeicons-react';

export default function BizFiLoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(password);
    if (!success) {
      setError('Invalid admin credentials. Access denied.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F1825] flex items-center justify-center relative overflow-hidden p-4 sm:p-6" style={{ background: 'linear-gradient(180deg, #0F1825 0%, #1A2538 100%)' }}>
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#81D7B4]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#2C3E5D]/30 rounded-full blur-[140px] pointer-events-none" />

      <div className="bg-[#1A2538]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 border border-[#7B8B9A]/20 shadow-2xl max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#81D7B4] flex items-center justify-center text-[#0F1825] font-black text-2xl mx-auto mb-4 shadow-[0_0_25px_rgba(129,215,180,0.3)]">
            <Shield01Icon className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F9F9FB] mb-2 tracking-tight">
            BizFi Admin
          </h1>
          <p className="text-xs sm:text-sm text-[#9BA8B5]">
            Secure portal access & onchain business verification
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8B5] mb-2">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 pl-11 rounded-xl bg-[#0F1825] border border-[#7B8B9A]/25 text-[#F9F9FB] placeholder-[#7B8B9A]/50 focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4] transition-all text-sm shadow-inner"
                placeholder="Enter password"
                required
                autoFocus
              />
              <LockKeyIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8B9A]" />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/40 py-3 px-4 rounded-xl border border-red-500/30 font-medium">
              <Alert01Icon className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full py-3.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0F1825] rounded-xl shadow-[0_4px_16px_rgba(129,215,180,0.25)] transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-[#0F1825] border-t-transparent animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Access Dashboard</span>
                <ArrowRight01Icon className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#7B8B9A]/15 text-center">
          <Link href="/bizfi" className="text-xs font-bold text-[#81D7B4] hover:underline transition-colors inline-flex items-center gap-1.5">
            ← Return to BizFi Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
