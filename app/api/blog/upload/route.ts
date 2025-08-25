import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'blog');

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Generate unique filename
function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  return `${timestamp}-${random}.${extension}`;
}

// Optimize image using Sharp
async function optimizeImage(buffer: Buffer, filename: string): Promise<Buffer> {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  let sharpInstance = sharp(buffer)
    .resize(1200, 800, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .jpeg({ 
      quality: 85,
      progressive: true 
    });

  // Convert to WebP for better compression if not already WebP
  if (extension !== 'webp') {
    sharpInstance = sharpInstance.webp({ quality: 85 });
  }

  return await sharpInstance.toBuffer();
}

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

    // Ensure upload directory exists
    await ensureUploadDir();

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename and optimize image
    const originalFileName = generateFileName(file.name);
    const optimizedBuffer = await optimizeImage(buffer, originalFileName);
    
    // Use .webp extension for optimized images
    const finalFileName = originalFileName.replace(/\.[^/.]+$/, '.webp');
    const filePath = join(UPLOAD_DIR, finalFileName);

    // Save optimized image
    await writeFile(filePath, optimizedBuffer);

    // Return the public URL
    const publicUrl = `/uploads/blog/${finalFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: finalFileName,
      originalSize: file.size,
      optimizedSize: optimizedBuffer.length,
      compressionRatio: Math.round((1 - optimizedBuffer.length / file.size) * 100)
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}