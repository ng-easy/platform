import { ImageLayout } from './image-layout';

export interface ImageSourcesOptions {
  src: string;
  width: number | undefined;
  layout: ImageLayout;
  sizes: string;
  unoptimized: boolean;
}
