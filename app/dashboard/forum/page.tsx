'use client';

import { 
  PlusSignIcon, Cancel01Icon, SparklesIcon, 
  Bookmark01Icon, ArrowDown01Icon, Search01Icon, Tick02Icon,
  BubbleChatIcon, FireIcon, FilterIcon, Sorting01Icon,
  ArrowRight01Icon
} from "hugeicons-react";
import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { formatForumDate, isSavvyBotUser, renderFormattedContent } from '@/lib/forumUtils';

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

interface TopUser {
  name: string;
  walletAddress: string;
  avatar: string;
  points: string;
}

interface ActiveTopic {
  tag: string;
  threads: number;
}

const AVAILABLE_TAGS = ['savings', 'defi', 'strategy', 'help', 'general', 'feedback', 'proposals', 'gooddollar'];

export default function ForumHubPage() {
  const { address } = useAccount();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [activeTopics, setActiveTopics] = useState<ActiveTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'Community' | 'My answers'>('Community');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'replies'>('latest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  
  // Bookmarks saved in local storage
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [filterBookmarksOnly, setFilterBookmarksOnly] = useState(false);

  // Create form modal state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState<string[]>(['savings']);
  const [isPosting, setIsPosting] = useState(false);

  // Load bookmarks on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bitsave_forum_bookmarks');
      if (saved) {
        setBookmarkedIds(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleBookmark = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds(prev => {
      const exists = prev.includes(postId);
      const updated = exists ? prev.filter(id => id !== postId) : [...prev, postId];
      try {
        localStorage.setItem('bitsave_forum_bookmarks', JSON.stringify(updated));
      } catch {
        // ignore
      }
      toast.success(exists ? 'Bookmark removed' : 'Thread bookmarked!');
      return updated;
    });
  };

  const fetchPosts = useCallback(async (initialLoad = false) => {
    try {
      if (initialLoad) setIsLoading(true);
      
      let url = `/api/forum?sort=${sortBy}`;
      if (selectedTag && selectedTag !== 'all') {
        url += `&tag=${encodeURIComponent(selectedTag)}`;
      }
      if (activeTab === 'My answers' && address) {
        url += `&userAddress=${encodeURIComponent(address)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        if (data.topUsers) setTopUsers(data.topUsers);
        if (data.activeTopics) setActiveTopics(data.activeTopics);
      }
    } catch (e) {
      console.error('Failed to fetch posts', e);
    } finally {
      if (initialLoad) setIsLoading(false);
    }
  }, [selectedTag, sortBy, activeTab, address]);

  useEffect(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Title and content are required');
      return;
    }
    if (!address) {
      toast.error('Please connect your wallet to post');
      return;
    }
    
    setIsPosting(true);
    try {
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          walletAddress: address,
          tags: newTags.length > 0 ? newTags : ['general']
        }),
      });

      if (res.ok) {
        const createdData = await res.json();
        toast.success('🎉 Discussion thread published!');
        setShowCreateForm(false);
        setNewTitle('');
        setNewContent('');
        setNewTags(['savings']);
        await fetchPosts(false);
        
        // Background AI Bot Auto-reply if @savvybot is mentioned
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
            console.error('Failed to trigger bot auto-response', e);
          }
        }
      } else {
        toast.error('Failed to create discussion');
      }
    } catch {
      toast.error('Network error occurred');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!address) {
      toast.error('Connect wallet to like threads');
      return;
    }
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
      fetchPosts(false);
    }
  };

  const toggleNewPostTag = (tag: string) => {
    setNewTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // Client-side filtering for search & bookmark toggle
  const filteredPosts = posts.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.savvyName && p.savvyName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesBookmarks = filterBookmarksOnly ? bookmarkedIds.includes(p._id) : true;
    return matchesSearch && matchesBookmarks;
  });

  return (
    <div className="max-w-7xl mx-auto min-h-screen font-sans pb-24 px-2 sm:px-4">
      
      {/* Header & Tabs */}
      <div className="mb-8 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-instrument text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
              Community Forum
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Ask questions, discuss savings strategies, share ideas, and chat with the BitSave community.
            </p>
          </div>

          <button 
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3.5 bg-[#81D7B4] hover:opacity-90 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-all text-sm cursor-pointer shrink-0"
          >
            <PlusSignIcon className="w-5 h-5" />
            <span>Start a New Thread</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-b border-gray-200/70 dark:border-white/10">
          <button 
            onClick={() => { setActiveTab('Community'); setFilterBookmarksOnly(false); }}
            className={`text-base font-bold pb-3 transition-colors cursor-pointer relative ${
              activeTab === 'Community' && !filterBookmarksOnly
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span>Community Discussions</span>
            {activeTab === 'Community' && !filterBookmarksOnly && (
              <motion.div layoutId="forumTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-[#81D7B4]" />
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('My answers'); setFilterBookmarksOnly(false); }}
            className={`text-base font-bold pb-3 transition-colors cursor-pointer relative ${
              activeTab === 'My answers' && !filterBookmarksOnly
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span>My Threads & Answers</span>
            {activeTab === 'My answers' && !filterBookmarksOnly && (
              <motion.div layoutId="forumTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-[#81D7B4]" />
            )}
          </button>

          {bookmarkedIds.length > 0 && (
            <button 
              onClick={() => setFilterBookmarksOnly(prev => !prev)}
              className={`text-base font-bold pb-3 transition-colors cursor-pointer relative flex items-center gap-1.5 ${
                filterBookmarksOnly
                  ? 'text-[#81D7B4]' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Bookmark01Icon className="w-4 h-4" />
              <span>Saved ({bookmarkedIds.length})</span>
              {filterBookmarksOnly && (
                <motion.div layoutId="forumTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-[#81D7B4]" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Main Content Area (Threads Feed) */}
        <div className="flex-1 w-full bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 shadow-sm overflow-hidden">
          
          {/* Threads Filter & Search Toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 dark:bg-white/[0.02]">
            
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-gray-900 dark:text-white font-instrument">
                {selectedTag !== 'all' ? `#${selectedTag}` : 'All Threads'}
              </h2>
              {selectedTag !== 'all' && (
                <button
                  onClick={() => setSelectedTag('all')}
                  className="text-[11px] font-bold text-[#81D7B4] hover:underline cursor-pointer"
                >
                  Clear filter
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Topic Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => { setShowTopicDropdown(!showTopicDropdown); setShowSortDropdown(false); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-white/5 border border-gray-200/70 dark:border-white/10 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:border-[#81D7B4] transition-all cursor-pointer"
                >
                  <FilterIcon className="w-3.5 h-3.5 text-[#81D7B4]" />
                  <span>Topic</span>
                  <ArrowDown01Icon className="w-3 h-3 text-gray-400" />
                </button>

                {showTopicDropdown && (
                  <div className="absolute top-full mt-1.5 left-0 w-44 bg-white dark:bg-[#161616] rounded-2xl border border-gray-200/70 dark:border-white/10 shadow-xl py-1.5 z-30">
                    <button
                      onClick={() => { setSelectedTag('all'); setShowTopicDropdown(false); }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${selectedTag === 'all' ? 'text-[#81D7B4] bg-[#81D7B4]/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                      # All Topics
                    </button>
                    {AVAILABLE_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => { setSelectedTag(tag); setShowTopicDropdown(false); }}
                        className={`w-full text-left px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${selectedTag === tag ? 'text-[#81D7B4] bg-[#81D7B4]/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => { setShowSortDropdown(!showSortDropdown); setShowTopicDropdown(false); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-white/5 border border-gray-200/70 dark:border-white/10 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:border-[#81D7B4] transition-all cursor-pointer"
                >
                  <Sorting01Icon className="w-3.5 h-3.5 text-[#81D7B4]" />
                  <span className="capitalize">{sortBy}</span>
                  <ArrowDown01Icon className="w-3 h-3 text-gray-400" />
                </button>

                {showSortDropdown && (
                  <div className="absolute top-full mt-1.5 right-0 w-36 bg-white dark:bg-[#161616] rounded-2xl border border-gray-200/70 dark:border-white/10 shadow-xl py-1.5 z-30">
                    {[
                      { key: 'latest', label: 'Latest' },
                      { key: 'popular', label: 'Most Liked' },
                      { key: 'replies', label: 'Most Replies' }
                    ].map(s => (
                      <button
                        key={s.key}
                        onClick={() => { setSortBy(s.key as any); setShowSortDropdown(false); }}
                        className={`w-full text-left px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${sortBy === s.key ? 'text-[#81D7B4] bg-[#81D7B4]/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search01Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search discussions..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white dark:bg-white/5 border border-gray-200/70 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white outline-none w-32 sm:w-48 focus:w-56 focus:border-[#81D7B4] transition-all"
                />
              </div>

            </div>
          </div>

          {/* Threads List */}
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-16 text-center text-gray-500 dark:text-gray-400">
                <BubbleChatIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-1">
                  {filterBookmarksOnly ? 'No saved bookmarks yet' : 'No discussion threads found'}
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  {filterBookmarksOnly ? 'Bookmark interesting discussions to view them here later.' : 'Be the first to ask a question or start a conversation!'}
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-5 py-2 bg-[#81D7B4] text-white font-bold text-xs rounded-xl hover:opacity-90 transition-all cursor-pointer"
                >
                  Start a Thread
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isBookmarked = bookmarkedIds.includes(post._id);
                const isLiked = post.likedBy?.includes(address?.toLowerCase() || '');
                const isBot = isSavvyBotUser(post.walletAddress, post.savvyName);

                return (
                  <div 
                    key={post._id} 
                    className="p-5 sm:p-6 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Author Line */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          isBot
                            ? 'bg-[#81D7B4] text-white shadow-xs'
                            : 'bg-[#81D7B4]/15 border border-[#81D7B4]/30 text-[#81D7B4]'
                        }`}>
                          {isBot ? (
                            <SparklesIcon className="w-4 h-4 text-white" />
                          ) : (
                            post.savvyName ? post.savvyName.slice(0, 2).toUpperCase() : post.walletAddress.slice(2, 4).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                              {isBot ? 'SavvyBot' : (post.savvyName ? `@${post.savvyName}` : `${post.walletAddress.slice(0, 6)}...${post.walletAddress.slice(-4)}`)}
                            </span>
                            {isBot ? (
                              <span className="px-1.5 py-0.2 bg-[#81D7B4]/15 text-[#81D7B4] rounded text-[9px] font-black uppercase tracking-wider">AI</span>
                            ) : (
                              <Tick02Icon className="w-3.5 h-3.5 text-[#81D7B4]" />
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] text-gray-400 font-medium">
                        {formatForumDate(post.createdAt)}
                      </span>
                    </div>

                    {/* Thread Title & Content */}
                    <Link href={`/dashboard/forum/${post._id}`} className="block group/link my-2">
                      <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-snug mb-1.5 group-hover/link:text-[#81D7B4] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                        {renderFormattedContent(post.content)}
                      </p>
                    </Link>

                    {/* Tags & Action Buttons */}
                    <div className="flex items-center justify-between mt-4 pt-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(post.tags || []).map(tag => (
                          <button 
                            key={tag} 
                            onClick={() => setSelectedTag(tag.toLowerCase())}
                            className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 hover:bg-[#81D7B4]/15 hover:text-[#81D7B4] text-gray-500 dark:text-gray-400 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Bookmark Button */}
                        <button 
                          onClick={(e) => toggleBookmark(post._id, e)}
                          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Thread'}
                          className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                            isBookmarked 
                              ? 'bg-[#81D7B4]/15 border-[#81D7B4]/30 text-[#81D7B4]' 
                              : 'border-gray-200/70 dark:border-white/10 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <Bookmark01Icon className="w-4 h-4" />
                        </button>

                        {/* Upvote Button */}
                        <button 
                          onClick={(e) => handleLike(post._id, e)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                            isLiked 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' 
                              : 'border-gray-200/70 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-[#81D7B4]/40 hover:bg-gray-50 dark:hover:bg-white/5'
                          }`}
                        >
                          <FireIcon className="w-3.5 h-3.5 text-[#81D7B4]" />
                          <span>{post.likes || 0}</span>
                        </button>

                        {/* Reply Button */}
                        <Link 
                          href={`/dashboard/forum/${post._id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#81D7B4]/10 border border-[#81D7B4]/20 text-[#81D7B4] text-xs font-bold hover:bg-[#81D7B4]/20 transition-all"
                        >
                          <BubbleChatIcon className="w-3.5 h-3.5" />
                          <span>{post.replyCount || 0} Replies</span>
                        </Link>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          
          {/* Real Top Contributors Card */}
          <div className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-base font-instrument">
                Top Contributors
              </h3>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active</span>
            </div>

            {topUsers.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No community activity recorded yet.</p>
            ) : (
              <div className="space-y-3.5">
                {topUsers.map((u, i) => {
                  const isBot = isSavvyBotUser(u.walletAddress, u.name);
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          isBot ? 'bg-[#81D7B4] text-white' : 'bg-[#81D7B4]/15 text-[#81D7B4]'
                        }`}>
                          {isBot ? <SparklesIcon className="w-4 h-4" /> : u.avatar}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            {isBot ? 'SavvyBot' : (u.name.startsWith('@') ? u.name : `@${u.name}`)}
                          </span>
                          {isBot ? (
                            <span className="px-1 py-0.2 bg-[#81D7B4]/15 text-[#81D7B4] rounded text-[8px] font-black uppercase">AI</span>
                          ) : (
                            <Tick02Icon className="w-3 h-3 text-[#81D7B4]" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-[#81D7B4] text-xs font-bold bg-[#81D7B4]/10 px-2 py-0.5 rounded-md">
                        <FireIcon className="w-3 h-3" />
                        <span>{u.points}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Real Active Topics Card */}
          <div className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white text-base font-instrument mb-4">
              Active Topics
            </h3>

            {activeTopics.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No topic tags created yet.</p>
            ) : (
              <div className="space-y-2.5">
                {activeTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTag(topic.tag)}
                    className="w-full flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-left"
                  >
                    <span className={`font-bold ${selectedTag === topic.tag ? 'text-[#81D7B4]' : 'text-gray-700 dark:text-gray-300'}`}>
                      #{topic.tag}
                    </span>
                    <span className="text-gray-400 text-[11px] font-medium">
                      {topic.threads} {topic.threads === 1 ? 'thread' : 'threads'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Forum Rules & Guidelines */}
          <div className="p-5 rounded-3xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5 text-xs text-gray-500 dark:text-gray-400 space-y-2">
            <p className="font-bold text-gray-800 dark:text-gray-200">💡 Forum Guidelines</p>
            <p>1. Keep conversations respectful and focused on DeFi & savings.</p>
            <p>2. Tag <span className="font-bold text-[#81D7B4]">@SavvyBot</span> in your question to get instant AI answers on personal finance!</p>
          </div>

        </div>
      </div>

      {/* Start a New Thread Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }} 
              className="bg-white dark:bg-[#161616] rounded-3xl shadow-2xl w-full max-w-lg border border-gray-200/70 dark:border-white/10 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white font-instrument">
                      Start a New Discussion
                    </h2>
                    <p className="text-xs text-gray-400">Share insights, ask questions, or propose ideas.</p>
                  </div>
                  <button 
                    onClick={() => setShowCreateForm(false)} 
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 cursor-pointer"
                  >
                    <Cancel01Icon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Thread Title
                    </label>
                    <input 
                      value={newTitle} 
                      onChange={e => setNewTitle(e.target.value)} 
                      placeholder="e.g. Best yield lock duration for USDC?" 
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 focus:border-[#81D7B4] outline-none text-sm font-bold text-gray-900 dark:text-white" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Discussion Content
                    </label>
                    <textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Type your message... (Tip: mention @SavvyBot to ask the AI bot!)"
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 focus:border-[#81D7B4] outline-none text-sm text-gray-900 dark:text-white resize-none h-32 leading-relaxed"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Topic Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_TAGS.map(tag => (
                        <button 
                          key={tag} 
                          type="button"
                          onClick={() => toggleNewPostTag(tag)} 
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            newTags.includes(tag) 
                              ? 'bg-[#81D7B4] text-white shadow-xs' 
                              : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button 
                    type="button"
                    onClick={() => setShowCreateForm(false)} 
                    className="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleCreatePost} 
                    disabled={isPosting} 
                    className="flex-1 py-3 bg-[#81D7B4] hover:opacity-90 text-white font-bold rounded-2xl text-xs disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                  >
                    {isPosting ? 'Publishing...' : 'Publish Discussion'}
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
