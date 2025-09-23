'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BlogPost, BlogCategory } from '@/lib/blogDatabase';
import BlogImage, { BlogImageSizes } from '@/app/components/BlogImage';
import ViewCounter from '@/components/ViewCounter';

interface BlogResponse {
  posts: BlogPost[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

interface CategoriesResponse {
  categories: BlogCategory[];
}

export default function BlogListingClient() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');


  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/blog/categories');
      const data: CategoriesResponse = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        published: 'true',
        limit: '6',
        skip: reset ? '0' : posts.length.toString()
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/blog/posts?${params}`);
      const data: BlogResponse = await response.json();

      if (reset) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }

      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, searchQuery, posts.length]);

  useEffect(() => {
    fetchCategories();
    fetchPosts(true);
  }, [fetchCategories, fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchTerm('');
    setSearchQuery('');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FDFC] to-[#E8F8F5]">
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-[#81D7B4]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Our Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover expert insights on financial wellness, smart saving strategies, and tips to help you achieve your financial goals.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#81D7B4]/10 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 w-full lg:w-auto">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search blog posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/20 focus:border-[#81D7B4] text-gray-900"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#81D7B4] text-white rounded-xl hover:bg-[#66C4A3] transition-colors font-medium"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === ''
                      ? 'bg-[#81D7B4] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id?.toString()}
                    onClick={() => handleCategoryChange(category.name)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-[#81D7B4] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#81D7B4]/10 shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📝</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {searchQuery || selectedCategory ? 'No posts found' : 'No blog posts yet'}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {searchQuery || selectedCategory
                ? 'Try adjusting your search or filter criteria.'
                : 'Check back soon for the latest insights and tips!'}
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSearchTerm('');
                  setSearchQuery('');
                }}
                className="px-6 py-3 bg-[#81D7B4] text-white rounded-xl hover:bg-[#66C4A3] transition-colors font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
                            sizes={BlogImageSizes.featured}
                            priority={false}
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-[#81D7B4]/20 to-[#66C4A3]/20 flex items-center justify-center">
                          <div className="text-6xl text-[#81D7B4]/40">📝</div>
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
                        <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[#81D7B4] transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        
                        {/* Excerpt */}
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {renderMarkdownExcerpt(post.excerpt, 120)}
                        </p>
                        
                        {/* Meta */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span>By {post.author}</span>
                          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                        </div>
                        
                        {/* View Count */}
                        <div className="flex items-center">
                          {post._id && (
                            <ViewCounter 
                              postId={post._id.toString()} 
                              className="text-sm"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={() => fetchPosts(false)}
                  disabled={loadingMore}
                  className="px-8 py-4 bg-[#81D7B4] text-white rounded-2xl hover:bg-[#66C4A3] transition-colors font-semibold disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loadingMore && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  )}
                  {loadingMore ? 'Loading...' : 'Load More Posts'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      

    </div>
  );
}