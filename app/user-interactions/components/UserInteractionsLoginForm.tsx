'use client';

import { Activity01Icon, FlashIcon, UserMultipleIcon, Alert02Icon, DashboardSquare01Icon, BarChartIcon, LockKeyIcon, EyeIcon, ViewOffIcon, ArrowLeft01Icon, Shield01Icon } from "hugeicons-react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/adminAuth';

export default function UserInteractionsLoginForm() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the admin password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await login(password);
      if (success) {
        router.refresh();
      } else {
        setError('Invalid admin credentials. Please check password and try again.');
      }
    } catch {
      setError('Authentication server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b101b] via-[#080d17] to-[#040810] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#81D7B4]/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[160px]" />
        
        {/* Floating Icons */}
        <Activity01Icon className="absolute top-[12%] left-[12%] w-24 h-24 text-[#81D7B4]/10 -rotate-12 blur-[1px]" />
        <UserMultipleIcon className="absolute top-[20%] right-[12%] w-28 h-28 text-[#81D7B4]/5 rotate-12 blur-[2px]" />
        <FlashIcon className="absolute bottom-[20%] right-[15%] w-24 h-24 text-[#81D7B4]/10 -rotate-6 blur-[1px]" />
        <BarChartIcon className="absolute bottom-[15%] left-[15%] w-28 h-28 text-[#81D7B4]/5 rotate-45 blur-[2px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Top Back Link */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#81D7B4] transition-colors py-1 px-2.5 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft01Icon className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
          <span className="text-[11px] font-bold text-[#81D7B4] bg-[#81D7B4]/10 border border-[#81D7B4]/20 px-2.5 py-0.5 rounded-full">
            Dev & Ops Portal
          </span>
        </div>

        <div className="bg-[#0f172a]/90 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#81D7B4] to-transparent opacity-80" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#81D7B4]/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#81D7B4]/30 shadow-lg shadow-[#81D7B4]/10">
              <Shield01Icon className="w-8 h-8 text-[#81D7B4]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2 font-display">
              User Interactions
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Internal observability, error monitoring, and on-chain analytics for BitSave ecosystem.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Admin Security Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#81D7B4] transition-colors">
                  <LockKeyIcon className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-white/10 bg-white/[0.04] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/30 focus:border-[#81D7B4] text-sm transition-all"
                  placeholder="Enter administrator password"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#81D7B4] transition-colors cursor-pointer p-2 focus:outline-none"
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <ViewOffIcon className="w-5 h-5 transition-transform active:scale-90" />
                  ) : (
                    <EyeIcon className="w-5 h-5 transition-transform active:scale-90" />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2.5"
                >
                  <Alert02Icon className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#81D7B4] hover:opacity-90 text-white font-bold py-4 rounded-2xl transition-all transform active:scale-[0.99] shadow-lg shadow-[#81D7B4]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Shield01Icon className="w-4 h-4" />
                  <span>Authenticate & Enter</span>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-[11px] text-gray-500 font-medium">
              BitSave Protocol Infrastructure • Production Observability
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}