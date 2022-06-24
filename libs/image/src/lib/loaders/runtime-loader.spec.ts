import { TestBed } from '@angular/core/testing';

import { ImageFormat } from '@ng-easy/image-config';

import { ImageModule } from '../image.module';
import { ImageLoaderRegistry } from '../services';
import { RuntimeImageLoader } from './runtime-loader';

describe('RuntimeImageLoader', () => {
  let loaderRegistry: ImageLoaderRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ImageModule.forRoot({ loaders: [RuntimeImageLoader] })] });
    loaderRegistry = TestBed.inject(ImageLoaderRegistry);
  });

  it('should compile', () => {
    expect(loaderRegistry.getLoader('runtime')).toBeTruthy();
  });

  it('should return an image url', () => {
    const loader = loaderRegistry.getLoader('runtime');
    expect(loader.getImageUrl({ src: 'image', width: 128, quality: 95, format: ImageFormat.Jpeg })).toBe('image?w=128&q=95&fm=jpeg');
  });
});
