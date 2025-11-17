'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blogDatabase';
import BlogImage, { BlogImageSizes } from './BlogImage';
import { FiArrowRight, FiFileText } from 'react-icons/fi';

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
    // The excerpt is already processed on the server side, just truncate if needed
    return truncateText(content, maxLength);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-[#F8FDFC] to-[#E8F8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Latest from Our Blog
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay updated with the latest insights, tips, and news about financial wellness and smart saving strategies.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#81D7B4]/10 shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-[#F8FDFC] to-[#E8F8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Latest from Our Blog
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Stay updated with the latest insights, tips, and news about financial wellness and smart saving strategies.
          </p>
        </div>

        {/* Blog Posts */}
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {posts.map((post) => (
                <article key={post._id?.toString()} className="group">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-[#81D7B4]/10 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      {/* Featured Image */}
                      {post.featuredImage ? (
                        <div className="h-48 overflow-hidden">
                          <BlogImage
                            src={post.featuredImage}
                            alt={post.title}
                            className="group-hover:scale-105 transition-transform duration-300"
                            aspectRatio="video"
                            sizes={BlogImageSizes.thumbnail}
                            priority={false}
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-[#81D7B4]/20 to-[#66C4A3]/20 flex items-center justify-center">
                          <FiFileText className="w-14 h-14 text-[#81D7B4]/40" />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="p-6">
                        {/* Category */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 bg-[#81D7B4]/10 text-[#81D7B4] rounded-full text-sm font-medium">
                            {post.category}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {post.readTime} min read
                          </span>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[#81D7B4] transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        
                        {/* Excerpt */}
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {renderMarkdownExcerpt(post.excerpt, 120)}
                        </p>
                        
                        {/* Meta */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>By {post.author}</span>
                          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
            
            {/* View All Button */}
            <div className="text-center">
              <Link
                href="/blog"
                className="inline-flex items-center px-8 py-4 bg-[#81D7B4] text-white rounded-2xl hover:bg-[#66C4A3] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                View All Posts
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </>
        ) : (
          /* No Posts State */
          <div className="text-center py-16">
            <FiFileText className="w-20 h-20 mx-auto mb-6 text-[#81D7B4]/40" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Coming Soon!
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We&apos;re working on creating amazing content for you. Check back soon for the latest insights on financial wellness and smart saving strategies.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-[#81D7B4] text-white rounded-xl hover:bg-[#66C4A3] transition-colors font-medium"
            >
              Visit Blog Page
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}