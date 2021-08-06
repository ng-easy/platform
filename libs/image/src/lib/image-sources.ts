import { ImageMimeType } from './image-mime-type';

export interface ImageSources {
  srcset: string;
  sizes: string;
  src: string;
  mimeType: ImageMimeType;
}
