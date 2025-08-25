import { NextRequest, NextResponse } from 'next/server';
import { getBlogCommentsCollection } from '@/lib/blogDatabase';
import { ObjectId } from 'mongodb';

// Get comments for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const collection = await getBlogCommentsCollection();
    if (!collection) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const comments = await collection
      .find({ 
        postId: new ObjectId(postId),
        isDeleted: { $ne: true }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    const total = await collection.countDocuments({ 
      postId: new ObjectId(postId),
      isDeleted: { $ne: true }
    });

    return NextResponse.json({
      comments,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new comment
export async function POST(request: NextRequest) {
  try {
    const { postId, walletAddress, content, parentCommentId } = await request.json();

    if (!postId || !walletAddress || !content) {
      return NextResponse.json(
        { error: 'Post ID, wallet address, and content are required' },
        { status: 400 }
      );
    }

    // Basic content validation
    if (content.trim().length < 1 || content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be between 1 and 1000 characters' },
        { status: 400 }
      );
    }

    const collection = await getBlogCommentsCollection();
    if (!collection) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const now = new Date();
    const comment = {
      postId: new ObjectId(postId),
      walletAddress: walletAddress.toLowerCase(),
      content: content.trim(),
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      likes: 0,
      likedBy: [],
      ...(parentCommentId && { parentCommentId: new ObjectId(parentCommentId) })
    };

    const result = await collection.insertOne(comment);

    return NextResponse.json({
      success: true,
      commentId: result.insertedId,
      comment: {
        ...comment,
        _id: result.insertedId
      }
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}