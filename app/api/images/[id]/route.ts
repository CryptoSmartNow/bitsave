import { NextRequest, NextResponse } from 'next/server';
import { retrieveImage } from '@/lib/imageStorage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const result = await retrieveImage(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to retrieve image' },
        { status: 404 }
      );
    }

    if (!result.buffer) {
      return NextResponse.json(
        { error: 'Image data not found' },
        { status: 404 }
      );
    }

    // Determine content type
    const contentType = result.metadata?.mimeType || 'image/webp';

    // Set appropriate headers for image serving
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Length', result.buffer.length.toString());
    
    // Cache headers for better performance
    headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
    headers.set('ETag', `"${id}"`);
    
    // Optional: Add filename for downloads
    if (result.metadata?.originalName) {
      headers.set('Content-Disposition', `inline; filename="${result.metadata.originalName}"`);
    }

    return new NextResponse(result.buffer as any, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}