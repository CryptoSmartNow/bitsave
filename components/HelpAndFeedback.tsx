'use client';

import { 
  MessageQuestionIcon, Cancel01Icon, Image01Icon, 
  SentIcon, Tick02Icon, Bug02Icon, SparklesIcon, 
  HelpCircleIcon, LockIcon, BubbleChatIcon, 
  Clock01Icon, CheckmarkCircle02Icon, ArrowRight01Icon,
  Upload01Icon
} from 'hugeicons-react';
import React, { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { optimizeImage, OptimizedImage } from '@/utils/imageOptimizer';

export interface HelpAndFeedbackProps {
  appContext?: string; // e.g. 'SaveFi Dashboard', 'BizSwap', 'BizFun', 'BizFi', 'Docs'
  embedded?: boolean;
}

const CATEGORIES = [
  { id: 'bug', label: 'Bug Report', icon: Bug02Icon, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
  { id: 'feature', label: 'Feature Request', icon: SparklesIcon, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  { id: 'savings', label: 'Savings / Vault Issue', icon: LockIcon, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'query', label: 'General Query', icon: HelpCircleIcon, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { id: 'feedback', label: 'Feedback & Praise', icon: BubbleChatIcon, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
];

export default function HelpAndFeedback({ appContext = 'SaveFi Dashboard', embedded = false }: HelpAndFeedbackProps) {
  const { user } = usePrivy();
  const { address: wagmiAddress } = useAccount();
  const activeAddress = (wagmiAddress || user?.wallet?.address || '').toLowerCase();

  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const [category, setCategory] = useState<string>('bug');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [email, setEmail] = useState<string>(user?.email?.address || '');
  const [savvyName, setSavvyName] = useState<string>('');

  const [images, setImages] = useState<OptimizedImage[]>([]);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  // Past tickets history
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch savvy name on mount
  useEffect(() => {
    if (!activeAddress) return;
    fetch(`/api/users/savvy?walletAddress=${activeAddress}`)
      .then(res => res.json())
      .then(data => {
        if (data.savvyName) setSavvyName(data.savvyName);
      })
      .catch(() => {});
  }, [activeAddress]);

  // Fetch past user tickets
  const fetchUserHistory = async () => {
    if (!activeAddress) return;
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/feedback?userAddress=${activeAddress}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.feedback || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchUserHistory();
    }
  }, [activeTab, activeAddress]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > 3) {
      toast.error('You can upload a maximum of 3 screenshots.');
      return;
    }

    setIsCompressing(true);
    const toastId = toast.loading('Optimizing screenshot(s)...');

    try {
      const optimizedResults: OptimizedImage[] = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file.`);
          continue;
        }
        const opt = await optimizeImage(file, 1280, 1280, 0.82);
        optimizedResults.push(opt);
      }

      setImages(prev => [...prev, ...optimizedResults].slice(0, 3));
      toast.success('Images optimized & attached!', { id: toastId });
    } catch (err: any) {
      toast.error('Failed to process image', { id: toastId });
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in both the subject and message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        category,
        subject: subject.trim(),
        message: message.trim(),
        walletAddress: activeAddress || null,
        email: email.trim() || null,
        savvyName: savvyName || null,
        appContext,
        images: images.map(img => img.dataUrl),
      };

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedTicketId(data.id);
        toast.success('Thank you! Your feedback has been sent to our dev team.');
        // Reset form
        setSubject('');
        setMessage('');
        setImages([]);
      } else {
        toast.error(data.error || 'Failed to submit feedback');
      }
    } catch {
      toast.error('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full ${embedded ? '' : 'max-w-4xl mx-auto py-2 sm:py-6 px-2 sm:px-4'}`}>
      
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200/70 dark:border-white/10 pb-4 mb-8">
        <div>
          <h1 className="font-instrument text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
            Help & Feedback
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Encountered an issue or have a feature idea? Send your feedback directly to the BitSave engineering team.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => { setActiveTab('submit'); setSubmittedTicketId(null); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'submit' 
                ? 'bg-white dark:bg-[#161616] text-gray-900 dark:text-white shadow-xs' 
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Submit Inquiry
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history' 
                ? 'bg-white dark:bg-[#161616] text-gray-900 dark:text-white shadow-xs' 
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            My Inquiries {history.length > 0 && `(${history.length})`}
          </button>
        </div>
      </div>

      {activeTab === 'submit' ? (
        submittedTicketId ? (
          /* Submission Success State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#161616] rounded-3xl p-8 sm:p-12 border border-gray-200/70 dark:border-white/10 shadow-sm text-center max-w-xl mx-auto space-y-4"
          >
            <div className="w-16 h-16 rounded-3xl bg-[#81D7B4]/15 text-[#81D7B4] flex items-center justify-center mx-auto shadow-xs">
              <CheckmarkCircle02Icon className="w-8 h-8" />
            </div>

            <h2 className="font-instrument text-2xl font-black text-gray-900 dark:text-white">
              Feedback Received!
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
              Our dev and support team has logged your inquiry under ticket ID <span className="font-mono font-bold text-gray-900 dark:text-white">#{submittedTicketId.slice(-6)}</span>. We appreciate you helping us make BitSave better!
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setSubmittedTicketId(null)}
                className="w-full sm:w-auto px-6 py-3 bg-[#81D7B4] hover:opacity-90 text-white font-bold text-xs rounded-2xl shadow-xs transition-all cursor-pointer"
              >
                Submit Another Inquiry
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className="w-full sm:w-auto px-6 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-2xl transition-all cursor-pointer"
              >
                View Inquiry Status
              </button>
            </div>
          </motion.div>
        ) : (
          /* Main Submission Form */
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Category Selector */}
            <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-8 border border-gray-200/70 dark:border-white/10 shadow-sm space-y-4">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400">
                1. Select Category
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#81D7B4] bg-[#81D7B4]/10 shadow-xs ring-2 ring-[#81D7B4]/20' 
                          : 'border-gray-200/70 dark:border-white/10 hover:border-[#81D7B4]/50 bg-gray-50/50 dark:bg-white/[0.02]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${cat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-[#81D7B4]' : 'text-gray-900 dark:text-white'}`}>
                          {cat.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inquiry Details */}
            <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-8 border border-gray-200/70 dark:border-white/10 shadow-sm space-y-5">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400">
                2. Inquiry Details
              </label>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Issue connecting wallet on Base network, or Suggestion for Group Vaults"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#81D7B4] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe what happened, steps to reproduce the issue, or details of your suggestion..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-[#81D7B4] transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Contact Email (Optional for updates)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 rounded-2xl text-xs font-medium text-gray-900 dark:text-white outline-none focus:border-[#81D7B4] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Connected Wallet / Savvy Name
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={savvyName ? `@${savvyName}` : (activeAddress || 'Not connected')}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-white/10 border border-gray-200/50 dark:border-white/5 rounded-2xl text-xs font-mono text-gray-500 dark:text-gray-400 outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Screenshots & Images (Max 3, Optimized) */}
            <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-8 border border-gray-200/70 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-400">
                    3. Attach Screenshots (Optional — Max 3)
                  </label>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Images are automatically compressed & optimized for rapid transmission.
                  </p>
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {images.length}/3 attached
                </span>
              </div>

              {/* Upload Dropzone */}
              {images.length < 3 && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    id="feedback-image-upload"
                  />
                  <label
                    htmlFor="feedback-image-upload"
                    className="border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-[#81D7B4] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-gray-50/50 dark:bg-white/[0.02] group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 text-[#81D7B4] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Upload01Icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Click to browse or drop screenshots here
                    </p>
                    <p className="text-[10px] text-gray-400">
                      PNG, JPG, or WEBP up to 10MB (automatically resized)
                    </p>
                  </label>
                </div>
              )}

              {/* Attached Thumbnails */}
              {images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="relative rounded-2xl overflow-hidden border border-gray-200/70 dark:border-white/10 group bg-gray-50 dark:bg-white/5"
                    >
                      <img 
                        src={img.dataUrl} 
                        alt={`Attachment ${idx + 1}`} 
                        className="w-full h-32 object-cover" 
                      />
                      <div className="p-2.5 flex items-center justify-between text-[10px] text-gray-500 bg-white/90 dark:bg-[#161616]/90 backdrop-blur-xs">
                        <span className="font-mono truncate max-w-[120px]">{img.name}</span>
                        <span className="font-bold text-[#81D7B4]">{(img.sizeBytes / 1024).toFixed(0)} KB</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                      >
                        <Cancel01Icon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isCompressing}
                className="px-8 py-3.5 bg-[#81D7B4] hover:opacity-90 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Inquiry...</span>
                  </>
                ) : (
                  <>
                    <SentIcon className="w-4 h-4" />
                    <span>Submit to Dev Team</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )
      ) : (
        /* Inquiry History Tab */
        <div className="space-y-4">
          {isLoadingHistory ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-white dark:bg-[#161616] rounded-3xl animate-pulse border border-gray-200/70 dark:border-white/10" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white dark:bg-[#161616] rounded-3xl p-12 text-center border border-gray-200/70 dark:border-white/10 text-gray-400 space-y-2">
              <MessageQuestionIcon className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">No previous inquiries</h3>
              <p className="text-xs text-gray-400">Your submitted bugs, questions, and feature suggestions will show up here.</p>
            </div>
          ) : (
            history.map((ticket) => {
              const statusColor = 
                ticket.status === 'resolved' 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                  : ticket.status === 'reviewed'
                  ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                  : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';

              return (
                <div 
                  key={ticket._id} 
                  className="bg-white dark:bg-[#161616] rounded-3xl p-6 border border-gray-200/70 dark:border-white/10 shadow-sm space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-400">#{ticket._id.slice(-6)}</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-gray-100 dark:bg-white/5 text-[10px] font-bold uppercase text-gray-600 dark:text-gray-300">
                        {ticket.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold uppercase ${statusColor}`}>
                        {ticket.status}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {ticket.subject}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {ticket.message}
                  </p>

                  {ticket.images && ticket.images.length > 0 && (
                    <div className="flex gap-2 pt-2">
                      {ticket.images.map((imgUrl: string, idx: number) => (
                        <a key={idx} href={imgUrl} target="_blank" rel="noopener noreferrer" className="block w-14 h-14 rounded-xl overflow-hidden border border-gray-200/70 dark:border-white/10">
                          <img src={imgUrl} alt="attachment" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}

                  {ticket.adminNotes ? (
                    <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/[0.08] border border-[#81D7B4]/30 rounded-2xl space-y-1.5 mt-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-black text-[#81D7B4]">
                          <SparklesIcon className="w-4 h-4" />
                          <span>BitSave Engineering Response</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#81D7B4]/20 text-[#81D7B4] rounded-md uppercase">
                          Official Reply
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium whitespace-pre-wrap">
                        {ticket.adminNotes}
                      </p>
                    </div>
                  ) : (
                    <div className="pt-2 text-[11px] text-gray-400 flex items-center gap-1.5">
                      <Clock01Icon className="w-3.5 h-3.5" />
                      <span>Inquiry queued with development team for review.</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
