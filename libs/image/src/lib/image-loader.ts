import { Inject, Injectable } from '@angular/core';

import { getImageSizes, ImageOptimizerConfig, IMAGE_OPTIMIZER_CONFIG } from './image-optimizer-config';

/**
 * Provider that resolves image URLs.
 */
export abstract class ImageLoader {
  /**
   * Collection of unique image sizes to use.
   */
  abstract readonly imageSizes: number[];

  /**
   * A custom function used to resolve URLs.
   */
  abstract load(options: { src: string; width: number; quality: number }): string;
}

@Injectable()
export class DefaultImageLoader implements ImageLoader {
  readonly imageSizes: number[] = getImageSizes(this.imageOptimizerConfig);

  constructor(@Inject(IMAGE_OPTIMIZER_CONFIG) private readonly imageOptimizerConfig: ImageOptimizerConfig) {}

  load({ src, width, quality }: { src: string; width: number; quality: number }) {
    return `${src}?w=${width}&q=${quality}`;
  }
}
