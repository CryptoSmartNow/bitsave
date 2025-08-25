'use client';
import { useState, useEffect } from 'react';
import { BlogCategory } from '@/lib/blogDatabase';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editCategory, setEditCategory] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog/categories');
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/blog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });

      if (response.ok) {
        const data = await response.json();
        setCategories([...categories, data.category]);
        setNewCategory({ name: '', description: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async (categoryId: string) => {
    if (!editCategory.name.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      const response = await fetch(`/api/blog/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCategory)
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(categories.map(cat => 
          cat._id?.toString() === categoryId ? data.category : cat
        ));
        setEditing(null);
        setEditCategory({ name: '', description: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(categoryId);
      const response = await fetch(`/api/blog/categories/${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCategories(categories.filter(cat => cat._id?.toString() !== categoryId));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  const startEdit = (category: BlogCategory) => {
    setEditing(category._id?.toString() || '');
    setEditCategory({ name: category.name, description: category.description || '' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditCategory({ name: '', description: '' });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
        <p className="text-gray-600 mt-1">Manage blog categories and tags</p>
      </div>

      {/* Create New Category */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#81D7B4]/10 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Category</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/20 focus:border-[#81D7B4] text-black"
                placeholder="Category name"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/20 focus:border-[#81D7B4] text-black"
                placeholder="Optional description"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-3 bg-[#81D7B4] text-white rounded-xl hover:bg-[#66C4A3] transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {creating && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            Create Category
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#81D7B4]/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Existing Categories</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#81D7B4]"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No categories found</h3>
            <p className="text-gray-500">Create your first category to organize your blog posts</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {categories.map((category) => (
              <div key={category._id?.toString()} className="p-6">
                {editing === category._id?.toString() ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={editCategory.name}
                          onChange={(e) => setEditCategory(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/20 focus:border-[#81D7B4] text-black"
                          placeholder="Category name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          value={editCategory.description}
                          onChange={(e) => setEditCategory(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/20 focus:border-[#81D7B4] text-black"
                          placeholder="Optional description"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(category._id?.toString() || '')}
                        className="px-4 py-2 bg-[#81D7B4] text-white rounded-lg hover:bg-[#66C4A3] transition-colors font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                        <span className="px-3 py-1 bg-[#81D7B4]/10 text-[#81D7B4] rounded-full text-sm font-medium">
                          {category.slug}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-gray-600 mb-2">{category.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Created {formatDate(category.createdAt)}</span>
                        {category.postCount !== undefined && (
                          <>
                            <span>•</span>
                            <span>{category.postCount} posts</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => startEdit(category)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category._id?.toString() || '')}
                        disabled={deleting === category._id?.toString()}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {deleting === category._id?.toString() ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}