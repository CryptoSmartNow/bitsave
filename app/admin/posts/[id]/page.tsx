'use client';
import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BlogPost, BlogCategory } from '@/lib/blogDatabase';

import ImageUpload from '@/app/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';
import ConfirmationModal from '@/components/ConfirmationModal';
import SuccessModal from '@/app/components/SuccessModal';


interface FormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string;
  author: string;
  published: boolean;
  featuredImage?: string;
}

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    author: '',
    published: false,
    featuredImage: ''
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/blog/posts/${id}`);
      if (response.ok) {
        const data = await response.json();
        const postData = data.post;
        setPost(postData);
        setFormData({
          title: postData.title,
          content: postData.content,
          excerpt: postData.excerpt || '',
          category: postData.category,
          tags: postData.tags.join(', '),
          author: postData.author,
          published: postData.published,
          featuredImage: postData.featuredImage || ''
        });
      } else {
        router.push('/admin/posts');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      router.push('/admin/posts');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchPost();
    fetchCategories();
  }, [fetchPost]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories');
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent, publishStatus?: boolean) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const postData = {
        ...formData,
        published: publishStatus !== undefined ? publishStatus : formData.published,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        excerpt: formData.excerpt || undefined,
        featuredImage: formData.featuredImage || undefined
      };

      const response = await fetch(`/api/blog/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data.post);
        const isPublished = postData.published;
        
        // Show success modal
        setSuccessModal({
          isOpen: true,
          title: isPublished ? '🎉 Post Updated & Published!' : '📝 Post Updated!',
          message: isPublished 
            ? `Your post "${formData.title}" has been successfully updated and is now live on your blog.`
            : `Your post "${formData.title}" has been updated and saved as a draft.`
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const generateExcerpt = () => {
    if (formData.content) {
      const plainText = formData.content.replace(/<[^>]*>/g, '');
      const excerpt = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
      setFormData(prev => ({ ...prev, excerpt }));
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/admin/posts');
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81D7B4]"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Post not found</h2>
        <Link
          href="/admin/posts"
          className="text-[#81D7B4] hover:text-[#66C4A3] font-medium"
        >
          ← Back to Posts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Edit Post</h1>
          <p className="text-gray-600 mt-1">
            Created {formatDate(post.createdAt)}
            {post.published && post.publishedAt && (
              <> • Published {formatDate(post.publishedAt)}</>
            )}
          </p>

        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="px-4 py-2 text-[#81D7B4] hover:text-[#66C4A3] transition-colors"
          >
            View Post
          </Link>
          <Link
            href="/admin/posts"
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Posts
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#81D7B4]/10 shadow-sm space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/20 focus:border-[#81D7B4] text-lg text-black"
              placeholder="Enter post title..."
            />
          </div>

          {/* Category and Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/20 focus:border-[#81D7B4] text-black"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id?.toString()} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/20 focus:border-[#81D7B4] text-black"
                placeholder="Author name"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/20 focus:border-[#81D7B4] text-black"
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          {/* Featured Image - Full Width */}
          <div>
            <ImageUpload
              onChange={(url: string) => setFormData(prev => ({ ...prev, featuredImage: url }))}
              label="Featured Image"
            />
          </div>

          {/* Excerpt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                Excerpt
              </label>
              <button
                type="button"
                onClick={generateExcerpt}
                className="text-sm text-[#81D7B4] hover:text-[#66C4A3] font-medium"
              >
                Generate from content
              </button>
            </div>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/20 focus:border-[#81D7B4] resize-none text-black"
              placeholder="Brief description of the post (optional - will be auto-generated if empty)"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.excerpt.length}/160 characters
            </p>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
              placeholder="Write your post content here... Use the toolbar for formatting or write in Markdown!"
              className="focus-within:ring-2 focus-within:ring-[#81D7B4]/20 focus-within:border-[#81D7B4]"
            />
          </div>

          {/* Publish Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleInputChange}
              className="w-4 h-4 text-[#81D7B4] border-gray-300 rounded focus:ring-[#81D7B4]/20"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">
              Published
            </label>
            <span className="text-sm text-gray-500">
              ({formData.published ? 'Visible to public' : 'Draft only'})
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
          >
            Delete Post
          </button>
          
          <div className="flex gap-3">
            <Link
              href="/admin/posts"
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </Link>
            
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={saving}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Save as Draft
            </button>
            
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={saving}
              className="px-6 py-3 bg-[#81D7B4] text-white rounded-xl hover:bg-[#66C4A3] transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {saving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              Update & Publish
            </button>
          </div>
        </div>
      </form>



      {/* Delete Confirmation Modal */}
       <ConfirmationModal
         isOpen={showDeleteModal}
         onClose={() => setShowDeleteModal(false)}
         onConfirm={handleDelete}
         title="Delete Post"
         message={`Are you sure you want to delete "${formData.title}"? This action cannot be undone.`}
         confirmText="Delete"
         isDestructive={true}
       />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
        autoClose={true}
        autoCloseDelay={4000}
      />
    </div>
  );
}