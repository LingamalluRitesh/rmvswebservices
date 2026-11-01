/**
 * Image processing utilities for device-selected profile photos.
 * Ensures fast 60fps UI, lightweight cloud database storage, and seamless cross-device synchronization.
 */

export interface ProcessedImageResult {
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
  originalName: string;
}

export const processDeviceImage = (
  file: File,
  maxDimension = 512,
  quality = 0.85
): Promise<ProcessedImageResult> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image. Please choose a JPG, PNG, or WebP photo.'));
    }

    // 15MB max raw file limit
    if (file.size > 15 * 1024 * 1024) {
      return reject(new Error('Image file is too large. Please select a photo under 15 MB.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file from your device.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image. The file format might be unsupported.'));
      img.onload = () => {
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          const minDim = Math.min(width, height);
          const sx = (width - minDim) / 2;
          const sy = (height - minDim) / 2;
          const targetDim = Math.min(minDim, maxDimension);

          const canvas = document.createElement('canvas');
          canvas.width = targetDim;
          canvas.height = targetDim;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            // Fallback to raw dataUrl if canvas context isn't available
            const rawUrl = reader.result as string;
            return resolve({
              dataUrl: rawUrl,
              sizeKb: Math.round(file.size / 1024),
              width,
              height,
              originalName: file.name,
            });
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetDim, targetDim);

          let dataUrl = canvas.toDataURL('image/webp', quality);
          // Fallback if browser doesn't support WebP export
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
          resolve({
            dataUrl,
            sizeKb,
            width: targetDim,
            height: targetDim,
            originalName: file.name,
          });
        } catch (e: any) {
          reject(e);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
};
