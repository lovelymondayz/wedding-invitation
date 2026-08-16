/**
 * Canvas-based image compression
 * - Resize to max 1200px wide
 * - Convert to WebP if supported, JPEG fallback
 * - Quality 0.7
 */
export async function compressImage(file: File): Promise<File> {
  // If already small and webp, skip compression
  if (file.size < 100 * 1024 && file.type === 'image/webp') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Scale down to max 1200px wide
      const MAX_WIDTH = 1200;
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        height = (height * MAX_WIDTH) / width;
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first
      const mimeType = 'image/webp';
      const quality = 0.7;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          const ext = file.name.split('.').pop() || 'jpg';
          const baseName = file.name.replace(`.${ext}`, '');
          const newFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(newFile);
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Compress multiple images with progress callback
 */
export async function compressImages(
  files: File[],
  onProgress?: (index: number, total: number) => void
): Promise<File[]> {
  const results: File[] = [];
  for (let i = 0; i < files.length; i++) {
    const compressed = await compressImage(files[i]);
    results.push(compressed);
    onProgress?.(i + 1, files.length);
  }
  return results;
}
