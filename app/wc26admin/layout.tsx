'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth, AuthProvider } from '@/lib/adminAuth';
import Link from 'next/link';
import { Award01Icon, ViewIcon, Logout01Icon } from 'hugeicons-react';
import { useEffect } from 'react';

export default function WC26AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WC26AdminLayoutContent>{children}</WC26AdminLayoutContent>
    </AuthProvider>
  );
}

function WC26AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && pathname !== '/wc26admin/login') {
      router.push('/wc26admin/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A3622] to-[#051A10] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  // If on login page, just render children without nav
  if (pathname === '/wc26admin/login') {
    return <>{children}</>;
  }

  if (!user) {
    // Show a blank loading screen while redirecting
    return (
      <div className="min-h-screen bg-[#020611] flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2 text-[#D4AF37]">
          <Award01Icon className="w-6 h-6" />
          <span>Redirecting...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020611] text-white selection:bg-[#D4AF37] selection:text-black flex flex-col">
      {/* Top Navbar for WC26 Admin */}
      <header className="bg-[#0A3622]/80 backdrop-blur-xl border-b border-[#D4AF37]/20 shadow-xl z-20 px-8 py-4 sticky top-0 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center">
              <Award01Icon className="w-5 h-5 text-black" strokeWidth={2} />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">WC26<span className="text-[#D4AF37]">Admin</span></h1>
          </div>
          
          <nav className="flex items-center gap-2">
            <Link href="/wc26admin" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] font-semibold border border-[#D4AF37]/20 transition-all hover:bg-[#D4AF37]/20">
              <Award01Icon className="w-4 h-4" strokeWidth={2} />
              Pool Dashboard
            </Link>
            <Link href="/bizswap/wc26" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium">
              <ViewIcon className="w-4 h-4" strokeWidth={2} />
              View Live Pool
            </Link>
          </nav>
        </div>

        <div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-semibold border border-transparent hover:border-red-400/20"
          >
            <Logout01Icon className="w-4 h-4" strokeWidth={2} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <main className="p-8 max-w-5xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
