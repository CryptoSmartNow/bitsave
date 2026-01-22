import { NextRequest, NextResponse } from 'next/server';
import { getBlogCollection, BlogPost, generateSlug, calculateReadTime, generateExcerpt } from '@/lib/blogDatabase';

// Mock data for fallback
const MOCK_POSTS: BlogPost[] = [
  {
    title: "Welcome to Bitsave Blog",
    slug: "welcome-to-bitsave",
    content: "We are excited to launch our new blog where we will share updates, guides, and insights about DeFi savings. Stay tuned for more!",
    excerpt: "We are excited to launch our new blog where we will share updates, guides, and insights about DeFi savings.",
    author: "Bitsave Team",
    tags: ["Announcements", "Bitsave"],
    category: "Announcements",
    published: true,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    readTime: 2,
    featuredImage: "/images/bitsavepreview.png"
  },
  {
    title: "Why DeFi is the Future of Savings",
    slug: "why-defi-savings",
    content: "Decentralized Finance (DeFi) removes intermediaries, allowing you to earn higher yields on your stablecoins directly from the protocol.",
    excerpt: "DeFi removes intermediaries, allowing you to earn higher yields on your stablecoins directly from the protocol.",
    author: "Bitsave Team",
    tags: ["DeFi", "Education"],
    category: "Education",
    published: true,
    publishedAt: new Date(Date.now() - 86400000), // 1 day ago
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
    readTime: 5,
    featuredImage: "/images/topupsavings.png"
  },
  {
    title: "How to Secure Your Crypto Assets",
    slug: "secure-crypto-assets",
    content: "Security is paramount. Learn how to protect your wallet, use hardware wallets, and avoid common phishing scams.",
    excerpt: "Security is paramount. Learn how to protect your wallet and avoid common phishing scams.",
    author: "Bitsave Team",
    tags: ["Security", "Guide"],
    category: "Security",
    published: true,
    publishedAt: new Date(Date.now() - 172800000), // 2 days ago
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
    readTime: 4,
    featuredImage: "/images/withdrawcomplete.png"
  }
];

// GET - Fetch all blog posts with optional filtering
export async function GET(request: NextRequest) {
  try {
    const collection = await getBlogCollection();
    
    if (!collection) {
      console.warn('Database connection failed, returning mock data');
      return NextResponse.json({
        posts: MOCK_POSTS,
        pagination: {
          total: MOCK_POSTS.length,
          limit: 10,
          skip: 0,
          hasMore: false
        }
      });
    }

    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');
    const search = searchParams.get('search');

    // Build query
    const query: Record<string, unknown> = {};
    
    if (published !== null) {
      query.published = published === 'true';
    }
    
    if (category) {
      query.category = category;
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    if (search) {
      // Use text search index for better performance
      query.$text = { $search: search };
    }

    const posts = await collection
      .find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // If no posts found in main feed, return mock data
    const isMainFeed = !category && !tag && !search;
    if (posts.length === 0 && isMainFeed) {
       return NextResponse.json({
        posts: MOCK_POSTS,
        pagination: {
          total: MOCK_POSTS.length,
          limit: 10,
          skip: 0,
          hasMore: false
        }
      });
    }

    const total = await collection.countDocuments(query);

    return NextResponse.json({
      posts,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const collection = await getBlogCollection();
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { title, content, author, tags = [], category, featuredImage, published = false, seoTitle, seoDescription } = body;

    // Validation
    if (!title || !content || !author) {
      return NextResponse.json(
        { error: 'Title, content, and author are required' },
        { status: 400 }
      );
    }

    const slug = generateSlug(title);
    const readTime = calculateReadTime(content);
    const excerpt = generateExcerpt(content);
    const now = new Date();

    // Check if slug already exists
    const existingPost = await collection.findOne({ slug });
    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this title already exists' },
        { status: 409 }
      );
    }

    const newPost: Omit<BlogPost, '_id'> = {
      title,
      slug,
      content,
      excerpt,
      author,
      tags,
      category: category || 'General',
      featuredImage,
      published,
      publishedAt: published ? now : undefined,
      createdAt: now,
      updatedAt: now,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      readTime
    };

    const result = await collection.insertOne(newPost);
    const createdPost = await collection.findOne({ _id: result.insertedId });

    return NextResponse.json({
      message: 'Blog post created successfully',
      post: createdPost
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}