'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChatBubbleLeftRight, HiOutlineHeart, HiOutlinePaperAirplane, HiOutlinePlus, HiOutlineXMark, HiOutlineSparkles, HiOutlineHashtag } from 'react-icons/hi2';
import toast from 'react-hot-toast';

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

const TAGS = ['savings', 'defi', 'strategy', 'help', 'general'];

export default function SavvyForum() {
  const { address } = useAccount();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  // Ask Bot feature
  const [askBotPost, setAskBotPost] = useState<ForumPost | null>(null);
  const [askBotChat, setAskBotChat] = useState<{role: 'user'|'bot', content: string}[]>([]);
  const [askBotInput, setAskBotInput] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const botChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    botChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [askBotChat, isBotThinking]);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = activeTag ? `/api/forum?tag=${activeTag}` : '/api/forum';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      console.error('Failed to fetch posts');
    } finally {
      setIsLoading(false);
    }
  }, [activeTag]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

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
        toast.success('Post created!');
        setShowCreateForm(false);
        setNewTitle(''); setNewContent(''); setNewTags([]);
        fetchPosts();
      } else { toast.error('Failed to create post'); }
    } catch { toast.error('An error occurred'); } finally { setIsPosting(false); }
  };

  const handleReply = async (postId: string) => {
    const replyContent = replyInputs[postId]?.trim();
    if (!replyContent || !address) return;
    try {
      const res = await fetch('/api/forum', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, walletAddress: address, replyContent, action: 'reply' }),
      });
      if (res.ok) {
        setReplyInputs(prev => ({ ...prev, [postId]: '' }));
        await fetchPosts();

        // Check if reply invokes the bot
        if (replyContent.toLowerCase().match(/^@savvy(?:bot)?\b/)) {
          const currentPost = posts.find(p => p._id === postId);
          const context = currentPost ? `Forum discussion context: "${currentPost.title}" - ${currentPost.content}` : '';
          
          try {
            const botRes = await fetch('/api/savvy-bot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                question: replyContent.replace(/^@savvy(?:bot)?\b/i, '').trim() || 'Respond to this discussion.',
                chatHistory: [{ role: 'System', content: context }]
              })
            });
            
            if (botRes.ok) {
              const botData = await botRes.json();
              await fetch('/api/forum', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  postId, 
                  walletAddress: '0x0000000000000000000000000000000SavvyBot', 
                  replyContent: botData.reply, 
                  action: 'reply',
                  savvyName: 'SavvyBot'
                }),
              });
              await fetchPosts();
            }
          } catch (e) {
            console.error('Failed to get bot reply', e);
          }
        }
      }
    } catch { toast.error('Failed to reply'); }
  };

  const startAskBot = (post: ForumPost) => {
    setAskBotPost(post);
    setAskBotChat([
      { role: 'bot', content: `Hi! I'm Savvy Bot. I've read the post: "${post.title}". What would you like to know or discuss about it?` }
    ]);
    setAskBotInput('');
  };

  const handleAskBotQuery = async () => {
    if (!askBotInput.trim() || isBotThinking) return;
    const query = askBotInput.trim();
    setAskBotChat(prev => [...prev, { role: 'user', content: query }]);
    setAskBotInput('');
    setIsBotThinking(true);

    try {
      const context = `Forum post being discussed: "${askBotPost?.title}" - ${askBotPost?.content}`;
      const botRes = await fetch('/api/savvy-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          chatHistory: [
            { role: 'System', content: context },
            ...askBotChat.slice(-4).map(m => ({ role: m.role === 'user' ? 'User' : 'Assistant', content: m.content }))
          ]
        })
      });
      
      const botData = await botRes.json();
      setAskBotChat(prev => [...prev, { role: 'bot', content: botRes.ok ? botData.reply : 'Sorry, an error occurred.' }]);
    } catch {
      setAskBotChat(prev => [...prev, { role: 'bot', content: 'Connection error while contacting Savvy Bot.' }]);
    } finally {
      setIsBotThinking(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!address) return;
    const lowerAddress = address.toLowerCase();

    // Optimistic UI update
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

  const renderContentWithMentions = (content: string) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-[#81D7B4] font-bold bg-[#81D7B4]/10 px-1 py-0.5 rounded-md">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const toggleTag = (tag: string) => {
    setNewTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="w-2 h-8 bg-[#81D7B4] rounded-full"></span>
            Savvy Forum
          </h2>
          <p className="text-gray-500 mt-1 ml-4 text-sm">Discuss strategies, ask questions, and chat with Savvy Bot</p>
        </div>
        <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-xl text-sm transition-colors shadow-sm">
          <HiOutlinePlus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Tag Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setActiveTag(null)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${!activeTag ? 'bg-[#81D7B4] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All
        </button>
        {TAGS.map(tag => (
          <button key={tag} onClick={() => setActiveTag(tag)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${activeTag === tag ? 'bg-[#81D7B4] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <HiOutlineHashtag className="w-3 h-3" />{tag}
          </button>
        ))}
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-gray-100" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <HiOutlineChatBubbleLeftRight className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">No posts yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <motion.div key={post._id} layout className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#81D7B4]/20 transition-colors">
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-[15px] leading-tight">{post.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs font-bold text-[#81D7B4]">{post.savvyName ? `@${post.savvyName}` : `${post.walletAddress.slice(0, 6)}...`}</span>
                      <span className="text-[10px] text-gray-400">•</span>
                      <span className="text-[10px] text-gray-400 font-medium">{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">{renderContentWithMentions(post.content)}</p>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-[#81D7B4]/5 text-[#81D7B4] text-[10px] font-bold rounded-md">#{tag}</span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button onClick={() => handleLike(post._id)} className={`flex items-center gap-1 text-xs font-bold transition-colors ${post.likedBy?.includes(address?.toLowerCase() || '') ? 'text-[#81D7B4]' : 'text-gray-400 hover:text-[#81D7B4]'}`}>
                    <HiOutlineHeart className={`w-4 h-4 ${post.likedBy?.includes(address?.toLowerCase() || '') ? 'fill-[#81D7B4]/20' : ''}`} /> {post.likes || 0}
                  </button>
                  <button onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-[#81D7B4] transition-colors">
                    <HiOutlineChatBubbleLeftRight className="w-4 h-4" /> {post.replyCount || 0}
                  </button>
                  <button onClick={() => startAskBot(post)} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-[#81D7B4] transition-colors ml-auto">
                    <HiOutlineSparkles className="w-4 h-4" /> Ask Bot
                  </button>
                </div>
              </div>

              {/* Expanded Replies */}
              <AnimatePresence>
                {expandedPost === post._id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-gray-50 bg-[#FAFBFA]">
                    <div className="p-4 space-y-2.5 max-h-60 overflow-y-auto">
                      {(!post.replies || post.replies.length === 0) && (
                        <p className="text-xs text-gray-400 text-center py-2">No replies yet</p>
                      )}
                      {post.replies?.map((reply) => (
                        <div key={reply._id} className="flex gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-[#81D7B4]/15 flex items-center justify-center text-[8px] font-black text-[#2D5A4A] shrink-0 mt-0.5">
                            {reply.savvyName ? reply.savvyName.slice(0, 2).toUpperCase() : reply.walletAddress.slice(2, 4).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-[#81D7B4]">{reply.savvyName ? `@${reply.savvyName}` : `${reply.walletAddress.slice(0, 6)}...`}</span>
                              <span className="text-[9px] text-gray-400">{timeAgo(reply.createdAt)}</span>
                            </div>
                            <p className="text-xs text-gray-700 mt-0.5">{renderContentWithMentions(reply.content)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reply Input */}
                    <div className="p-3 border-t border-gray-100 flex gap-2">
                      <input
                        value={replyInputs[post._id] || ''}
                        onChange={(e) => setReplyInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleReply(post._id); }}
                        placeholder="Write a reply..."
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#81D7B4]"
                      />
                      <button onClick={() => handleReply(post._id)} disabled={!replyInputs[post._id]?.trim()} className="w-8 h-8 flex items-center justify-center bg-[#81D7B4] hover:bg-[#6BC4A0] text-white rounded-lg disabled:opacity-40 shrink-0">
                        <HiOutlinePaperAirplane className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Ask Bot Modal */}
      <AnimatePresence>
        {askBotPost && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl w-full max-w-lg h-[80vh] sm:h-[600px] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#81D7B4]/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#81D7B4] to-[#6BC4A0] flex items-center justify-center text-white">
                    <HiOutlineSparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">Ask SavvyBot</h3>
                    <p className="text-[10px] uppercase tracking-wider text-[#81D7B4] font-bold">About &quot;{askBotPost.title.slice(0, 20)}...&quot;</p>
                  </div>
                </div>
                <button onClick={() => setAskBotPost(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>

              {/* Bot Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50/50">
                {askBotChat.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user' ? 'bg-[#81D7B4] text-white font-bold rounded-br-md shadow-sm' : 'bg-white border border-gray-100 text-gray-800 font-medium rounded-bl-md shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isBotThinking && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={botChatEndRef} />
              </div>

              {/* Bot Input */}
              <div className="p-3 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 focus-within:border-[#81D7B4] transition-colors">
                  <input
                    value={askBotInput}
                    onChange={(e) => setAskBotInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAskBotQuery(); }}
                    placeholder="Ask about this post..."
                    className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                  />
                  <button onClick={handleAskBotQuery} disabled={!askBotInput.trim() || isBotThinking} className="w-9 h-9 flex items-center justify-center bg-[#81D7B4] hover:bg-[#6BC4A0] text-white rounded-lg disabled:opacity-50 shrink-0 shadow-sm transition-all focus:ring-4 focus:ring-[#81D7B4]/20">
                    <HiOutlinePaperAirplane className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-gray-900">New Discussion</h2>
                  <button onClick={() => setShowCreateForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
                    <HiOutlineXMark className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Discussion title" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 outline-none text-sm font-bold text-gray-900" />

                  <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Share your thoughts..." rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 outline-none text-sm font-medium text-gray-900 resize-none" />

                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {TAGS.map(tag => (
                        <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${newTags.includes(tag) ? 'bg-[#81D7B4] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowCreateForm(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl">Cancel</button>
                  <button onClick={handleCreatePost} disabled={isPosting} className="flex-1 py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-xl disabled:opacity-50">
                    {isPosting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
