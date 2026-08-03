'use client';

import { useState, useEffect } from 'react';
import { Activity01Icon } from "hugeicons-react";
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-8 bg-[#81D7B4] rounded-full"></span>
            Trending in Forum
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 ml-4 text-sm">Join the latest conversations in the BitSave community</p>
        </div>
        <Link href="/dashboard/forum" className="text-[#81D7B4] font-bold text-sm hover:underline">View All</Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-[88px] bg-white dark:bg-[#161616] rounded-2xl animate-pulse border border-gray-100 dark:border-white/5" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No trending discussions yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post, i) => (
            <Link href={`/dashboard/forum/${post._id}`} key={post._id}>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-white/5 p-4 sm:p-5 hover:border-[#81D7B4]/40 dark:hover:border-[#81D7B4]/40 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between group gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-11 h-11 shrink-0 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/20 flex items-center justify-center text-[#81D7B4] font-black text-sm shadow-sm">
                    {post.savvyName ? post.savvyName.slice(0, 2).toUpperCase() : post.walletAddress.slice(2, 4).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg leading-snug mb-1 group-hover:text-[#2D5A4A] dark:group-hover:text-[#81D7B4] transition-colors truncate">
                      {post.title}
                    </h3>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {post.savvyName ? `@${post.savvyName}` : `${post.walletAddress.slice(0, 6)}...`}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 shrink-0 bg-gray-50 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-bold text-sm">
                    <Activity01Icon className="w-4 h-4 text-[#81D7B4]" /> 
                    <span>{post.likes || 0}</span>
                  </div>
                  <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-bold text-sm">
                    <svg className="w-4 h-4 text-[#81D7B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
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
