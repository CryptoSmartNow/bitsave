'use client';

import { 
  FireIcon, SentIcon, SparklesIcon, ArrowLeft01Icon, 
  Tick02Icon, BubbleChatIcon, Bookmark01Icon 
} from "hugeicons-react";
import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatForumDate, isSavvyBotUser, renderFormattedContent } from '@/lib/forumUtils';

// MentionInput component for @SavvyBot and participant auto-completion
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
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-2 left-0 w-64 bg-white dark:bg-[#161616] border border-gray-200/70 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col"
          >
            <div className="text-[10px] uppercase font-black tracking-wider text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-[#121212] px-3.5 py-2 border-b border-gray-100 dark:border-white/5">
              Mention Member
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
              {filteredParticipants.map((p: string, idx: number) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => insertMention(p)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                    idx === selectedIndex 
                      ? 'bg-[#81D7B4]/15 text-[#81D7B4]' 
                      : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {p === 'SavvyBot' ? (
                    <span className="w-5 h-5 rounded-md bg-[#81D7B4] flex items-center justify-center text-white shrink-0">
                      <SparklesIcon className="w-3 h-3"/>
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-md bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 font-mono text-[10px] shrink-0">@</span>
                  )}
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isTextarea ? (
        <textarea 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          onKeyDown={handleKeyDown} 
          placeholder={placeholder} 
          className={className} 
          rows={3} 
        />
      ) : (
        <input 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          onKeyDown={handleKeyDown} 
          placeholder={placeholder} 
          className={className} 
        />
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
      toast.error('Failed to load thread');
    } finally {
      setIsLoading(false);
    }
  }, [postId, router]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleReply = async () => {
    const content = replyInput.trim();
    if (!content || !address || !post) {
      if (!address) toast.error('Connect wallet to reply');
      return;
    }
    
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

        if (content.toLowerCase().includes('@savvybot') || content.toLowerCase().includes('@savvy')) {
          setBotTyping(true);
          try {
            const context = `Forum discussion title: "${post.title}". Original post: "${post.content}". Conversation history: ${
              (post.replies || []).map(r => `${r.savvyName || 'User'}: ${r.content}`).join(' | ')
            }`;
            
            const botRes = await fetch('/api/savvy-bot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                question: content.replace(/@savvy(?:bot)?\b/gi, '').trim() || 'Please give your insight on this topic.',
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
    if (!address || !post) {
      toast.error('Connect wallet to like');
      return;
    }
    const lowerAddress = address.toLowerCase();

    // Optimistic like toggle
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-6 px-2 sm:px-4">
        <div className="h-40 bg-white dark:bg-[#161616] rounded-3xl animate-pulse border border-gray-200/70 dark:border-white/10" />
        <div className="h-64 bg-white dark:bg-[#161616] rounded-3xl animate-pulse border border-gray-200/70 dark:border-white/10" />
      </div>
    );
  }

  if (!post) return null;

  const participants = Array.from(new Set([
    'SavvyBot',
    post.savvyName || post.walletAddress?.slice(0,6) || '',
    ...(post.replies?.map(r => r.savvyName || r.walletAddress?.slice(0,6) || '') || [])
  ])).filter(Boolean);

  const isLiked = post.likedBy?.includes(address?.toLowerCase() || '');
  const isPostBot = isSavvyBotUser(post.walletAddress, post.savvyName);

  return (
    <div className="max-w-4xl mx-auto min-h-screen pb-24 px-2 sm:px-4 font-sans">
      
      {/* Back Button */}
      <Link 
        href="/dashboard/forum" 
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#81D7B4] transition-colors mb-6 pt-4 cursor-pointer"
      >
        <ArrowLeft01Icon className="w-4 h-4" />
        <span>Back to Forum Discussions</span>
      </Link>

      {/* Main Discussion Post */}
      <div className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 shadow-sm p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
              isPostBot 
                ? 'bg-[#81D7B4] text-white shadow-xs' 
                : 'bg-[#81D7B4]/15 border border-[#81D7B4]/30 text-[#81D7B4]'
            }`}>
              {isPostBot ? (
                <SparklesIcon className="w-4 h-4 text-white" />
              ) : (
                post.savvyName ? post.savvyName.slice(0, 2).toUpperCase() : post.walletAddress.slice(2, 4).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {isPostBot ? 'SavvyBot' : (post.savvyName ? `@${post.savvyName}` : `${post.walletAddress.slice(0, 6)}...${post.walletAddress.slice(-4)}`)}
                </span>
                {isPostBot ? (
                  <span className="px-1.5 py-0.2 bg-[#81D7B4]/15 text-[#81D7B4] rounded text-[9px] font-black uppercase tracking-wider">AI</span>
                ) : (
                  <Tick02Icon className="w-3.5 h-3.5 text-[#81D7B4]" />
                )}
              </div>
              <span className="text-[11px] text-gray-400 font-medium">{formatForumDate(post.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleLike} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isLiked 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' 
                  : 'border-gray-200/70 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-[#81D7B4]/40 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <FireIcon className="w-3.5 h-3.5 text-[#81D7B4]" /> 
              <span>{post.likes || 0}</span>
            </button>
          </div>
        </div>

        <h1 className="font-instrument text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-wrap mb-6">
          {renderFormattedContent(post.content)}
        </div>

        <div className="flex flex-wrap gap-1.5 pt-4 border-t border-gray-100 dark:border-white/5">
          {(post.tags || []).map(tag => (
            <span key={tag} className="px-2.5 py-1 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs font-bold rounded-lg border border-gray-200/50 dark:border-white/5">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Replies Section */}
      <div className="mb-6">
        <h3 className="font-instrument text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-[#81D7B4] rounded-full"></span>
          Replies ({post.replyCount || 0})
        </h3>

        {post.replies && post.replies.length > 0 ? (
          <div className="space-y-3.5 mb-6">
            {post.replies.map((reply, idx) => {
              const isReplyBot = isSavvyBotUser(reply.walletAddress, reply.savvyName);

              return (
                <div key={reply._id || idx} className="bg-white dark:bg-[#161616] rounded-2xl border border-gray-200/70 dark:border-white/10 p-4 sm:p-5">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      isReplyBot 
                        ? 'bg-[#81D7B4] text-white shadow-xs' 
                        : 'bg-[#81D7B4]/15 text-[#81D7B4]'
                    }`}>
                      {isReplyBot ? (
                        <SparklesIcon className="w-4 h-4 text-white"/>
                      ) : (
                        <span className="text-[10px] font-black">{reply.savvyName ? reply.savvyName.slice(0, 2).toUpperCase() : reply.walletAddress.slice(2, 4).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {isReplyBot ? 'SavvyBot' : (reply.savvyName ? `@${reply.savvyName}` : `${reply.walletAddress.slice(0, 6)}...${reply.walletAddress.slice(-4)}`)}
                      </span>
                      {isReplyBot && (
                        <span className="px-1.5 py-0.2 bg-[#81D7B4]/15 text-[#81D7B4] rounded text-[8px] font-black uppercase tracking-wider">AI</span>
                      )}
                      <span className="text-[10px] text-gray-400 font-medium">{formatForumDate(reply.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {renderFormattedContent(reply.content)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 bg-gray-50 dark:bg-white/[0.02] rounded-3xl border border-gray-200/60 dark:border-white/5 text-center mb-6">
            <p className="text-xs font-bold text-gray-500">No replies yet. Be the first to join this conversation!</p>
          </div>
        )}

        {botTyping && (
          <div className="bg-white dark:bg-[#161616] rounded-2xl border border-gray-200/70 dark:border-white/10 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl bg-[#81D7B4] flex items-center justify-center text-white shrink-0 shadow-xs">
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

      {/* Reply Sticky Input Box */}
      <div className="sticky bottom-4 z-10 bg-white dark:bg-[#161616] rounded-3xl shadow-xl border border-gray-200/70 dark:border-white/10 p-3 sm:p-4 flex items-end gap-3 transition-all">
        <MentionInput
          value={replyInput}
          onChange={(val: string) => setReplyInput(val)}
          onKeyDown={(e: any) => { 
            if (e.key === 'Enter' && !e.shiftKey) { 
              e.preventDefault(); 
              handleReply(); 
            } 
          }}
          placeholder="Write a reply... (Tip: mention @SavvyBot to ask the bot)"
          className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-200/70 dark:border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium outline-none focus:border-[#81D7B4] text-gray-900 dark:text-white transition-all resize-none max-h-32"
          participants={participants}
          isTextarea={true}
        />
        <button 
          onClick={handleReply} 
          disabled={!replyInput.trim() || isReplying} 
          className="w-11 h-11 flex shrink-0 items-center justify-center bg-[#81D7B4] hover:opacity-90 text-white rounded-2xl disabled:opacity-50 transition-all shadow-xs cursor-pointer mb-0.5"
        >
          <SentIcon className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
