import { NextRequest, NextResponse } from 'next/server';
import { listImages, getStorageStats, deleteImage } from '@/lib/imageStorage';

// GET /api/images - List images with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      // Return storage statistics
      const result = await getStorageStats();
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to get storage stats' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        stats: result.stats
      });
    } else {
      // Return list of images
      const result = await listImages(category, limit, skip);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to list images' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        images: result.images,
        total: result.total,
        pagination: {
          limit,
          skip,
          hasMore: (result.total || 0) > skip + limit
        }
      });
    }

  } catch (error) {
    console.error('Error in images API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/images?id=fileId - Delete an image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    const result = await deleteImage(fileId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}