import { ImageFormat } from './image-optimizer-config';

export interface ImageUrlOptions {
  src: string;
  width: number;
  quality: number;
  format: ImageFormat;
}
