'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/adminAuth';
import { Activity, Zap, Shield, Database, Lock, Hexagon } from 'lucide-react';

interface AdminLoginFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export default function AdminLoginForm({ 
  redirectTo, 
  onSuccess,
  title = "Admin Portal",
  subtitle = "Authenticate to access system controls"
}: AdminLoginFormProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(password);
    if (success) {
      if (onSuccess) {
        onSuccess();
      } else if (redirectTo) {
        router.push(redirectTo);
      } else {
        // Default behavior if no redirect/callback provided
        router.refresh();
      }
    } else {
      setError('Invalid credentials');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FDFC] via-white to-[#F0F9FF] flex items-center justify-center relative overflow-hidden">
      {/* Background Ambience & Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Icons with fade effect */}
        <Activity className="absolute top-[10%] left-[10%] w-24 h-24 text-[#81D7B4]/5 -rotate-12 blur-sm" />
        <Zap className="absolute top-[20%] right-[15%] w-32 h-32 text-[#81D7B4]/10 rotate-12 blur-[2px]" />
        <Shield className="absolute bottom-[15%] left-[20%] w-20 h-20 text-[#81D7B4]/5 rotate-45 blur-sm" />
        <Database className="absolute bottom-[20%] right-[10%] w-28 h-28 text-[#81D7B4]/10 -rotate-6 blur-[1px]" />
        <Lock className="absolute top-[40%] left-[5%] w-16 h-16 text-[#81D7B4]/5 rotate-12 blur-sm" />
        <Hexagon className="absolute bottom-[5%] left-[50%] w-40 h-40 text-[#81D7B4]/5 -translate-x-1/2 rotate-90 blur-md" />
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#81D7B4]/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#81D7B4]/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-[#81D7B4]/20 shadow-2xl max-w-md w-full mx-4 relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#81D7B4]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#81D7B4]/20">
            <Shield className="w-8 h-8 text-[#81D7B4]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
            {title}
          </h1>
          <p className="text-slate-500">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/20 focus:border-[#81D7B4] focus:bg-white transition-all duration-200"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center animate-shake">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#81D7B4] hover:bg-[#66C4A3] text-white font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#81D7B4]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Protected by Bitsave Protocol Security
          </p>
        </div>
      </div>
    </div>
  );
}