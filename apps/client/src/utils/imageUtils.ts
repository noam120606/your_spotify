import { SpotifyImage } from "../api/types";

export class ImageUtils {
  static getOptimizedImage(images: SpotifyImage[], targetSize: number): string | null {
    if (!images || images.length === 0) {
      return null;
    }

    const pixelRatio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const effectiveTargetSize = targetSize * pixelRatio;

    // Sort images from smallest to largest
    const sortedImages = [...images].sort((a, b) => {
      // Use width as the primary size metric, assuming most covers are square
      return (a.width || 0) - (b.width || 0);
    });

    // Find the first image that is larger than or equal to the target size
    for (const image of sortedImages) {
      if (image.width >= effectiveTargetSize || image.height >= effectiveTargetSize) {
        return image.url;
      }
    }

    // If none are larger, return the largest available (the last one after sorting)
    return sortedImages[sortedImages.length - 1]?.url || null;
  }
}
