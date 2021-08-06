import { ImageLayout } from './image-layout';
import { ImageFormat } from './image-optimizer-config';

export interface ImageSourcesOptions {
  src: string;
  format: ImageFormat;
  width: number | undefined;
  layout: ImageLayout;
  sizes: string;
  unoptimized: boolean;
}
