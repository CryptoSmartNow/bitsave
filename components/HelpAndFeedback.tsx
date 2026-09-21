import React, { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { optimizeImage, OptimizedImage } from '@/utils/imageOptimizer';
import { 
  Cancel01Icon, 
  Upload01Icon, 
  SentIcon,
  MessageQuestionIcon,
  PlusSignIcon,
  Search01Icon,
  BookOpen01Icon,
  BubbleChatIcon,
  ArrowRight01Icon,
  Mail01Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
  ArrowLeft01Icon
} from "hugeicons-react";

type FeedbackProps = {
  embedded?: boolean;
  appContext?: string;
};

export default function HelpAndFeedback({ embedded = false, appContext = 'savefi' }: FeedbackProps) {
  const { address: wagmiAddress } = useAccount();
  const { user } = usePrivy();
  const activeAddress = wagmiAddress || user?.wallet?.address;
  const isBizFi = appContext.toLowerCase().includes('bizfi');

  // Core State
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  
  // Navigation State
  // 'list' = showing thread list (on mobile) or thread detail (on desktop)
  // 'create' = showing the new ticket form
  const [viewMode, setViewMode] = useState<'create' | 'list'>('list');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // New Ticket State
  const [category, setCategory] = useState<string>(isBizFi ? 'listing' : 'bug');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [email, setEmail] = useState<string>(user?.email?.address || '');
  const [images, setImages] = useState<OptimizedImage[]>([]);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reply State
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [isReplying, setIsReplying] = useState<{ [key: string]: boolean }>({});

  const fetchHistory = async () => {
    if (!activeAddress) {
      setIsLoadingHistory(false);
      return;
    }
    try {
      const res = await fetch(`/api/feedback?userAddress=${activeAddress}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.feedback || []);
        if (data.feedback && data.feedback.length > 0 && !selectedTicketId) {
          setSelectedTicketId(data.feedback[0]._id);
          setViewMode('list');
        } else if (!data.feedback || data.feedback.length === 0) {
          setViewMode('create');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAddress]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (images.length + files.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    setIsCompressing(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const optimized = await optimizeImage(files[i]);
        setImages((prev) => [...prev, optimized]);
      }
    } catch (error) {
      toast.error('Failed to process some images');
    } finally {
      setIsCompressing(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: activeAddress,
          email,
          category,
          subject,
          message,
          images: images.map(img => img.dataUrl),
          appContext
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Inquiry submitted successfully!');
        setSubject(''); setMessage(''); setImages([]); setCategory(isBizFi ? 'listing' : 'bug');
        await fetchHistory();
        setViewMode('list');
      } else {
        toast.error(data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (ticketId: string) => {
    const text = replyText[ticketId];
    if (!text || !text.trim()) return;
    setIsReplying({ ...isReplying, [ticketId]: true });
    try {
      const res = await fetch('/api/feedback/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId: ticketId, replyMessage: text }),
      });
      if (res.ok) {
        toast.success('Reply sent!');
        setReplyText({ ...replyText, [ticketId]: '' });
        fetchHistory();
      } else {
        toast.error('Failed to send reply');
      }
    } catch (e) {
      toast.error('Error sending reply');
    } finally {
      setIsReplying({ ...isReplying, [ticketId]: false });
    }
  };

  const filteredHistory = history.filter(t => 
    (t.subject || '').toLowerCase().includes(search.toLowerCase()) || 
    (t.message || '').toLowerCase().includes(search.toLowerCase())
  );

  const selectedTicket = history.find(t => t._id === selectedTicketId);

  // Theme colors
  const bgMain = isBizFi ? 'bg-[#0A1019]' : 'bg-gray-50 dark:bg-[#121212]';
  const bgPanel = isBizFi ? 'bg-[#070A0F]' : 'bg-white dark:bg-[#1C1C1C]';
  const borderCol = isBizFi ? 'border-[#1C2538]' : 'border-gray-200 dark:border-[#2A2A2A]';
  const textPrimary = isBizFi ? 'text-[#F9F9FB]' : 'text-gray-900 dark:text-white';
  const textSecondary = isBizFi ? 'text-[#7B8B9A]' : 'text-gray-500 dark:text-gray-400';
  const accentCol = isBizFi ? 'bg-[#81D7B4] text-[#070A0F]' : 'bg-[#81D7B4] text-white';
  const accentText = 'text-[#81D7B4]';

  return (
    <div className={`flex h-full w-full rounded-3xl overflow-hidden border ${borderCol} ${bgMain}`}>
      
      {/* LEFT PANE: Navigation & Ticket List */}
      <div className={`w-full md:w-[320px] lg:w-[360px] flex-shrink-0 border-r ${borderCol} ${bgPanel} ${
        (selectedTicketId || viewMode === 'create') ? 'hidden md:flex flex-col' : 'flex flex-col'
      }`}>
        {/* Header & New Ticket Btn */}
        <div className={`p-4 border-b ${borderCol} flex flex-col gap-4`}>
          <button 
            onClick={() => { setViewMode('create'); setSelectedTicketId(null); }}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all hover:scale-[0.98] shadow-sm ${accentCol}`}
          >
            <PlusSignIcon className="w-5 h-5" />
            New Inquiry
          </button>
          
          <div className="relative">
            <Search01Icon className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${textSecondary}`} />
            <input 
              type="text"
              placeholder="Search inquiries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none border transition-colors ${isBizFi ? 'bg-[#121A27] border-[#1C2538] focus:border-[#81D7B4] text-[#F9F9FB]' : 'bg-gray-100 dark:bg-[#2A2A2A] border-transparent focus:border-[#81D7B4] text-gray-900 dark:text-white'}`}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoadingHistory ? (
            <div className="p-2 space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-20 rounded-xl overflow-hidden relative ${isBizFi ? 'bg-[#121A27]' : 'bg-gray-100 dark:bg-[#2A2A2A]'}`}>
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center opacity-70">
              <MessageQuestionIcon className={`w-8 h-8 mb-2 ${textSecondary}`} />
              <p className={`text-xs ${textSecondary}`}>No inquiries found.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredHistory.map(ticket => {
                const isSelected = selectedTicketId === ticket._id && viewMode !== 'create';
                return (
                  <button
                    key={ticket._id}
                    onClick={() => { setSelectedTicketId(ticket._id); setViewMode('list'); }}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                      isSelected 
                        ? (isBizFi ? 'bg-[#121A27] border-[#81D7B4]/30' : 'bg-[#81D7B4]/10 dark:bg-[#81D7B4]/5 border-[#81D7B4]/30')
                        : (isBizFi ? 'bg-transparent border-transparent hover:bg-[#121A27]/50' : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-[#2A2A2A]')
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        ticket.status === 'resolved' ? 'bg-emerald-500/15 text-emerald-500' :
                        ticket.status === 'reviewed' ? 'bg-blue-500/15 text-blue-500' : 'bg-amber-500/15 text-amber-500'
                      }`}>
                        {ticket.status || 'pending'}
                      </span>
                      <span className={`text-[10px] ${textSecondary}`}>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className={`text-sm font-bold truncate ${textPrimary}`}>{ticket.subject}</h4>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono ${accentText}`}>#{ticket._id.slice(-6).toUpperCase()}</span>
                      {ticket.replies && ticket.replies.length > 0 && (
                        <span className={`text-[10px] flex items-center gap-1 ${textSecondary}`}>
                          <BubbleChatIcon className="w-3 h-3" /> {ticket.replies.length}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MIDDLE PANE: Active Thread OR Create Form */}
      <div className={`flex-1 min-w-0 ${bgMain} ${
        (!selectedTicketId && viewMode === 'list') ? 'hidden md:flex flex-col' : 'flex flex-col'
      }`}>
        {viewMode === 'create' ? (
          // CREATE TICKET FORM
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-2 mb-4 md:hidden">
                <button onClick={() => setViewMode('list')} className={`p-2 -ml-2 rounded-lg ${textSecondary} hover:bg-gray-100 dark:hover:bg-white/5`}>
                  <ArrowLeft01Icon className="w-5 h-5" />
                </button>
                <span className={`text-sm font-bold ${textPrimary}`}>Back to List</span>
              </div>
              <div>
                <h2 className={`text-2xl font-black mb-1 ${textPrimary}`}>Submit an Inquiry</h2>
                <p className={`text-sm ${textSecondary}`}>Describe your issue or feature request in detail.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${textSecondary}`}>Category</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['Bug Report', 'Feature Request', 'Savings / Vault Issue', 'General Query'].map((cat) => {
                      const val = cat.toLowerCase();
                      const isActive = category === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setCategory(val)}
                          className={`p-4 rounded-xl border text-sm font-bold transition-all text-left whitespace-nowrap overflow-hidden text-ellipsis ${
                            isActive
                              ? (isBizFi ? 'bg-[#81D7B4]/10 border-[#81D7B4] text-[#81D7B4]' : 'bg-[#81D7B4]/10 dark:bg-[#81D7B4]/5 border-[#81D7B4] text-[#81D7B4]')
                              : (isBizFi ? 'bg-[#070A0F] border-[#1C2538] text-[#7B8B9A] hover:border-[#7B8B9A]/50' : 'bg-white dark:bg-[#1C1C1C] border-gray-200 dark:border-[#2A2A2A] text-gray-500 dark:text-gray-400')
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${textSecondary}`}>Subject</label>
                  <input
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your inquiry..."
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${isBizFi ? 'bg-[#070A0F] border-[#1C2538] focus:border-[#81D7B4] text-[#F9F9FB]' : 'bg-white dark:bg-[#1C1C1C] border-gray-200 dark:border-[#2A2A2A] focus:border-[#81D7B4] text-gray-900 dark:text-white'}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${textSecondary}`}>Details</label>
                  <textarea
                    required
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide as much context as possible..."
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none resize-none ${isBizFi ? 'bg-[#070A0F] border-[#1C2538] focus:border-[#81D7B4] text-[#F9F9FB]' : 'bg-white dark:bg-[#1C1C1C] border-gray-200 dark:border-[#2A2A2A] focus:border-[#81D7B4] text-gray-900 dark:text-white'}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${textSecondary}`}>Attachments (Optional)</label>
                  <div className="flex items-center gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className={`relative w-16 h-16 rounded-xl border overflow-hidden ${borderCol}`}>
                        <img src={img.dataUrl} alt="Upload" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white">
                          <Delete02Icon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    {images.length < 3 && (
                      <label className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${isBizFi ? 'border-[#1C2538] hover:border-[#81D7B4] bg-[#070A0F] text-[#7B8B9A]' : 'border-gray-300 dark:border-[#333] hover:border-[#81D7B4] text-gray-400'}`}>
                        <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                        {isCompressing ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Upload01Icon className="w-6 h-6" />}
                      </label>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-dashed border-[#1C2538]">
                  <button type="submit" disabled={isSubmitting || isCompressing} className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 ${accentCol}`}>
                    {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : selectedTicket ? (
          // THREAD VIEW
          <div className="flex-1 flex flex-col min-h-0">
            {/* Thread Header */}
            <div className={`p-4 sm:p-6 border-b flex items-center justify-between shrink-0 ${borderCol} ${bgPanel}`}>
              <div className="flex items-center gap-3">
                <button onClick={() => { setSelectedTicketId(null); setViewMode('list'); }} className={`md:hidden p-2 -ml-2 rounded-lg ${textSecondary} hover:bg-gray-100 dark:hover:bg-white/5`}>
                  <ArrowLeft01Icon className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono font-bold ${accentText}`}>#{selectedTicket._id.slice(-6).toUpperCase()}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${borderCol} ${textSecondary}`}>{selectedTicket.category}</span>
                  </div>
                  <h3 className={`text-lg font-bold ${textPrimary}`}>{selectedTicket.subject}</h3>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                selectedTicket.status === 'resolved' ? 'bg-emerald-500/15 text-emerald-500' :
                selectedTicket.status === 'reviewed' ? 'bg-blue-500/15 text-blue-500' : 'bg-amber-500/15 text-amber-500'
              }`}>
                {selectedTicket.status || 'pending'}
              </span>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Original User Message */}
              <div className="flex flex-col items-end w-full">
                <div className={`max-w-[85%] rounded-2xl p-4 text-sm whitespace-pre-wrap rounded-tr-sm shadow-sm ${isBizFi ? 'bg-[#81D7B4]/10 border border-[#81D7B4]/20 text-[#F9F9FB]' : 'bg-[#81D7B4]/15 border border-[#81D7B4]/20 text-gray-800 dark:text-gray-100'}`}>
                  <p>{selectedTicket.message}</p>
                  {selectedTicket.images && selectedTicket.images.length > 0 && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-white/20">
                      {selectedTicket.images.map((img: string, i: number) => (
                        <a key={i} href={img} target="_blank" rel="noreferrer"><img src={img} alt="attach" className="w-16 h-16 rounded-xl object-cover hover:opacity-80" /></a>
                      ))}
                    </div>
                  )}
                </div>
                <div className={`text-[10px] mt-1.5 flex gap-2 ${textSecondary}`}>
                  <span className="font-bold">You</span>
                  <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Replies */}
              {selectedTicket.replies && selectedTicket.replies.map((rep: any, i: number) => {
                const isUser = rep.sentBy === 'User';
                return (
                  <div key={i} className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm whitespace-pre-wrap shadow-sm ${
                      isUser 
                        ? (isBizFi ? 'bg-[#81D7B4]/10 border border-[#81D7B4]/20 text-[#F9F9FB] rounded-tr-sm' : 'bg-[#81D7B4]/15 border border-[#81D7B4]/20 text-gray-800 dark:text-gray-100 rounded-tr-sm')
                        : (isBizFi ? 'bg-[#1C2538] text-[#F9F9FB] rounded-tl-sm' : 'bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-[#333] text-gray-900 dark:text-white rounded-tl-sm')
                    }`}>
                      <p>{rep.message}</p>
                      {rep.images && rep.images.length > 0 && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-black/10 dark:border-white/10">
                          {rep.images.map((img: string, j: number) => (
                            <a key={j} href={img} target="_blank" rel="noreferrer"><img src={img} alt="attach" className="w-16 h-16 rounded-xl object-cover hover:opacity-80" /></a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={`text-[10px] mt-1.5 flex gap-2 ${textSecondary}`}>
                      <span className="font-bold">{isUser ? 'You' : 'Bitsave Support'}</span>
                      <span>{new Date(rep.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Box */}
            {selectedTicket.status !== 'resolved' ? (
              <div className={`p-4 sm:p-6 border-t flex gap-3 shrink-0 ${borderCol} ${bgPanel}`}>
                <textarea
                  value={replyText[selectedTicket._id] || ''}
                  onChange={(e) => setReplyText({ ...replyText, [selectedTicket._id]: e.target.value })}
                  placeholder="Type a reply..."
                  rows={1}
                  className={`flex-1 rounded-full px-5 py-3 text-sm outline-none resize-none border ${isBizFi ? 'bg-[#121A27] border-[#1C2538] focus:border-[#81D7B4] text-[#F9F9FB]' : 'bg-gray-100 dark:bg-[#1A1A1A] border-transparent focus:border-[#81D7B4] text-gray-900 dark:text-white'}`}
                />
                <button
                  onClick={() => handleReplySubmit(selectedTicket._id)}
                  disabled={isReplying[selectedTicket._id] || !(replyText[selectedTicket._id] || '').trim()}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-105 shadow-md disabled:opacity-50 ${accentCol}`}
                >
                  {isReplying[selectedTicket._id] ? <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" /> : <SentIcon className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <div className={`p-4 text-center text-xs font-bold ${borderCol} ${bgPanel} ${textSecondary}`}>
                This inquiry has been marked as resolved and closed.
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-70">
            <MessageQuestionIcon className={`w-12 h-12 mb-4 ${textSecondary}`} />
            <h3 className={`font-bold ${textPrimary}`}>No Ticket Selected</h3>
            <p className={`text-sm max-w-sm mt-1 ${textSecondary}`}>Select an inquiry from the sidebar or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
