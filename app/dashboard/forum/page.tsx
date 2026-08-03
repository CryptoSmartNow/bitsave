'use client';

import { Activity01Icon, PlusSignIcon, Cancel01Icon, SparklesIcon, SentIcon, Bookmark01Icon, ArrowDown01Icon, ArrowUp01Icon, Search01Icon, Tick02Icon } from "hugeicons-react";
import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

interface ForumPost {
  _id: string;
  title: string;
  content: string;
  walletAddress: string;
  savvyName: string | null;
  tags: string[];
  replyCount: number;
  likes: number;
  likedBy: string[];
  createdAt: string;
}

const TAGS = ['savings', 'defi', 'strategy', 'help', 'general', 'jobs', 'dashboard', 'connection'];

// MOCK DATA
const TOP_USERS = [
  { name: 'Milad Irani', points: '2.3k', avatar: 'M' },
  { name: 'James Brown', points: '1.2k', avatar: 'J' },
  { name: 'TheMMD', points: '800', avatar: 'T' },
  { name: 'Eli williams', points: '700', avatar: 'E' },
  { name: 'Michel polat', points: '12', avatar: 'M' }
];

const ACTIVE_TOPICS = [
  { tag: 'sidebar', threads: 24 },
  { tag: 'questions', threads: 22 },
  { tag: 'jobs', threads: 20 },
  { tag: 'ideas', threads: 18 },
  { tag: 'time-tracker', threads: 10 },
  { tag: 'connection', threads: 10 },
];

export default function ForumHubPage() {
  const { address } = useAccount();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [activeTab, setActiveTab] = useState('Community');
  const [searchQuery, setSearchQuery] = useState('');

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  const fetchPosts = useCallback(async (initialLoad = false) => {
    try {
      if (initialLoad) setIsLoading(true);
      const res = await fetch('/api/forum');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      console.error('Failed to fetch posts');
    } finally {
      if (initialLoad) setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(true); }, [fetchPosts]);

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) { toast.error('Title and content are required'); return; }
    if (!address) { toast.error('Please connect your wallet'); return; }
    setIsPosting(true);
    try {
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent, walletAddress: address, tags: newTags }),
      });
      if (res.ok) {
        const createdData = await res.json();
        toast.success('Post created!');
        setShowCreateForm(false);
        setNewTitle(''); setNewContent(''); setNewTags([]);
        await fetchPosts(false);
        
        // Background bot auto-reply
        if (newContent.toLowerCase().includes('@savvybot') && createdData.post?._id) {
            try {
              const botRes = await fetch('/api/savvy-bot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  question: newContent.replace(/@savvy(?:bot)?\b/gi, '').trim() || 'Talk about this.',
                  chatHistory: [{ role: 'System', content: `Forum discussion context: "${newTitle}" - ${newContent}` }]
                })
              });
              if (botRes.ok) {
                const botData = await botRes.json();
                await fetch('/api/forum', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    postId: createdData.post._id, 
                    walletAddress: '0x0000000000000000000000000000000SavvyBot', 
                    replyContent: botData.reply, 
                    action: 'reply',
                    savvyName: 'SavvyBot'
                  }),
                });
                fetchPosts(false);
              }
            } catch (e) {
              console.error('Failed to get bot reply on new post', e);
            }
        }
      } else { toast.error('Failed to create post'); }
    } catch { toast.error('An error occurred'); } finally { setIsPosting(false); }
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!address) return;
    const lowerAddress = address.toLowerCase();

    setPosts(prevPosts => prevPosts.map(p => {
      if (p._id === postId) {
        const isLiked = p.likedBy?.includes(lowerAddress);
        return {
          ...p,
          likes: isLiked ? Math.max(0, p.likes - 1) : (p.likes || 0) + 1,
          likedBy: isLiked 
            ? p.likedBy.filter(addr => addr !== lowerAddress)
            : [...(p.likedBy || []), lowerAddress]
        };
      }
      return p;
    }));

    try {
      await fetch('/api/forum', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, walletAddress: address, action: 'like' }),
      });
    } catch {
      fetchPosts();
    }
  };

  const toggleTag = (tag: string) => {
    setNewTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto min-h-screen font-sans">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center gap-6 mb-6 px-4 md:px-0">
        <button 
          onClick={() => setActiveTab('Community')}
          className={`text-xl font-bold pb-2 transition-colors ${activeTab === 'Community' ? 'text-gray-900 dark:text-white border-b-2 border-[#81D7B4]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          Community
        </button>
        <button 
          onClick={() => setActiveTab('My answers')}
          className={`text-xl font-bold pb-2 transition-colors ${activeTab === 'My answers' ? 'text-gray-900 dark:text-white border-b-2 border-[#81D7B4]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          My answers
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main Content Area (Threads) */}
        <div className="flex-1 w-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
          
          {/* Threads Toolbar */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Threads</h2>
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                <ArrowDown01Icon className="w-3.5 h-3.5" /> Topic
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                Sort
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                <Bookmark01Icon className="w-3.5 h-3.5" /> Bookmarks
              </button>
              
              <div className="relative">
                <Search01Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-lg text-xs font-medium text-gray-900 dark:text-white outline-none w-32 focus:w-48 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Threads List */}
          <div className="flex flex-col">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No threads found.</p>
              </div>
            ) : (
              filteredPosts.map((post, idx) => (
                <div key={post._id} className={`p-6 ${idx !== filteredPosts.length - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''}`}>
                  
                  {/* Header: User Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#81D7B4]/20 dark:bg-[#81D7B4]/30 flex items-center justify-center text-[#81D7B4] dark:text-[#6BC4A0] font-bold text-xs shrink-0">
                      {post.savvyName ? post.savvyName.slice(0,2).toUpperCase() : post.walletAddress.slice(2,4).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {post.savvyName ? post.savvyName : `${post.walletAddress.slice(0, 6)}...`}
                    </span>
                    <Tick02Icon className="w-4 h-4 text-[#81D7B4] fill-[#81D7B4]/20" />
                  </div>

                  {/* Content */}
                  <Link href={`/dashboard/forum/${post._id}`} className="block group">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#81D7B4] dark:group-hover:text-[#6BC4A0] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">
                      {post.content}
                    </p>
                  </Link>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-500 dark:text-gray-400">
                      {post.tags.slice(0, 2).map(tag => (
                        <span key={tag}>#{tag}</span>
                      ))}
                      <span>•</span>
                      <span>{timeAgo(post.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <Bookmark01Icon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleLike(post._id, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                          post.likedBy?.includes(address?.toLowerCase() || '') 
                            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400' 
                            : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                        {post.likes || 0}
                      </button>
                      <Link 
                        href={`/dashboard/forum/${post._id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#81D7B4]/20 dark:border-[#81D7B4]/30 bg-[#81D7B4]/10 dark:bg-[#6BC4A0]/10 text-[#81D7B4] dark:text-[#6BC4A0] text-xs font-bold hover:bg-[#81D7B4]/20 dark:hover:bg-[#6BC4A0]/20 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        Reply
                      </Link>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          
          <button 
            onClick={() => setShowCreateForm(true)}
            className="w-full py-3.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors text-sm"
          >
            <PlusSignIcon className="w-5 h-5" /> Start a New Thread
          </button>

          {/* Top Users Card */}
          <div className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-4">Top Users</h3>
            <div className="space-y-4">
              {TOP_USERS.map((u, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xs shrink-0">
                      {u.avatar}
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{u.name}</span>
                    <Tick02Icon className="w-3.5 h-3.5 text-[#81D7B4] fill-[#81D7B4]/20" />
                  </div>
                  <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-bold">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                    {u.points}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Topics Card */}
          <div className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-4">Active Topics</h3>
            <div className="space-y-3">
              {ACTIVE_TOPICS.map((topic, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-600 dark:text-gray-300"># {topic.tag}</span>
                  <span className="text-gray-400 text-xs font-medium">{topic.threads} threads</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-[#121212] rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-white/10">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Start a New Thread</h2>
                  <button onClick={() => setShowCreateForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400">
                    <Cancel01Icon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Thread title" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#81D7B4] dark:focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 outline-none text-sm font-bold text-gray-900 dark:text-white" />

                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#81D7B4] dark:focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 outline-none text-sm font-medium text-gray-900 dark:text-white resize-none h-32"
                  />

                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Select Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {TAGS.map(tag => (
                        <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${newTags.includes(tag) ? 'bg-[#81D7B4] text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'}`}>
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setShowCreateForm(false)} className="flex-1 py-3.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors">Cancel</button>
                  <button onClick={handleCreatePost} disabled={isPosting} className="flex-1 py-3.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-xl disabled:opacity-50 transition-colors">
                    {isPosting ? 'Posting...' : 'Post Thread'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
