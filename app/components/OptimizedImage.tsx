'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  retryAttempts?: number;
  sizes?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc,
  retryAttempts = 2,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Reset states when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasError(false);
    setRetryCount(0);
    setIsRetrying(false);
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsRetrying(false);
    onLoad?.();
  }, [onLoad]);

  const handleRetry = useCallback(async () => {
    if (retryCount < retryAttempts) {
      setIsRetrying(true);
      setHasError(false);
      
      // Add a small delay before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRetryCount(prev => prev + 1);
      setCurrentSrc(`${src}?retry=${retryCount + 1}`); // Add cache-busting parameter
      setIsRetrying(false);
    } else if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setRetryCount(0);
    } else {
      setHasError(true);
      onError?.();
    }
  }, [src, retryCount, retryAttempts, fallbackSrc, currentSrc, onError]);

  const handleError = useCallback(() => {
    if (retryCount < retryAttempts || (fallbackSrc && currentSrc !== fallbackSrc)) {
      handleRetry();
    } else {
      setHasError(true);
      onError?.();
    }
  }, [retryCount, retryAttempts, fallbackSrc, currentSrc, handleRetry, onError]);

  // Generate a simple blur placeholder if none provided
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

  if (hasError && !isRetrying) {
    return (
      <div 
        ref={imgRef}
        className={`bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-gray-400 text-center p-4">
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium">Image unavailable</span>
          {retryCount > 0 && (
            <span className="text-xs text-gray-300 block mt-1">
              Tried {retryCount} time{retryCount > 1 ? 's' : ''}
            </span>
          )}
          {retryCount < retryAttempts && (
            <button
              onClick={handleRetry}
              className="mt-2 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      {(!isLoaded && isInView) || isRetrying ? (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-gray-400 text-center">
            <svg className="w-6 h-6 animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {isRetrying && (
              <span className="text-xs">
                Retrying... ({retryCount}/{retryAttempts})
              </span>
            )}
          </div>
        </div>
      ) : null}
      
      {/* Actual image */}
      {isInView && !hasError && (
        <Image
          src={currentSrc}
          alt={alt}
          width={width || 800}
          height={height || 600}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL || defaultBlurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          sizes={sizes}
          unoptimized={currentSrc.startsWith('/api/images/')} // Don't optimize MongoDB images as they're already optimized
        />
      )}
    </div>
  );
}