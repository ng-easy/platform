import { Injectable } from '@angular/core';

import { ImageUrlOptions } from '../models';
import { ImageLoader } from './image-loader';

@Injectable()
export class RuntimeImageLoader extends ImageLoader {
  readonly name = 'runtime';

  getImageUrl({ src, width, quality, format }: ImageUrlOptions) {
    return `${src}?w=${width}&q=${quality}&fm=${format}`;
  }
}
