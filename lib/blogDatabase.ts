import { Collection, ObjectId } from 'mongodb';
import { getDatabase } from './mongodb';
import { marked } from 'marked';

export interface BlogPost {
  _id?: ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  tags: string[];
  category: string;
  featuredImage?: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  seoTitle?: string;
  seoDescription?: string;
  readTime?: number;
  // Analytics fields
  viewCount?: number;
  uniqueViews?: number;
  lastViewedAt?: Date;
  analytics?: {
    dailyViews: { date: string; views: number }[];
    weeklyViews: { week: string; views: number }[];
    monthlyViews: { month: string; views: number }[];
  };
}

export interface BlogCategory {
  _id?: ObjectId;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  postCount?: number;
}

export interface BlogComment {
  _id?: ObjectId;
  postId: ObjectId;
  walletAddress: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  parentCommentId?: ObjectId; // For nested replies
  likes?: number;
  likedBy?: string[]; // Array of wallet addresses
}

export async function getBlogCollection(): Promise<Collection<BlogPost> | null> {
  try {
    const db = await getDatabase();
    if (!db) {
      console.warn('Database connection failed');
      return null;
    }
    return db.collection<BlogPost>('blog_posts');
  } catch (error) {
    console.error('Error getting blog collection:', error);
    return null;
  }
}

export async function getBlogCategoriesCollection(): Promise<Collection<BlogCategory> | null> {
  try {
    const db = await getDatabase();
    if (!db) {
      console.warn('Database connection failed');
      return null;
    }
    return db.collection<BlogCategory>('blog_categories');
  } catch (error) {
    console.error('Error getting blog categories collection:', error);
    return null;
  }
}

export async function getBlogCommentsCollection(): Promise<Collection<BlogComment> | null> {
  try {
    const db = await getDatabase();
    if (!db) {
      console.warn('Database connection failed');
      return null;
    }
    return db.collection<BlogComment>('blog_comments');
  } catch (error) {
    console.error('Error getting blog comments collection:', error);
    return null;
  }
}

// Helper function to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper function to calculate reading time
export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Helper function to generate excerpt
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // First, try to parse as markdown if it contains markdown syntax
  let plainText = content;
  if (content.includes('**') || content.includes('*') || content.includes('`') || content.includes('#') || content.includes('[')) {
    try {
      // marked is now imported at the top
      const htmlContent = marked.parse(content) as string;
      plainText = htmlContent.replace(/<[^>]*>/g, ''); // Remove HTML tags
    } catch {
      // Fallback to simple HTML tag removal if marked fails
      plainText = content.replace(/<[^>]*>/g, '');
    }
  } else {
    // Just remove HTML tags if no markdown detected
    plainText = content.replace(/<[^>]*>/g, '');
  }
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  return plainText.substring(0, maxLength).trim() + '...';
}