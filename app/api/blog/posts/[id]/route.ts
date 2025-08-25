import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getBlogCollection, generateSlug, calculateReadTime, generateExcerpt, BlogPost } from '@/lib/blogDatabase';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Fetch a single blog post by ID or slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const collection = await getBlogCollection();
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { id } = await params;
    let post;

    // Try to find by ObjectId first, then by slug
    if (ObjectId.isValid(id)) {
      post = await collection.findOne({ _id: new ObjectId(id) });
    }
    
    if (!post) {
      post = await collection.findOne({ slug: id });
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT - Update a blog post
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const collection = await getBlogCollection();
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, content, author, tags, category, featuredImage, published, seoTitle, seoDescription } = body;

    // Get existing post
    const existingPost = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const updateData: Partial<BlogPost> = {
      updatedAt: new Date()
    };

    // Update fields if provided
    if (title !== undefined) {
      updateData.title = title;
      updateData.slug = generateSlug(title);
      
      // Check if new slug conflicts with existing posts
      const slugConflict = await collection.findOne({ 
        slug: updateData.slug, 
        _id: { $ne: new ObjectId(id) } 
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: 'A post with this title already exists' },
          { status: 409 }
        );
      }
    }
    
    if (content !== undefined) {
      updateData.content = content;
      updateData.readTime = calculateReadTime(content);
      updateData.excerpt = generateExcerpt(content);
    }
    
    if (author !== undefined) updateData.author = author;
    if (tags !== undefined) updateData.tags = tags;
    if (category !== undefined) updateData.category = category;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    
    if (published !== undefined) {
      updateData.published = published;
      if (published && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      } else if (!published) {
        updateData.publishedAt = undefined;
      }
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const updatedPost = await collection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      message: 'Blog post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a blog post
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const collection = await getBlogCollection();
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}