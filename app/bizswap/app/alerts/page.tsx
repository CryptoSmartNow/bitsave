'use client';

import React, { useEffect, useState } from 'react';
import { Notification01Icon, Tick01Icon, InformationCircleIcon, Cancel01Icon, CheckmarkCircle01Icon } from "hugeicons-react";
import { useWallet } from '@solana/wallet-adapter-react';
import { usePrivy } from '@privy-io/react-auth';

interface Alert {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  time: string;
  timestamp: string;
  isNew: boolean;
}

export default function AlertsPage() {
  const { publicKey, connected: isSolanaConnected } = useWallet();
  const { ready, authenticated, user } = usePrivy();

  const connected = ready && (authenticated || isSolanaConnected);

  const privySolanaWallet = user?.linkedAccounts?.find(
    (account) => account.type === 'wallet' && account.chainType === 'solana'
  ) as { address: string } | undefined;

  const walletAddress = isSolanaConnected
    ? publicKey?.toBase58()
    : (privySolanaWallet?.address || user?.wallet?.address);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (connected && walletAddress) {
      fetchAlerts(walletAddress);
    } else if (!connected && ready) {
      setAlerts([]);
      setLoading(false);
    }
  }, [connected, walletAddress, ready]);

  const fetchAlerts = async (wallet: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bizswap/alerts?wallet=${wallet}`);
      const data = await res.json();
      if (res.ok) {
        setAlerts(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (alert?.isNew) {
      window.dispatchEvent(new CustomEvent('bizswap:alertsRead', { detail: { count: 1 } }));
    }
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isNew: false } : a));
  };

  const markAllAsRead = () => {
    const unreadCount = alerts.filter(a => a.isNew).length;
    if (unreadCount > 0) {
      window.dispatchEvent(new CustomEvent('bizswap:alertsRead', { detail: { count: unreadCount } }));
    }
    setAlerts(prev => prev.map(a => ({ ...a, isNew: false })));
  };

  const dismissAlert = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleAlertClick = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
    markAsRead(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <Tick01Icon className="w-6 h-6 text-[#81D7B4]" />;
      case 'info': return <InformationCircleIcon className="w-6 h-6 text-[#3B82F6]" />;
      default: return <Notification01Icon className="w-6 h-6 text-[#F5A623]" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'success': return 'bg-[#81D7B4]/10 border border-[#81D7B4]/20';
      case 'info': return 'bg-[#3B82F6]/10 border border-[#3B82F6]/20';
      default: return 'bg-[#F5A623]/10 border border-[#F5A623]/20';
    }
  };

  const unreadCount = alerts.filter(a => a.isNew).length;

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center py-32">
        <div className="w-24 h-24 rounded-full bg-[#1C2538]/30 flex items-center justify-center mb-6 border border-[#2C3E5D]/30 relative">
          <div className="absolute inset-0 bg-[#81D7B4]/10 rounded-full blur-xl"></div>
          <Notification01Icon className="w-10 h-10 text-[#4B5A75] relative z-10" />
        </div>
        <h2 className="text-3xl font-black text-[#F9F9FB] mb-3 tracking-tight">Wallet Not Connected</h2>
        <p className="text-[#7B8B9A] mb-8 max-w-md text-lg">Please connect your Solana wallet to view your notifications.</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-24 relative flex justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-[1000px] space-y-8 min-w-0 relative z-10">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-[#81D7B4]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 -translate-x-1/3 z-0"></div>

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#81D7B4]/10 border border-[#81D7B4]/20 rounded-full mb-4 shadow-[0_0_15px_rgba(129,215,180,0.15)]">
            <Notification01Icon className="w-4 h-4 text-[#81D7B4]" />
            <span className="text-[10px] font-bold text-[#81D7B4] uppercase tracking-widest">Inbox</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#F9F9FB] tracking-tight flex items-center flex-wrap gap-4">
            Alerts & Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black bg-[#81D7B4] text-[#0A0F17] shadow-[0_0_20px_rgba(129,215,180,0.5)]">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-base text-[#7B8B9A] mt-2 max-w-md">Stay updated on your payouts, account activity, and real-world asset news.</p>
        </div>

        <div className="w-full lg:w-auto">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="w-full lg:w-auto text-sm font-bold text-[#F9F9FB] bg-[#0A0F17] hover:bg-[#1C2538] transition-colors border border-[#2C3E5D] px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckmarkCircle01Icon className="w-4 h-4 text-[#81D7B4]" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 pt-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-6 rounded-2xl border border-[#1C2538] bg-[#121A27] flex gap-4 animate-pulse shadow-xl">
                <div className="w-14 h-14 rounded-full bg-[#1C2538] shrink-0" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-4 bg-[#1C2538] rounded w-1/3" />
                  <div className="h-3 bg-[#1C2538] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-gradient-to-b from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-3xl p-16 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-[#1C2538]/30 flex items-center justify-center mx-auto mb-6 border border-[#2C3E5D]/30 relative">
              <div className="absolute inset-0 bg-[#81D7B4]/10 rounded-full blur-xl"></div>
              <Notification01Icon className="w-8 h-8 text-[#4B5A75] relative z-10" />
            </div>
            <h3 className="text-xl font-black text-[#F9F9FB] mb-2">You're all caught up!</h3>
            <p className="text-[#7B8B9A] max-w-sm mx-auto">Alerts will appear here when you make purchases or receive yield distributions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const isExpanded = expandedId === alert.id;
              return (
                <div
                  key={alert.id}
                  onClick={() => handleAlertClick(alert.id)}
                  className={`relative rounded-2xl border transition-all duration-300 cursor-pointer group shadow-lg overflow-hidden ${
                    alert.isNew
                      ? 'bg-gradient-to-r from-[#1A2538] to-[#121A27] border-[#2C3E5D] hover:border-[#81D7B4]/50 hover:shadow-[0_0_30px_rgba(129,215,180,0.1)]'
                      : 'bg-[#0A0F17] border-[#1C2538] hover:border-[#2C3E5D]'
                  }`}
                >
                  {/* Glowing edge indicator for new alerts */}
                  {alert.isNew && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#81D7B4] to-[#6BC4A0]"></div>
                  )}

                  {/* Main row */}
                  <div className={`p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start ${alert.isNew ? 'ml-1' : ''}`}>
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-full shrink-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-inner ${getIconBg(alert.type)}`}>
                      {getIcon(alert.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className={`font-black text-base sm:text-lg leading-tight transition-colors ${
                          alert.isNew ? 'text-[#F9F9FB]' : 'text-[#7B8B9A]'
                        }`}>
                          {alert.title}
                        </h3>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-bold uppercase tracking-widest text-[#4B5A75]">{alert.time}</span>
                          {/* Dismiss button */}
                          <button
                            onClick={(e) => dismissAlert(e, alert.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full flex items-center justify-center text-[#4B5A75] hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10"
                            title="Dismiss"
                          >
                            <Cancel01Icon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Message preview (collapsed) or full (expanded) */}
                      <p className={`text-sm mt-2 leading-relaxed transition-colors ${
                        alert.isNew ? 'text-[#B8C5D6]' : 'text-[#4B5A75]'
                      } ${!isExpanded ? 'line-clamp-2 sm:line-clamp-1' : ''}`}>
                        {alert.message}
                      </p>
                      
                      {/* Expand hint */}
                      {!isExpanded && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B5A75] mt-3 inline-block group-hover:text-[#81D7B4] transition-colors">
                          Click to read more →
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div
                      className={`px-5 sm:px-6 pb-6 pt-0 ${alert.isNew ? 'ml-1' : ''}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className={`rounded-xl p-5 border shadow-inner ${
                        alert.type === 'success' ? 'bg-[#81D7B4]/5 border-[#81D7B4]/15' :
                        alert.type === 'info' ? 'bg-[#3B82F6]/5 border-[#3B82F6]/15' :
                        'bg-[#F5A623]/5 border-[#F5A623]/15'
                      }`}>
                        <p className="text-sm text-[#F9F9FB] leading-relaxed">
                          {alert.message}
                        </p>
                        <div className="mt-4 pt-4 border-t border-[#1C2538] flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B5A75]">
                            {new Date(alert.timestamp).toLocaleString('en-US', {
                              month: 'long', day: 'numeric', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(null);
                            }}
                            className="text-[10px] font-black uppercase tracking-widest text-[#81D7B4] hover:text-[#F9F9FB] transition-colors flex items-center gap-1 bg-[#81D7B4]/10 hover:bg-[#81D7B4]/20 px-3 py-1.5 rounded-md"
                          >
                            Collapse ↑
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
