import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/imageStorage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to MongoDB with optimization
    const result = await uploadImage(
      buffer,
      file.name,
      file.type,
      'blog', // category
      true    // optimize
    );

    if (!result.success) {
      console.error('MongoDB upload error:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to upload image to database' },
        { status: 500 }
      );
    }

    // Calculate compression ratio if metadata is available
    const compressionRatio = result.metadata 
      ? Math.round((1 - result.metadata.size / file.size) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.fileId,
      fileId: result.fileId,
      originalSize: file.size,
      optimizedSize: result.metadata?.size || file.size,
      compressionRatio,
      metadata: {
        width: result.metadata?.width,
        height: result.metadata?.height,
        mimeType: result.metadata?.mimeType,
        uploadedAt: result.metadata?.uploadedAt
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}