'use client';

import { PlusSignIcon, UserMultipleIcon, Cancel01Icon, UserAdd01Icon, BarChartIcon, Calendar01Icon, Delete02Icon, ArrowDown01Icon } from "hugeicons-react";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exo } from 'next/font/google';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import CustomDatePicker from '@/components/CustomDatePicker';

const exo = Exo({ subsets: ['latin'], display: 'swap', variable: '--font-exo' });

interface GroupMember {
  wallet: string;
  role: string;
  contributed: number;
  joinedAt: string;
  savvyName?: string | null;
}

import { NETWORKS } from '../create-savings/lib/createSavingsLogic';

interface GroupSavings {
  _id: string;
  name: string;
  description: string;
  currentAmount: number;
  token: string;
  network: string;
  maturityDate: string | null;
  creatorWallet: string;
  members: GroupMember[];
  status: string;
  createdAt: string;
}

export default function GroupSavingsPage() {
  const { address: evmAddress } = useAccount();
  const { publicKey } = useWallet();
  const address = publicKey?.toBase58() || evmAddress;
  const [groups, setGroups] = useState<GroupSavings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupSavings | null>(null);

  // Create form state
  const [formName, setFormName] = useState('');
  const [formToken, setFormToken] = useState('USDC');
  const [formChain, setFormChain] = useState('Base');
  const [formPenalty, setFormPenalty] = useState('10%');
  const [formDescription, setFormDescription] = useState('');
  const [formMaturity, setFormMaturity] = useState('');
  const [formInvites, setFormInvites] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFormCalendar, setShowFormCalendar] = useState(false);

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
        setGroups(data);
      }
    } catch {
      console.error('Failed to fetch groups');
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

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
    if (!formName.trim()) { toast.error('Name is required'); return; }
    setIsCreating(true);
    try {
      const invitedSavvyNames = formInvites.split(',').map(s => s.trim().replace('@', '')).filter(Boolean);
      const res = await fetch('/api/savings/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName, token: formToken, description: formDescription,
          maturityDate: formMaturity || null, creatorWallet: address, invitedSavvyNames, network: formChain, penalty: formPenalty
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Group created!');
        setShowCreateModal(false);
        setFormName(''); setFormDescription(''); setFormMaturity(''); setFormInvites('');
        fetchGroups();
      } else {
        toast.error(data.error || 'Failed to create group');
      }
    } catch { toast.error('An error occurred'); } finally { setIsCreating(false); }
  };

  const handleDelete = async (groupId: string) => {
    if (!address) return;
    if (!window.confirm('Are you sure you want to delete this group? This will only delete the group record; individual savings will remain intact.')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/savings/group?groupId=${groupId}&walletAddress=${address}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Group deleted successfully');
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

  const handleInviteMembers = async () => {
    if (!newInvites.trim() || !address || !selectedGroup) return;
    setIsInviting(true);
    try {
      const invitedSavvyNames = newInvites.split(',').map(s => s.trim().replace('@', '')).filter(Boolean);
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
        // Update selected group to show new members
        const updatedRes = await fetch(`/api/savings/group?walletAddress=${address}`);
        if (updatedRes.ok) {
          const updatedGroups = await updatedRes.json();
          const refreshedGroup = updatedGroups.find((g: any) => g._id === selectedGroup._id);
          if (refreshedGroup) setSelectedGroup(refreshedGroup);
        }
      } else {
        toast.error(data.error || 'Failed to invite members');
      }
    } catch (e) {
      toast.error('An error occurred while inviting members');
    } finally {
      setIsInviting(false);
    }
  };



  return (
    <div className={`${exo.variable} font-sans max-w-5xl mx-auto`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-1">Group Savings</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Save together with family and friends toward shared goals.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-2xl shadow-[0_4px_15px_rgba(129,215,180,0.3)] transition-all w-full sm:w-auto">
          <span>Create Group</span>
        </button>
      </div>

      {/* Groups ListView */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl h-40 animate-pulse border border-gray-100" />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20 px-6 sm:px-10 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="w-72 h-72 mx-auto mb-8 flex justify-center items-center">
            <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
              {/* Organic Blob Background */}
              <path d="M195.5 142.5C216.5 107 197.5 59.5 159 40.5C120.5 21.5 73.5 31.5 48 64.5C22.5 97.5 18.5 153.5 44 181.5C69.5 209.5 174.5 178 195.5 142.5Z" fill="#81D7B4" fillOpacity="0.15" />
              <path d="M178.5 163C203 129 196 82 165 59C134 36 93.5 35 63 56C32.5 77 12 120 28 153C44 186 154 197 178.5 163Z" fill="#81D7B4" fillOpacity="0.1" />

              {/* Piggy Bank Body */}
              <path d="M165 130C165 102.386 142.614 80 115 80C95.5393 80 78.6756 91.1219 70.3644 107.82C66.5262 107.284 62.5931 107 58.625 107C53.8615 107 50 110.861 50 115.625V135C50 139.761 53.8615 143.625 58.625 143.625H62.2155C65.5786 160.854 78.1147 174.887 95 179.883V185C95 187.761 97.2386 190 100 190H110C112.761 190 115 187.761 115 185V181.763C121.579 181.763 128 180.75 134 178.892V185C134 187.761 136.239 190 139 190H149C151.761 190 154 187.761 154 185V172.935C160.835 161.767 165 146.402 165 130Z" fill="#81D7B4" />

              {/* Piggy Bank Ear */}
              <path d="M120 81L135 70L142 86C136 80 128 78 120 81Z" fill="#6BC4A0" />

              {/* Piggy Bank Snout Detail */}
              <ellipse cx="55" cy="125" rx="4" ry="8" fill="#6BC4A0" />
              <circle cx="55" cy="122" r="1.5" fill="#2D5A4A" />
              <circle cx="55" cy="128" r="1.5" fill="#2D5A4A" />

              {/* Piggy Bank View */}
              <circle cx="85" cy="115" r="4" fill="#2D5A4A" />

              {/* Piggy Bank Coin Slot */}
              <rect x="105" y="76" width="24" height="6" rx="3" fill="#2D5A4A" />

              {/* Dollar Coin 1 dropping */}
              <circle cx="117" cy="52" r="16" fill="#FDE047" />
              <path d="M117 40V64M112 47C112 44.7909 114.239 43 117 43C119.761 43 122 44.7909 122 47C122 50 112 53 112 57C112 59.2091 114.239 61 117 61C119.761 61 122 59.2091 122 57" stroke="#CA8A04" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Dollar Coin 2 */}
              <circle cx="150" cy="35" r="11" fill="#FDE047" fillOpacity="0.9" />
              <path d="M150 27V43M146 32C146 30.5 148 29.5 150 29.5C152 29.5 154 30.5 154 32C154 34 146 36 146 38.5C146 40 148 41 150 41C152 41 154 40 154 38.5" stroke="#CA8A04" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Group of UserMultipleIcon / People Icons */}

              {/* Left Person */}
              <circle cx="45" cy="95" r="12" fill="#E8F7F0" stroke="#81D7B4" strokeWidth="2" />
              <path d="M25 125C25 113.954 33.9543 105 45 105C56.0457 105 65 113.954 65 125H25Z" fill="#E8F7F0" stroke="#81D7B4" strokeWidth="2" />

              {/* Right Person 1 */}
              <circle cx="185" cy="105" r="14" fill="#E8F7F0" stroke="#81D7B4" strokeWidth="2" />
              <path d="M160 140C160 126.193 171.193 115 185 115C198.807 115 210 126.193 210 140H160Z" fill="#E8F7F0" stroke="#81D7B4" strokeWidth="2" />

              {/* Right Person 2 */}
              <circle cx="210" cy="85" r="10" fill="#F8FAF9" stroke="#A7E4CB" strokeWidth="2" />
              <path d="M195 115C195 106.716 201.716 100 210 100C218.284 100 225 106.716 225 115H195Z" fill="#F8FAF9" stroke="#A7E4CB" strokeWidth="2" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">No Group Savings Yet</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">Create your first group and invite family or friends by their Savvy Name to start saving together!</p>
          <button onClick={() => setShowCreateModal(true)} className="mx-auto w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-xl transition-colors">
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {groups.map(group => (
            <motion.div
              key={group._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedGroup(group)}
              className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6 hover:shadow-[0_10px_40px_rgba(129,215,180,0.12)] hover:border-[#81D7B4]/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">{group.name}</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{group.description || 'No description'}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${group.status === 'active' ? 'bg-[#81D7B4]/10 text-[#81D7B4]' : 'bg-gray-100 text-gray-500'}`}>
                  {group.status}
                </span>
              </div>

              {/* Stats */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-500 uppercase tracking-wider">Total Saved</span>
                  <span className="text-[#81D7B4]">{group.currentAmount.toLocaleString()} {group.token}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#81D7B4] rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              {/* Members */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 4).map((m, i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-[#81D7B4]/20 border-2 border-white flex items-center justify-center text-[9px] font-black text-[#2D5A4A]">
                        {m.savvyName ? m.savvyName.slice(0, 2).toUpperCase() : m.wallet.slice(2, 4).toUpperCase()}
                      </div>
                    ))}
                    {group.members.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-500">
                        +{group.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{group.members.length} member{group.members.length !== 1 ? 's' : ''}</span>
                </div>
                {group.maturityDate && (
                  <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                    <Calendar01Icon className="w-3 h-3" />
                    {new Date(group.maturityDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="p-5 sm:p-10">
                {/* Modal Header */}
                <div className="flex items-start justify-between pb-5 sm:pb-6 border-b border-gray-100 mb-6 sm:mb-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight text-center sm:text-left">Create Group</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1.5 text-center sm:text-left">Set up a shared savings goal and invite friends.</p>
                  </div>
                  <button onClick={() => setShowCreateModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900">
                    <Cancel01Icon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  {/* Step 1: Details */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2.5">
                      <span className="w-6 h-6 flex-shrink-0 rounded-full bg-[#81D7B4]/20 text-[#2D5A4A] flex items-center justify-center text-xs">1</span>
                      Group Details
                    </h3>
                    <div className="space-y-3.5 sm:pl-8">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">Name</label>
                        <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Vacation Fund" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#81D7B4] bg-gray-50/50 focus:bg-white outline-none text-sm font-bold text-gray-900 transition-all focus:ring-4 focus:ring-[#81D7B4]/10" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">Description</label>
                        <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="What are you saving for?" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#81D7B4] bg-gray-50/50 focus:bg-white outline-none text-sm font-medium text-gray-900 transition-all focus:ring-4 focus:ring-[#81D7B4]/10 resize-none h-20" />
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Step 2: Parameters */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2.5">
                      <span className="w-6 h-6 flex-shrink-0 rounded-full bg-[#81D7B4]/20 text-[#2D5A4A] flex items-center justify-center text-xs">2</span>
                      Parameters
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:pl-8">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">Network *</label>
                        <div className="relative">
                          <select value={formChain} onChange={e => setFormChain(e.target.value)} className="w-full px-4 py-3.5 appearance-none rounded-xl border border-gray-200 focus:border-[#81D7B4] bg-gray-50/50 focus:bg-white outline-none text-sm font-bold text-gray-900 transition-all focus:ring-4 focus:ring-[#81D7B4]/10 cursor-pointer">
                            {NETWORKS.filter(n => !n.isComingSoon).map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                          </select>
                          <ArrowDown01Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">Currency *</label>
                        <div className="relative">
                          <select value={formToken} onChange={e => setFormToken(e.target.value)} className="w-full px-4 py-3.5 appearance-none rounded-xl border border-gray-200 focus:border-[#81D7B4] bg-gray-50/50 focus:bg-white outline-none text-sm font-bold text-gray-900 transition-all focus:ring-4 focus:ring-[#81D7B4]/10 cursor-pointer">
                            {availableTokens.map((t: string) => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <ArrowDown01Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">Penalty *</label>
                        <div className="relative">
                          <select value={formPenalty} onChange={e => setFormPenalty(e.target.value)} className="w-full px-4 py-3.5 appearance-none rounded-xl border border-gray-200 focus:border-[#81D7B4] bg-gray-50/50 focus:bg-white outline-none text-sm font-bold text-gray-900 transition-all focus:ring-4 focus:ring-[#81D7B4]/10 cursor-pointer">
                            {['10%', '20%', '30%'].map((p: string) => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <ArrowDown01Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div className="relative space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">Target Date</label>
                        <button
                          type="button"
                          onClick={() => setShowFormCalendar(!showFormCalendar)}
                          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-[#81D7B4] focus:bg-white focus:ring-4 focus:ring-[#81D7B4]/10 transition-all text-sm font-bold shadow-sm outline-none cursor-pointer"
                        >
                          <span className={formMaturity ? 'text-gray-900' : 'text-gray-400 font-medium'}>
                            {formMaturity ? format(parseISO(formMaturity), 'MMM d, yyyy') : 'Select Date'}
                          </span>
                          <Calendar01Icon className="w-5 h-5 text-gray-400" />
                        </button>

                        <AnimatePresence>
                          {showFormCalendar && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowFormCalendar(false)}
                                className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
                              />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-[320px] sm:max-w-[400px]"
                              >
                                <div className="p-4 bg-[#81D7B4]/5 border-b border-gray-100 flex items-center justify-between">
                                  <h3 className="text-sm font-black text-gray-900 tracking-tight">Select Target Date</h3>
                                  <button onClick={() => setShowFormCalendar(false)} className="text-gray-400 hover:text-gray-600">
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
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Step 3: Invites */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2.5">
                      <span className="w-6 h-6 flex-shrink-0 rounded-full bg-[#81D7B4]/20 text-[#2D5A4A] flex items-center justify-center text-xs">3</span>
                      Invite Members
                    </h3>
                    <div className="sm:pl-8">
                      <div className="bg-[#81D7B4]/10 p-5 rounded-2xl border border-[#81D7B4]/30 shadow-sm relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#81D7B4]/20 rounded-full blur-xl pointer-events-none" />

                        <label className="text-sm font-bold text-[#2D5A4A] flex items-center gap-2 mb-3 relative z-10">
                          <UserAdd01Icon className="w-5 h-5" /> Invite by Savvy Name
                        </label>
                        <input value={formInvites} onChange={e => setFormInvites(e.target.value)} placeholder="@alice, @bob" className="w-full px-4 py-3.5 rounded-xl border border-white/60 focus:border-[#81D7B4] outline-none text-sm font-bold text-gray-900 shadow-sm transition-all focus:ring-4 focus:ring-[#81D7B4]/20 bg-white/80 backdrop-blur-sm relative z-10" />
                        <p className="text-xs text-[#2D5A4A]/70 mt-2.5 font-medium relative z-10">Separate multiple Savvy Names with commas.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-10 pt-6 border-t border-gray-100">
                  <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl transition-colors border border-gray-200">Cancel</button>
                  <button onClick={handleCreate} disabled={isCreating} className="flex-[2] py-4 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-black text-lg rounded-2xl shadow-[0_8px_20px_rgba(129,215,180,0.3)] transition-all disabled:opacity-50 disabled:shadow-none disabled:transform-none active:scale-[0.98]">
                    {isCreating ? 'Creating Group...' : 'Create Group'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Group Detail Modal */}
      <AnimatePresence>
        {selectedGroup && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedGroup.name}</h2>
                  <button onClick={() => setSelectedGroup(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                    <Cancel01Icon className="w-5 h-5" />
                  </button>
                </div>

                {selectedGroup.description && <p className="text-sm text-gray-500 mb-4">{selectedGroup.description}</p>}

                {/* Stats */}
                <div className="bg-[#F8FAF9] rounded-2xl p-5 mb-6 border border-[#81D7B4]/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChartIcon className="w-5 h-5 text-[#81D7B4]" />
                      <span className="text-sm font-bold text-gray-700">Group Status</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Savings</p>
                      <p className="text-2xl font-black text-gray-900">{selectedGroup.currentAmount.toLocaleString()} <span className="text-[#81D7B4] text-lg">{selectedGroup.token}</span></p>
                    </div>

                    <button
                      onClick={() => {
                        const params = new URLSearchParams({
                          groupId: selectedGroup._id,
                          currency: selectedGroup.token,
                          chain: selectedGroup.network.toLowerCase()
                        });
                        window.location.href = `/dashboard/create-savings?${params.toString()}`;
                      }}
                      className="w-full py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-xl shadow-[0_4px_12px_rgba(129,215,180,0.2)] transition-all flex items-center justify-center gap-2"
                    >
                      <PlusSignIcon className="w-5 h-5" />
                      Create Savings for Group
                    </button>
                  </div>
                </div>

                {/* Members */}
                <h3 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2 mt-2">
                  <UserMultipleIcon className="w-4 h-4 text-[#81D7B4]" /> Members ({selectedGroup.members.length})
                </h3>
                <div className="flex gap-2 mb-4">
                  <input
                    value={newInvites}
                    onChange={e => setNewInvites(e.target.value)}
                    placeholder="Enter Savvy Names to invite (e.g. @alice, @bob)"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#81D7B4] outline-none text-sm font-medium text-gray-900 shadow-sm transition-all focus:ring-2 focus:ring-[#81D7B4]/10 bg-white"
                  />
                  <button
                    onClick={handleInviteMembers}
                    disabled={isInviting || !newInvites.trim()}
                    className="px-4 py-2.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                  >
                    {isInviting ? 'Inviting...' : 'Invite'}
                  </button>
                </div>
                <div className="space-y-2 mb-6 max-h-[200px] overflow-y-auto pr-2">
                  {selectedGroup.members.map((member, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#81D7B4]/20 flex items-center justify-center text-xs font-black text-[#2D5A4A]">
                          {member.savvyName ? member.savvyName.slice(0, 2).toUpperCase() : member.wallet.slice(2, 4).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{member.savvyName ? `@${member.savvyName}` : `${member.wallet.slice(0, 6)}...${member.wallet.slice(-4)}`}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-900">{member.contributed} <span className="text-xs text-gray-400">{selectedGroup.token}</span></p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setSelectedGroup(null)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                    Close
                  </button>
                  {selectedGroup.creatorWallet.toLowerCase() === address?.toLowerCase() && (
                    <button
                      onClick={() => handleDelete(selectedGroup._id)}
                      disabled={isDeleting}
                      className="flex-1 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-red-100 disabled:opacity-50"
                    >
                      <Delete02Icon className="w-5 h-5" />
                      {isDeleting ? 'Deleting...' : 'Delete Group'}
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
