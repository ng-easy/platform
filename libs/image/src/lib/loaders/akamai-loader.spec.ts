import { TestBed } from '@angular/core/testing';

import { ImageFormat } from '@ng-easy/image-config';

import { ImageModule } from '../image.module';
import { ImageLoaderRegistry } from '../services';
import { akamaiImageLoader } from './akamai-loader';

describe('AkamaiImageLoader', () => {
  let loaderRegistry: ImageLoaderRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ImageModule.forRoot({ loaders: [akamaiImageLoader('root')] })] });
    loaderRegistry = TestBed.inject(ImageLoaderRegistry);
  });

  it('should compile', () => {
    expect(loaderRegistry.getLoader('akamai')).toBeTruthy();
  });

  it('should return an image url', () => {
    const loader = loaderRegistry.getLoader('akamai');
    expect(loader.getImageUrl({ src: 'image', width: 128, quality: 95, format: ImageFormat.Jpeg })).toBe('root/image?imwidth=128');
  });
});
