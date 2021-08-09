import { ImageFormat } from '@ng-easy/image-config';

export interface ImageUrlOptions {
  src: string;
  width: number;
  quality: number;
  format: ImageFormat;
}
