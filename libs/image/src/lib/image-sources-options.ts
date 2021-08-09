import { ImageFormat } from '@ng-easy/image-config';

import { ImageLayout } from './image-layout';

export interface ImageSourcesOptions {
  src: string;
  format: ImageFormat;
  width: number | undefined;
  layout: ImageLayout;
  sizes: string;
  unoptimized: boolean;
}
