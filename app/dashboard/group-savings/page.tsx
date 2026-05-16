'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Exo } from 'next/font/google';
import { HiOutlinePlus, HiOutlineUsers, HiOutlineXMark, HiOutlineUserPlus, HiOutlineChartBar, HiOutlineCalendar, HiOutlineTrash, HiOutlineChevronDown } from 'react-icons/hi2';
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
  const { address } = useAccount();
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

  const fetchGroups = useCallback(async () => {
    if (!address) return;
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



  return (
    <div className={`${exo.variable} font-sans max-w-5xl mx-auto`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-1">Group Savings</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Save together with family and friends toward shared goals.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-6 py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-2xl shadow-[0_4px_15px_rgba(129,215,180,0.3)] transition-all">
          <HiOutlinePlus className="w-5 h-5" /> Create Group
        </button>
      </div>

      {/* Groups List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl h-40 animate-pulse border border-gray-100" />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#81D7B4]/10 flex items-center justify-center mx-auto mb-6">
            <HiOutlineUsers className="w-10 h-10 text-[#81D7B4]" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">No Group Savings Yet</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">Create your first group and invite family or friends by their Savvy Name to start saving together!</p>
          <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-xl transition-colors">
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
                    <HiOutlineCalendar className="w-3 h-3" />
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create Group</h2>
                  <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                    <HiOutlineXMark className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Group Details</label>
                    <div className="space-y-3">
                      <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Group Name (e.g. Vacation Fund)" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#81D7B4] outline-none text-sm font-bold text-gray-900 shadow-sm transition-all focus:ring-4 focus:ring-[#81D7B4]/10" />
                      <input value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Brief description..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#81D7B4] outline-none text-sm font-medium text-gray-900 shadow-sm transition-all focus:ring-4 focus:ring-[#81D7B4]/10" />
                    </div>
                  </div>


                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Parameters</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Network *</label>
                      <select value={formChain} onChange={e => setFormChain(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#81D7B4] outline-none text-sm font-bold text-gray-900 bg-white shadow-sm transition-all focus:ring-4 focus:ring-[#81D7B4]/10">
                        {NETWORKS.filter(n => !n.isComingSoon).map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Currency *</label>
                      <select value={formToken} onChange={e => setFormToken(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#81D7B4] outline-none text-sm font-bold text-gray-900 bg-white shadow-sm transition-all focus:ring-4 focus:ring-[#81D7B4]/10">
                        {availableTokens.map((t: string) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Penalty *</label>
                      <select value={formPenalty} onChange={e => setFormPenalty(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#81D7B4] outline-none text-sm font-bold text-gray-900 bg-white shadow-sm transition-all focus:ring-4 focus:ring-[#81D7B4]/10">
                        {['10%', '20%', '30%'].map((p: string) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="relative">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Target Date</label>
                      <button 
                        type="button"
                        onClick={() => setShowFormCalendar(!showFormCalendar)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-[#81D7B4] focus:ring-4 focus:ring-[#81D7B4]/10 transition-all text-sm font-bold text-gray-900 shadow-sm outline-none"
                      >
                        <span className={formMaturity ? 'text-gray-900' : 'text-gray-400 font-medium'}>
                          {formMaturity ? format(parseISO(formMaturity), 'MMM d, yyyy') : 'Select Date'}
                        </span>
                        <HiOutlineCalendar className="w-5 h-5 text-gray-400" />
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
                                  <HiOutlineXMark className="w-5 h-5" />
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



                  <div className="bg-[#81D7B4]/5 p-4 rounded-2xl border border-[#81D7B4]/20">
                    <label className="text-xs font-bold text-[#2D5A4A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <HiOutlineUserPlus className="w-4 h-4" /> Invite Members
                    </label>
                    <input value={formInvites} onChange={e => setFormInvites(e.target.value)} placeholder="Enter Savvy Names: @alice, @bob" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#81D7B4] outline-none text-sm font-medium text-gray-900 shadow-sm transition-all focus:ring-4 focus:ring-[#81D7B4]/10 bg-white" />
                    <p className="text-[11px] text-gray-500 mt-2 font-medium">Use comma separated formatting for multiple invites.</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancel</button>
                  <button onClick={handleCreate} disabled={isCreating} className="flex-1 py-3.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50">
                    {isCreating ? 'Creating...' : 'Create Group'}
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
                    <HiOutlineXMark className="w-5 h-5" />
                  </button>
                </div>

                {selectedGroup.description && <p className="text-sm text-gray-500 mb-4">{selectedGroup.description}</p>}

                {/* Stats */}
                <div className="bg-[#F8FAF9] rounded-2xl p-5 mb-6 border border-[#81D7B4]/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <HiOutlineChartBar className="w-5 h-5 text-[#81D7B4]" />
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
                      <HiOutlinePlus className="w-5 h-5" />
                      Create Savings for Group
                    </button>
                  </div>
                </div>

                {/* Members */}
                <h3 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <HiOutlineUsers className="w-4 h-4 text-[#81D7B4]" /> Members ({selectedGroup.members.length})
                </h3>
                <div className="space-y-2 mb-6">
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
                      <HiOutlineTrash className="w-5 h-5" />
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
