'use client';

import { ArrowRight01Icon, TextIcon } from "hugeicons-react";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blogDatabase';
import BlogImage, { BlogImageSizes } from './BlogImage';
import { motion } from 'framer-motion';

interface BlogResponse {
  posts: BlogPost[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentPosts();
  }, []);

  const fetchRecentPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts?published=true&limit=3');
      const data: BlogResponse = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const renderMarkdownExcerpt = (content: string, maxLength: number = 120) => {
    return truncateText(content, maxLength);
  };

  if (loading) {
    return (
      <section className="py-24 md:py-32 lg:py-40 bg-[#f8fafc] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
            <div>
              <div className="h-6 w-32 bg-slate-200 rounded-full mb-8"></div>
              <div className="h-16 w-80 md:w-96 bg-slate-200 rounded-2xl"></div>
            </div>
            <div className="h-12 w-40 bg-slate-200 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white/70 rounded-[2.5rem] h-[450px] overflow-hidden border border-slate-200">
                <div className="h-56 bg-slate-100 w-full mb-8"></div>
                <div className="px-8 space-y-4">
                  <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                  <div className="h-8 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-full mt-4"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-24 md:py-32 lg:py-40 bg-[#f8fafc] relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.4 }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-slate-200 mb-6 backdrop-blur-md shadow-sm">
              <span className="text-xs font-bold text-slate-600 tracking-[0.25em] uppercase">Our Blog</span>
            </div>
            <h2 className="font-instrument text-5xl md:text-7xl lg:text-8xl tracking-tight text-slate-900 leading-none">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5fb392] to-[#81D7B4] drop-shadow-sm">Insights</span>
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link
              href="/blog"
              className="hidden md:inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-slate-200 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:border-[#81D7B4]/50 transition-all duration-300 group shadow-sm"
            >
              View All Posts
              <ArrowRight01Icon className="w-4 h-4 group-hover:translate-x-1 group-hover:text-[#5fb392] transition-all" />
            </Link>
          </motion.div>
        </div>

        {/* Blog Posts */}
        {posts.length > 0 ? (
          <>
            {/* Grid / Carousel on Mobile */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 lg:gap-10 mb-16 md:pb-0 md:mx-0 md:px-0 md:overflow-visible md:snap-none">
              {posts.map((post, index) => (
                <motion.article 
                  key={post.slug || index} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group flex flex-col h-full bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-[2.5rem] overflow-hidden snap-center shrink-0 min-w-[300px] max-w-[380px] md:min-w-0 md:max-w-none md:shrink md:snap-align-none relative hover:bg-white hover:border-[#81D7B4]/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-500"
                >
                  <Link href={`/blog/${post.slug}`} className="flex flex-col h-full relative z-10">
                    {/* Featured Image */}
                    <div className="w-full aspect-[4/3] relative overflow-hidden bg-slate-50 m-3 rounded-[2rem] w-[calc(100%-24px)]">
                      {post.featuredImage ? (
                        <BlogImage
                          src={post.featuredImage}
                          alt={post.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-all duration-700 ease-out"
                          aspectRatio="video"
                          sizes={BlogImageSizes.thumbnail}
                          priority={false}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-50">
                          <TextIcon className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <span className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-[10px] font-bold text-slate-800 uppercase tracking-widest shadow-sm">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 flex flex-col space-y-4 p-8 pt-6">
                      <div className="flex items-center gap-3 text-sm font-medium text-slate-500 uppercase tracking-widest text-[10px]">
                        <span>{formatDate(post.publishedAt || new Date().toISOString())}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-[#5fb392] font-bold">{post.readTime} min read</span>
                      </div>
                      
                      <h3 className="font-instrument text-3xl font-bold text-slate-900 group-hover:text-[#5fb392] transition-colors leading-tight line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-slate-500 line-clamp-3 text-base leading-relaxed flex-1 font-light">
                        {renderMarkdownExcerpt(post.excerpt, 120)}
                      </p>
                      
                      <div className="pt-6 mt-auto border-t border-slate-100 group-hover:border-[#81D7B4]/20 transition-colors">
                        <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-800 group-hover:text-[#5fb392] transition-colors uppercase tracking-widest">
                          Read Article
                          <ArrowRight01Icon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
            
            <div className="md:hidden text-center mt-8">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-[#5fb392] transition-colors w-full max-w-sm"
              >
                View All Posts
                <ArrowRight01Icon className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          /* No Posts State */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-32 bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[3rem] relative overflow-hidden"
          >
            <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6 text-[#5fb392] shadow-sm">
              <TextIcon className="w-8 h-8" />
            </div>
            <h3 className="font-instrument text-4xl font-bold text-slate-900 mb-4">
              Coming Soon
            </h3>
            <p className="text-lg text-slate-500 font-light max-w-md mx-auto">
              We're crafting new content. Check back shortly for updates and insights.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}