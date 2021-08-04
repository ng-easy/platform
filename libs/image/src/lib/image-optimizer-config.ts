import { InjectionToken } from '@angular/core';

// TODO: move to shared library

export enum ImageFormat {
  Png = 'png',
  Jpeg = 'jpeg',
  Webp = 'webp',
  Avif = 'avif',
  Heif = 'heif',
}

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

export function dedupAndSortImageSizes(imageSizes: number[]): number[] {
  return [...new Set([...imageSizes])].sort((a, b) => a - b);
}

export const IMAGE_OPTIMIZER_CONFIG = new InjectionToken<ImageOptimizerConfig>('@ng-easy/image:image-optimizer-config');
