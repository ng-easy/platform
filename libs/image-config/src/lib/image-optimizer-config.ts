import { ImageFormat } from './image-format';

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
