'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/adminAuth';

export default function BizFiLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(username, password);
    if (success) {
      // The layout will handle the redirect/rendering
    } else {
      setError('Invalid credentials');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F1825] flex items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#81D7B4]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#1A2538]/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="bg-[#1A2538]/80 backdrop-blur-md rounded-2xl p-8 border border-[#7B8B9A]/20 shadow-xl max-w-md w-full mx-4 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#F9F9FB] mb-2">
            BizFi Admin
          </h1>
          <p className="text-[#7B8B9A]">Secure access to BizFi analytics</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#9BA8B5] mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0F1825] border border-[#7B8B9A]/20 text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9BA8B5] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0F1825] border border-[#7B8B9A]/20 text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4] transition-colors"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg border border-red-900/30">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#81D7B4] text-[#0F1825] rounded-xl hover:bg-[#6BC4A0] transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Accessing...' : 'Access Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/bizfi" className="text-[#81D7B4] hover:text-[#6BC4A0] text-sm transition-colors">
            ← Return to BizFi
          </Link>
        </div>
      </div>
    </div>
  );
}
