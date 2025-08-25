'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blogDatabase';
import AnalyticsDisplay from '@/components/AnalyticsDisplay';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalCategories: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalCategories: 0
  });
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all posts
      const postsResponse = await fetch('/api/blog/posts?limit=100');
      const postsData = await postsResponse.json();
      const allPosts = postsData.posts || [];
      
      // Fetch categories
      const categoriesResponse = await fetch('/api/blog/categories');
      const categoriesData = await categoriesResponse.json();
      const categories = categoriesData.categories || [];
      
      // Calculate stats
      const publishedPosts = allPosts.filter((post: BlogPost) => post.published).length;
      const draftPosts = allPosts.filter((post: BlogPost) => !post.published).length;
      
      setStats({
        totalPosts: allPosts.length,
        publishedPosts,
        draftPosts,
        totalCategories: categories.length
      });
      
      // Set recent posts (last 5)
      setRecentPosts(allPosts.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81D7B4]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your blog management center</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="px-6 py-3 bg-[#81D7B4] text-white rounded-xl hover:bg-[#66C4A3] transition-colors font-medium"
        >
          Create New Post
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#81D7B4]/10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalPosts}</p>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#81D7B4]/10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-3xl font-bold text-green-600">{stats.publishedPosts}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#81D7B4]/10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.draftPosts}</p>
            </div>
            <div className="text-3xl">📄</div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#81D7B4]/10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalCategories}</p>
            </div>
            <div className="text-3xl">📁</div>
          </div>
        </div>
      </div>

      {/* Blog Analytics Overview */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#81D7B4]/10 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">📊 Blog Analytics Overview</h2>
          <p className="text-gray-600 text-sm mt-1">Track your blog&apos;s performance and engagement</p>
        </div>
        
        <div className="p-6">
          {recentPosts.length > 0 ? (
            <div className="space-y-6">
              {/* Top Performing Posts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Posts</h3>
                <div className="space-y-4">
                  {recentPosts.slice(0, 3).map((post) => (
                    <div key={post._id?.toString()} className="bg-gray-50/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800 line-clamp-1">{post.title}</h4>
                        <Link
                          href={`/admin/posts/${post._id}`}
                          className="text-[#81D7B4] hover:text-[#66C4A3] text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                      {post._id && (
                        <AnalyticsDisplay 
                          postId={post._id.toString()} 
                          showDetailed={false}
                          className="bg-white/50 rounded-lg"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Quick Analytics Summary */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="/admin/posts"
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-blue-800">View All Analytics</div>
                      <div className="text-sm text-blue-600">Detailed post performance</div>
                    </div>
                    <div className="text-2xl">📈</div>
                  </Link>
                  
                  <Link
                    href="/admin/posts/new"
                    className="flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-green-800">Create New Post</div>
                      <div className="text-sm text-green-600">Start writing content</div>
                    </div>
                    <div className="text-2xl">✏️</div>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No analytics data yet</h3>
              <p className="text-gray-500 mb-4">Create and publish posts to start tracking analytics</p>
              <Link
                href="/admin/posts/new"
                className="inline-flex items-center px-4 py-2 bg-[#81D7B4] text-white rounded-lg hover:bg-[#66C4A3] transition-colors font-medium"
              >
                Create First Post
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#81D7B4]/10 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Recent Posts</h2>
            <Link
              href="/admin/posts"
              className="text-[#81D7B4] hover:text-[#66C4A3] font-medium"
            >
              View All →
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {recentPosts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-4">Create your first blog post to get started</p>
              <Link
                href="/admin/posts/new"
                className="inline-flex items-center px-4 py-2 bg-[#81D7B4] text-white rounded-lg hover:bg-[#66C4A3] transition-colors font-medium"
              >
                Create Post
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div
                  key={post._id?.toString()}
                  className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-800 line-clamp-1">
                        {post.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.published 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>By {post.author}</span>
                      <span>•</span>
                      <span>{post.category}</span>
                      <span>•</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="px-3 py-1 text-[#81D7B4] hover:text-[#66C4A3] text-sm font-medium"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/posts/${post._id}`}
                      className="px-3 py-1 bg-[#81D7B4] text-white rounded-lg hover:bg-[#66C4A3] transition-colors text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/posts/new"
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#81D7B4]/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">✏️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Create New Post</h3>
            <p className="text-gray-600 text-sm">Write and publish a new blog article</p>
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#81D7B4]/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Manage Categories</h3>
            <p className="text-gray-600 text-sm">Organize your content with categories</p>
          </div>
        </Link>

        <Link
          href="/blog"
          target="_blank"
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#81D7B4]/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">👁️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">View Blog</h3>
            <p className="text-gray-600 text-sm">See how your blog looks to visitors</p>
          </div>
        </Link>
      </div>
    </div>
  );
}