'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blogDatabase';
import OptimizedImage from '@/app/components/OptimizedImage';
import { marked } from 'marked';

import Comments from '@/components/Comments';
import ShareButtons from '@/components/ShareButtons';
import { usePageView } from '@/hooks/useAnalytics';

interface BlogPostResponse {
  post: BlogPost;
}

interface BlogPostClientProps {
  slug: string;
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track page view for analytics
  usePageView(post?._id?.toString() || null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/blog/posts/${slug}`);
        
        if (!response.ok) {
          throw new Error('Post not found');
        }
        
        const data: BlogPostResponse = await response.json();
        setPost(data.post);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    // Parse markdown content to HTML synchronously
    const htmlContent = marked.parse(content) as string;
    return (
      <div 
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };



  const generateStructuredData = (postData: BlogPost | null) => {
    if (!postData) return "";

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": postData.title,
      "description": postData.excerpt || postData.content.substring(0, 160).replace(/<[^>]*>/g, ''),
      "image": postData.featuredImage || "https://bitsave.io/og-blog.jpg",
      "author": {
        "@type": "Person",
        "name": postData.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "BitSave",
        "logo": {
          "@type": "ImageObject",
          "url": "https://bitsave.io/favicon.ico"
        }
      },
      "datePublished": new Date(postData.publishedAt || postData.createdAt).toISOString(),
      "dateModified": new Date(postData.updatedAt || postData.publishedAt || postData.createdAt).toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://bitsave.io/blog/${postData.slug}`
      },
      "articleSection": postData.category,
      "keywords": postData.tags?.join(', ') || 'financial blog, savings tips, BitSave',
      "wordCount": postData.content.split(' ').length,
      "timeRequired": `PT${postData.readTime}M`
    };

    return JSON.stringify(structuredData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FDFC] via-white to-[#F0F9FF] pt-32">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81D7B4]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FDFC] via-white to-[#F0F9FF] pt-32">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="text-6xl mb-6">😕</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {error === 'Post not found' ? 'Post Not Found' : 'Something went wrong'}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {error === 'Post not found' 
              ? "The blog post you're looking for doesn't exist or has been removed."
              : 'We encountered an error while loading this post. Please try again later.'}
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-[#81D7B4] text-white rounded-xl hover:bg-[#66C4A3] transition-colors font-medium"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Structured Data */}
      {post && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateStructuredData(post)
          }}
        />
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-[#F8FDFC] via-white to-[#F0F9FF] pt-32">
        <article className="container mx-auto px-4 max-w-4xl">
        {/* Back to Blog */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-[#81D7B4] hover:text-[#66C4A3] transition-colors font-medium"
          >
            ← Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-12">
          {/* Category and Meta */}
          <div className="flex items-center gap-4 mb-6">
            <span className="px-4 py-2 bg-[#81D7B4]/10 text-[#81D7B4] rounded-full text-sm font-medium">
              {post.category}
            </span>
            <span className="text-gray-500 text-sm">
              {post.readTime} min read
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Author and Date */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#81D7B4] to-[#66C4A3] rounded-full flex items-center justify-center text-white font-bold text-lg">
                {post.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{post.author}</div>
                <div className="text-sm text-gray-500">
                  Published on {formatDate(post.publishedAt || post.createdAt)}
                  {post.updatedAt && post.updatedAt !== post.createdAt && (
                    <span> • Updated {formatDate(post.updatedAt)}</span>
                  )}
                </div>
              </div>
            </div>
            

          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-12">
            <OptimizedImage
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="text-lg leading-relaxed">
            {formatContent(post.content)}
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share Buttons */}
        <div className="mb-12">
          <ShareButtons
            url={`/blog/${post.slug}`}
            title={post.title}
            description={post.excerpt || ''}
          />
        </div>



        {/* Comments Section */}
        {post._id && (
          <div className="mb-12">
            <Comments postId={post._id.toString()} />
          </div>
        )}

        {/* Navigation */}
        <div className="border-t border-gray-200 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-[#81D7B4] text-white rounded-xl hover:bg-[#66C4A3] transition-colors font-medium"
          >
            ← Back to All Posts
          </Link>
        </div>
        </article>
      </div>
      

    </>
  );
}