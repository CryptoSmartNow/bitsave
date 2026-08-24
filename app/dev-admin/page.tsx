'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Award01Icon,
  ArrowLeftRightIcon,
  Notification01Icon,
  Logout01Icon,
  Edit02Icon,
  Delete02Icon,
  LegalHammerIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  FlashIcon,
  PlusSignIcon,
  CheckmarkCircle01Icon,
  CheckmarkCircle02Icon,
  ViewIcon,
  ViewOffSlashIcon,
  Search01Icon,
  CustomerService01Icon,
  Shield01Icon,
  Activity01Icon,
  Certificate01Icon,
  UserGroupIcon,
  Mail01Icon,
  SparklesIcon,
  RefreshIcon,
  Cancel01Icon,
  Dollar01Icon,
  LinkSquare01Icon,
  InformationCircleIcon,
  Clock01Icon,
  Alert02Icon,
  Coins01Icon,
} from "hugeicons-react";
import { AuthProvider, useAuth } from '@/lib/adminAuth';
import toast, { Toaster } from 'react-hot-toast';

// ─── MAIN PAGE WRAPPER ───────────────────────────────────────────────
export default function DevAdminPage() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ style: { background: '#0E1726', color: '#F9F9FB', border: '1px solid #1C2A42' } }} />
      <WatchTowerContent />
    </AuthProvider>
  );
}

// ─── AUTH CONTENT & WATCH TOWER CONTROLLER ───────────────────────────
function WatchTowerContent() {
  const { user, loading, login, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab: 'overview' | 'transactions' | 'users' | 'certificates' | 'feedback' | 'updates' | 'leaderboard'
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'users' | 'certificates' | 'feedback' | 'updates' | 'leaderboard'>('overview');

  // Telemetry state
  const [telemetry, setTelemetry] = useState<any>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  const fetchTelemetry = useCallback(async () => {
    if (!user) return;
    setTelemetryLoading(true);
    try {
      const res = await fetch('/api/dev-admin/overview');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (e) {
      console.error('Failed to fetch telemetry:', e);
    } finally {
      setTelemetryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTelemetry();
      const interval = setInterval(fetchTelemetry, 30000); // 30s live refresh
      return () => clearInterval(interval);
    }
  }, [user, fetchTelemetry]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    try {
      const success = await login(password);
      if (!success) {
        setError('Invalid admin credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070A0F]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81D7B4]"></div>
          <span className="text-xs font-mono text-[#7B8B9A] uppercase tracking-widest">Initializing Watch Tower...</span>
        </div>
      </div>
    );
  }

  // ─── LOGIN SCREEN (DARK AESTHETIC & EYE TOGGLE) ─────────────────────
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070A0F] px-4 font-sans relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#81D7B4]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-md w-full bg-[#0A1019] border border-[#1C2538] rounded-3xl p-8 shadow-2xl relative z-10">
          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 bg-[#81D7B4]/15 border border-[#81D7B4]/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#81D7B4]/10">
              <Shield01Icon className="w-8 h-8 text-[#81D7B4]" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#81D7B4]/10 rounded-full border border-[#81D7B4]/20">
              <span className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></span>
              <span className="text-[10px] font-bold text-[#81D7B4] uppercase tracking-widest">Super Watch Tower</span>
            </div>
            <h1 className="text-2xl font-black text-[#F9F9FB] tracking-tight">Dev Admin Access</h1>
            <p className="text-[#7B8B9A] text-xs">High-clearance observability and emergency tools.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#7B8B9A] mb-2">
                Admin Master Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-12 rounded-xl bg-[#070A0F] border border-[#1C2538] focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 transition-all outline-none text-[#F9F9FB] text-sm font-mono placeholder:text-[#3B4C68]"
                  placeholder="••••••••••••"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7B8B9A] hover:text-[#81D7B4] p-1 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <ViewOffSlashIcon className="w-5 h-5" />
                  ) : (
                    <ViewIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2">
                <Alert02Icon className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || !password}
              className="w-full py-3.5 bg-[#81D7B4] hover:bg-[#6BC4A0] disabled:opacity-50 text-[#070A0F] font-black text-sm rounded-xl transition-all shadow-lg hover:shadow-[#81D7B4]/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoggingIn ? 'Authenticating...' : 'Enter Watch Tower'}
              <FlashIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── LOGGED IN DASHBOARD ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#070A0F] text-[#F9F9FB] flex font-sans">
      
      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-[#0A1019] border-r border-[#1C2538] fixed h-full z-20 flex flex-col justify-between">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#1C2538] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#81D7B4]/15 border border-[#81D7B4]/30 rounded-xl flex items-center justify-center">
                <Shield01Icon className="w-5 h-5 text-[#81D7B4]" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-[#F9F9FB]">Watch Tower</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4] animate-pulse"></span>
                  <span className="text-[10px] font-mono text-[#81D7B4]">LIVE SYS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <SidebarBtn
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon={<Activity01Icon className="w-5 h-5" />}
              label="Live Overview"
            />
            <SidebarBtn
              active={activeTab === 'transactions'}
              onClick={() => setActiveTab('transactions')}
              icon={<ArrowLeftRightIcon className="w-5 h-5" />}
              label="Transactions & Fixes"
              badge={telemetry?.metrics?.pendingBizswapTxs > 0 ? telemetry.metrics.pendingBizswapTxs : undefined}
              badgeColor="amber"
            />
            <SidebarBtn
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
              icon={<UserGroupIcon className="w-5 h-5" />}
              label="Users & Wallets"
            />
            <SidebarBtn
              active={activeTab === 'certificates'}
              onClick={() => setActiveTab('certificates')}
              icon={<Certificate01Icon className="w-5 h-5" />}
              label="RWA Certificates"
            />
            <SidebarBtn
              active={activeTab === 'feedback'}
              onClick={() => setActiveTab('feedback')}
              icon={<CustomerService01Icon className="w-5 h-5" />}
              label="User Feedback"
              badge={telemetry?.metrics?.pendingFeedbackCount > 0 ? telemetry.metrics.pendingFeedbackCount : undefined}
              badgeColor="mint"
            />
            <SidebarBtn
              active={activeTab === 'updates'}
              onClick={() => setActiveTab('updates')}
              icon={<Notification01Icon className="w-5 h-5" />}
              label="Announcements"
            />
            <SidebarBtn
              active={activeTab === 'leaderboard'}
              onClick={() => setActiveTab('leaderboard')}
              icon={<Award01Icon className="w-5 h-5" />}
              label="Leaderboard"
            />
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#1C2538] space-y-2">
          <button
            onClick={fetchTelemetry}
            disabled={telemetryLoading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#121A27] hover:bg-[#1C2538] text-[#7B8B9A] hover:text-[#F9F9FB] rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshIcon className={`w-4 h-4 ${telemetryLoading ? 'animate-spin text-[#81D7B4]' : ''}`} />
            <span>{telemetryLoading ? 'Syncing...' : 'Sync Telemetry'}</span>
          </button>
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Logout01Icon className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
        
        {/* Top Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1C2538] mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#F9F9FB] tracking-tight">
              {activeTab === 'overview' && 'System Overview & Watch Tower'}
              {activeTab === 'transactions' && 'Transaction Command Center'}
              {activeTab === 'users' && 'Users, DIDs & Wallets'}
              {activeTab === 'certificates' && 'Issued Yield Certificates'}
              {activeTab === 'feedback' && 'User Feedback & Support Inbox'}
              {activeTab === 'updates' && 'Platform Updates & Broadcasts'}
              {activeTab === 'leaderboard' && 'Leaderboard Management'}
            </h1>
            <p className="text-xs text-[#7B8B9A] mt-1 font-medium">
              Real-time monitoring and 1-click administrative resolution without database terminal login.
            </p>
          </div>

          {/* Telemetry Status Pills */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0A1019] border border-[#1C2538] rounded-xl text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#81D7B4]"></span>
              <span className="text-[#7B8B9A]">Mongo:</span>
              <span className="text-[#81D7B4] font-bold">{telemetry?.telemetry?.mongo?.latencyMs ?? 0}ms</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0A1019] border border-[#1C2538] rounded-xl text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${telemetry?.telemetry?.redis?.status === 'connected' ? 'bg-[#81D7B4]' : 'bg-amber-400'}`}></span>
              <span className="text-[#7B8B9A]">Redis:</span>
              <span className="text-[#F9F9FB] font-bold capitalize">{telemetry?.telemetry?.redis?.status || 'Active'}</span>
            </div>

            {/* Cron Status Pill & Manual Trigger */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0A1019] border border-[#1C2538] rounded-xl text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${telemetry?.telemetry?.cron?.status === 'active' ? 'bg-[#81D7B4] animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-[#7B8B9A]">Cron:</span>
              <span className="text-[#81D7B4] font-bold">
                {telemetry?.telemetry?.cron?.minutesSinceLastRun !== null && telemetry?.telemetry?.cron?.minutesSinceLastRun !== undefined
                  ? `${telemetry.telemetry.cron.minutesSinceLastRun}m ago`
                  : 'Ready'}
              </span>
            </div>
          </div>
        </header>

        {/* ── TAB CONTENTS ── */}
        {activeTab === 'overview' && <OverviewTab telemetry={telemetry} setActiveTab={setActiveTab} onRefreshTelemetry={fetchTelemetry} />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'certificates' && <CertificatesTab />}
        {activeTab === 'feedback' && <FeedbackTab />}
        {activeTab === 'updates' && <UpdatesTab />}
        {activeTab === 'leaderboard' && <LeaderboardTab />}

      </main>
    </div>
  );
}

// ─── 1. OVERVIEW TAB (MULTI-APP WATCH TOWER) ─────────────────────────
function OverviewTab({ telemetry, setActiveTab, onRefreshTelemetry }: { telemetry: any; setActiveTab: (t: any) => void; onRefreshTelemetry: () => void }) {
  const m = telemetry?.metrics || {};
  const c = telemetry?.telemetry?.cron || {};
  const [triggeringCron, setTriggeringCron] = useState(false);

  const handleTriggerCron = async () => {
    setTriggeringCron(true);
    try {
      const res = await fetch('/api/dev-admin/overview', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Cron reconciliation completed!');
        onRefreshTelemetry();
      } else {
        toast.error(data.error || 'Failed to execute cron');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error triggering cron');
    } finally {
      setTriggeringCron(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* ── MULTI-APP ECOSYSTEM TOP COUNTERS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Global Accounts"
          value={m.totalUsers?.toLocaleString() || '0'}
          sub="Combined across SaveFi & BizSwap"
          icon={<UserGroupIcon className="w-5 h-5 text-[#81D7B4]" />}
          onClick={() => setActiveTab('users')}
        />
        <MetricCard
          title="BizSwap 24h Volume"
          value={`$${(m.bizswap?.volumeToday || 0).toLocaleString()}`}
          sub={`${m.bizswap?.completedTodayCount || 0} completed & minted`}
          icon={<Dollar01Icon className="w-5 h-5 text-[#3B82F6]" />}
          onClick={() => setActiveTab('transactions')}
        />
        <MetricCard
          title="SaveFi Active Savings"
          value={m.savefi?.activeSavingsCount?.toLocaleString() || '0'}
          sub={`${m.savefi?.childVaultsCount || 0} Child Vaults Protected`}
          icon={<Coins01Icon className="w-5 h-5 text-[#81D7B4]" />}
          onClick={() => setActiveTab('users')}
        />
        <MetricCard
          title="Unresolved Support"
          value={m.pendingFeedbackCount || '0'}
          sub="Feedback awaiting email reply"
          icon={<CustomerService01Icon className="w-5 h-5 text-amber-400" />}
          highlight={m.pendingFeedbackCount > 0}
          onClick={() => setActiveTab('feedback')}
        />
      </div>

      {/* ── CRON RECONCILER LIVE ENGINE STATUS ── */}
      <div className="bg-[#0A1019] border border-[#1C2538] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${c.status === 'active' ? 'bg-[#81D7B4] animate-pulse' : 'bg-amber-400'}`}></span>
              <h3 className="text-sm font-black text-[#F9F9FB] uppercase tracking-wider">
                Automated 24-Hour Reconciler & Expire Engine
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#81D7B4]/10 text-[#81D7B4] border border-[#81D7B4]/20">
                /api/cron/reconcile-pending
              </span>
            </div>
            <p className="text-xs text-[#7B8B9A]">
              Driven via scheduled heartbeat from cron-jobs.org. Evaluates pending Onswitch checkouts, mints confirmed certificates, and forcibly expires unfulfilled orders after 24 hours.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono text-[#F9F9FB]">
                Last Run: <strong className="text-[#81D7B4]">{c.minutesSinceLastRun !== null && c.minutesSinceLastRun !== undefined ? `${c.minutesSinceLastRun}m ago` : 'Active'}</strong>
              </div>
              <div className="text-[10px] text-[#4B5A75] font-mono">
                Evaluated: {c.lastEvaluatedCount || 0} | Expired: {c.lastExpiredCount || 0}
              </div>
            </div>

            <button
              onClick={handleTriggerCron}
              disabled={triggeringCron}
              className="px-4 py-2.5 bg-[#81D7B4] hover:bg-[#6BC4A0] disabled:opacity-50 text-[#070A0F] font-black text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <FlashIcon className={`w-4 h-4 ${triggeringCron ? 'animate-spin' : ''}`} />
              <span>{triggeringCron ? 'Executing Cron...' : 'Run Reconciler Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── THREE COLUMN ECOSYSTEM BREAKDOWN: BIZSWAP, SAVEFI, BIZFI ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* BizSwap Watch */}
        <div className="bg-[#0A1019] border border-[#1C2538] rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#1C2538] pb-3">
            <div className="flex items-center gap-2">
              <Certificate01Icon className="w-4 h-4 text-[#81D7B4]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#F9F9FB]">BizSwap RWA</h4>
            </div>
            <button onClick={() => setActiveTab('certificates')} className="text-[10px] text-[#81D7B4] font-bold hover:underline">
              View →
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[#8DA2B5]">
              <span>Issued Certificates</span>
              <strong className="text-[#F9F9FB]">{m.bizswap?.totalCertificates || 0}</strong>
            </div>
            <div className="flex justify-between text-[#8DA2B5]">
              <span>Pending Orders</span>
              <strong className={m.bizswap?.pendingTxs > 0 ? 'text-amber-400 font-bold' : 'text-[#F9F9FB]'}>
                {m.bizswap?.pendingTxs || 0}
              </strong>
            </div>
            <div className="flex justify-between text-[#8DA2B5]">
              <span>Stale (&gt;24h)</span>
              <strong className={m.bizswap?.stalePendingTxs > 0 ? 'text-red-400 font-bold' : 'text-[#81D7B4]'}>
                {m.bizswap?.stalePendingTxs || 0}
              </strong>
            </div>
          </div>
        </div>

        {/* SaveFi Watch */}
        <div className="bg-[#0A1019] border border-[#1C2538] rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#1C2538] pb-3">
            <div className="flex items-center gap-2">
              <Coins01Icon className="w-4 h-4 text-[#3B82F6]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#F9F9FB]">SaveFi Protocol</h4>
            </div>
            <span className="text-[10px] font-mono text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded">
              Base / EVM
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[#8DA2B5]">
              <span>Savings Vaults</span>
              <strong className="text-[#F9F9FB]">{m.savefi?.activeSavingsCount || 0}</strong>
            </div>
            <div className="flex justify-between text-[#8DA2B5]">
              <span>Child Vaults</span>
              <strong className="text-[#F9F9FB]">{m.savefi?.childVaultsCount || 0}</strong>
            </div>
            <div className="flex justify-between text-[#8DA2B5]">
              <span>Smart Contract Protection</span>
              <strong className="text-[#81D7B4]">Active</strong>
            </div>
          </div>
        </div>

        {/* BizFi & BizFun Watch */}
        <div className="bg-[#0A1019] border border-[#1C2538] rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#1C2538] pb-3">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-[#F5A623]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#F9F9FB]">BizFi & BizFun</h4>
            </div>
            <span className="text-[10px] font-mono text-[#F5A623] bg-[#F5A623]/10 px-2 py-0.5 rounded">
              Multi-Chain
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[#8DA2B5]">
              <span>Business Deals / Campaigns</span>
              <strong className="text-[#F9F9FB]">{m.bizfi?.activeCampaignsCount || 0}</strong>
            </div>
            <div className="flex justify-between text-[#8DA2B5]">
              <span>Revenue Routing</span>
              <strong className="text-[#81D7B4]">Operational</strong>
            </div>
            <div className="flex justify-between text-[#8DA2B5]">
              <span>Onswitch Gateway</span>
              <strong className="text-[#81D7B4]">Connected</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Two Column Section: Pending Alert & Recent Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Pending & Stale Action Center */}
        <div className="bg-[#0A1019] border border-[#1C2538] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FlashIcon className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-[#F9F9FB] uppercase tracking-wider">Pending Action Center</h3>
              </div>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs text-[#81D7B4] hover:underline font-bold"
              >
                View all →
              </button>
            </div>
            <p className="text-xs text-[#7B8B9A] mb-4">
              Transactions in pending/processing status. The 24h cron automatically expires stale ones, or you can force-mint / resolve here.
            </p>

            <div className="space-y-2">
              {telemetry?.recentAlerts?.recentTxs?.map((tx: any) => (
                <div key={tx._id} className="p-3 bg-[#070A0F] border border-[#1C2538] rounded-xl flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${tx.status === 'completed' ? 'bg-[#81D7B4]' : tx.status === 'expired' ? 'bg-gray-500' : 'bg-amber-400 animate-pulse'}`}></span>
                    <span className="text-[#F9F9FB] font-bold truncate max-w-[140px]">{tx.reference}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#81D7B4] font-bold">${tx.usdcAmount || 0} {tx.currency || 'USDC'}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tx.status === 'completed' ? 'bg-[#81D7B4]/10 text-[#81D7B4]' : 'bg-amber-400/10 text-amber-400'}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recent Unresolved Feedback */}
        <div className="bg-[#0A1019] border border-[#1C2538] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CustomerService01Icon className="w-5 h-5 text-[#81D7B4]" />
                <h3 className="text-sm font-black text-[#F9F9FB] uppercase tracking-wider">Recent User Submissions</h3>
              </div>
              <button
                onClick={() => setActiveTab('feedback')}
                className="text-xs text-[#81D7B4] hover:underline font-bold"
              >
                Inbox ({m.pendingFeedbackCount || 0}) →
              </button>
            </div>
            
            {telemetry?.recentAlerts?.unresolvedFeedback?.length > 0 ? (
              <div className="space-y-2.5">
                {telemetry.recentAlerts.unresolvedFeedback.map((f: any) => (
                  <div key={f._id} className="p-3 bg-[#070A0F] border border-[#1C2538] rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F9F9FB] truncate max-w-[200px]">{f.subject}</span>
                      <span className="text-[10px] font-bold uppercase text-[#81D7B4] bg-[#81D7B4]/10 px-2 py-0.5 rounded">
                        {f.category}
                      </span>
                    </div>
                    <p className="text-[#7B8B9A] text-[11px] line-clamp-1">{f.message}</p>
                    <div className="flex items-center justify-between text-[10px] text-[#4B5A75] pt-1">
                      <span>{f.email || f.walletAddress?.slice(0, 10) || 'Anonymous'}</span>
                      <span className="uppercase text-[#60A5FA]">{f.appContext || 'savefi'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#070A0F] border border-[#1C2538] rounded-xl text-xs text-[#7B8B9A]">
                No pending feedback items. All user queries resolved.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── 2. TRANSACTIONS TAB (COMMAND CENTER) ────────────────────────────
function TransactionsTab() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<any>(null);

  // Selected Transaction for Actions / JSON Inspection
  const [activeTx, setActiveTx] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        search,
        page: page.toString(),
        limit: '25',
      });
      const res = await fetch(`/api/dev-admin/bizswap-transactions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setTotalPages(data.totalPages || 1);
        setStats(data.stats);
      }
    } catch (e) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // 1-Click Action: Force Mint Certificate
  const handleForceMint = async (tx: any) => {
    if (!confirm(`Force mint certificate for ref: ${tx.reference}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/dev-admin/mint-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: tx._id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Certificate minted successfully!');
        fetchTransactions();
      } else {
        toast.error(data.error || 'Minting failed');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error executing mint');
    } finally {
      setActionLoading(false);
    }
  };

  // 1-Click Action: Update Status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/dev-admin/bizswap-transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Transaction status updated to ${newStatus}`);
        setActiveTx(null);
        fetchTransactions();
      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to update');
    } finally {
      setActionLoading(false);
    }
  };

  // 1-Click Action: Delete / Purge
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this transaction record?')) return;
    try {
      const res = await fetch(`/api/dev-admin/bizswap-transactions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Transaction purged');
        fetchTransactions();
      }
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search01Icon className="w-4 h-4 text-[#7B8B9A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by Reference, Hash, Wallet, Email..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0A1019] border border-[#1C2538] focus:border-[#81D7B4] rounded-xl text-xs text-[#F9F9FB] outline-none transition-colors"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'pending', 'completed', 'failed', 'expired'].map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#81D7B4] text-[#070A0F]'
                  : 'bg-[#0A1019] text-[#7B8B9A] hover:bg-[#121A27] hover:text-[#F9F9FB] border border-[#1C2538]'
              }`}
            >
              {st} {stats && stats[st] !== undefined && `(${stats[st]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#0A1019] border border-[#1C2538] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#070A0F] border-b border-[#1C2538] text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A]">
                <th className="py-3.5 px-4">Reference & Time</th>
                <th className="py-3.5 px-4">Instrument / Asset</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">User / Wallet</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2538]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#7B8B9A]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#81D7B4] mx-auto mb-2"></div>
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#7B8B9A]">
                    No transactions match your search.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-[#0E1726] transition-colors">
                    
                    {/* Ref */}
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-[#F9F9FB] truncate max-w-[160px]">{tx.reference || 'N/A'}</div>
                      <div className="text-[10px] text-[#4B5A75]">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'N/A'}
                      </div>
                    </td>

                    {/* Instrument */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#F9F9FB]">{tx.metadata?.instrument || 'BizSwap Share'}</span>
                      <div className="text-[10px] text-[#7B8B9A] uppercase">{tx.paymentMethod || 'Onswitch'}</div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className="text-[#81D7B4]">${tx.usdcAmount || tx.metadata?.investmentAmount || 0}</span>
                      <span className="text-[#4B5A75] text-[10px] ml-1">USDC</span>
                      {tx.fiatAmount && (
                        <div className="text-[10px] text-[#7B8B9A]">₦{Number(tx.fiatAmount).toLocaleString()}</div>
                      )}
                    </td>

                    {/* User */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="text-[#94A3B8] truncate max-w-[130px]">{tx.metadata?.wallet || tx.userId || 'N/A'}</div>
                      <div className="text-[10px] text-[#4B5A75] truncate max-w-[130px]">{tx.metadata?.email || ''}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        tx.status === 'completed'
                          ? 'bg-[#81D7B4]/15 text-[#81D7B4] border border-[#81D7B4]/30'
                          : tx.status === 'expired'
                          ? 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
                          : tx.status === 'failed' || tx.status === 'failed_fulfillment'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'bg-amber-400/15 text-amber-400 border border-amber-400/30 animate-pulse'
                      }`}>
                        {tx.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Force Mint Button if pending/failed */}
                        {tx.status !== 'completed' && (
                          <button
                            onClick={() => handleForceMint(tx)}
                            disabled={actionLoading}
                            title="Force Mint Certificate & Complete"
                            className="p-1.5 bg-[#81D7B4]/10 hover:bg-[#81D7B4] text-[#81D7B4] hover:text-[#070A0F] rounded-lg transition-colors cursor-pointer"
                          >
                            <FlashIcon className="w-4 h-4" />
                          </button>
                        )}

                        {/* Inspect Raw / Edit */}
                        <button
                          onClick={() => { setActiveTx(tx); setEditStatus(tx.status); }}
                          title="Inspect JSON & Edit Status"
                          className="p-1.5 bg-[#1C2538] hover:bg-[#2C3E5D] text-[#F9F9FB] rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit02Icon className="w-4 h-4" />
                        </button>

                        {/* Purge Delete */}
                        <button
                          onClick={() => handleDelete(tx._id)}
                          title="Purge record"
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Delete02Icon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#1C2538] flex items-center justify-between text-xs text-[#7B8B9A]">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-[#121A27] rounded-lg disabled:opacity-30 hover:bg-[#1C2538] text-[#F9F9FB] cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 bg-[#121A27] rounded-lg disabled:opacity-30 hover:bg-[#1C2538] text-[#F9F9FB] cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── TRANSACTION INSPECTION & EDIT MODAL ── */}
      {activeTx && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1019] border border-[#1C2538] rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1C2538] pb-4">
              <div>
                <h3 className="text-base font-black text-[#F9F9FB]">Inspect Transaction</h3>
                <p className="text-xs font-mono text-[#81D7B4]">{activeTx.reference}</p>
              </div>
              <button onClick={() => setActiveTx(null)} className="text-[#7B8B9A] hover:text-white">
                <Cancel01Icon className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Status Modifier */}
            <div className="bg-[#070A0F] p-4 rounded-xl border border-[#1C2538] space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A]">Change Transaction Status</label>
              <div className="flex flex-wrap gap-2">
                {['pending', 'completed', 'failed', 'expired', 'failed_fulfillment'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleUpdateStatus(activeTx._id, s)}
                    disabled={actionLoading}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer ${
                      activeTx.status === s ? 'bg-[#81D7B4] text-[#070A0F]' : 'bg-[#121A27] text-[#94A3B8] hover:bg-[#1C2538]'
                    }`}
                  >
                    Set to {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Raw JSON viewer */}
            <div className="flex-1 overflow-y-auto bg-[#070A0F] border border-[#1C2538] p-4 rounded-xl font-mono text-[11px] text-[#A5B4FC] select-all">
              <pre>{JSON.stringify(activeTx.raw || activeTx, null, 2)}</pre>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveTx(null)}
                className="px-5 py-2.5 bg-[#121A27] hover:bg-[#1C2538] text-white text-xs font-bold rounded-xl"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── 3. USERS & WALLETS TAB (PRIVY / DB INSPECTOR) ───────────────────
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit user modal
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [pendingUsdcInput, setPendingUsdcInput] = useState('0');
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, page: page.toString(), limit: '25' });
      const res = await fetch(`/api/dev-admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/dev-admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser._id,
          walletAddress: selectedUser.walletAddress,
          referralCode: referralCodeInput,
          pendingUsdc: parseFloat(pendingUsdcInput) || 0,
        }),
      });
      if (res.ok) {
        toast.success('User updated successfully');
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error('Failed to update user');
      }
    } catch (e) {
      toast.error('Error saving user');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search01Icon className="w-4 h-4 text-[#7B8B9A] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by Wallet, Privy DID, Email, Referral Code..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#0A1019] border border-[#1C2538] focus:border-[#81D7B4] rounded-xl text-xs text-[#F9F9FB] outline-none"
        />
      </div>

      {/* Users Table */}
      <div className="bg-[#0A1019] border border-[#1C2538] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#070A0F] border-b border-[#1C2538] text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A]">
                <th className="py-3.5 px-4">Wallet / Identity</th>
                <th className="py-3.5 px-4">Referral Code</th>
                <th className="py-3.5 px-4">Pending Referral Earnings</th>
                <th className="py-3.5 px-4">Certificates</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2538]/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#7B8B9A]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#81D7B4] mx-auto mb-2"></div>
                    Loading user records...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#7B8B9A]">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#0E1726] transition-colors">
                    
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-[#F9F9FB] truncate max-w-[200px]">{u.walletAddress}</div>
                      <div className="text-[10px] text-[#4B5A75] truncate max-w-[200px]">{u.userId || u.email || ''}</div>
                    </td>

                    <td className="py-3 px-4">
                      {u.referralCode ? (
                        <span className="font-mono font-bold text-[#81D7B4] bg-[#81D7B4]/10 border border-[#81D7B4]/20 px-2.5 py-1 rounded-lg">
                          {u.referralCode}
                        </span>
                      ) : (
                        <span className="text-[#4B5A75] italic">None</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-[#F9F9FB]">${(u.pendingUsdcEarnings || 0).toFixed(2)}</span>
                      <span className="text-[10px] text-[#4B5A75] ml-1">USDC</span>
                      <div className="text-[10px] text-[#4B5A75]">Lifetime: ${(u.totalUsdcEarned || 0).toFixed(2)}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/20">
                        {u.certificateCount || 0} Minted
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setReferralCodeInput(u.referralCode || '');
                          setPendingUsdcInput((u.pendingUsdcEarnings || 0).toString());
                        }}
                        className="px-3 py-1.5 bg-[#1C2538] hover:bg-[#2C3E5D] text-[#81D7B4] font-bold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Edit User
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#1C2538] flex items-center justify-between text-xs text-[#7B8B9A]">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-[#121A27] rounded-lg disabled:opacity-30 hover:bg-[#1C2538] text-[#F9F9FB]"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 bg-[#121A27] rounded-lg disabled:opacity-30 hover:bg-[#1C2538] text-[#F9F9FB]"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── EDIT USER MODAL ── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1019] border border-[#1C2538] rounded-3xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1C2538] pb-4">
              <div>
                <h3 className="text-base font-black text-[#F9F9FB]">Modify User Account</h3>
                <p className="text-xs font-mono text-[#7B8B9A] truncate max-w-[300px]">{selectedUser.walletAddress}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-[#7B8B9A] hover:text-white">
                <Cancel01Icon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A] mb-1.5">Referral Code</label>
                <input
                  type="text"
                  value={referralCodeInput}
                  onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. BIZ12345"
                  className="w-full px-3.5 py-2.5 bg-[#070A0F] border border-[#1C2538] focus:border-[#81D7B4] rounded-xl text-xs font-mono text-[#81D7B4] font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A] mb-1.5">Pending Referral Balance (USDC)</label>
                <input
                  type="number"
                  step="0.01"
                  value={pendingUsdcInput}
                  onChange={(e) => setPendingUsdcInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#070A0F] border border-[#1C2538] focus:border-[#81D7B4] rounded-xl text-xs font-mono text-[#F9F9FB] font-bold outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#1C2538]">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2.5 bg-[#121A27] text-white text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#81D7B4] text-[#070A0F] text-xs font-black rounded-xl hover:bg-[#6BC4A0] cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── 4. CERTIFICATES TAB ─────────────────────────────────────────────
function CertificatesTab() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [instrumentFilter, setInstrumentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, instrument: instrumentFilter, page: page.toString(), limit: '25' });
      const res = await fetch(`/api/dev-admin/certificates?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCertificates(data.certificates || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (e) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, [search, instrumentFilter, page]);

  useEffect(() => {
    fetchCerts();
  }, [fetchCerts]);

  return (
    <div className="space-y-6">
      
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search01Icon className="w-4 h-4 text-[#7B8B9A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by Wallet, Serial #, Certificate ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0A1019] border border-[#1C2538] focus:border-[#81D7B4] rounded-xl text-xs text-[#F9F9FB] outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['all', 'BizYield', 'BizCredit', 'BizBond'].map((inst) => (
            <button
              key={inst}
              onClick={() => { setInstrumentFilter(inst); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                instrumentFilter === inst
                  ? 'bg-[#81D7B4] text-[#070A0F]'
                  : 'bg-[#0A1019] text-[#7B8B9A] hover:bg-[#121A27] hover:text-[#F9F9FB] border border-[#1C2538]'
              }`}
            >
              {inst}
            </button>
          ))}
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-[#0A1019] border border-[#1C2538] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#070A0F] border-b border-[#1C2538] text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A]">
                <th className="py-3.5 px-4">Serial & Instrument</th>
                <th className="py-3.5 px-4">Owner Wallet</th>
                <th className="py-3.5 px-4">Principal & Entitlement</th>
                <th className="py-3.5 px-4">Network & Status</th>
                <th className="py-3.5 px-4 text-right">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2538]/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#7B8B9A]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#81D7B4] mx-auto mb-2"></div>
                    Loading certificates...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#7B8B9A]">
                    No certificates found.
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert._id} className="hover:bg-[#0E1726] transition-colors">
                    
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-[#81D7B4]">#{cert.serialNumber || 'N/A'}</div>
                      <div className="text-[11px] text-[#F9F9FB] font-sans font-bold">{cert.instrument}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="text-[#94A3B8] truncate max-w-[180px]">{cert.wallet}</div>
                      <div className="text-[10px] text-[#4B5A75]">{cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : ''}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#F9F9FB]">${cert.investmentAmount || 0} USDC</div>
                      <div className="text-[10px] text-[#81D7B4] font-bold">{cert.entitlement || cert.apr}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#0052FF]/10 text-[#60A5FA] border border-[#0052FF]/20">
                        {cert.networkName || cert.chain || 'Base'}
                      </span>
                      <div className="text-[10px] text-[#7B8B9A] mt-0.5">{cert.status}</div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {cert.explorerUrl ? (
                        <a
                          href={cert.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3B82F6] hover:underline"
                        >
                          <span>Scan</span>
                          <LinkSquare01Icon className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-[#4B5A75] text-[10px]">No link</span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#1C2538] flex items-center justify-between text-xs text-[#7B8B9A]">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-[#121A27] rounded-lg disabled:opacity-30 hover:bg-[#1C2538] text-[#F9F9FB]"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 bg-[#121A27] rounded-lg disabled:opacity-30 hover:bg-[#1C2538] text-[#F9F9FB]"
            >
              Next
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── 5. FEEDBACK & DIRECT EMAIL REPLY INBOX ──────────────────────────
function FeedbackTab() {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [appFilter, setAppFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<any>(null);

  // Selected item for Reply Modal
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [newStatus, setNewStatus] = useState('resolved');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        category: categoryFilter,
        search,
        page: page.toString(),
        limit: '25',
      });
      const res = await fetch(`/api/feedback?${params}`);
      if (res.ok) {
        const data = await res.json();
        let list = data.feedback || [];
        if (appFilter !== 'all') {
          list = list.filter((item: any) => (item.appContext || 'savefi').toLowerCase().includes(appFilter.toLowerCase()));
        }
        setFeedbackList(list);
        setTotalPages(data.pagination?.totalPages || 1);
        setStats(data.stats);
      }
    } catch (e) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, appFilter, search, page]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleSendReply = async () => {
    if (!selectedFeedback || !replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setIsSendingReply(true);
    try {
      const res = await fetch('/api/dev-admin/feedback/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId: selectedFeedback._id,
          replyMessage,
          newStatus,
          recipientEmail: selectedFeedback.email,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Reply sent to email & logged to user dashboard!');
        setSelectedFeedback(null);
        setReplyMessage('');
        fetchFeedback();
      } else {
        toast.error(data.error || 'Failed to send reply');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error processing reply');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleQuickStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        toast.success(`Marked as ${status}`);
        fetchFeedback();
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search01Icon className="w-4 h-4 text-[#7B8B9A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search feedback subjects, messages, emails, wallets..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0A1019] border border-[#1C2538] focus:border-[#81D7B4] rounded-xl text-xs text-[#F9F9FB] outline-none"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* App Selector */}
          <div className="flex items-center gap-1 bg-[#070A0F] p-1 rounded-xl border border-[#1C2538]">
            {[
              { key: 'all', label: 'All Apps' },
              { key: 'savefi', label: 'SaveFi' },
              { key: 'bizswap', label: 'BizSwap' },
              { key: 'bizfun', label: 'BizFun' }
            ].map((app) => (
              <button
                key={app.key}
                onClick={() => { setAppFilter(app.key); setPage(1); }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                  appFilter === app.key ? 'bg-[#1C2538] text-[#81D7B4]' : 'text-[#7B8B9A] hover:text-[#F9F9FB]'
                }`}
              >
                {app.label}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5">
            {['all', 'pending', 'reviewed', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => { setStatusFilter(st); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#81D7B4] text-[#070A0F]'
                    : 'bg-[#0A1019] text-[#7B8B9A] hover:bg-[#121A27] hover:text-[#F9F9FB] border border-[#1C2538]'
                }`}
              >
                {st} {stats && stats[st] !== undefined && `(${stats[st]})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2-in-1 Notification Banner */}
      <div className="px-4 py-2.5 bg-[#81D7B4]/10 border border-[#81D7B4]/20 rounded-xl flex items-center justify-between text-xs text-[#81D7B4]">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-[#81D7B4]" />
          <span className="font-bold">2-in-1 Support Active:</span>
          <span className="text-[#F9F9FB]">Replying sends an email via platform SMTP & automatically updates the user's dashboard feed.</span>
        </div>
      </div>

      {/* Feedback Feed Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center bg-[#0A1019] border border-[#1C2538] rounded-2xl text-[#7B8B9A]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#81D7B4] mx-auto mb-2"></div>
            Loading feedback feed...
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="p-12 text-center bg-[#0A1019] border border-[#1C2538] rounded-2xl text-[#7B8B9A]">
            No feedback found matching the filters.
          </div>
        ) : (
          feedbackList.map((item) => (
            <div key={item._id} className="bg-[#0A1019] border border-[#1C2538] hover:border-[#2C3E5D] rounded-2xl p-5 shadow-xl transition-all space-y-3">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#81D7B4]/10 text-[#81D7B4] border border-[#81D7B4]/20">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-mono text-[#60A5FA] bg-[#3B82F6]/10 px-2 py-0.5 rounded">
                      {item.appContext || 'savefi'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      item.status === 'resolved' ? 'bg-[#81D7B4]/20 text-[#81D7B4]' : item.status === 'reviewed' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-400/20 text-amber-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-[#F9F9FB]">{item.subject}</h4>
                </div>

                <div className="text-[10px] text-[#4B5A75] font-mono shrink-0">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                </div>
              </div>

              {/* Message */}
              <p className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-wrap bg-[#070A0F] p-3.5 rounded-xl border border-[#1C2538]/60">
                {item.message}
              </p>

              {/* User Screenshots if attached */}
              {item.images && item.images.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  {item.images.map((img: string, i: number) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer" className="block w-16 h-16 rounded-lg border border-[#1C2538] overflow-hidden hover:scale-105 transition-transform">
                      <img src={img} alt="User Screenshot" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}

              {/* Replies Thread */}
              {item.replies && item.replies.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#81D7B4]">Developer Replies ({item.replies.length})</span>
                  {item.replies.map((rep: any, idx: number) => (
                    <div key={idx} className="p-3 bg-[#121A27] border-l-2 border-[#81D7B4] rounded-r-xl text-xs space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-[#7B8B9A]">
                        <span>{rep.sentBy || 'Dev Admin'} {rep.sentToEmail ? `→ ${rep.sentToEmail}` : ''}</span>
                        <span>{rep.createdAt ? new Date(rep.createdAt).toLocaleString() : ''}</span>
                      </div>
                      <p className="text-[#F9F9FB] whitespace-pre-wrap">{rep.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* User Metadata & Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#1C2538]/80 text-[11px] text-[#7B8B9A]">
                <div className="flex items-center gap-3 flex-wrap">
                  {item.email && (
                    <span className="flex items-center gap-1 text-[#81D7B4]">
                      <Mail01Icon className="w-3.5 h-3.5" />
                      {item.email}
                    </span>
                  )}
                  {item.walletAddress && (
                    <span className="font-mono text-[#64748B]">
                      {item.walletAddress.slice(0, 10)}...{item.walletAddress.slice(-6)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => handleQuickStatus(item._id, 'resolved')}
                      className="px-3 py-1.5 bg-[#81D7B4]/10 hover:bg-[#81D7B4]/20 text-[#81D7B4] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      ✓ Mark Resolved
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedFeedback(item);
                      setReplyMessage('');
                      setNewStatus('resolved');
                    }}
                    className="px-4 py-1.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#070A0F] font-black rounded-lg transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Mail01Icon className="w-3.5 h-3.5" />
                    <span>Reply & Resolve</span>
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* ── COMPOSE EMAIL REPLY MODAL ── */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1019] border border-[#1C2538] rounded-3xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1C2538] pb-4">
              <div>
                <h3 className="text-base font-black text-[#F9F9FB]">Direct Reply to User</h3>
                <p className="text-xs text-[#81D7B4]">
                  {selectedFeedback.email ? `Sending email to: ${selectedFeedback.email}` : 'Logging reply to feedback thread'}
                </p>
              </div>
              <button onClick={() => setSelectedFeedback(null)} className="text-[#7B8B9A] hover:text-white">
                <Cancel01Icon className="w-6 h-6" />
              </button>
            </div>

            {/* Original query quote */}
            <div className="p-3 bg-[#070A0F] border border-[#1C2538] rounded-xl text-xs space-y-1 text-[#94A3B8]">
              <span className="font-bold text-[#F9F9FB]">Regarding: "{selectedFeedback.subject}"</span>
              <p className="text-[11px] line-clamp-2 italic">"{selectedFeedback.message}"</p>
            </div>

            {/* Reply Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A] mb-1.5">
                Your Response Message
              </label>
              <textarea
                rows={5}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your official response to the user... (This will be sent directly to their email if provided)"
                className="w-full px-3.5 py-3 bg-[#070A0F] border border-[#1C2538] focus:border-[#81D7B4] rounded-xl text-xs text-[#F9F9FB] outline-none leading-relaxed placeholder:text-[#3B4C68]"
              />
            </div>

            {/* Status after reply */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#7B8B9A]">Status after sending:</span>
              <div className="flex gap-2">
                {['reviewed', 'resolved'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setNewStatus(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                      newStatus === st ? 'bg-[#81D7B4] text-[#070A0F]' : 'bg-[#121A27] text-[#7B8B9A]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#1C2538]">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="px-4 py-2.5 bg-[#121A27] text-white text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={isSendingReply || !replyMessage.trim()}
                className="px-5 py-2.5 bg-[#81D7B4] text-[#070A0F] text-xs font-black rounded-xl hover:bg-[#6BC4A0] cursor-pointer flex items-center gap-2"
              >
                {isSendingReply ? 'Sending Email...' : 'Send Reply'}
                <Mail01Icon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── 6. UPDATES / BROADCASTS TAB ─────────────────────────────────────
function UpdatesTab() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('feature');
  const [isPosting, setIsPosting] = useState(false);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/updates');
      if (res.ok) {
        const data = await res.json();
        setUpdates(data.updates || []);
      }
    } catch (e) {
      toast.error('Failed to load updates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setIsPosting(true);
    try {
      const res = await fetch('/api/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, type }),
      });
      if (res.ok) {
        toast.success('Announcement broadcasted!');
        setTitle('');
        setContent('');
        fetchUpdates();
      }
    } catch (e) {
      toast.error('Failed to post announcement');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Create Form */}
      <div className="lg:col-span-5 bg-[#0A1019] border border-[#1C2538] rounded-2xl p-6 shadow-xl h-fit">
        <h3 className="text-sm font-black text-[#F9F9FB] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Notification01Icon className="w-5 h-5 text-[#81D7B4]" />
          Broadcast System Update
        </h3>

        <form onSubmit={handleCreateUpdate} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A] mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. BizSwap 24-Hour Reconciler Live"
              className="w-full px-3.5 py-2.5 bg-[#070A0F] border border-[#1C2538] focus:border-[#81D7B4] rounded-xl text-xs text-[#F9F9FB] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A] mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#070A0F] border border-[#1C2538] focus:border-[#81D7B4] rounded-xl text-xs text-[#F9F9FB] outline-none"
            >
              <option value="feature">New Feature</option>
              <option value="announcement">General Announcement</option>
              <option value="maintenance">System Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A] mb-1">Content</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed description..."
              className="w-full px-3.5 py-2.5 bg-[#070A0F] border border-[#1C2538] focus:border-[#81D7B4] rounded-xl text-xs text-[#F9F9FB] outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isPosting}
            className="w-full py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#070A0F] font-black text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {isPosting ? 'Broadcasting...' : 'Publish Update'}
          </button>
        </form>
      </div>

      {/* Broadcast History */}
      <div className="lg:col-span-7 bg-[#0A1019] border border-[#1C2538] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-[#F9F9FB] uppercase tracking-wider mb-2">Previous Announcements</h3>
        {loading ? (
          <div className="p-8 text-center text-[#7B8B9A]">Loading...</div>
        ) : updates.length === 0 ? (
          <div className="p-8 text-center text-[#7B8B9A]">No announcements published yet.</div>
        ) : (
          updates.map((up) => (
            <div key={up._id} className="p-4 bg-[#070A0F] border border-[#1C2538] rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F9F9FB]">{up.title}</span>
                <span className="text-[10px] font-mono text-[#81D7B4] uppercase bg-[#81D7B4]/10 px-2 py-0.5 rounded">
                  {up.type}
                </span>
              </div>
              <p className="text-[#94A3B8] leading-relaxed text-[11px]">{up.content}</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

// ─── 7. LEADERBOARD TAB ──────────────────────────────────────────────
function LeaderboardTab() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.leaderboard || data || []);
      })
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#0A1019] border border-[#1C2538] rounded-2xl overflow-hidden shadow-xl p-6">
      <h3 className="text-sm font-black text-[#F9F9FB] uppercase tracking-wider mb-4 flex items-center gap-2">
        <Award01Icon className="w-5 h-5 text-[#81D7B4]" />
        Platform Leaderboard Rankings
      </h3>

      {loading ? (
        <div className="p-12 text-center text-[#7B8B9A]">Loading leaderboard...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1C2538] text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A]">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">User Wallet</th>
                <th className="py-3 px-4">Total Savings / Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2538]/60">
              {entries.slice(0, 20).map((en, i) => (
                <tr key={i} className="hover:bg-[#0E1726]">
                  <td className="py-3 px-4 font-mono font-bold text-[#81D7B4]">#{i + 1}</td>
                  <td className="py-3 px-4 font-mono text-[#94A3B8]">{en.walletAddress || en.wallet || 'Anonymous'}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#F9F9FB]">${(en.totalSaved || en.points || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── UI HELPER COMPONENTS ────────────────────────────────────────────
function SidebarBtn({ active, onClick, icon, label, badge, badgeColor }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
        active
          ? 'bg-[#1C2538] text-[#81D7B4] shadow-md border border-[#2C3E5D]'
          : 'text-[#7B8B9A] hover:bg-[#121A27] hover:text-[#F9F9FB]'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          badgeColor === 'amber' ? 'bg-amber-400 text-[#070A0F]' : 'bg-[#81D7B4] text-[#070A0F]'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function MetricCard({ title, value, sub, icon, highlight, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-[#0A1019] border transition-all cursor-pointer shadow-xl ${
        highlight
          ? 'border-amber-400/40 hover:border-amber-400 shadow-amber-400/5'
          : 'border-[#1C2538] hover:border-[#2C3E5D]'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A]">{title}</span>
        <div className="p-2 rounded-xl bg-[#070A0F] border border-[#1C2538]">{icon}</div>
      </div>
      <div className="text-2xl sm:text-3xl font-black text-[#F9F9FB] tracking-tight">{value}</div>
      <p className="text-[11px] text-[#4B5A75] mt-1 font-medium">{sub}</p>
    </div>
  );
}
