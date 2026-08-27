'use client';

import {
  UserIcon,
  Logout01Icon,
  Shield01Icon,
  Settings01Icon,
  Activity01Icon,
  LockKeyIcon,
  Tick01Icon
} from "hugeicons-react";
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/adminAuth';

export default function BizFiSettingsPage() {
  const { user, logout } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-16 max-w-[1600px] mx-auto font-sans"
    >
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#1A2538]/70 border border-[#7B8B9A]/20 p-6 md:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#81D7B4]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#81D7B4]/15 flex items-center justify-center text-[#81D7B4] border border-[#81D7B4]/25">
              <Settings01Icon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#F9F9FB] tracking-tight">
              Admin Settings
            </h1>
          </div>
          <p className="text-[#9BA8B5] text-xs md:text-sm max-w-xl">
            Manage your administrative session, security preferences, and protocol telemetry health.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information Card */}
          <div className="bg-[#1A2538]/70 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-[#7B8B9A]/20 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 border border-[#81D7B4]/25 flex items-center justify-center text-[#81D7B4]">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F9F9FB]">Active Administrator</h3>
                <p className="text-xs text-[#9BA8B5]">Session credentials and authenticated role</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15 space-y-1">
                <span className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-wider block">Username</span>
                <p className="font-bold text-[#F9F9FB] text-sm">{user?.username || 'admin'}</p>
              </div>

              <div className="p-4 bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15 space-y-1">
                <span className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-wider block">Role</span>
                <p className="font-bold text-[#81D7B4] text-sm capitalize">{user?.role || 'Super Admin'}</p>
              </div>
            </div>

            <p className="text-xs text-[#7B8B9A] italic">
              * Master credentials are governed through cryptographically signed server environment variables.
            </p>
          </div>

          {/* Session Management */}
          <div className="bg-[#1A2538]/70 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-[#7B8B9A]/20 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center text-red-400">
                <Shield01Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F9F9FB]">Session Security</h3>
                <p className="text-xs text-[#9BA8B5]">Revoke active authentication cookies and sign out</p>
              </div>
            </div>

            <p className="text-xs text-[#9BA8B5] leading-relaxed">
              Terminating your session clears your secure HTTP-only token and returns you to the login screen.
            </p>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold text-xs transition-all border border-red-500/20 cursor-pointer active:scale-95 shadow-sm"
            >
              <Logout01Icon className="w-4 h-4" />
              <span>Terminate Session & Sign Out</span>
            </button>
          </div>
        </div>

        {/* Sidebar Status Column */}
        <div className="space-y-6">
          <div className="bg-[#1A2538]/70 backdrop-blur-xl p-6 rounded-3xl border border-[#7B8B9A]/20 shadow-xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#81D7B4] flex items-center gap-2">
              <Activity01Icon className="w-4 h-4" />
              System Status
            </h3>

            <div className="p-4 bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#7B8B9A]">Admin Service:</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7B8B9A]">Registry Database:</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7B8B9A]">Protocol Version:</span>
                <span className="font-mono text-[#F9F9FB]">v2.4.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7B8B9A]">Environment:</span>
                <span className="font-mono text-[#81D7B4] capitalize">{process.env.NODE_ENV || 'production'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
