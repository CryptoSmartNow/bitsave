'use client';

import { 
  MessageQuestionIcon, Cancel01Icon, 
  SentIcon, Bug02Icon, SparklesIcon, 
  HelpCircleIcon, LockIcon, BubbleChatIcon, 
  CheckmarkCircle02Icon, RocketIcon, Shield01Icon,
  Upload01Icon
} from 'hugeicons-react';
import React, { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { optimizeImage, OptimizedImage } from '@/utils/imageOptimizer';

export interface HelpAndFeedbackProps {
  appContext?: string; // e.g. 'SaveFi Dashboard', 'BizSwap', 'BizFun', 'BizFi Dashboard', 'Docs'
  embedded?: boolean;
}

const DEFAULT_CATEGORIES = [
  { id: 'bug', label: 'Bug Report', icon: Bug02Icon, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
  { id: 'feature', label: 'Feature Request', icon: SparklesIcon, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  { id: 'savings', label: 'Savings / Vault Issue', icon: LockIcon, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'query', label: 'General Query', icon: HelpCircleIcon, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { id: 'feedback', label: 'Feedback & Praise', icon: BubbleChatIcon, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
];

const BIZFI_CATEGORIES = [
  { id: 'bug', label: 'Bug Report', icon: Bug02Icon, color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' },
  { id: 'listing', label: 'Listing & Tiers', icon: RocketIcon, color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
  { id: 'compliance', label: 'KYB & Verification', icon: Shield01Icon, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  { id: 'shares', label: 'BizShares & Equity', icon: SparklesIcon, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
  { id: 'query', label: 'General Inquiry', icon: HelpCircleIcon, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
  { id: 'feedback', label: 'Feedback & Ideas', icon: BubbleChatIcon, color: 'text-[#81D7B4] bg-[#81D7B4]/15 border-[#81D7B4]/30' },
];

export default function HelpAndFeedback({ appContext = 'SaveFi Dashboard', embedded = false }: HelpAndFeedbackProps) {
  const { user } = usePrivy();
  const { address: wagmiAddress } = useAccount();
  const activeAddress = (wagmiAddress || user?.wallet?.address || '').toLowerCase();

  const isBizFi = appContext.toLowerCase().includes('bizfi');
  const categories = isBizFi ? BIZFI_CATEGORIES : DEFAULT_CATEGORIES;

  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const [category, setCategory] = useState<string>(isBizFi ? 'listing' : 'bug');
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
          toast.error(`"${file.name}" is not an image.`);
          continue;
        }
        const opt = await optimizeImage(file, 1280, 1280, 0.82);
        optimizedResults.push(opt);
      }

      setImages(prev => [...prev, ...optimizedResults].slice(0, 3));
      toast.success('Screenshot(s) ready!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Image processing failed', { id: toastId });
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
      toast.error('Please enter a subject and detailed description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        userAddress: activeAddress || 'anonymous',
        savvyName: savvyName || null,
        email: email.trim() || null,
        category,
        subject: subject.trim(),
        message: message.trim(),
        appContext,
        images: images.map(img => img.dataUrl),
        systemInfo: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
          screenResolution: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown',
          timestamp: new Date().toISOString()
        }
      };

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedTicketId(data.id);
        toast.success(isBizFi ? 'Inquiry received! Our compliance team will review it.' : 'Thank you! Your feedback has been sent to our dev team.');
        // Reset form
        setSubject('');
        setMessage('');
        setImages([]);
      } else {
        toast.error(data.error || 'Failed to submit inquiry');
      }
    } catch {
      toast.error('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Theming classes
  const cardBgClass = isBizFi ? 'bg-[#1A2538]/50 border-[#7B8B9A]/15 text-[#F9F9FB]' : 'bg-white dark:bg-[#161616] border-gray-200/70 dark:border-white/10 text-gray-900 dark:text-white';
  const labelColor = isBizFi ? 'text-[#7B8B9A]' : 'text-gray-400';
  const inputBgClass = isBizFi ? 'bg-[#0F1825]/80 border-[#7B8B9A]/20 text-[#F9F9FB] placeholder-[#7B8B9A]/50 focus:border-[#81D7B4]' : 'bg-gray-50 dark:bg-white/5 border-gray-200/70 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#81D7B4]';
  const tabBgClass = isBizFi ? 'bg-[#0F1825]/80 border-[#7B8B9A]/20' : 'bg-gray-100 dark:bg-white/5';
  const tabActiveBtn = isBizFi ? 'bg-[#81D7B4] text-[#0F1825] shadow-sm font-black' : 'bg-white dark:bg-[#161616] text-gray-900 dark:text-white shadow-xs';
  const tabInactiveBtn = isBizFi ? 'text-[#7B8B9A] hover:text-[#F9F9FB]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white';

  return (
    <div className={`w-full ${embedded ? '' : 'max-w-4xl mx-auto py-2 sm:py-6 px-2 sm:px-4'}`}>
      
      {/* Header Tabs */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 ${embedded ? 'border-b-0 pt-0' : (isBizFi ? 'border-b border-[#7B8B9A]/15' : 'border-b border-gray-200/70 dark:border-white/10')}`}>
        {!embedded && (
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight mb-1 ${isBizFi ? 'text-[#F9F9FB]' : 'text-gray-900 dark:text-white'}`}>
              {isBizFi ? 'BizFi Help & Support' : 'Help & Feedback'}
            </h1>
            <p className={`text-xs sm:text-sm leading-relaxed max-w-xl ${isBizFi ? 'text-[#7B8B9A]' : 'text-gray-500 dark:text-gray-400'}`}>
              {isBizFi 
                ? 'Encountered an issue or have a feature idea? Send your feedback directly to the BizFi engineering team.'
                : 'Encountered an issue or have a feature idea? Send your feedback directly to the BitSave engineering team.'
              }
            </p>
          </div>
        )}

        <div className={`flex items-center gap-1 p-1 rounded-2xl shrink-0 w-full sm:w-auto ${tabBgClass} ${embedded ? 'ml-auto' : ''}`}>
          <button
            onClick={() => { setActiveTab('submit'); setSubmittedTicketId(null); }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTab === 'submit' ? tabActiveBtn : tabInactiveBtn
            }`}
          >
            Submit Inquiry
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTab === 'history' ? tabActiveBtn : tabInactiveBtn
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
            className={`rounded-3xl p-6 sm:p-12 border shadow-sm text-center max-w-xl mx-auto space-y-4 ${cardBgClass}`}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-[#81D7B4]/15 text-[#81D7B4] flex items-center justify-center mx-auto shadow-xs border border-[#81D7B4]/30">
              <CheckmarkCircle02Icon className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <h2 className={`text-2xl font-black ${isBizFi ? 'text-[#F9F9FB]' : 'text-gray-900 dark:text-white'}`}>
              Inquiry Received!
            </h2>

            <p className={`text-xs sm:text-sm leading-relaxed max-w-md mx-auto ${isBizFi ? 'text-[#7B8B9A]' : 'text-gray-500 dark:text-gray-400'}`}>
              Our team has logged your inquiry under ticket ID <span className="font-mono font-bold text-[#81D7B4]">#{submittedTicketId.slice(-6)}</span>. We appreciate your feedback!
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setSubmittedTicketId(null)}
                className="w-full sm:w-auto px-6 py-3 bg-[#81D7B4] hover:bg-[#9FE0C5] text-[#0F1825] font-black text-xs rounded-2xl shadow-[0_4px_14px_rgba(129,215,180,0.25)] transition-all cursor-pointer"
              >
                Submit Another Inquiry
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`w-full sm:w-auto px-6 py-3 border font-bold text-xs rounded-2xl transition-all cursor-pointer ${
                  isBizFi 
                    ? 'bg-[#1A2538] hover:bg-[#2C3E5D] border-[#7B8B9A]/20 text-[#F9F9FB]' 
                    : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 border-transparent'
                }`}
              >
                View Inquiry Status
              </button>
            </div>
          </motion.div>
        ) : (
          /* Main Submission Form */
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            
            {/* Category Selector */}
            <div className={`rounded-3xl p-4 sm:p-7 border shadow-sm space-y-3.5 ${cardBgClass}`}>
              <label className={`block text-[11px] sm:text-xs font-black uppercase tracking-wider ${labelColor}`}>
                1. Select Category
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {categories.map((cat, idx) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  const isLastOdd = idx === categories.length - 1 && categories.length % 2 !== 0 && categories.length % 3 !== 0;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 sm:p-3.5 rounded-2xl border text-left flex items-center sm:items-start gap-2.5 sm:gap-3 transition-all cursor-pointer ${
                        isLastOdd ? 'col-span-2 sm:col-span-1 md:col-span-1' : ''
                      } ${
                        isSelected 
                          ? 'border-[#81D7B4] bg-[#81D7B4]/10 shadow-xs ring-2 ring-[#81D7B4]/20' 
                          : (isBizFi 
                              ? 'border-[#7B8B9A]/15 hover:border-[#81D7B4]/40 bg-[#0F1825]/60' 
                              : 'border-gray-200/70 dark:border-white/10 hover:border-[#81D7B4]/50 bg-gray-50/50 dark:bg-white/[0.02]'
                            )
                      }`}
                    >
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 border ${cat.color}`}>
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[11px] sm:text-xs font-bold leading-tight ${isSelected ? 'text-[#81D7B4]' : (isBizFi ? 'text-[#F9F9FB]' : 'text-gray-900 dark:text-white')}`}>
                          {cat.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inquiry Details */}
            <div className={`rounded-3xl p-4 sm:p-7 border shadow-sm space-y-4 sm:space-y-5 ${cardBgClass}`}>
              <label className={`block text-[11px] sm:text-xs font-black uppercase tracking-wider ${labelColor}`}>
                2. Inquiry Details
              </label>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isBizFi ? 'text-[#F9F9FB]' : 'text-gray-700 dark:text-gray-300'}`}>
                  Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={isBizFi ? "e.g. Business registration document review, or Question on token listing" : "e.g. Issue connecting wallet on Base network, or Suggestion for Group Vaults"}
                  className={`w-full px-4 py-3 border rounded-2xl text-xs sm:text-sm font-semibold outline-none transition-all ${inputBgClass}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isBizFi ? 'text-[#F9F9FB]' : 'text-gray-700 dark:text-gray-300'}`}>
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isBizFi ? "Please describe your business inquiry, registered business name, steps to reproduce, or details of your request..." : "Please describe what happened, steps to reproduce the issue, or details of your suggestion..."}
                  className={`w-full px-4 py-3 border rounded-2xl text-xs sm:text-sm font-medium outline-none transition-all resize-none leading-relaxed ${inputBgClass}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isBizFi ? 'text-[#F9F9FB]' : 'text-gray-700 dark:text-gray-300'}`}>
                    Contact Email (Optional for updates)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`w-full px-4 py-3 border rounded-2xl text-xs font-medium outline-none transition-all ${inputBgClass}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isBizFi ? 'text-[#F9F9FB]' : 'text-gray-700 dark:text-gray-300'}`}>
                    Connected Account / Identifier
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={savvyName ? `@${savvyName}` : (activeAddress || 'Not connected')}
                    className={`w-full px-4 py-3 border rounded-2xl text-xs font-mono outline-none ${
                      isBizFi 
                        ? 'bg-[#0F1825]/50 border-[#7B8B9A]/15 text-[#7B8B9A]' 
                        : 'bg-gray-100 dark:bg-white/10 border-gray-200/50 dark:border-white/5 text-gray-500 dark:text-gray-400'
                    }`}
                  />
                </div>
              </div>

            </div>

            {/* Screenshots & Images (Max 3, Optimized) */}
            <div className={`rounded-3xl p-4 sm:p-7 border shadow-sm space-y-3.5 ${cardBgClass}`}>
              <div className="flex items-center justify-between gap-2">
                <label className={`block text-[11px] sm:text-xs font-black uppercase tracking-wider ${labelColor}`}>
                  3. Attach Screenshots (Optional — Max 3)
                </label>
                <span className={`text-[11px] font-bold shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-lg border ${
                  isBizFi 
                    ? 'bg-[#0F1825]/80 text-[#81D7B4] border-[#7B8B9A]/20 font-mono' 
                    : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200/60 dark:border-white/10'
                }`}>
                  {images.length}/3 attached
                </span>
              </div>
              <p className={`text-[11px] leading-relaxed ${labelColor}`}>
                Images are automatically compressed & optimized for rapid transmission.
              </p>

              {/* Upload Dropzone */}
              {images.length < 3 && (
                <div className="pt-1">
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
                    className={`border-2 border-dashed rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group ${
                      isBizFi
                        ? 'border-[#7B8B9A]/25 hover:border-[#81D7B4] bg-[#0F1825]/40'
                        : 'border-gray-200 dark:border-white/10 hover:border-[#81D7B4] bg-gray-50/50 dark:bg-white/[0.02]'
                    }`}
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#81D7B4]/15 text-[#81D7B4] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#81D7B4]/30">
                      <Upload01Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <p className={`text-xs font-bold text-center ${isBizFi ? 'text-[#F9F9FB]' : 'text-gray-700 dark:text-gray-300'}`}>
                      Click to browse or drop screenshots here
                    </p>
                    <p className={`text-[10px] text-center ${labelColor}`}>
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
                      className={`relative rounded-2xl overflow-hidden border group ${
                        isBizFi ? 'border-[#7B8B9A]/20 bg-[#0F1825]' : 'border-gray-200/70 dark:border-white/10 bg-gray-50 dark:bg-white/5'
                      }`}
                    >
                      <img 
                        src={img.dataUrl} 
                        alt={`Attachment ${idx + 1}`} 
                        className="w-full h-32 object-cover" 
                      />
                      <div className={`p-2.5 flex items-center justify-between text-[10px] backdrop-blur-xs ${
                        isBizFi ? 'bg-[#0F1825]/90 text-[#7B8B9A]' : 'bg-white/90 dark:bg-[#161616]/90 text-gray-500'
                      }`}>
                        <span className="font-mono truncate max-w-[120px]">{img.name}</span>
                        <span className="font-bold text-[#81D7B4]">{(img.sizeBytes / 1024).toFixed(0)} KB</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
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
                className="w-full sm:w-auto px-8 py-3.5 bg-[#81D7B4] hover:bg-[#9FE0C5] text-[#0F1825] font-black rounded-2xl text-xs sm:text-sm shadow-[0_4px_14px_rgba(129,215,180,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#0F1825] border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Inquiry...</span>
                  </>
                ) : (
                  <>
                    <SentIcon className="w-4 h-4 text-[#0F1825]" />
                    <span>Submit Inquiry</span>
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
                <div key={i} className={`h-24 rounded-3xl animate-pulse border ${
                  isBizFi ? 'bg-[#1A2538]/50 border-[#7B8B9A]/15' : 'bg-white dark:bg-[#161616] border-gray-200/70 dark:border-white/10'
                }`} />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className={`rounded-3xl p-12 text-center border space-y-2 ${
              isBizFi ? 'bg-[#1A2538]/40 border-[#7B8B9A]/15 text-[#7B8B9A]' : 'bg-white dark:bg-[#161616] border-gray-200/70 dark:border-white/10 text-gray-400'
            }`}>
              <MessageQuestionIcon className="w-10 h-10 mx-auto text-[#7B8B9A] mb-2 opacity-60" />
              <h3 className={`font-bold text-sm ${isBizFi ? 'text-[#F9F9FB]' : 'text-gray-800 dark:text-gray-200'}`}>
                No previous inquiries
              </h3>
              <p className="text-xs text-[#7B8B9A]">Your submitted bugs, questions, and feature suggestions will show up here.</p>
            </div>
          ) : (
            history.map((ticket) => {
              const statusColor = 
                ticket.status === 'resolved' 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : ticket.status === 'reviewed'
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30';

              return (
                <div 
                  key={ticket._id} 
                  className={`rounded-3xl p-6 border shadow-sm space-y-3 ${cardBgClass}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#81D7B4]">#{ticket._id.slice(-6)}</span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                        isBizFi ? 'bg-[#0F1825] text-[#7B8B9A] border border-[#7B8B9A]/20' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'
                      }`}>
                        {ticket.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold uppercase ${statusColor}`}>
                        {ticket.status || 'pending'}
                      </span>
                      <span className="text-[11px] text-[#7B8B9A]">
                        {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <h3 className={`text-base font-bold ${isBizFi ? 'text-[#F9F9FB]' : 'text-gray-900 dark:text-white'}`}>
                    {ticket.subject}
                  </h3>

                  <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${isBizFi ? 'text-[#7B8B9A]' : 'text-gray-600 dark:text-gray-300'}`}>
                    {ticket.message}
                  </p>

                  {ticket.images && ticket.images.length > 0 && (
                    <div className="flex gap-2 pt-2">
                      {ticket.images.map((imgUrl: string, idx: number) => (
                        <a key={idx} href={imgUrl} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={imgUrl} 
                            alt={`Screenshot ${idx + 1}`} 
                            className="w-14 h-14 rounded-xl object-cover border border-[#7B8B9A]/20 hover:border-[#81D7B4] transition-colors" 
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  {ticket.adminReply && (
                    <div className="mt-3 p-4 rounded-2xl bg-[#0F1825]/90 border border-[#81D7B4]/30 space-y-1">
                      <p className="text-[11px] font-bold text-[#81D7B4]">Response from Core Team:</p>
                      <p className="text-xs text-[#F9F9FB] whitespace-pre-wrap">{ticket.adminReply}</p>
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
