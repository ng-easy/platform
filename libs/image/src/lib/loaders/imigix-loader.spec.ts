import { TestBed } from '@angular/core/testing';

import { ImageFormat } from '@ng-easy/image-config';

import { ImageModule } from '../image.module';
import { ImageLoaderRegistry } from '../services';
import { ImigixImageLoader } from './imigix-loader';

describe('ImigixImageLoader', () => {
  let loaderRegistry: ImageLoaderRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ImageModule.forRoot({ loaders: [ImigixImageLoader] })] });
    loaderRegistry = TestBed.inject(ImageLoaderRegistry);
  });

  it('should compile', () => {
    expect(loaderRegistry.getLoader('imigix')).toBeTruthy();
  });

  it('should return an image url', () => {
    const loader = loaderRegistry.getLoader('imigix');
    expect(loader.getImageUrl({ src: 'image', width: 128, quality: 95, format: ImageFormat.Jpeg })).toBe(
      'https://assets.imgix.net/image?w=128&q=95&fm=jpeg'
    );
  });
});
