'use client';

import { Activity01Icon, SentIcon, SparklesIcon, ArrowLeft01Icon } from "hugeicons-react";
import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// Extracted MentionInput
function MentionInput({ value, onChange, onKeyDown, placeholder, className, participants, isTextarea = false }: any) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const match = value.match(/@([a-zA-Z0-9_\.]*)$/);
    if (match) {
      setShowSuggestions(true);
      setMentionQuery(match[1]);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  }, [value]);

  const filteredParticipants = participants.filter((p: string) => 
    p.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && filteredParticipants.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredParticipants.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filteredParticipants.length) % filteredParticipants.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        insertMention(filteredParticipants[selectedIndex]);
        return;
      }
    }
    if (onKeyDown) onKeyDown(e as any);
  };

  const insertMention = (participant: string) => {
    const newValue = value.replace(/@([a-zA-Z0-9_\.]*)$/, `@${participant} `);
    onChange(newValue);
    setShowSuggestions(false);
  };

  return (
    <div className={`relative ${isTextarea ? 'w-full' : 'flex-1'}`}>
      <AnimatePresence>
        {showSuggestions && filteredParticipants.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-2 left-0 w-64 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden z-50 flex flex-col"
          >
            <div className="text-[10px] uppercase font-black tracking-wider text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-[#121212] px-3 py-1.5 border-b border-gray-100 dark:border-white/10">
              Mentions
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredParticipants.map((p: string, idx: number) => (
                <button
                  key={p}
                  onClick={() => insertMention(p)}
                  className={`w-full text-left px-3 py-2.5 text-[13px] font-bold flex items-center gap-2 transition-colors ${idx === selectedIndex ? 'bg-[#81D7B4]/10 text-[#2D5A4A]' : 'hover:bg-gray-50 dark:hover:bg-[#121212] text-gray-700 dark:text-gray-300'}`}
                >
                  {p === 'SavvyBot' ? (
                    <span className="w-5 h-5 rounded-md bg-[#81D7B4] flex items-center justify-center text-white"><SparklesIcon className="w-3 h-3"/></span>
                  ) : (
                     <span className="w-5 h-5 rounded-md bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 font-mono text-[9px]">@</span>
                  )}
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isTextarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className={className} rows={4} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className={className} />
      )}
    </div>
  );
}

interface Reply {
  _id: string;
  content: string;
  walletAddress: string;
  savvyName: string | null;
  createdAt: string;
}

interface ForumPost {
  _id: string;
  title: string;
  content: string;
  walletAddress: string;
  savvyName: string | null;
  tags: string[];
  replies: Reply[];
  replyCount: number;
  likes: number;
  likedBy: string[];
  createdAt: string;
}

export default function SinglePostPage({ params }: { params: Promise<{ postId: string }> }) {
  const unwrappedParams = use(params);
  const postId = unwrappedParams.postId;
  const router = useRouter();
  const { address } = useAccount();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyInput, setReplyInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchPost = useCallback(async () => {
    try {
      const res = await fetch(`/api/forum/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data.post);
      } else {
        router.push('/dashboard/forum');
      }
    } catch {
      toast.error('Failed to load post');
    } finally {
      setIsLoading(false);
    }
  }, [postId, router]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleReply = async () => {
    const content = replyInput.trim();
    if (!content || !address || !post) return;
    
    setIsReplying(true);
    try {
      const res = await fetch('/api/forum', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post._id, walletAddress: address, replyContent: content, action: 'reply' }),
      });
      
      if (res.ok) {
        setReplyInput('');
        await fetchPost();
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

        if (content.toLowerCase().includes('@savvybot')) {
          setBotTyping(true);
          try {
            const context = `Forum discussion context: "${post.title}" - ${post.content}`;
            const botRes = await fetch('/api/savvy-bot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                question: content.replace(/@savvy(?:bot)?\b/gi, '').trim() || 'Respond to this discussion.',
                chatHistory: [{ role: 'System', content: context }]
              })
            });
            
            if (botRes.ok) {
              const botData = await botRes.json();
              await fetch('/api/forum', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  postId: post._id, 
                  walletAddress: '0x0000000000000000000000000000000SavvyBot', 
                  replyContent: botData.reply, 
                  action: 'reply',
                  savvyName: 'SavvyBot'
                }),
              });
              await fetchPost();
              bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
          } catch (e) {
            console.error('Bot reply failed', e);
          } finally {
            setBotTyping(false);
          }
        }
      }
    } catch {
      toast.error('Failed to post reply');
    } finally {
      setIsReplying(false);
    }
  };

  const handleLike = async () => {
    if (!address || !post) return;
    const lowerAddress = address.toLowerCase();

    // Optimistic
    const isLiked = post.likedBy?.includes(lowerAddress);
    setPost({
      ...post,
      likes: isLiked ? Math.max(0, post.likes - 1) : (post.likes || 0) + 1,
      likedBy: isLiked 
        ? post.likedBy.filter(addr => addr !== lowerAddress)
        : [...(post.likedBy || []), lowerAddress]
    });

    try {
      await fetch('/api/forum', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post._id, walletAddress: address, action: 'like' }),
      });
    } catch {
      fetchPost();
    }
  };

  const renderContentWithMentions = (content: string) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-[#81D7B4] font-bold bg-[#81D7B4]/10 px-1 py-0.5 rounded-md">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        <div className="h-40 bg-white dark:bg-[#1a1a1a] rounded-3xl animate-pulse border border-gray-100 dark:border-white/10" />
        <div className="h-64 bg-white dark:bg-[#1a1a1a] rounded-3xl animate-pulse border border-gray-100 dark:border-white/10" />
      </div>
    );
  }

  if (!post) return null;

  const participants = Array.from(new Set([
    'SavvyBot',
    post.savvyName || post.walletAddress?.slice(0,6) || '',
    ...(post.replies?.map(r => r.savvyName || r.walletAddress?.slice(0,6) || '') || [])
  ])).filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto min-h-screen pb-20">
      <Link href="/dashboard/forum" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-6">
        <ArrowLeft01Icon className="w-4 h-4" /> Back to Forum
      </Link>

      {/* Main Post */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm p-6 sm:p-8 mb-6 relative overflow-hidden">
        {/* Subtle decorative gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#81D7B4]/10 to-transparent blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#81D7B4]/20 flex items-center justify-center text-[#2D5A4A] dark:text-[#81D7B4] text-xs font-black">
              {post.savvyName ? post.savvyName.slice(0, 2).toUpperCase() : post.walletAddress.slice(2, 4).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                {post.savvyName ? `@${post.savvyName}` : `${post.walletAddress.slice(0, 6)}...`}
              </div>
              <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{timeAgo(post.createdAt)}</div>
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          {post.title}
        </h1>

        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base whitespace-pre-wrap mb-6">
          {renderContentWithMentions(post.content)}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-white/10">
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-50 dark:bg-[#121212] text-gray-500 dark:text-gray-400 text-xs font-bold rounded-lg border border-gray-100 dark:border-white/10">#{tag}</span>
            ))}
          </div>

          <button 
            onClick={handleLike} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${post.likedBy?.includes(address?.toLowerCase() || '') ? 'bg-[#81D7B4]/10 text-[#81D7B4]' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}
          >
            <Activity01Icon className={`w-5 h-5 ${post.likedBy?.includes(address?.toLowerCase() || '') ? 'fill-[#81D7B4]' : ''}`} /> 
            {post.likes || 0} Likes
          </button>
        </div>
      </div>

      {/* Replies Section */}
      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#81D7B4] rounded-full"></span>
        Replies ({post.replyCount || 0})
      </h3>

      <div className="space-y-4 mb-6">
        {post.replies?.map((reply, idx) => (
          <div key={reply._id || idx} className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-white/10 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${reply.savvyName === 'SavvyBot' ? 'bg-[#81D7B4] text-white shadow-sm' : 'bg-[#81D7B4]/15 text-[#2D5A4A] dark:text-[#81D7B4]'}`}>
                {reply.savvyName === 'SavvyBot' ? <SparklesIcon className="w-4 h-4"/> : <span className="text-[10px] font-black">{reply.savvyName ? reply.savvyName.slice(0, 2).toUpperCase() : reply.walletAddress.slice(2, 4).toUpperCase()}</span>}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {reply.savvyName ? (reply.savvyName === 'SavvyBot' ? 'SavvyBot' : `@${reply.savvyName}`) : `${reply.walletAddress.slice(0, 6)}...`}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">{timeAgo(reply.createdAt)}</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {renderContentWithMentions(reply.content)}
            </p>
          </div>
        ))}
        
        {botTyping && (
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-white/10 p-5 opacity-70">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-[#81D7B4] flex items-center justify-center text-white shrink-0 shadow-sm">
                <SparklesIcon className="w-4 h-4"/>
              </div>
              <span className="text-xs font-bold text-[#81D7B4]">SavvyBot is typing...</span>
            </div>
            <div className="flex gap-1.5 ml-9">
              <span className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply Input */}
      <div className="sticky bottom-4 z-10 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-white/10 p-3 flex items-end gap-3 transition-all">
        <MentionInput
          value={replyInput}
          onChange={(val: string) => setReplyInput(val)}
          onKeyDown={(e: any) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
          placeholder="Write a reply... Type @ to mention"
          className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 focus:bg-white dark:focus:bg-[#1a1a1a] text-gray-900 dark:text-white transition-all resize-none max-h-32"
          participants={participants}
          isTextarea={true}
        />
        <button 
          onClick={handleReply} 
          disabled={!replyInput.trim() || isReplying} 
          className="w-12 h-12 flex shrink-0 items-center justify-center bg-[#81D7B4] hover:bg-[#6BC4A0] text-white rounded-xl disabled:opacity-50 transition-colors shadow-sm mb-1"
        >
          <SentIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
