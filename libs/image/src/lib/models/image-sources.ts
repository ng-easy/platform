import { ImageMimeType } from '@ng-easy/image-config';

export interface ImageSources {
  srcset: string;
  sizes: string;
  src: string;
  mimeType: ImageMimeType;
}
