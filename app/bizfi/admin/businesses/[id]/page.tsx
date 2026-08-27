'use client';

import {
  ArrowLeft02Icon,
  Calendar01Icon,
  Dollar01Icon,
  Tick01Icon,
  Cancel01Icon,
  Building04Icon,
  Wallet01Icon,
  Message02Icon,
  File01Icon,
  UserIcon,
  Mail01Icon,
  GlobalIcon,
  Copy01Icon,
  ViewIcon,
  Shield01Icon,
  Alert01Icon,
  Clock01Icon
} from "hugeicons-react";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import LoanAgreementEditor from '../../components/LoanAgreementEditor';

interface Business {
  transactionHash: string;
  owner: string;
  businessName: string;
  tier: string;
  status: string;
  createdAt: string;
  feePaid?: string;
  referralCode?: string;
  metadata?: any;
  loanAgreement?: any;
}

type TabType = 'overview' | 'kyc' | 'agreement' | 'raw';

export default function BusinessDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBusiness();
    }
  }, [id]);

  const fetchBusiness = async () => {
    try {
      const res = await fetch(`/api/bizfi/business?transactionHash=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error('Failed to fetch business');
      const data = await res.json();
      if (data && data.length > 0) {
        setBusiness(data[0]);
      } else {
        setError('Business profile not found');
      }
    } catch (err) {
      setError('Error loading business details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!business) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/bizfi/admin/business/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionHash: business.transactionHash,
          owner: business.owner,
          status: newStatus
        })
      });

      if (res.ok) {
        setBusiness(prev => prev ? { ...prev, status: newStatus } : null);
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert('Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveAgreement = async (data: any) => {
    if (!business) return;
    try {
      const res = await fetch('/api/bizfi/admin/business/update-agreement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionHash: business.transactionHash,
          agreement: data
        }),
      });

      if (!res.ok) throw new Error('Failed to save agreement');
      setBusiness(prev => prev ? { ...prev, loanAgreement: data } : null);
      setShowAgreement(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save loan agreement');
    }
  };

  const handleMessage = () => {
    if (!business) return;
    const queryParams = new URLSearchParams({
      businessId: business.owner || business.transactionHash,
      businessName: business.businessName
    });
    router.push(`/bizfi/admin/chat?${queryParams.toString()}`);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-3 border-[#81D7B4]/20 border-t-[#81D7B4] rounded-full animate-spin"></div>
        <p className="text-[#81D7B4] text-xs font-bold uppercase tracking-widest animate-pulse">
          Loading Business Profile...
        </p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400">
          <Alert01Icon className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-[#F9F9FB]">{error || 'Business Not Found'}</h2>
          <p className="text-xs text-[#9BA8B5]">The record could not be found in the protocol registry.</p>
        </div>
        <button
          onClick={() => router.push('/bizfi/admin/businesses')}
          className="flex items-center gap-2 px-6 py-3 bg-[#1A2538] hover:bg-[#253247] rounded-xl border border-[#7B8B9A]/20 text-[#F9F9FB] font-bold text-xs transition-all cursor-pointer"
        >
          <ArrowLeft02Icon className="w-4 h-4 text-[#81D7B4]" />
          <span>Return to Businesses</span>
        </button>
      </div>
    );
  }

  const meta = business.metadata || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-16 max-w-[1600px] mx-auto font-sans"
    >
      <AnimatePresence>
        {showAgreement && (
          <LoanAgreementEditor
            business={business}
            onClose={() => setShowAgreement(false)}
            onSave={handleSaveAgreement}
          />
        )}
      </AnimatePresence>

      {/* Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.push('/bizfi/admin/businesses')}
          className="flex items-center gap-2.5 text-[#9BA8B5] hover:text-[#81D7B4] transition-colors cursor-pointer group w-fit"
        >
          <div className="w-8 h-8 rounded-xl bg-[#1A2538] flex items-center justify-center border border-[#7B8B9A]/20 group-hover:border-[#81D7B4]/40">
            <ArrowLeft02Icon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="text-xs font-bold">Back to Businesses</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleMessage}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1A2538] hover:bg-[#253247] text-[#81D7B4] rounded-xl border border-[#81D7B4]/30 font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <Message02Icon className="w-4 h-4" />
            <span>Chat with Owner</span>
          </button>

          <button
            onClick={() => setShowAgreement(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0F1825] rounded-xl font-black text-xs transition-all shadow-md shadow-[#81D7B4]/20 cursor-pointer active:scale-95"
          >
            <File01Icon className="w-4 h-4" />
            <span>Loan Agreement</span>
          </button>
        </div>
      </div>

      {/* Business Hero Banner */}
      <div className="bg-[#1A2538]/70 backdrop-blur-xl rounded-3xl border border-[#7B8B9A]/20 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#81D7B4]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#81D7B4]/20 to-[#81D7B4]/5 border border-[#81D7B4]/30 flex items-center justify-center text-[#81D7B4] font-black text-2xl sm:text-3xl shadow-inner shrink-0">
              {(business.businessName || 'B').charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-[#F9F9FB] tracking-tight">
                  {business.businessName}
                </h1>
                
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  business.status === 'approved'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : business.status === 'pending'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    business.status === 'approved' ? 'bg-emerald-400 animate-pulse' :
                    business.status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
                  }`} />
                  <span className="capitalize">{business.status || 'pending'}</span>
                </span>

                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#0F1825] text-[#81D7B4] border border-[#81D7B4]/20">
                  {business.tier || 'builder'} Tier
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-[#9BA8B5]">
                <div className="flex items-center gap-1.5">
                  <Calendar01Icon className="w-3.5 h-3.5 text-[#81D7B4]" />
                  <span>Registered {business.createdAt ? format(new Date(business.createdAt), 'MMMM d, yyyy') : '-'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7B8B9A]"></span>
                  <span className="text-[#7B8B9A]">TX:</span>
                  <button
                    onClick={() => copyToClipboard(business.transactionHash, 'tx')}
                    className="hover:text-[#81D7B4] transition-colors inline-flex items-center gap-1"
                    title="Click to copy full hash"
                  >
                    <span>{business.transactionHash ? `${business.transactionHash.slice(0, 8)}...${business.transactionHash.slice(-6)}` : '-'}</span>
                    <Copy01Icon className="w-3 h-3 text-[#7B8B9A]" />
                  </button>
                  {copied === 'tx' && <span className="text-emerald-400 text-[10px] font-bold">Copied!</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Status Action Switcher */}
          <div className="flex items-center gap-2 bg-[#0F1825] p-1.5 rounded-2xl border border-[#7B8B9A]/20 w-fit">
            {business.status !== 'approved' && (
              <button
                onClick={() => handleStatusUpdate('approved')}
                disabled={updating}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold transition-all border border-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                <Tick01Icon className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
            )}

            {business.status !== 'pending' && (
              <button
                onClick={() => handleStatusUpdate('pending')}
                disabled={updating}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl text-xs font-bold transition-all border border-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                <Clock01Icon className="w-3.5 h-3.5" />
                <span>Mark Pending</span>
              </button>
            )}

            {business.status !== 'rejected' && (
              <button
                onClick={() => handleStatusUpdate('rejected')}
                disabled={updating}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all border border-red-500/20 cursor-pointer disabled:opacity-50"
              >
                <Cancel01Icon className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-[#7B8B9A]/15 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Building04Icon },
            { id: 'kyc', label: 'KYC & Metadata', icon: UserIcon },
            { id: 'agreement', label: 'Loan Agreement', icon: File01Icon },
            { id: 'raw', label: 'Raw JSON', icon: ViewIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#81D7B4] text-[#0F1825] shadow-md shadow-[#81D7B4]/20'
                    : 'text-[#9BA8B5] hover:bg-[#0F1825] hover:text-[#F9F9FB]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Core Info Card */}
            <div className="bg-[#1A2538]/70 backdrop-blur-xl rounded-3xl border border-[#7B8B9A]/20 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#81D7B4] flex items-center gap-2">
                <Building04Icon className="w-4 h-4" />
                Business Overview
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15">
                  <span className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-wider block mb-1">Business Name</span>
                  <p className="font-bold text-[#F9F9FB] text-sm">{business.businessName}</p>
                </div>

                <div className="p-3.5 bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15">
                  <span className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-wider block mb-1">Tier Level</span>
                  <p className="font-bold text-[#81D7B4] text-sm capitalize">{business.tier || 'builder'}</p>
                </div>

                <div className="p-3.5 bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15">
                  <span className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-wider block mb-1">Fee Paid</span>
                  <p className="font-bold text-[#F9F9FB] text-sm">
                    {business.feePaid ? `$${business.feePaid}` : 'Free / Included'}
                  </p>
                </div>

                <div className="p-3.5 bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15">
                  <span className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-wider block mb-1">Referral Code</span>
                  <p className="font-bold text-[#F9F9FB] text-sm">{business.referralCode || 'None'}</p>
                </div>
              </div>
            </div>

            {/* Owner & Contacts Card */}
            <div className="bg-[#1A2538]/70 backdrop-blur-xl rounded-3xl border border-[#7B8B9A]/20 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#81D7B4] flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Owner & Contact Channels
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-wider block mb-1">Owner Wallet Address</span>
                    <p className="font-mono text-xs text-[#F9F9FB] break-all select-all">{business.owner}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(business.owner, 'owner')}
                    className="p-2 hover:bg-[#1A2538] rounded-xl text-[#9BA8B5] hover:text-[#81D7B4] transition-colors shrink-0"
                    title="Copy Address"
                  >
                    <Copy01Icon className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15 flex items-center gap-3">
                    <Mail01Icon className="w-4 h-4 text-[#81D7B4] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-wider block">Email</span>
                      <p className="text-xs font-medium text-[#F9F9FB] truncate">
                        {meta.email || meta.businessEmail || meta.ceoEmail || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15 flex items-center gap-3">
                    <GlobalIcon className="w-4 h-4 text-[#81D7B4] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-wider block">Website</span>
                      <p className="text-xs font-medium text-[#F9F9FB] truncate">
                        {meta.website || meta.businessWebsite ? (
                          <a href={meta.website || meta.businessWebsite} target="_blank" rel="noreferrer" className="text-[#81D7B4] hover:underline">
                            {meta.website || meta.businessWebsite}
                          </a>
                        ) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Quick Summary Card */}
            <div className="bg-[#1A2538]/70 backdrop-blur-xl rounded-3xl border border-[#7B8B9A]/20 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#81D7B4] flex items-center gap-2">
                <Shield01Icon className="w-4 h-4" />
                Verification Status
              </h3>

              <div className="p-4 bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#7B8B9A]">Protocol Status:</span>
                  <span className="font-bold text-[#F9F9FB] capitalize">{business.status}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#7B8B9A]">Loan Agreement:</span>
                  <span className={`font-bold ${business.loanAgreement ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {business.loanAgreement ? 'Generated' : 'Not Created'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#7B8B9A]">Metadata Attached:</span>
                  <span className="font-bold text-[#81D7B4]">{Object.keys(meta).length} fields</span>
                </div>
              </div>

              <button
                onClick={() => setShowAgreement(true)}
                className="w-full py-3 bg-[#1A2538] hover:bg-[#253247] text-[#81D7B4] rounded-xl border border-[#81D7B4]/30 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <File01Icon className="w-4 h-4" />
                <span>{business.loanAgreement ? 'Edit Agreement' : 'Generate Agreement'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: KYC & METADATA */}
      {activeTab === 'kyc' && (
        <div className="bg-[#1A2538]/70 backdrop-blur-xl rounded-3xl border border-[#7B8B9A]/20 p-6 sm:p-8 shadow-xl space-y-6">
          <h3 className="text-base font-black uppercase tracking-wider text-[#81D7B4] flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Registered KYC & Business Details
          </h3>

          {Object.keys(meta).length === 0 ? (
            <div className="p-12 text-center text-[#7B8B9A]">
              <File01Icon className="w-8 h-8 opacity-30 text-[#81D7B4] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#F9F9FB]">No additional KYC metadata recorded for this business.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(meta).map(([key, val]) => {
                if (typeof val === 'object' && val !== null) {
                  return (
                    <div key={key} className="p-4 bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15 md:col-span-2 space-y-1">
                      <span className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-wider block">{key}</span>
                      <pre className="text-xs font-mono text-[#F9F9FB] overflow-x-auto bg-[#1A2538]/50 p-3 rounded-xl">
                        {JSON.stringify(val, null, 2)}
                      </pre>
                    </div>
                  );
                }
                return (
                  <div key={key} className="p-4 bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15 space-y-1">
                    <span className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-wider block">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <p className="text-xs font-semibold text-[#F9F9FB] break-words">
                      {String(val) || '-'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: LOAN AGREEMENT */}
      {activeTab === 'agreement' && (
        <div className="bg-[#1A2538]/70 backdrop-blur-xl rounded-3xl border border-[#7B8B9A]/20 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-[#81D7B4] flex items-center gap-2">
                <File01Icon className="w-5 h-5" />
                Loan Agreement Status
              </h3>
              <p className="text-xs text-[#9BA8B5] mt-1">Legally binding covenants & repayment terms</p>
            </div>

            <button
              onClick={() => setShowAgreement(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0F1825] rounded-xl font-bold text-xs transition-all shadow-md shadow-[#81D7B4]/20 cursor-pointer"
            >
              <File01Icon className="w-4 h-4" />
              <span>{business.loanAgreement ? 'Edit Agreement Document' : 'Draft New Agreement'}</span>
            </button>
          </div>

          {business.loanAgreement ? (
            <div className="p-6 bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-[#1A2538] rounded-xl border border-[#7B8B9A]/10">
                  <span className="text-[10px] font-bold text-[#7B8B9A] uppercase">Principal Sum</span>
                  <p className="text-sm font-bold text-[#F9F9FB] mt-0.5">{business.loanAgreement.principalSum || '-'}</p>
                </div>
                <div className="p-3 bg-[#1A2538] rounded-xl border border-[#7B8B9A]/10">
                  <span className="text-[10px] font-bold text-[#7B8B9A] uppercase">Tenor</span>
                  <p className="text-sm font-bold text-[#F9F9FB] mt-0.5">{business.loanAgreement.tenor || '-'}</p>
                </div>
                <div className="p-3 bg-[#1A2538] rounded-xl border border-[#7B8B9A]/10">
                  <span className="text-[10px] font-bold text-[#7B8B9A] uppercase">Interest Rate</span>
                  <p className="text-sm font-bold text-[#81D7B4] mt-0.5">{business.loanAgreement.interestRate || '-'}</p>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] font-bold text-[#7B8B9A] uppercase block mb-1">Repayment Schedule</span>
                <p className="text-xs text-[#9BA8B5] bg-[#1A2538] p-3 rounded-xl border border-[#7B8B9A]/10">
                  {business.loanAgreement.repaymentSchedule || 'Standard amortized schedule'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-[#7B8B9A] bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15">
              <File01Icon className="w-10 h-10 opacity-30 text-[#81D7B4] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#F9F9FB]">No loan agreement drafted yet.</p>
              <p className="text-xs text-[#7B8B9A] mt-1">Click the button above to generate a customized agreement.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB: RAW JSON */}
      {activeTab === 'raw' && (
        <div className="bg-[#1A2538]/70 backdrop-blur-xl rounded-3xl border border-[#7B8B9A]/20 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#81D7B4] flex items-center gap-2">
              <ViewIcon className="w-4 h-4" />
              Raw Registry Record
            </h3>
            <button
              onClick={() => copyToClipboard(JSON.stringify(business, null, 2), 'raw')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F1825] hover:bg-[#1A2538] text-[#81D7B4] rounded-xl text-xs font-bold border border-[#7B8B9A]/20 transition-colors"
            >
              <Copy01Icon className="w-3.5 h-3.5" />
              <span>{copied === 'raw' ? 'Copied JSON!' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="text-xs font-mono text-[#81D7B4] bg-[#0F1825] p-4 rounded-2xl border border-[#7B8B9A]/15 overflow-x-auto max-h-[500px]">
            {JSON.stringify(business, null, 2)}
          </pre>
        </div>
      )}
    </motion.div>
  );
}
