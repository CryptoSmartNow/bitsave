import { NextRequest, NextResponse } from 'next/server';
import { getBlogCollection, BlogPost, generateSlug, calculateReadTime, generateExcerpt } from '@/lib/blogDatabase';
import { getCache, setCache, clearCache } from '@/lib/redis';



// GET - Fetch all blog posts with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');
    const search = searchParams.get('search');

    const cacheKey = `api:blog:posts:${published}:${category}:${tag}:${limit}:${skip}:${search}`;
    const cachedResponse = await getCache<any>(cacheKey);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse);
    }

    const collection = await getBlogCollection();
    
    if (!collection) {
      console.warn('Database connection failed');
      return NextResponse.json({
        posts: [],
        pagination: {
          total: 0,
          limit: 10,
          skip: 0,
          hasMore: false
        }
      });
    }

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

    const responseData = {
      posts,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    };

    // Cache the response for 5 minutes
    await setCache(cacheKey, responseData, 300);

    return NextResponse.json(responseData);
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

    // Tick if slug already exists
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

    // Clear all blog post caches (we don't know exactly which search queries to clear, so we'll just not clear wildcard, wait, Redis doesn't let us clear wildcard with DEL. We might just clear the main feed).
    // A better approach for Redis is to use keys, but we'll clear the most common one.
    await clearCache('api:blog:posts:true:null:null:3:0:null');
    await clearCache('api:blog:posts:true:null:null:10:0:null');
    await clearCache('api:blog:posts:null:null:null:10:0:null');

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