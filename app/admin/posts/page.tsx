'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blogDatabase';
import ViewCounter from '@/components/ViewCounter';
import { BarChart3 } from 'lucide-react';
import AnalyticsModal from '@/components/AnalyticsModal';
import ConfirmationModal from '@/components/ConfirmationModal';

interface BlogResponse {
  posts: BlogPost[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [analyticsModal, setAnalyticsModal] = useState<{ isOpen: boolean; postId: string; postTitle: string }>({ isOpen: false, postId: '', postTitle: '' });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; postId: string; postTitle: string }>({ isOpen: false, postId: '', postTitle: '' });

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '50'
      });
      
      if (filter !== 'all') {
        params.append('published', filter === 'published' ? 'true' : 'false');
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/blog/posts?${params}`);
      const data: BlogResponse = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleDelete = (postId: string, postTitle: string) => {
    setConfirmModal({ isOpen: true, postId, postTitle });
  };

  const confirmDelete = async () => {
    const postId = confirmModal.postId;
    
    try {
      setDeleting(postId);
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setPosts(posts.filter(post => post._id?.toString() !== postId));
        setConfirmModal({ isOpen: false, postId: '', postTitle: '' });
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setDeleting(null);
    }
  };

  const togglePublished = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/blog/posts/${post._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !post.published })
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(p => 
          p._id?.toString() === post._id?.toString() ? data.post : p
        ));
      } else {
        alert('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post');
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'published') return post.published;
    if (filter === 'draft') return !post.published;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Posts</h1>
          <p className="text-gray-600 mt-1">Manage your blog posts</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="px-6 py-3 bg-[#81D7B4] text-white rounded-xl hover:bg-[#66C4A3] transition-colors font-medium"
        >
          Create New Post
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#81D7B4]/10 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#81D7B4] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({posts.length})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'published'
                  ? 'bg-[#81D7B4] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Published ({posts.filter(p => p.published).length})
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'draft'
                  ? 'bg-[#81D7B4] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Drafts ({posts.filter(p => !p.published).length})
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/20 focus:border-[#81D7B4] text-black"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#81D7B4] text-white rounded-lg hover:bg-[#66C4A3] transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#81D7B4]/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81D7B4]"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts found</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Create your first blog post to get started'
                : `No ${filter} posts found`}
            </p>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center px-6 py-3 bg-[#81D7B4] text-white rounded-xl hover:bg-[#66C4A3] transition-colors font-medium"
            >
              Create New Post
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPosts.map((post) => (
              <div key={post._id?.toString()} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">
                        {post.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        post.published 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>By {post.author}</span>
                      <span>•</span>
                      <span>{post.category}</span>
                      <span>•</span>
                      <span>{post.readTime} min read</span>
                      <span>•</span>
                      <span>
                        {post.published && post.publishedAt 
                          ? `Published ${formatDate(post.publishedAt)}`
                          : `Created ${formatDate(post.createdAt)}`}
                      </span>
                      {post._id && (
                        <>
                          <span>•</span>
                          <ViewCounter 
                            postId={post._id.toString()} 
                            className="text-sm"
                            showIcon={true}
                          />
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="px-3 py-1 text-[#81D7B4] hover:text-[#66C4A3] text-sm font-medium"
                    >
                      View
                    </Link>
                    
                    <button
                      onClick={() => {
                        setAnalyticsModal({
                          isOpen: true,
                          postId: post._id!.toString(),
                          postTitle: post.title
                        });
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-gray-600 hover:text-[#81D7B4] hover:bg-[#81D7B4]/10 rounded-lg transition-colors text-sm font-medium"
                      title="View Analytics"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </button>
                    
                    <Link
                      href={`/admin/posts/${post._id}`}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Edit
                    </Link>
                    
                    <button
                      onClick={() => togglePublished(post)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        post.published
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {post.published ? 'Unpublish' : 'Publish'}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(post._id?.toString() || '', post.title)}
                      disabled={deleting === post._id?.toString()}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {deleting === post._id?.toString() ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Analytics Modal */}
      <AnalyticsModal
        isOpen={analyticsModal.isOpen}
        onClose={() => setAnalyticsModal({ isOpen: false, postId: '', postTitle: '' })}
        postId={analyticsModal.postId}
        postTitle={analyticsModal.postTitle}
      />
      
      {/* Confirmation Modal */}
       <ConfirmationModal
         isOpen={confirmModal.isOpen}
         onClose={() => setConfirmModal({ isOpen: false, postId: '', postTitle: '' })}
         onConfirm={confirmDelete}
         title="Delete Post"
         message={`Are you sure you want to delete "${confirmModal.postTitle}"? This action cannot be undone.`}
         confirmText="Delete"
         isDestructive={true}
         isLoading={deleting === confirmModal.postId}
       />
    </div>
  );
}