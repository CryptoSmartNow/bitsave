import { NextRequest, NextResponse } from 'next/server';
import { getBlogCollection, BlogPost, generateSlug, calculateReadTime, generateExcerpt } from '@/lib/blogDatabase';

// GET - Fetch all blog posts with optional filtering
export async function GET(request: NextRequest) {
  try {
    const collection = await getBlogCollection();
    
    if (!collection) {
      return NextResponse.json({
        posts: [],
        warning: 'Database connection failed'
      }, { status: 503 });
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