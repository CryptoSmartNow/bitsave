import { NextRequest, NextResponse } from 'next/server';
import { getBlogCollection } from '@/lib/blogDatabase';
import { ObjectId } from 'mongodb';

// Track post view
export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const collection = await getBlogCollection();
    if (!collection) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Find post by slug or ObjectId
    let post;
    if (ObjectId.isValid(postId)) {
      post = await collection.findOne({ _id: new ObjectId(postId) });
    } else {
      post = await collection.findOne({ slug: postId });
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Update post analytics
    const result = await collection.updateOne(
      { _id: post._id },
      {
        $inc: { viewCount: 1 },
        $set: { lastViewedAt: now }
      }
    );

    // Update daily views count
    await collection.updateOne(
      { 
        _id: post._id,
        'analytics.dailyViews.date': { $ne: today }
      },
      {
        $push: {
          'analytics.dailyViews': {
            date: today,
            views: 1
          }
        }
      }
    );

    // If today's entry exists, increment it
    await collection.updateOne(
      { 
        _id: post._id,
        'analytics.dailyViews.date': today
      },
      {
        $inc: { 'analytics.dailyViews.$.views': 1 }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking post view:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get post analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const collection = await getBlogCollection();
    if (!collection) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Find post by slug or ObjectId
    let post;
    if (ObjectId.isValid(postId)) {
      post = await collection.findOne(
        { _id: new ObjectId(postId) },
        { 
          projection: { 
            viewCount: 1, 
            uniqueViews: 1, 
            lastViewedAt: 1, 
            analytics: 1 
          } 
        }
      );
    } else {
      post = await collection.findOne(
        { slug: postId },
        { 
          projection: { 
            viewCount: 1, 
            uniqueViews: 1, 
            lastViewedAt: 1, 
            analytics: 1,
            title: 1
          } 
        }
      );
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      postId: post._id,
      title: post.title,
      viewCount: post.viewCount || 0,
      uniqueViews: post.uniqueViews || 0,
      lastViewedAt: post.lastViewedAt,
      analytics: post.analytics || {
        dailyViews: [],
        weeklyViews: [],
        monthlyViews: []
      }
    });
  } catch (error) {
    console.error('Error fetching post analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}