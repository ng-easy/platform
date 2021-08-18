import { inject } from '@angular/core';

import { ImageOptimizerConfig } from '@ng-easy/image-config';

import { ImageUrlOptions } from '../models';
import { IMAGE_OPTIMIZER_CONFIG } from '../tokens';
import { ImageLoader } from './image-loader';

class AkamaiImageLoader extends ImageLoader {
  readonly name = 'akamai';

  constructor(private readonly root: string, imageOptimizerConfig: ImageOptimizerConfig) {
    super(imageOptimizerConfig);
  }

  // Example: https://www.akamai.com/fetch-dv-data/www/im-demo/360/01.jpg?imwidth=5000
  getImageUrl({ src, width }: ImageUrlOptions) {
    return `${this.root}/${this.normalizeSrc(src)}?imwidth=${width}`;
  }
}

export const akamaiImageLoader = (root: string) => () => {
  return new AkamaiImageLoader(root, inject(IMAGE_OPTIMIZER_CONFIG));
};
