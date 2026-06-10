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
      // Notify the layout header to decrement badge by 1
      window.dispatchEvent(new CustomEvent('bizswap:alertsRead', { detail: { count: 1 } }));
    }
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isNew: false } : a));
  };

  const markAllAsRead = () => {
    const unreadCount = alerts.filter(a => a.isNew).length;
    if (unreadCount > 0) {
      // Notify the layout header to decrement badge by total unread count
      window.dispatchEvent(new CustomEvent('bizswap:alertsRead', { detail: { count: unreadCount } }));
    }
    setAlerts(prev => prev.map(a => ({ ...a, isNew: false })));
  };

  const dismissAlert = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setAlerts(prev => prev.filter(a => a.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const handleAlertClick = (id: string) => {
    // Mark as read when clicked
    markAsRead(id);
    // Toggle expanded detail view
    setExpandedId(prev => prev === id ? null : id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <Tick01Icon className="w-6 h-6 text-[#81D7B4]" />;
      case 'info': return <InformationCircleIcon className="w-6 h-6 text-[#3B82F6]" />;
      default: return <Notification01Icon className="w-6 h-6 text-[#7B8B9A]" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'success': return 'bg-[#81D7B4]/10';
      case 'info': return 'bg-[#3B82F6]/10';
      default: return 'bg-[#F59E0B]/10';
    }
  };

  const unreadCount = alerts.filter(a => a.isNew).length;

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <Notification01Icon className="w-16 h-16 text-[#2C3E5D] mb-6" />
        <h2 className="text-2xl font-black text-[#F9F9FB] mb-2">Wallet Not Connected</h2>
        <p className="text-[#7B8B9A] mb-8 max-w-sm">Please connect your Solana wallet to view your notifications.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-[800px] mx-auto space-y-6 md:space-y-8 min-w-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#1C2538] pb-6">
        <div>
          <h1 className="text-2xl font-black text-[#F9F9FB]">
            Alerts & Notifications
            {unreadCount > 0 && (
              <span className="ml-3 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#81D7B4]/15 text-[#81D7B4] border border-[#81D7B4]/30">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-[#7B8B9A] mt-1">
            Click an alert to read it. Stay updated on your payouts and account activity.
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-xs font-bold text-[#81D7B4] hover:text-[#F9F9FB] transition-colors bg-[#81D7B4]/10 hover:bg-[#81D7B4]/20 px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2"
          >
            <CheckmarkCircle01Icon className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-5 rounded-2xl border border-[#1C2538] bg-[#121A27] flex gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1C2538] animate-pulse shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-[#1C2538] rounded animate-pulse w-1/3" />
                <div className="h-3 bg-[#1C2538] rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const isExpanded = expandedId === alert.id;
            return (
              <div
                key={alert.id}
                onClick={() => handleAlertClick(alert.id)}
                className={`rounded-2xl border transition-all duration-200 cursor-pointer group ${
                  alert.isNew
                    ? 'bg-[#1A2538] border-[#2C3E5D] hover:border-[#81D7B4]/40'
                    : 'bg-[#121A27] border-[#1C2538] hover:border-[#2C3E5D]'
                }`}
              >
                {/* Main row */}
                <div className="p-5 flex gap-4 items-start">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${getIconBg(alert.type)}`}>
                    {getIcon(alert.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3">
                      <h3 className={`font-bold text-sm leading-snug transition-colors ${
                        alert.isNew ? 'text-[#F9F9FB]' : 'text-[#7B8B9A]'
                      }`}>
                        {alert.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-[#4B5A75]">{alert.time}</span>
                        {/* Dismiss button */}
                        <button
                          onClick={(e) => dismissAlert(e, alert.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-md flex items-center justify-center text-[#4B5A75] hover:text-[#F9F9FB] hover:bg-[#2C3E5D]"
                          title="Dismiss"
                        >
                          <Cancel01Icon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Message preview (collapsed) or full (expanded) */}
                    <p className={`text-xs mt-1.5 leading-relaxed transition-colors ${
                      alert.isNew ? 'text-[#7B8B9A]' : 'text-[#4B5A75]'
                    } ${!isExpanded ? 'line-clamp-1' : ''}`}>
                      {alert.message}
                    </p>
                    {/* Expand hint */}
                    {!isExpanded && (
                      <span className="text-[10px] text-[#4B5A75] mt-1 inline-block group-hover:text-[#81D7B4] transition-colors">
                        Click to read →
                      </span>
                    )}
                  </div>

                  {/* Unread dot */}
                  <div className={`w-2 h-2 rounded-full shrink-0 mt-2 transition-all duration-300 ${
                    alert.isNew ? 'bg-[#81D7B4]' : 'bg-transparent'
                  }`} />
                </div>

                {/* Expanded detail panel */}
                {isExpanded && (
                  <div
                    className="px-5 pb-5 pt-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={`rounded-xl p-4 border ${
                      alert.type === 'success' ? 'bg-[#81D7B4]/5 border-[#81D7B4]/15' :
                      alert.type === 'info' ? 'bg-[#3B82F6]/5 border-[#3B82F6]/15' :
                      'bg-[#F59E0B]/5 border-[#F59E0B]/15'
                    }`}>
                      <p className="text-sm text-[#B8C5D6] leading-relaxed">
                        {alert.message}
                      </p>
                      <div className="mt-3 pt-3 border-t border-[#1C2538] flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#4B5A75]">
                          {new Date(alert.timestamp).toLocaleString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        <button
                          onClick={() => setExpandedId(null)}
                          className="text-[10px] font-bold text-[#4B5A75] hover:text-[#81D7B4] transition-colors"
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

          {alerts.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#1C2538] flex items-center justify-center mx-auto mb-4">
                <Notification01Icon className="w-8 h-8 text-[#2C3E5D]" />
              </div>
              <p className="text-[#7B8B9A] font-bold">You're all caught up!</p>
              <p className="text-[#4B5A75] text-sm mt-1">Alerts will appear here when you make purchases or receive payouts.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
