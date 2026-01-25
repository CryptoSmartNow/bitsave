'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth, AuthProvider } from '@/lib/adminAuth';
import AdminLoginForm from '@/components/AdminLoginForm';

function AdminSidebar() {
  const { logout } = useAuth();
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Posts', href: '/admin/posts', icon: '📝' },
    { name: 'Categories', href: '/admin/categories', icon: '📁' },
    { name: 'New Post', href: '/admin/posts/new', icon: '✏️' }
  ];

  return (
    <div className="w-64 bg-white/70 backdrop-blur-sm border-r border-[#81D7B4]/10 h-screen fixed left-0 top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center mb-8">
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#81D7B4] to-[#66C4A3]">
            BitSave Admin
          </span>
        </Link>

        <nav className="space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                pathname === item.href
                  ? 'bg-[#81D7B4]/10 text-[#81D7B4]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <span className="text-lg">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <AuthProvider>
      <AdminLayoutContent pathname={pathname}>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}

function AdminLayoutContent({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FDFC] via-white to-[#F0F9FF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81D7B4]"></div>
      </div>
    );
  }

  if (!user && pathname !== '/admin/login') {
    return <AdminLoginForm redirectTo="/admin" />;
  }

  if (pathname === '/admin/login' && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FDFC] via-white to-[#F0F9FF] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">You are already logged in.</p>
          <Link href="/admin" className="text-[#81D7B4] hover:text-[#66C4A3]">
            Go to Dashboard →
          </Link>
        </div>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <AdminLoginForm redirectTo="/admin" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FDFC] via-white to-[#F0F9FF]">
      <AdminSidebar />
      <div className="ml-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}