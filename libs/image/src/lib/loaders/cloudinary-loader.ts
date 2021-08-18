import { inject } from '@angular/core';

import { ImageOptimizerConfig } from '@ng-easy/image-config';

import { ImageUrlOptions } from '../models';
import { IMAGE_OPTIMIZER_CONFIG } from '../tokens';
import { ImageLoader } from './image-loader';

class CloudinaryImageLoader extends ImageLoader {
  readonly name = 'cloudinary';

  constructor(private readonly root: string, imageOptimizerConfig: ImageOptimizerConfig) {
    super(imageOptimizerConfig);
  }

  // Example: https://res.cloudinary.com/idemo/image/upload/f_webp,q_75,w_355/balloons.jpg
  getImageUrl({ src, width, quality, format }: ImageUrlOptions) {
    const supportedFormat: string = format.replace(/jpeg/, 'jpg');
    return `${this.root}/f_${supportedFormat},w_${width},q_${quality}/${this.normalizeSrc(src)}`;
  }
}

export const cloudinaryImageLoader = (root: string) => () => {
  return new CloudinaryImageLoader(root, inject(IMAGE_OPTIMIZER_CONFIG));
};
