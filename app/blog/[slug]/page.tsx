import { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const db = await getDatabase();
    
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const collection = db.collection('blog_posts');
    
    // Try to find by slug first, then by ObjectId if slug doesn't work
    let post = await collection.findOne({ slug: slug, published: true });
    
    if (!post && ObjectId.isValid(slug)) {
      post = await collection.findOne({ _id: new ObjectId(slug), published: true });
    }
    
    if (!post) {
      return {
        title: 'Post Not Found | BitSave Blog',
        description: 'The requested blog post could not be found.'
      };
    }
    
    const title = `${post.title} | BitSave Blog`;
    const description = post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, '') + '...';
    const publishedTime = post.publishedAt || post.createdAt;
    const modifiedTime = post.updatedAt || publishedTime;
    
    return {
      title,
      description,
      keywords: post.tags?.join(', ') || 'financial blog, savings tips, BitSave',
      authors: [{ name: post.author }],
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://bitsave.io/blog/${post.slug}`,
        publishedTime: new Date(publishedTime).toISOString(),
        modifiedTime: new Date(modifiedTime).toISOString(),
        authors: [post.author],
        tags: post.tags,
        images: post.featuredImage ? [
          {
            url: post.featuredImage,
            width: 1200,
            height: 630,
            alt: post.title
          }
        ] : [
          {
            url: '/og-blog.jpg',
            width: 1200,
            height: 630,
            alt: 'BitSave Blog'
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [post.featuredImage || '/og-blog.jpg']
      },
      alternates: {
        canonical: `https://bitsave.io/blog/${post.slug}`
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog Post | BitSave',
      description: 'Read the latest insights from BitSave blog.'
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}