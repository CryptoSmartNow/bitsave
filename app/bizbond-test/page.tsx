'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Building03Icon, 
  Wallet01Icon, 
  Coins01Icon, 
  ArrowRight01Icon, 
  SafeIcon,
  DocumentValidationIcon,
  CreditCardIcon,
  Activity01Icon
} from 'hugeicons-react';
import Link from 'next/link';
import Image from 'next/image';
import { PaymentModal } from '@chainrails/react';

type Stats = {
  totalDeposits: number;
  totalCertificates: number;
  activeYield: number;
  totalVolume: number;
};

export default function BizbondTestApp() {
  const [apiKey, setApiKey] = useState('');
  const [env, setEnv] = useState<'sandbox' | 'production'>('sandbox');
  const [isLoading, setIsLoading] = useState(false);
  
  // App State
  const [stats, setStats] = useState<Stats | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositWallet, setDepositWallet] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentSessionToken, setCurrentSessionToken] = useState('');
  
  const [mintDepositId, setMintDepositId] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  
  const [redeemCertId, setRedeemCertId] = useState('');
  
  const [fetchWallet, setFetchWallet] = useState('');
  const [certificates, setCertificates] = useState<any[]>([]);

  const baseUrl = env === 'sandbox' ? '' : 'https://bitsave.io';

  const getHeaders = () => {
    if (!apiKey) throw new Error('API Key is required');
    return {
      'x-api-key': apiKey.trim(),
      'Content-Type': 'application/json'
    };
  };

  const fetchStats = async () => {
    if (!apiKey) return toast.error('Enter API Key first');
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/v1/bizbond/stats`, { headers: getHeaders() });
      const data = await res.json();
      const statsData = data.data || data;
      setStats({
        totalVolume: statsData.tvlUsd || 0,
        activeYield: statsData.totalYieldDistributedUsd || 0,
        totalDeposits: statsData.activeBonds || 0,
        totalCertificates: statsData.activeBonds || 0,
      });
      toast.success('Stats refreshed!');
    } catch (e: any) {
      toast.error('Failed to fetch stats: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/v1/bizbond/deposit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          amount: Number(depositAmount), 
          walletAddress: depositWallet, 
          token: 'USDC',
          instrument: 'BizBond'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'Failed');
      
      const session = data.data?.session;
      const sessionId = typeof session === 'string' ? session : (session?.sessionToken || session?.token || session?.session_id || session?.id || data.depositId);
      
      if (sessionId) {
        toast.success(`Deposit created! Session: ${sessionId}`);
        setMintDepositId(sessionId);
        setMintAmount(depositAmount);
        setCurrentSessionToken(sessionId);
        setIsPaymentModalOpen(true);
      } else {
        throw new Error('Failed to extract session ID from response');
      }
    } catch (e: any) {
      toast.error('Deposit failed: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/v1/bizbond/mint`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          chainrailsSessionId: mintDepositId, 
          walletAddress: depositWallet || '0x...',
          chain: 'BASE'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'Failed');
      toast.success(`Minted successfully! Cert ID: ${data.data?.certificateId || data.certificateId || 'Success'}`);
    } catch (e: any) {
      toast.error('Mint failed: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchCertificates = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/v1/bizbond/certificates/${fetchWallet}`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      const certs = data.data || data.certificates || [];
      setCertificates(certs);
      toast.success(`Found ${certs.length} certificates`);
    } catch (e: any) {
      toast.error('Fetch failed: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/v1/bizbond/redeem`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          walletAddress: depositWallet || fetchWallet, 
          certificateId: redeemCertId, 
          chain: 'BASE' 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Redemption initiated successfully!');
    } catch (e: any) {
      toast.error('Redeem failed: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans">
      {/* Chainrails Payment Modal */}
      {isPaymentModalOpen && currentSessionToken && (
        <PaymentModal
          sessionToken={currentSessionToken}
          isOpen={isPaymentModalOpen}
          open={() => setIsPaymentModalOpen(true)}
          close={() => setIsPaymentModalOpen(false)}
          onClose={() => setIsPaymentModalOpen(false)}
          onCancel={() => setIsPaymentModalOpen(false)}
          onSuccess={(txHash: string | undefined) => {
            setIsPaymentModalOpen(false);
            toast.success(`Payment confirmed by Chainrails! Tx: ${txHash || 'Success'}`);
          }}
          styles={{ theme: 'dark', accentColor: '#81D7B4' }}
          amount={Number(depositAmount)}
        />
      )}

      {/* Acme Corp Header */}
      <header className="bg-[#1A1A1A] border-b border-[#333333] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#81D7B4] rounded-lg flex items-center justify-center">
              <Building03Icon className="w-5 h-5 text-[#121212]" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none text-white">Acme Corp</h1>
              <p className="text-[10px] text-[#7B8B9A] font-bold uppercase tracking-wider leading-none mt-1">Partner Dashboard Simulator</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SafeIcon className="w-4 h-4 text-[#7B8B9A]" />
              </div>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste API Key here..."
                className="w-64 bg-[#121212] border border-[#333333] rounded-lg pl-10 pr-4 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4]/50 transition-all"
              />
            </div>
            <select
              value={env}
              onChange={(e) => setEnv(e.target.value as any)}
              className="bg-[#121212] border border-[#333333] rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#81D7B4]"
            >
              <option value="sandbox">Sandbox (Local)</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Stats Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Activity01Icon className="w-5 h-5 text-[#81D7B4]" />
              Platform Overview
            </h2>
            <button
              onClick={fetchStats}
              disabled={isLoading}
              className="text-sm font-bold text-[#121212] hover:bg-[#6ec2a0] bg-[#81D7B4] px-4 py-2 rounded-lg transition-colors"
            >
              Refresh Stats
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#333333] shadow-sm">
              <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-1">Total Volume</p>
              <p className="text-3xl font-black text-white">${stats?.totalVolume?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#333333] shadow-sm">
              <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-1">Active Yield</p>
              <p className="text-3xl font-black text-[#81D7B4]">${stats?.activeYield?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#333333] shadow-sm">
              <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-1">Total Deposits</p>
              <p className="text-3xl font-black text-white">{stats?.totalDeposits?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#333333] shadow-sm">
              <p className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-1">Certificates</p>
              <p className="text-3xl font-black text-white">{stats?.totalCertificates?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-8">
          {/* Operations */}
          <div className="space-y-8">
            {/* Deposit Form */}
            <section className="bg-[#1A1A1A] rounded-2xl border border-[#333333] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#333333] bg-[#121212]">
                <h3 className="font-bold flex items-center gap-2 text-white">
                  <CreditCardIcon className="w-5 h-5 text-[#81D7B4]" />
                  1. Initialize Deposit
                </h3>
              </div>
              <form onSubmit={handleDeposit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-2">User Wallet Address</label>
                  <input required type="text" value={depositWallet} onChange={e => setDepositWallet(e.target.value)} className="w-full bg-[#121212] border border-[#333333] rounded-lg px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4]/50" placeholder="0x..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-2">Amount (USDC)</label>
                  <input required type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="w-full bg-[#121212] border border-[#333333] rounded-lg px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4]/50" placeholder="1000" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-[#81D7B4] hover:bg-[#6ec2a0] text-[#121212] font-bold py-3 rounded-lg transition-colors">
                  Create Deposit Record
                </button>
              </form>
            </section>

            {/* Mint Form */}
            <section className="bg-[#1A1A1A] rounded-2xl border border-[#333333] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#333333] bg-[#121212]">
                <h3 className="font-bold flex items-center gap-2 text-white">
                  <DocumentValidationIcon className="w-5 h-5 text-[#81D7B4]" />
                  2. Mint Certificate
                </h3>
              </div>
              <form onSubmit={handleMint} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-2">Deposit Session ID</label>
                  <input required type="text" value={mintDepositId} onChange={e => setMintDepositId(e.target.value)} className="w-full bg-[#121212] border border-[#333333] rounded-lg px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4]/50" placeholder="sess_..." />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-[#81D7B4] hover:bg-[#6ec2a0] text-[#121212] font-bold py-3 rounded-lg transition-colors">
                  Mint Yield Certificate
                </button>
              </form>
            </section>
          </div>

          {/* Certificates & Redemption */}
          <div className="space-y-8">
            
            {/* View Certificates */}
            <section className="bg-[#1A1A1A] rounded-2xl border border-[#333333] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#333333] bg-[#121212]">
                <h3 className="font-bold flex items-center gap-2 text-white">
                  <Wallet01Icon className="w-5 h-5 text-[#81D7B4]" />
                  User Portfolio
                </h3>
              </div>
              <div className="p-6">
                <form onSubmit={handleFetchCertificates} className="flex gap-2 mb-6">
                  <input required type="text" value={fetchWallet} onChange={e => setFetchWallet(e.target.value)} className="flex-1 bg-[#121212] border border-[#333333] rounded-lg px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4]/50" placeholder="Enter Wallet Address..." />
                  <button type="submit" disabled={isLoading} className="bg-[#81D7B4] hover:bg-[#6ec2a0] text-[#121212] font-bold px-6 py-2.5 rounded-lg transition-colors">
                    Search
                  </button>
                </form>
                
                <div className="space-y-3">
                  {certificates.length === 0 ? (
                    <div className="text-center py-8 text-[#4B5A75] text-sm font-bold">No certificates found</div>
                  ) : (
                    certificates.map((cert, i) => (
                      <div key={i} className="p-4 rounded-xl border border-[#333333] hover:border-[#81D7B4] transition-colors cursor-pointer group flex items-center justify-between" onClick={() => setRedeemCertId(cert.mintAddress || cert.certificateId || cert.id)}>
                        <div>
                          <p className="font-bold text-sm text-white">Certificate #{(cert.mintAddress || cert.id || 'Unknown').substring(0,12)}</p>
                          <p className="text-xs text-[#7B8B9A] font-mono mt-1">Status: {cert.status || 'Active'} · {cert.instrument || 'BizBond'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-[#81D7B4]">${(cert.investmentAmount || cert.amount || 0).toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-[#4B5A75] uppercase tracking-wider mt-1 group-hover:text-[#81D7B4] transition-colors">Click to Redeem</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Redeem Form */}
            <section className="bg-[#1A1A1A] rounded-2xl border border-[#333333] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#333333] bg-[#121212]">
                <h3 className="font-bold flex items-center gap-2 text-white">
                  <Coins01Icon className="w-5 h-5 text-[#81D7B4]" />
                  3. Redeem & Withdraw
                </h3>
              </div>
              <form onSubmit={handleRedeem} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#7B8B9A] uppercase tracking-wider mb-2">Certificate ID</label>
                  <input required type="text" value={redeemCertId} onChange={e => setRedeemCertId(e.target.value)} className="w-full bg-[#121212] border border-[#333333] rounded-lg px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4]/50" placeholder="cert_..." />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-[#81D7B4] hover:bg-[#6ec2a0] text-[#121212] font-bold py-3 rounded-lg transition-colors">
                  Initiate Redemption
                </button>
              </form>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
