'use client';
import { useState, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';

interface BlogImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall' | 'auto';
  showCaption?: boolean;
  caption?: string;
  sizes?: string;
}

export default function BlogImage({
  src,
  alt,
  className = '',
  priority = false,
  aspectRatio = 'auto',
  showCaption = false,
  caption,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
}: BlogImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isMongoImage, setIsMongoImage] = useState(false);

  useEffect(() => {
    setIsMongoImage(src.startsWith('/api/images/'));
  }, [src]);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'wide':
        return 'aspect-[21/9]';
      case 'tall':
        return 'aspect-[3/4]';
      default:
        return '';
    }
  };

  const getFallbackSrc = () => {
    // Generate a placeholder image URL based on the alt text
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dy=".3em">
          ${alt}
        </text>
      </svg>
    `)}`;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const containerClasses = `
    relative overflow-hidden rounded-lg
    ${getAspectRatioClass()}
    ${className}
  `.trim();

  return (
    <figure className="space-y-2">
      <div className={containerClasses}>
        <OptimizedImage
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          priority={priority}
          fallbackSrc={getFallbackSrc()}
          retryAttempts={isMongoImage ? 3 : 1}
          sizes={sizes}
          onError={handleImageError}
        />
        

        
        {/* Error overlay */}
        {imageError && (
          <div className="absolute inset-0 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center text-gray-500 p-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">Image not available</p>
              <p className="text-xs text-gray-400 mt-1">{alt}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Caption */}
      {showCaption && (caption || alt) && (
        <figcaption className="text-sm text-gray-600 text-center italic">
          {caption || alt}
        </figcaption>
      )}
    </figure>
  );
}

// Responsive image sizes for different use cases
export const BlogImageSizes = {
  hero: "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw",
  featured: "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw",
  inline: "(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 50vw",
  thumbnail: "(max-width: 640px) 50vw, (max-width: 1024px) 30vw, 20vw",
  gallery: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
};

// Utility function to check if an image is from MongoDB
export const isMongoDBImage = (src: string): boolean => {
  return src.startsWith('/api/images/');
};

// Utility function to get optimized image URL with query parameters
export const getOptimizedImageUrl = (src: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
}): string => {
  if (!isMongoDBImage(src)) return src;
  
  const url = new URL(src, window.location.origin);
  if (options?.width) url.searchParams.set('w', options.width.toString());
  if (options?.height) url.searchParams.set('h', options.height.toString());
  if (options?.quality) url.searchParams.set('q', options.quality.toString());
  
  return url.pathname + url.search;
};