'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blogDatabase';
import BlogImage, { BlogImageSizes } from './BlogImage';
import { FiArrowRight, FiFileText } from 'react-icons/fi';
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
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-24">
            <div className="h-4 w-32 bg-gray-100 rounded mb-8"></div>
            <div className="h-16 w-96 bg-gray-100 rounded"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-50 rounded-[2.5rem] h-[500px] overflow-hidden border border-gray-100">
                <div className="h-64 bg-gray-200 w-full mb-8"></div>
                <div className="px-8 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-16 md:py-24 lg:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
             <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/20">
              <span className="w-2 h-2 rounded-full bg-[#81D7B4]"></span>
              <span className="text-sm font-bold text-[#81D7B4] tracking-wide uppercase">Our Blog</span>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-none">
              Latest Insights
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/blog"
              className="hidden md:inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gray-50 border border-gray-100 text-lg font-bold text-gray-900 hover:bg-[#81D7B4] hover:text-white hover:border-[#81D7B4] transition-all duration-300 group"
            >
              View All Posts
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Blog Posts */}
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {posts.map((post, index) => (
                <motion.article 
                  key={post.slug || index} 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="group flex flex-col h-full bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:border-[#81D7B4]/30 hover:shadow-2xl hover:shadow-[#81D7B4]/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                >
                  <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
                    {/* Featured Image */}
                    <div className="w-full aspect-[4/3] relative">
                      {post.featuredImage ? (
                        <div className="w-full h-full relative overflow-hidden">
                          <BlogImage
                            src={post.featuredImage}
                            alt={post.title}
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                            aspectRatio="video"
                            sizes={BlogImageSizes.thumbnail}
                            priority={false}
                          />
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 group-hover:bg-[#81D7B4]/5 transition-colors">
                          <FiFileText className="w-12 h-12 text-gray-400 group-hover:text-[#81D7B4] transition-colors duration-500" />
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 text-xs font-bold text-[#81D7B4] uppercase tracking-wider shadow-sm">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 flex flex-col space-y-4 p-8">
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{formatDate(post.publishedAt || new Date().toISOString())}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{post.readTime} min read</span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#81D7B4] transition-colors leading-tight line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-500 line-clamp-3 text-base leading-relaxed flex-1">
                        {renderMarkdownExcerpt(post.excerpt, 120)}
                      </p>
                      
                      <div className="pt-6 mt-auto border-t border-gray-200/50">
                        <span className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide group-hover:translate-x-2 transition-transform duration-300">
                          Read Article
                          <FiArrowRight className="w-4 h-4 text-[#81D7B4]" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
            
            <div className="md:hidden text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#81D7B4] text-white font-bold shadow-lg shadow-[#81D7B4]/20 hover:bg-[#6BC5A0] transition-all"
              >
                View All Posts
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </>
        ) : (
          /* No Posts State */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-32 bg-gray-50 rounded-[3rem] border border-gray-100"
          >
            <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-8 text-[#81D7B4]">
              <FiFileText className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Coming Soon
            </h3>
            <p className="text-xl text-gray-500 mb-8 max-w-md mx-auto">
              We're crafting new content. Check back shortly for updates.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}