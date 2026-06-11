'use client';

import { useAuth } from '@/lib/adminAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield01Icon } from 'hugeicons-react';

export default function WC26AdminLoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push('/wc26admin');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const success = await login(password);
    if (success) {
      router.push('/wc26admin');
    } else {
      setError('Invalid credentials');
    }
    setIsSubmitting(false);
  };

  if (loading || user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A3622] to-[#051A10] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020611] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#0A3622]/30 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
          {/* Inner subtle glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37]/20 to-[#B8860B]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
              <Shield01Icon className="w-8 h-8 text-[#D4AF37]" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#D4AF37] to-[#B8860B] mb-2 tracking-tight">WC26 Admin</h1>
            <p className="text-gray-400 font-medium text-sm">Please sign in to manage the pool</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 ml-1">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-white/10 bg-[#020611]/80 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all duration-200 placeholder-gray-600"
                placeholder="••••••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center animate-shake">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-3" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#E5C158] hover:to-[#D4AF37] text-black font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs font-medium text-gray-500/80">
              Protected by Bitsave Protocol Security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
