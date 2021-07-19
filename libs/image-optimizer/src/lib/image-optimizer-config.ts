export interface ImageOptimizerConfig {
  deviceSizes: number[];
  imageSizes: number[];
  quality: number;
}

export const defaultImageOptimizerConfig: ImageOptimizerConfig = {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  quality: 75,
};

export function getImageSizes({ deviceSizes, imageSizes }: ImageOptimizerConfig): number[] {
  return [...new Set([...deviceSizes, ...imageSizes])];
}

const minSizesLength = 1;
const maxSizesLength = 20;
const minWidth = 16;
const maxWidth = 4000;
const minQuality = 10;
const maxQuality = 100;

export function getValidatedImageOptimizerConfig(imageOptimizerConfig: ImageOptimizerConfig): ImageOptimizerConfig {
  if (imageOptimizerConfig.deviceSizes.length < minSizesLength || imageOptimizerConfig.deviceSizes.length > maxSizesLength) {
    throw new Error(`deviceSizes must have between ${minSizesLength} and ${maxSizesLength} items`);
  }
  if (imageOptimizerConfig.imageSizes.length < minSizesLength || imageOptimizerConfig.imageSizes.length > maxSizesLength) {
    throw new Error(`imageSizes must have between ${minSizesLength} and ${maxSizesLength} items`);
  }
  if (imageOptimizerConfig.deviceSizes.some((size) => size < minWidth || size > maxWidth)) {
    throw new Error(`deviceSizes items must be between ${minWidth} and ${maxWidth} pixels`);
  }
  if (imageOptimizerConfig.imageSizes.some((size) => size < minWidth || size > maxWidth)) {
    throw new Error(`imageSizes items must be between ${minWidth} and ${maxWidth} pixels`);
  }
  if (imageOptimizerConfig.quality < minQuality || imageOptimizerConfig.quality > maxQuality) {
    throw new Error(`quality must be between ${minQuality} and ${maxQuality}`);
  }
  return imageOptimizerConfig;
}
