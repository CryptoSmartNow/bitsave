'use client';

import { motion } from 'framer-motion';
import { User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/lib/adminAuth';

export default function BizFiSettingsPage() {
  const { user, logout } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#F9F9FB]">Settings</h1>
        <p className="text-[#9BA8B5] text-sm md:text-base">Manage your admin session</p>
      </div>

      <div className="grid gap-6">
        {/* Account Information */}
        <div className="bg-[#1A2538]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#7B8B9A]/10">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-[#81D7B4]" />
            <h3 className="text-lg font-bold text-[#F9F9FB]">Account Information</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#9BA8B5] mb-2">Username</label>
                <div className="w-full bg-[#0F1825] border border-[#7B8B9A]/20 rounded-xl px-4 py-2.5 text-[#F9F9FB] opacity-70 flex items-center h-11">
                  {user?.username || 'Loading...'}
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#9BA8B5] mb-2">Role</label>
                <div className="w-full bg-[#0F1825] border border-[#7B8B9A]/20 rounded-xl px-4 py-2.5 text-[#F9F9FB] opacity-70 capitalize flex items-center h-11">
                  {user?.role || 'Admin'}
                </div>
              </div>
            </div>
            <p className="text-sm text-[#7B8B9A] italic">
              * Account details are managed by system administrators via environment configuration.
            </p>
          </div>
        </div>

        {/* Session Management */}
        <div className="bg-[#1A2538]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#7B8B9A]/10">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-[#F59E0B]" />
            <h3 className="text-lg font-bold text-[#F9F9FB]">Session Management</h3>
          </div>
          <div className="space-y-4">
            <p className="text-[#9BA8B5]">
              Securely end your current session. You will be required to log in again to access the dashboard.
            </p>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold transition-colors border border-red-500/20"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* System Info */}
        <div className="text-center text-[#7B8B9A] text-sm pt-8">
          <p>BizFi Admin Dashboard v1.0.0</p>
          <p>Environment: {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}</p>
        </div>
      </div>
    </motion.div>
  );
}