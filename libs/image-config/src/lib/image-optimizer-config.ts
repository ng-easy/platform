import { ImageFormat } from './image-format';

export type NetworkEffectiveType = 'slow-2g' | '2g' | '3g' | '4g';

export interface NavigatorConnection {
  effectiveType: NetworkEffectiveType;
  saveData: boolean;
}

export interface ImageQualityNetwork extends Record<NetworkEffectiveType, number> {
  saveData: number;
  default: number;
}

export interface ImageOptimizerConfig {
  deviceSizes: number[];
  imageSizes: number[];
  quality: number | ImageQualityNetwork;
  formats: ImageFormat[];
}

export const defaultImageOptimizerConfig: ImageOptimizerConfig = {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  quality: { 'slow-2g': 30, '2g': 40, '3g': 50, '4g': 75, saveData: 40, default: 75 },
  formats: [ImageFormat.Jpeg, ImageFormat.Webp],
};
