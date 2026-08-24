/**
 * Client-side image optimization utility
 * Resizes and compresses image files using HTML5 Canvas before uploading
 */

export interface OptimizedImage {
  dataUrl: string;
  name: string;
  sizeBytes: number;
  originalSizeBytes: number;
  dimensions: { width: number; height: number };
}

export async function optimizeImage(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.82
): Promise<OptimizedImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Failed to load image'));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context not available'));
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Calculate approx size of base64
        const stringLength = dataUrl.length - 'data:image/jpeg;base64,'.length;
        const sizeBytes = Math.round((stringLength * 3) / 4);

        resolve({
          dataUrl,
          name: file.name,
          sizeBytes,
          originalSizeBytes: file.size,
          dimensions: { width, height },
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
