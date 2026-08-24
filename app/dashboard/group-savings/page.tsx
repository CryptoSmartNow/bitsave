'use client';

import {
  PlusSignIcon,
  UserMultipleIcon,
  Cancel01Icon,
  UserAdd01Icon,
  BarChartIcon,
  Calendar01Icon,
  Delete02Icon,
  ArrowDown01Icon,
  Copy01Icon,
  Share01Icon,
  Logout01Icon,
  CheckmarkCircle02Icon,
  Target02Icon,
  Coins01Icon
} from "hugeicons-react";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Exo } from 'next/font/google';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import CustomDatePicker from '@/components/CustomDatePicker';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { NETWORKS } from '../create-savings/lib/createSavingsLogic';

const exo = Exo({ subsets: ['latin'], display: 'swap', variable: '--font-exo' });

interface GroupMember {
  wallet: string;
  role: string;
  contributed: number;
  joinedAt: string;
  savvyName?: string | null;
}

interface GroupSavings {
  _id: string;
  name: string;
  description: string;
  currentAmount: number;
  targetAmount?: number;
  token: string;
  network: string;
  penalty?: string;
  maturityDate: string | null;
  creatorWallet: string;
  members: GroupMember[];
  status: string;
  createdAt: string;
}

// Logo helper for tokens
function getTokenLogo(tokenSymbol: string) {
  if (!tokenSymbol) return '/coin.png';
  const lower = tokenSymbol.toLowerCase();
  if (lower === 'cusd') return '/cusd.png';
  if (lower === 'cngn') return '/cngn.png';
  if (lower === 'usdglo') return '/usdglo.png';
  if (lower === 'gooddollar' || lower === '$g' || lower === 'g$') return '/$g.png';
  if (lower === 'usdc') return '/usdclogo.png';
  if (lower === 'eth' || lower === 'ethereum') return '/eth.png';
  if (lower === 'usdt') return '/usdt.png';
  if (lower === 'celo') return '/celo.png';
  if (lower === 'bnb' || lower === 'bsc') return '/bsc.png';
  if (lower === 'lisk' || lower === 'lsk') return '/lisk.png';
  return '/coin.png';
}

// Logo helper for networks
function getNetworkLogo(networkName: string) {
  if (!networkName) return '/base-logo.svg';
  const lower = networkName.toLowerCase();
  if (lower.includes('celo')) return '/celo.png';
  if (lower.includes('lisk')) return '/lisk-logo.png';
  if (lower.includes('bsc') || lower.includes('bnb')) return '/bsc.png';
  if (lower.includes('avalanche') || lower.includes('avax')) return '/avalanche-logo.svg';
  return '/base-logo.svg';
}

export default function GroupSavingsPage() {
  const { address } = useAccount();

  const [groups, setGroups] = useState<GroupSavings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupSavings | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Create form state
  const [formName, setFormName] = useState('');
  const [formToken, setFormToken] = useState('USDC');
  const [formChain, setFormChain] = useState('Base');
  const [formPenalty, setFormPenalty] = useState('10%');
  const [formTargetAmount, setFormTargetAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMaturity, setFormMaturity] = useState('');
  const [formInvites, setFormInvites] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showFormCalendar, setShowFormCalendar] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Add member state
  const [newInvites, setNewInvites] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const fetchGroups = useCallback(async () => {
    if (!address) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`/api/savings/group?walletAddress=${address}`);
      if (res.ok) {
        const data = await res.json();
        setGroups(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Handle URL join query param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const joinGroupId = urlParams.get('join');
      if (joinGroupId && groups.length > 0) {
        const target = groups.find(g => g._id === joinGroupId);
        if (target) {
          setSelectedGroup(target);
        }
      }
    }
  }, [groups]);

  const selectedNetworkConfig = useMemo(() => {
    return NETWORKS.find(n => n.name.toLowerCase() === formChain.toLowerCase()) || NETWORKS[0];
  }, [formChain]);

  const availableTokens = useMemo(() => {
    return selectedNetworkConfig ? selectedNetworkConfig.tokens.map((t: any) => t.symbol) : ['USDC'];
  }, [selectedNetworkConfig]);

  useEffect(() => {
    if (availableTokens.length > 0 && !availableTokens.includes(formToken)) {
      setFormToken(availableTokens[0]);
    }
  }, [formChain, availableTokens, formToken]);

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error('Vault name is required');
      return;
    }
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }
    setIsCreating(true);
    try {
      const invitedSavvyNames = formInvites
        .split(',')
        .map(s => s.trim().replace(/^@/, ''))
        .filter(Boolean);

      const res = await fetch('/api/savings/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          token: formToken,
          description: formDescription,
          targetAmount: formTargetAmount ? parseFloat(formTargetAmount) : 0,
          maturityDate: formMaturity || null,
          creatorWallet: address,
          invitedSavvyNames,
          network: formChain,
          penalty: formPenalty
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Shared Vault created successfully!');
        setShowCreateModal(false);
        setFormName('');
        setFormDescription('');
        setFormTargetAmount('');
        setFormMaturity('');
        setFormInvites('');
        setCurrentStep(1);
        fetchGroups();
      } else {
        toast.error(data.error || 'Failed to create group');
      }
    } catch {
      toast.error('An unexpected error occurred while creating vault');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!address) return;
    if (!window.confirm('Are you sure you want to delete this Shared Vault? Individual blockchain savings plans will remain completely safe.')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/savings/group?groupId=${groupId}&walletAddress=${address}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Shared Vault deleted successfully');
        setSelectedGroup(null);
        fetchGroups();
      } else {
        toast.error(data.error || 'Failed to delete group');
      }
    } catch {
      toast.error('An error occurred while deleting');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!address) return;
    if (!window.confirm('Are you sure you want to leave this Shared Vault?')) return;

    setIsLeaving(true);
    try {
      const res = await fetch('/api/savings/group', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          walletAddress: address,
          action: 'leave'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Left the vault successfully');
        setSelectedGroup(null);
        fetchGroups();
      } else {
        toast.error(data.error || 'Failed to leave vault');
      }
    } catch {
      toast.error('An error occurred while leaving vault');
    } finally {
      setIsLeaving(false);
    }
  };

  const handleInviteMembers = async () => {
    if (!newInvites.trim() || !address || !selectedGroup) return;
    setIsInviting(true);
    try {
      const invitedSavvyNames = newInvites
        .split(',')
        .map(s => s.trim().replace(/^@/, ''))
        .filter(Boolean);

      const res = await fetch('/api/savings/group', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroup._id,
          walletAddress: address,
          action: 'invite',
          invitedSavvyNames
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Members invited successfully!');
        setNewInvites('');
        fetchGroups();

        // Refresh selected group
        const updatedRes = await fetch(`/api/savings/group?walletAddress=${address}`);
        if (updatedRes.ok) {
          const updatedGroups = await updatedRes.json();
          const refreshedGroup = updatedGroups.find((g: any) => g._id === selectedGroup._id);
          if (refreshedGroup) setSelectedGroup(refreshedGroup);
        }
      } else {
        toast.error(data.error || 'Failed to invite members');
      }
    } catch {
      toast.error('An error occurred while inviting members');
    } finally {
      setIsInviting(false);
    }
  };

  const copyShareLink = (groupId: string) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/dashboard/group-savings?join=${groupId}`;
      navigator.clipboard.writeText(url);
      toast.success('Vault link copied to clipboard!');
    }
  };

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q) ||
      g.network?.toLowerCase().includes(q) ||
      g.token?.toLowerCase().includes(q)
    );
  }, [groups, searchQuery]);

  return (
    <div className={`${exo.variable} font-sans max-w-5xl mx-auto pb-16`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] md:text-4xl font-instrument text-gray-900 dark:text-white tracking-tight mb-1 leading-none">Shared Vaults</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Save together with family and friends toward shared crypto goals.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-xl shadow-sm transition-all w-full sm:w-auto text-sm cursor-pointer active:scale-[0.98]"
        >
          <PlusSignIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
          <span>Create Shared Vault</span>
        </button>
      </div>

      {/* Search Filter when multiple groups exist */}
      {groups.length > 3 && (
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your shared vaults..."
            className="w-full sm:max-w-md px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 transition-all shadow-xs"
          />
        </div>
      )}

      {/* Groups Grid / Loading / Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-[#121212]/60 backdrop-blur-xl rounded-[24px] h-56 animate-pulse border border-gray-100 dark:border-white/5" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="relative overflow-hidden text-center py-24 px-6 sm:px-10 bg-white dark:bg-[#121212]/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none flex flex-col items-center justify-center min-h-[420px]">
          {/* Premium Background Glow Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[600px] pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#81D7B4]/20 dark:bg-[#81D7B4]/10 rounded-full blur-[80px]" />
            <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-[60px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-[#2D5A4A]/10 dark:bg-[#2D5A4A]/20 rounded-full blur-[70px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-md">
            <div className="w-16 h-16 bg-[#81D7B4]/15 dark:bg-[#81D7B4]/25 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <UserMultipleIcon className="w-8 h-8 text-[#81D7B4]" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-instrument text-gray-900 dark:text-white tracking-tight mb-3">No Shared Vaults Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
              Collaborate with your friends, family, or community. Create your first vault and invite members by their Savvy Name or wallet address!
            </p>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-7 py-3.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-xl transition-all shadow-sm text-sm cursor-pointer active:scale-[0.98]"
            >
              <PlusSignIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
              <span>Create Your First Shared Vault</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map(group => {
            const hasTarget = group.targetAmount && group.targetAmount > 0;
            const progress = hasTarget ? Math.min((group.currentAmount / group.targetAmount!) * 100, 100) : 100;

            return (
              <motion.div
                key={group._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedGroup(group)}
                className="bg-white dark:bg-[#121212]/60 backdrop-blur-xl rounded-[24px] border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none p-6 hover:shadow-xl dark:hover:bg-white/[0.04] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden min-h-[250px]"
              >
                {/* Background Watermark Token Logo */}
                <div className="absolute -right-6 -bottom-6 w-36 h-36 opacity-[0.03] dark:opacity-[0.05] pointer-events-none grayscale dark:grayscale-0 mix-blend-multiply dark:mix-blend-screen z-0">
                  <Image src={getTokenLogo(group.token)} alt={group.token} fill className="object-contain" />
                </div>

                {/* Card Header: Title & Network Badge */}
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="min-w-0 flex-1 pr-3">
                    <h3 className="text-xl font-instrument text-gray-900 dark:text-white tracking-tight truncate leading-tight">{group.name}</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-wider line-clamp-1">{group.description || 'Shared Savings Vault'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-white/5">
                    <Image src={getNetworkLogo(group.network)} alt={group.network} width={14} height={14} className="object-contain" />
                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{group.network}</span>
                  </div>
                </div>

                {/* Stats & Progress */}
                <div className="my-auto py-2 relative z-10">
                  <div className="flex justify-between items-baseline text-[11px] font-bold uppercase tracking-wider mb-2">
                    <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <Coins01Icon className="w-3.5 h-3.5 text-[#81D7B4]" />
                      Total Saved
                    </span>
                    <div className="text-right">
                      <span className="text-gray-900 dark:text-white font-instrument text-xl leading-none">
                        ${group.currentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-sans ml-1">{group.token}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-100 dark:bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#81D7B4] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {hasTarget && (
                    <div className="flex justify-between text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-1.5">
                      <span>{progress.toFixed(0)}% goal reached</span>
                      <span>Target: ${group.targetAmount?.toLocaleString()} {group.token}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer: Members & Target Date */}
                <div className="flex items-center justify-between relative z-10 pt-3 border-t border-gray-50 dark:border-white/5 mt-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 3).map((m, i) => (
                        <div key={i} className="w-7 h-7 rounded-full bg-[#81D7B4]/20 border-2 border-white dark:border-[#121212] flex items-center justify-center text-[9px] font-bold text-[#2D5A4A] dark:text-[#81D7B4]">
                          {m.savvyName ? m.savvyName.slice(0, 2).toUpperCase() : m.wallet.slice(2, 4).toUpperCase()}
                        </div>
                      ))}
                      {group.members.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#1a1a1a] border-2 border-white dark:border-[#121212] flex items-center justify-center text-[9px] font-bold text-gray-500 dark:text-gray-400">
                          +{group.members.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                      {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  {group.maturityDate && (
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-bold flex items-center gap-1 uppercase tracking-wider">
                      <Calendar01Icon className="w-3.5 h-3.5 text-[#81D7B4]" />
                      {new Date(group.maturityDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[100] p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white/95 dark:bg-[#121212]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.15)] dark:shadow-none border border-white/50 dark:border-white/10 w-full max-w-xl overflow-hidden relative"
            >
              {/* Premium Background Effects */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#81D7B4]/20 dark:bg-[#81D7B4]/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-[60px]" />
              </div>

              <div className="p-6 sm:p-8 relative z-10 flex flex-col h-[590px]">
                {/* Modal Top: Icon, Close Button, Progress Steps */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#81D7B4]/20 flex items-center justify-center text-[#2D5A4A] dark:text-[#81D7B4]">
                    <UserMultipleIcon className="w-6 h-6" />
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setTimeout(() => setCurrentStep(1), 300);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100/50 dark:bg-white/5 hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 z-50 cursor-pointer"
                  >
                    <Cancel01Icon className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-5 shrink-0">
                  <h2 className="text-3xl font-instrument text-gray-900 dark:text-white tracking-tight leading-none mb-1.5">Create Shared Vault</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Step {currentStep} of 4</p>
                  <div className="flex gap-2 mt-3">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${currentStep >= step ? 'bg-[#81D7B4]' : 'bg-gray-200 dark:bg-white/10'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Form Steps Content */}
                <div className="flex-1 relative overflow-visible">
                  <AnimatePresence mode="wait">
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 absolute inset-0 overflow-y-auto pr-1"
                      >
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">Vault Name *</label>
                          <input
                            value={formName}
                            onChange={e => setFormName(e.target.value)}
                            placeholder="e.g. Dream Vacation Fund, Family Pool"
                            className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 focus:border-[#81D7B4] bg-white dark:bg-black/20 focus:bg-white dark:focus:bg-black/40 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all focus:ring-4 focus:ring-[#81D7B4]/10 shadow-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">Target Goal Amount (Optional)</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={formTargetAmount}
                            onChange={e => setFormTargetAmount(e.target.value)}
                            placeholder="e.g. 1000"
                            className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 focus:border-[#81D7B4] bg-white dark:bg-black/20 focus:bg-white dark:focus:bg-black/40 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all focus:ring-4 focus:ring-[#81D7B4]/10 shadow-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">Description</label>
                          <textarea
                            value={formDescription}
                            onChange={e => setFormDescription(e.target.value)}
                            placeholder="What is this shared vault for?"
                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 focus:border-[#81D7B4] bg-white dark:bg-black/20 focus:bg-white dark:focus:bg-black/40 outline-none text-sm font-medium text-gray-900 dark:text-white transition-all focus:ring-4 focus:ring-[#81D7B4]/10 resize-none h-24 shadow-xs"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Blockchain, Currency & Penalty */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3.5 absolute inset-0 z-20"
                      >
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="space-y-1.5 z-30">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">Network *</label>
                            <CustomSelect
                              value={formChain}
                              onChange={setFormChain}
                              options={NETWORKS.filter(n => !n.isComingSoon).map(n => ({
                                label: n.name,
                                value: n.name,
                                icon: (
                                  <div className="w-5 h-5 relative shrink-0">
                                    <Image src={getNetworkLogo(n.name)} alt={n.name} fill className="object-contain" />
                                  </div>
                                )
                              }))}
                            />
                          </div>

                          <div className="space-y-1.5 z-30">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">Currency *</label>
                            <CustomSelect
                              value={formToken}
                              onChange={setFormToken}
                              options={availableTokens.map((t: string) => ({
                                label: t,
                                value: t,
                                icon: (
                                  <div className="w-5 h-5 relative shrink-0">
                                    <Image src={getTokenLogo(t)} alt={t} fill className="object-contain" />
                                  </div>
                                )
                              }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5 z-20">
                          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">Early Withdrawal Penalty *</label>
                          <CustomSelect
                            value={formPenalty}
                            onChange={setFormPenalty}
                            options={[
                              { label: '10% Penalty (Flexible)', value: '10%' },
                              { label: '20% Penalty (Standard)', value: '20%' },
                              { label: '30% Penalty (Strict)', value: '30%' }
                            ]}
                          />
                        </div>

                        <div className="space-y-1.5 relative z-10">
                          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">Target Date (Optional)</label>
                          <button
                            type="button"
                            onClick={() => setShowFormCalendar(!showFormCalendar)}
                            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 hover:bg-gray-50 dark:hover:bg-black/40 hover:border-[#81D7B4] focus:bg-white dark:focus:bg-black/40 focus:ring-4 focus:ring-[#81D7B4]/10 transition-all text-sm font-bold shadow-xs outline-none cursor-pointer"
                          >
                            <span className={formMaturity ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 font-medium'}>
                              {formMaturity ? format(parseISO(formMaturity), 'MMM d, yyyy') : 'Select Date'}
                            </span>
                            <Calendar01Icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Invites */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 absolute inset-0 flex flex-col justify-center"
                      >
                        <div className="text-center mb-4">
                          <div className="w-14 h-14 bg-[#81D7B4]/20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#2D5A4A] dark:text-[#81D7B4]">
                            <UserAdd01Icon className="w-7 h-7" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Invite Members</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Enter Savvy Names or wallet addresses separated by commas.</p>
                        </div>

                        <div className="relative z-10">
                          <input
                            value={formInvites}
                            onChange={e => setFormInvites(e.target.value)}
                            placeholder="@alice, @bob, 0x123..."
                            className="w-full px-4 py-4 rounded-2xl border border-gray-200 dark:border-white/10 focus:border-[#81D7B4] bg-white dark:bg-black/20 focus:bg-white dark:focus:bg-black/40 outline-none text-sm font-bold text-gray-900 dark:text-white shadow-xs transition-all focus:ring-4 focus:ring-[#81D7B4]/20 text-center"
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 text-center">You can also invite additional members anytime after creating the vault.</p>
                      </motion.div>
                    )}

                    {/* Step 4: Summary & Confirm */}
                    {currentStep === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex flex-col"
                      >
                        <div className="flex flex-col items-center justify-center pt-0 pb-3 border-b border-gray-100 dark:border-white/5 shrink-0">
                          <h3 className="text-xl font-instrument font-bold text-gray-900 dark:text-white text-center px-4 truncate w-full">{formName || 'Untitled Vault'}</h3>
                          <p className="text-xs text-gray-500 text-center mt-1 px-6 line-clamp-1 leading-relaxed">{formDescription || 'Shared crypto savings vault'}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2.5 pt-3 px-1 pb-0 custom-scrollbar">
                          {/* Setup Details */}
                          <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-3.5 border border-gray-100 dark:border-white/5 shadow-xs space-y-2.5">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-white/5">
                              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Asset & Chain</span>
                              <div className="flex items-center gap-1.5">
                                <div className="flex items-center gap-1.5 bg-white dark:bg-black/40 px-2 py-1 rounded-lg border border-gray-100 dark:border-white/5 shadow-xs">
                                  <Image src={getTokenLogo(formToken)} alt={formToken} width={14} height={14} className="object-contain" />
                                  <span className="text-xs font-bold text-gray-900 dark:text-white">{formToken}</span>
                                </div>
                                <span className="text-gray-400 text-[10px] font-bold uppercase">on</span>
                                <div className="flex items-center gap-1.5 bg-white dark:bg-black/40 px-2 py-1 rounded-lg border border-gray-100 dark:border-white/5 shadow-xs">
                                  <Image src={getNetworkLogo(formChain)} alt={formChain} width={14} height={14} className="object-contain" />
                                  <span className="text-xs font-bold text-gray-900 dark:text-white">{formChain}</span>
                                </div>
                              </div>
                            </div>

                            {formTargetAmount && (
                              <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-white/5">
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Target Goal</span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                  ${parseFloat(formTargetAmount).toLocaleString()} {formToken}
                                </span>
                              </div>
                            )}

                            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-white/5">
                              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Target Date</span>
                              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                {formMaturity ? format(parseISO(formMaturity), 'MMM d, yyyy') : 'No target date'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Early Penalty</span>
                              <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-2 py-0.5 rounded-md">
                                {formPenalty}
                              </span>
                            </div>
                          </div>

                          {/* Members details */}
                          <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-3.5 border border-gray-100 dark:border-white/5 shadow-xs">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Invited Members</span>
                              <span className="text-[10px] font-bold bg-[#81D7B4]/20 text-[#2D5A4A] dark:text-[#81D7B4] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                {formInvites ? formInvites.split(',').filter(i => i.trim()).length : 0} Invites
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-[60px] overflow-y-auto custom-scrollbar">
                              {formInvites && formInvites.trim() ? (
                                formInvites.split(',').filter(i => i.trim()).map((invite, i) => (
                                  <div key={i} className="text-xs font-bold px-2.5 py-1 bg-gray-100 dark:bg-white/5 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-white/10">
                                    {invite.trim()}
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-gray-400 italic">No initial invites (you can invite members later).</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Modal Footer Controls */}
                <div className="flex gap-3 sm:gap-4 mt-auto pt-4 shrink-0 z-10 border-t border-gray-100 dark:border-white/10">
                  {currentStep > 1 && (
                    <button
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="flex-1 py-3 bg-gray-100/60 dark:bg-white/5 hover:bg-gray-200/60 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors border border-gray-200/50 dark:border-white/10 cursor-pointer text-sm"
                    >
                      Back
                    </button>
                  )}
                  {currentStep === 1 && (
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setTimeout(() => setCurrentStep(1), 300);
                      }}
                      className="flex-1 py-3 bg-gray-100/60 dark:bg-white/5 hover:bg-gray-200/60 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors border border-gray-200/50 dark:border-white/10 cursor-pointer text-sm"
                    >
                      Cancel
                    </button>
                  )}
                  {currentStep < 4 ? (
                    <button
                      onClick={() => {
                        if (currentStep === 1 && !formName.trim()) {
                          toast.error('Vault name is required');
                          return;
                        }
                        setCurrentStep(prev => prev + 1);
                      }}
                      className="flex-[2] py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleCreate}
                      disabled={isCreating}
                      className="flex-[2] py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold text-sm rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:transform-none active:scale-[0.98] cursor-pointer"
                    >
                      {isCreating ? 'Creating Vault...' : 'Create Vault'}
                    </button>
                  )}
                </div>

                {/* Calendar Modal */}
                <AnimatePresence>
                  {showFormCalendar && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowFormCalendar(false)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden w-full max-w-[320px] sm:max-w-[400px]"
                      >
                        <div className="p-4 bg-[#81D7B4]/10 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Select Target Date</h3>
                          <button onClick={() => setShowFormCalendar(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer">
                            <Cancel01Icon className="w-5 h-5" />
                          </button>
                        </div>
                        <CustomDatePicker
                          selectedDate={formMaturity ? parseISO(formMaturity) : null}
                          onSelectDate={(date) => {
                            setFormMaturity(format(date, 'yyyy-MM-dd'));
                            setShowFormCalendar(false);
                          }}
                        />
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shared Vault Detail & Management Modal */}
      <AnimatePresence>
        {selectedGroup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#121212] rounded-[28px] shadow-2xl border border-gray-100 dark:border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar relative"
            >
              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl sm:text-3xl font-instrument text-gray-900 dark:text-white tracking-tight">{selectedGroup.name}</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#81D7B4]/15 text-[#2D5A4A] dark:text-[#81D7B4] uppercase tracking-wider">
                        {selectedGroup.status}
                      </span>
                    </div>
                    {selectedGroup.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{selectedGroup.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedGroup(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 cursor-pointer"
                  >
                    <Cancel01Icon className="w-4 h-4" />
                  </button>
                </div>

                {/* Financial Summary Card */}
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 mb-6 border border-gray-100 dark:border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-black/30 border border-gray-100 dark:border-white/10 flex items-center justify-center">
                        <Image src={getTokenLogo(selectedGroup.token)} alt={selectedGroup.token} width={18} height={18} className="object-contain" />
                      </div>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{selectedGroup.token} on {selectedGroup.network}</span>
                    </div>

                    <button
                      onClick={() => copyShareLink(selectedGroup._id)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-black/40 hover:bg-gray-100 dark:hover:bg-black/60 rounded-lg text-xs font-bold text-[#81D7B4] border border-[#81D7B4]/20 transition-colors cursor-pointer"
                    >
                      <Share01Icon className="w-3.5 h-3.5" />
                      <span>Share Link</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total Vault Savings</p>
                      <p className="text-3xl font-instrument text-gray-900 dark:text-white leading-none">
                        ${selectedGroup.currentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-base font-sans font-semibold text-gray-400 dark:text-gray-500 ml-1.5">{selectedGroup.token}</span>
                      </p>
                    </div>

                    {selectedGroup.targetAmount && selectedGroup.targetAmount > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                          <span>Target Progress</span>
                          <span>{((selectedGroup.currentAmount / selectedGroup.targetAmount) * 100).toFixed(0)}% (${selectedGroup.targetAmount.toLocaleString()} Goal)</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#81D7B4] rounded-full"
                            style={{ width: `${Math.min((selectedGroup.currentAmount / selectedGroup.targetAmount) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Deposit to Vault CTA */}
                    <button
                      onClick={() => {
                        const params = new URLSearchParams({
                          groupId: selectedGroup._id,
                          currency: selectedGroup.token,
                          chain: selectedGroup.network.toLowerCase()
                        });
                        window.location.href = `/dashboard/create-savings?${params.toString()}`;
                      }}
                      className="w-full py-3.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] text-sm"
                    >
                      <PlusSignIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                      <span>Save for this Vault</span>
                    </button>
                  </div>
                </div>

                {/* Members Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <UserMultipleIcon className="w-4 h-4 text-[#81D7B4]" />
                      <span>Members ({selectedGroup.members.length})</span>
                    </h3>
                  </div>

                  {/* Add Member Input */}
                  <div className="flex gap-2 mb-4">
                    <input
                      value={newInvites}
                      onChange={e => setNewInvites(e.target.value)}
                      placeholder="Add @savvyName or 0x wallet..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 focus:border-[#81D7B4] outline-none text-xs font-bold text-gray-900 dark:text-white shadow-xs transition-all focus:ring-2 focus:ring-[#81D7B4]/10 bg-white dark:bg-[#121212]"
                    />
                    <button
                      onClick={handleInviteMembers}
                      disabled={isInviting || !newInvites.trim()}
                      className="px-4 py-2.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isInviting ? 'Inviting...' : 'Invite'}
                    </button>
                  </div>

                  {/* Members Scroll List */}
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                    {selectedGroup.members.map((member, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-transparent dark:border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#81D7B4]/20 flex items-center justify-center text-xs font-bold text-[#2D5A4A] dark:text-[#81D7B4]">
                            {member.savvyName ? member.savvyName.slice(0, 2).toUpperCase() : member.wallet.slice(2, 4).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                              {member.savvyName ? `@${member.savvyName}` : `${member.wallet.slice(0, 6)}...${member.wallet.slice(-4)}`}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">{member.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            ${member.contributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="text-[10px] text-gray-400 ml-1">{selectedGroup.token}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelectedGroup(null)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl transition-colors border border-transparent dark:border-white/10 cursor-pointer"
                  >
                    Close
                  </button>

                  {/* Creator delete vs Member leave */}
                  {selectedGroup.creatorWallet.toLowerCase() === address?.toLowerCase() ? (
                    <button
                      onClick={() => handleDelete(selectedGroup._id)}
                      disabled={isDeleting}
                      className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:text-red-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-red-200/50 dark:border-red-900/40 disabled:opacity-50 cursor-pointer"
                    >
                      <Delete02Icon className="w-4 h-4" />
                      <span>{isDeleting ? 'Deleting...' : 'Delete Vault'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLeaveGroup(selectedGroup._id)}
                      disabled={isLeaving}
                      className="flex-1 py-3 bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 dark:text-amber-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-amber-200/50 dark:border-amber-900/40 disabled:opacity-50 cursor-pointer"
                    >
                      <Logout01Icon className="w-4 h-4" />
                      <span>{isLeaving ? 'Leaving...' : 'Leave Vault'}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
