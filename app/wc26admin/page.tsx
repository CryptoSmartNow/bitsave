'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/adminAuth';

export default function WC26Admin() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newPrice, setNewPrice] = useState('');
  const [priceReason, setPriceReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/wc26/dashboard', {
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrice || !priceReason) return toast.error('Fill in all fields');
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/wc26/set-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ price: Number(newPrice), reason: priceReason })
      });
      if (res.ok) {
        toast.success('Price updated successfully');
        setNewPrice('');
        setPriceReason('');
        fetchDashboard();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update price');
      }
    } catch (e) {
      toast.error('Network error');
    }
    setActionLoading(false);
  };



  const handleToggleTrading = async (open: boolean) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/wc26/trading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ open })
      });
      if (res.ok) {
        toast.success(open ? 'Trading Opened' : 'Trading Closed');
        setData((prev: any) => prev ? { ...prev, poolState: { ...prev.poolState, trading_open: open } } : prev);
        fetchDashboard();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to toggle trading');
      }
    } catch (e) {
      toast.error('Network error');
    }
    setActionLoading(false);
  };

  if (loading) return <div className="p-8">Loading WC26 Admin...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">WC26 Pool Control</h1>
        <p className="text-gray-400">Manage the temporary World Cup 2026 trading pool.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 p-6 rounded-2xl shadow-sm border border-white/10">
          <div className="text-sm text-gray-400 mb-1">Current Price</div>
          <div className="text-3xl font-bold text-white">${data?.poolState?.current_price_usd?.toFixed(2) ?? '0.00'}</div>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl shadow-sm border border-white/10">
          <div className="text-sm text-gray-400 mb-1">Total USDC Held</div>
          <div className="text-3xl font-bold text-white">${data?.poolState?.total_usdc_held?.toLocaleString() ?? '0'}</div>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl shadow-sm border border-white/10">
          <div className="text-sm text-gray-400 mb-1">Collected Fees</div>
          <div className="text-3xl font-bold text-[#D4AF37]">${data?.poolState?.collected_fees?.toLocaleString() ?? '0'}</div>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl shadow-sm border border-white/10">
          <div className="text-sm text-gray-400 mb-1">Total Shares Minted</div>
          <div className="text-3xl font-bold text-white">{data?.poolState?.total_shares_sold || 0}</div>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl shadow-sm border border-white/10">
          <div className="text-sm text-gray-400 mb-1">Active Users</div>
          <div className="text-3xl font-bold text-white">{data?.activeUsersCount}</div>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl shadow-sm border border-white/10 flex flex-col justify-center items-start">
          <div className="text-sm text-gray-400 mb-2">Trading Status</div>
          {data?.poolState?.trading_open ? (
            <button 
              onClick={() => handleToggleTrading(false)}
              disabled={actionLoading}
              className="px-6 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 font-semibold rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : 'Close Trading'}
            </button>
          ) : (
            <button 
              onClick={() => handleToggleTrading(true)}
              disabled={actionLoading}
              className="px-6 py-2.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 font-semibold rounded-xl hover:bg-[#D4AF37]/20 transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : 'Open Trading'}
            </button>
          )}
        </div>
      </div>

      <div className="w-full">
        <form onSubmit={handleSetPrice} className="bg-white/5 p-6 rounded-2xl shadow-sm border border-white/10 space-y-4">
          <h2 className="text-xl font-bold text-white">Force Set Price</h2>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">New Price (USD)</label>
            <input 
              type="number" 
              step="0.01"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Reason for change</label>
            <input 
              type="text"
              value={priceReason}
              onChange={e => setPriceReason(e.target.value)}
              placeholder="e.g. End of tournament match"
              className="w-full px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder-gray-500"
            />
          </div>
          <button 
            type="submit"
            disabled={actionLoading}
            className="w-full py-2 bg-[#D4AF37] text-black font-medium rounded-xl hover:bg-[#B8860B] transition"
          >
            Update Price
          </button>
        </form>

      </div>
    </div>
  );
}
