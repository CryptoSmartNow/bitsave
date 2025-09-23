'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BlogCategory } from '@/lib/blogDatabase';

import ImageUpload from '@/app/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';
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

export default function NewPostPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    author: 'Admin',
    published: false,
    featuredImage: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

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
      setLoading(true);
      
      const postData = {
        ...formData,
        published: publishStatus !== undefined ? publishStatus : formData.published,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        excerpt: formData.excerpt || undefined,
        featuredImage: formData.featuredImage || undefined
      };

      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        await response.json();
        const isPublished = postData.published;
        
        // Show success modal
        setSuccessModal({
          isOpen: true,
          title: isPublished ? '🎉 Post Published!' : '📝 Draft Saved!',
          message: isPublished 
            ? `Your post "${formData.title}" has been successfully published and is now live on your blog.`
            : `Your post "${formData.title}" has been saved as a draft. You can continue editing it later.`
        });

        // Reset form after successful submission
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          category: '',
          tags: '',
          author: 'Admin',
          published: false,
          featuredImage: ''
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Create New Post</h1>
          <p className="text-gray-600 mt-1">Write and publish a new blog post</p>
        </div>
        <Link
          href="/admin/posts"
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to Posts
        </Link>
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
              onChange={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
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
              Publish immediately
            </label>
            <span className="text-sm text-gray-500">
              (Uncheck to save as draft)
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/posts"
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </Link>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Save as Draft
            </button>
            
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="px-6 py-3 bg-[#81D7B4] text-white rounded-xl hover:bg-[#66C4A3] transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              Publish Post
            </button>
          </div>
        </div>
      </form>

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