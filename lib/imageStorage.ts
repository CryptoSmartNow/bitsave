import { GridFSBucket, ObjectId, Db } from 'mongodb';
import { getDatabase } from './mongodb';
import sharp from 'sharp';

export interface ImageMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  uploadedAt: Date;
  category: string; // e.g., 'blog', 'profile', 'general'
  optimized: boolean;
  fileId: ObjectId;
}

export interface ImageUploadResult {
  success: boolean;
  fileId?: string;
  url?: string;
  metadata?: ImageMetadata;
  error?: string;
}

export interface ImageRetrievalResult {
  success: boolean;
  buffer?: Buffer;
  metadata?: ImageMetadata;
  error?: string;
}

class MongoImageStorage {
  private bucket: GridFSBucket | null = null;
  private db: Db | null = null;

  private async initializeBucket(): Promise<GridFSBucket | null> {
    if (this.bucket) return this.bucket;

    try {
      this.db = await getDatabase();
      if (!this.db) {
        console.warn('MongoDB not available for image storage');
        return null;
      }

      this.bucket = new GridFSBucket(this.db, {
        bucketName: 'images'
      });

      return this.bucket;
    } catch (error) {
      console.error('Failed to initialize GridFS bucket:', error);
      return null;
    }
  }

  async uploadImage(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    category: string = 'general',
    optimize: boolean = true
  ): Promise<ImageUploadResult> {
    try {
      const bucket = await this.initializeBucket();
      if (!bucket) {
        return {
          success: false,
          error: 'Image storage not available'
        };
      }

      let processedBuffer = buffer;
      let metadata: Partial<ImageMetadata> = {
        originalName: filename,
        mimeType,
        size: buffer.length,
        uploadedAt: new Date(),
        category,
        optimized: false
      };

      // Optimize image if requested
      if (optimize && this.isImageMimeType(mimeType)) {
        try {
          const sharpInstance = sharp(buffer);
          const imageMetadata = await sharpInstance.metadata();
          
          processedBuffer = await sharpInstance
            .resize(1200, 800, { 
              fit: 'inside', 
              withoutEnlargement: true 
            })
            .webp({ quality: 85 })
            .toBuffer();

          metadata = {
            ...metadata,
            width: imageMetadata.width,
            height: imageMetadata.height,
            mimeType: 'image/webp',
            size: processedBuffer.length,
            optimized: true
          };

          // Update filename to reflect optimization
          filename = filename.replace(/\.[^/.]+$/, '.webp');
        } catch (optimizationError) {
          console.warn('Image optimization failed, using original:', optimizationError);
          // Continue with original buffer if optimization fails
        }
      }

      // Generate unique filename to prevent conflicts
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}-${filename}`;

      // Create upload stream
      const uploadStream = bucket.openUploadStream(uniqueFilename, {
        metadata: metadata as Record<string, unknown>
      });

      return new Promise((resolve) => {
        uploadStream.on('error', (error) => {
          console.error('GridFS upload error:', error);
          resolve({
            success: false,
            error: 'Failed to upload image to database'
          });
        });

        uploadStream.on('finish', async () => {
          try {
            // Store additional metadata in a separate collection for easier querying
            if (!this.db) {
              resolve({
                success: false,
                error: 'Database connection not available'
              });
              return;
            }
            const metadataCollection = this.db.collection('image_metadata');
            const fullMetadata: ImageMetadata = {
              ...metadata as ImageMetadata,
              fileId: uploadStream.id
            };

            await metadataCollection.insertOne({
              _id: uploadStream.id,
              ...fullMetadata
            });

            resolve({
              success: true,
              fileId: uploadStream.id.toString(),
              url: `/api/images/${uploadStream.id.toString()}`,
              metadata: fullMetadata
            });
          } catch (metadataError) {
            console.error('Failed to store image metadata:', metadataError);
            resolve({
              success: true,
              fileId: uploadStream.id.toString(),
              url: `/api/images/${uploadStream.id.toString()}`
            });
          }
        });

        // Write the buffer to the stream
        uploadStream.end(processedBuffer);
      });

    } catch (error) {
      console.error('Image upload error:', error);
      return {
        success: false,
        error: 'Failed to process image upload'
      };
    }
  }

  async retrieveImage(fileId: string): Promise<ImageRetrievalResult> {
    try {
      const bucket = await this.initializeBucket();
      if (!bucket) {
        return {
          success: false,
          error: 'Image storage not available'
        };
      }

      const objectId = new ObjectId(fileId);

      // Get metadata first
      let metadata: ImageMetadata | undefined;
      try {
        if (!this.db) {
          console.warn('Database connection not available for metadata retrieval');
        } else {
          const metadataCollection = this.db.collection('image_metadata');
          const metadataDoc = await metadataCollection.findOne({ _id: objectId });
          metadata = metadataDoc as unknown as ImageMetadata | undefined;
        }
      } catch (metadataError) {
        console.warn('Failed to retrieve metadata:', metadataError);
      }

      // Create download stream
      const downloadStream = bucket.openDownloadStream(objectId);

      return new Promise((resolve) => {
        const chunks: Buffer[] = [];

        downloadStream.on('data', (chunk) => {
          chunks.push(chunk);
        });

        downloadStream.on('error', (error) => {
          console.error('GridFS download error:', error);
          resolve({
            success: false,
            error: 'Failed to retrieve image from database'
          });
        });

        downloadStream.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            success: true,
            buffer,
            metadata
          });
        });
      });

    } catch (error) {
      console.error('Image retrieval error:', error);
      return {
        success: false,
        error: 'Failed to process image retrieval'
      };
    }
  }

  async deleteImage(fileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const bucket = await this.initializeBucket();
      if (!bucket) {
        return {
          success: false,
          error: 'Image storage not available'
        };
      }

      const objectId = new ObjectId(fileId);

      // Delete from GridFS
      await bucket.delete(objectId);

      // Delete metadata
      try {
        if (this.db) {
          const metadataCollection = this.db.collection('image_metadata');
          await metadataCollection.deleteOne({ _id: objectId });
        }
      } catch (metadataError) {
        console.warn('Failed to delete metadata:', metadataError);
      }

      return { success: true };

    } catch (error) {
      console.error('Image deletion error:', error);
      return {
        success: false,
        error: 'Failed to delete image'
      };
    }
  }

  async listImages(category?: string, limit: number = 50, skip: number = 0): Promise<{
    success: boolean;
    images?: ImageMetadata[];
    total?: number;
    error?: string;
  }> {
    try {
      const db = await getDatabase();
      if (!db) {
        return {
          success: false,
          error: 'Database not available'
        };
      }

      const metadataCollection = db.collection('image_metadata');
      const query = category ? { category } : {};

      const [images, total] = await Promise.all([
        metadataCollection
          .find(query)
          .sort({ uploadedAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        metadataCollection.countDocuments(query)
      ]);

      return {
        success: true,
        images: images as unknown as ImageMetadata[],
        total
      };

    } catch (error) {
      console.error('Failed to list images:', error);
      return {
        success: false,
        error: 'Failed to retrieve image list'
      };
    }
  }

  private isImageMimeType(mimeType: string): boolean {
    return mimeType.startsWith('image/') && 
           ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType);
  }

  async getStorageStats(): Promise<{
    success: boolean;
    stats?: {
      totalImages: number;
      totalSize: number;
      categoryCounts: Record<string, number>;
    };
    error?: string;
  }> {
    try {
      const db = await getDatabase();
      if (!db) {
        return {
          success: false,
          error: 'Database not available'
        };
      }

      const metadataCollection = db.collection('image_metadata');

      const [totalImages, sizeAggregation, categoryAggregation] = await Promise.all([
        metadataCollection.countDocuments(),
        metadataCollection.aggregate([
          { $group: { _id: null, totalSize: { $sum: '$size' } } }
        ]).toArray(),
        metadataCollection.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]).toArray()
      ]);

      const totalSize = sizeAggregation[0]?.totalSize || 0;
      const categoryCounts = categoryAggregation.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>);

      return {
        success: true,
        stats: {
          totalImages,
          totalSize,
          categoryCounts
        }
      };

    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        success: false,
        error: 'Failed to retrieve storage statistics'
      };
    }
  }
}

// Export singleton instance
export const mongoImageStorage = new MongoImageStorage();

// Export convenience functions
export const uploadImage = mongoImageStorage.uploadImage.bind(mongoImageStorage);
export const retrieveImage = mongoImageStorage.retrieveImage.bind(mongoImageStorage);
export const deleteImage = mongoImageStorage.deleteImage.bind(mongoImageStorage);
export const listImages = mongoImageStorage.listImages.bind(mongoImageStorage);
export const getStorageStats = mongoImageStorage.getStorageStats.bind(mongoImageStorage);