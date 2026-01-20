'use client';

import { useAuth, AuthProvider } from '@/lib/adminAuth';
import BizFiLoginForm from './components/BizFiLoginForm';
import BizFiSidebar from './components/BizFiSidebar';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, Shield } from 'lucide-react';

function BizFiAdminContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1825] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81D7B4]"></div>
      </div>
    );
  }

  if (!user) {
    return <BizFiLoginForm />;
  }

  return (
    <div className="min-h-screen bg-[#0F1825] text-[#F9F9FB] overflow-x-hidden">
      <BizFiSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Wrapper - Pushed right on desktop to accommodate fixed sidebar */}
      <div className="flex flex-col min-h-screen md:pl-72 transition-all duration-300 ease-in-out">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#1A2538]/80 backdrop-blur-md border-b border-[#7B8B9A]/20 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#81D7B4] flex items-center justify-center text-[#0F1825] shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-bold text-[#F9F9FB] tracking-tight">BizFi Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-[#9BA8B5] hover:text-[#F9F9FB] hover:bg-[#0F1825] rounded-xl transition-all active:scale-95"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 flex flex-col min-w-0">
          <div className="p-4 md:p-8 lg:p-10 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function BizFiAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BizFiAdminContent>{children}</BizFiAdminContent>
    </AuthProvider>
  );
}
