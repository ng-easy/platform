import { ImageFormat } from './image-optimizer';

export interface ImageOptimizerConfig {
  deviceSizes: number[];
  imageSizes: number[];
  quality: number;
  formats: ImageFormat[];
}

export const defaultImageOptimizerConfig: ImageOptimizerConfig = {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  quality: 75,
  formats: [ImageFormat.Jpeg, ImageFormat.Webp],
};

export function getImageSizes({ deviceSizes, imageSizes }: ImageOptimizerConfig): number[] {
  return [...new Set([...deviceSizes, ...imageSizes])];
}

const minArrayLength = 1;
const maxArrayLength = 20;
const minWidth = 16;
const maxWidth = 4000;
const minQuality = 10;
const maxQuality = 100;

export function getValidatedImageOptimizerConfig(imageOptimizerConfig: ImageOptimizerConfig): ImageOptimizerConfig {
  if (imageOptimizerConfig.deviceSizes.length < minArrayLength || imageOptimizerConfig.deviceSizes.length > maxArrayLength) {
    throw new Error(`deviceSizes must have between ${minArrayLength} and ${maxArrayLength} items`);
  }
  if (imageOptimizerConfig.imageSizes.length < minArrayLength || imageOptimizerConfig.imageSizes.length > maxArrayLength) {
    throw new Error(`imageSizes must have between ${minArrayLength} and ${maxArrayLength} items`);
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
  if (imageOptimizerConfig.formats.length < minArrayLength) {
    throw new Error(`imageSizes must have have at least ${minArrayLength} item`);
  }
  return imageOptimizerConfig;
}
