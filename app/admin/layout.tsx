'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth, AuthProvider } from '@/lib/adminAuth';

function LoginForm() {
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
      router.push('/admin');
    } else {
      setError('Invalid credentials');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FDFC] via-white to-[#F0F9FF] flex items-center justify-center">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-[#81D7B4]/10 shadow-lg max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] mb-2">
            Admin Login
          </h1>
          <p className="text-gray-600">Access the blog management dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/20 focus:border-[#81D7B4]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/20 focus:border-[#81D7B4]"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#81D7B4] text-white rounded-xl hover:bg-[#66C4A3] transition-colors font-medium disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-[#81D7B4] hover:text-[#66C4A3] text-sm">
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}

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
    return <LoginForm />;
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
    return <LoginForm />;
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