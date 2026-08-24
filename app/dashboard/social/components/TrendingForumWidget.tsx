'use client';

import { useState, useEffect } from 'react';
import { Activity01Icon, BubbleChatIcon, ArrowRight01Icon, FireIcon } from "hugeicons-react";
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ForumPost {
  _id: string;
  title: string;
  walletAddress: string;
  savvyName: string | null;
  replyCount: number;
  likes: number;
}

export default function TrendingForumWidget() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/forum?limit=3');
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (e) {
        console.error('Failed to fetch trending posts', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight font-instrument flex items-center gap-2.5">
            <span className="w-2.5 h-7 bg-[#81D7B4] rounded-full"></span>
            Trending in Forum
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5 ml-5">
            Join the latest discussions and ideas from the BitSave community.
          </p>
        </div>
        <Link 
          href="/dashboard/forum" 
          className="text-xs font-bold text-[#81D7B4] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>View All</span>
          <ArrowRight01Icon className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-white/5 rounded-3xl animate-pulse border border-gray-200/50 dark:border-white/5" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 shadow-sm">
          <BubbleChatIcon className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold">No trending discussions yet.</p>
          <Link href="/dashboard/forum" className="text-[#81D7B4] text-xs font-bold hover:underline mt-1 inline-block">
            Start the first conversation &rarr;
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {posts.map((post, i) => (
            <Link href={`/dashboard/forum/${post._id}`} key={post._id}>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 p-4 sm:p-5 hover:border-[#81D7B4]/50 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between group gap-4"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* User Initial Avatar */}
                  <div className="w-10 h-10 shrink-0 rounded-2xl bg-[#81D7B4]/15 border border-[#81D7B4]/30 flex items-center justify-center text-[#81D7B4] font-black text-xs shadow-xs">
                    {post.savvyName ? post.savvyName.slice(0, 2).toUpperCase() : post.walletAddress.slice(2, 4).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-snug mb-0.5 group-hover:text-[#81D7B4] transition-colors truncate">
                      {post.title}
                    </h3>
                    <span className="text-[11px] font-bold text-gray-400">
                      {post.savvyName ? `@${post.savvyName}` : `${post.walletAddress.slice(0, 6)}...${post.walletAddress.slice(-4)}`}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 bg-gray-50 dark:bg-white/5 px-3.5 py-1.5 rounded-2xl border border-gray-200/50 dark:border-white/5">
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 font-bold text-xs">
                    <FireIcon className="w-3.5 h-3.5 text-[#81D7B4]" /> 
                    <span>{post.likes || 0}</span>
                  </div>
                  <div className="w-[1px] h-3 bg-gray-200 dark:bg-white/10"></div>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 font-bold text-xs">
                    <BubbleChatIcon className="w-3.5 h-3.5 text-[#81D7B4]" />
                    <span>{post.replyCount || 0}</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
