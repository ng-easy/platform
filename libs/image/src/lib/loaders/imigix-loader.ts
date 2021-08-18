import { Injectable } from '@angular/core';

import { ImageUrlOptions } from '../models';
import { ImageLoader } from './image-loader';

@Injectable()
export class ImigixImageLoader extends ImageLoader {
  private static root = 'https://assets.imgix.net';
  readonly name = 'imigix';

  // Example: https://assets.imgix.net/unsplash/bear.jpg?w=1080&q=75&fm=webp
  getImageUrl({ src, width, quality, format }: ImageUrlOptions) {
    return `${ImigixImageLoader.root}/${this.normalizeSrc(src)}?w=${width}&q=${quality}&fm=${format}`;
  }
}
