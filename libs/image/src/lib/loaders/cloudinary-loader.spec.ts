import { TestBed } from '@angular/core/testing';

import { ImageFormat } from '@ng-easy/image-config';

import { ImageModule } from '../image.module';
import { ImageLoaderRegistry } from '../services';
import { cloudinaryImageLoader } from './cloudinary-loader';

describe('CloudinaryImageLoader', () => {
  let loaderRegistry: ImageLoaderRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ImageModule.forRoot({ loaders: [cloudinaryImageLoader('root')] })] });
    loaderRegistry = TestBed.inject(ImageLoaderRegistry);
  });

  it('should compile', () => {
    expect(loaderRegistry.getLoader('cloudinary')).toBeTruthy();
  });

  it('should return an image url', () => {
    const loader = loaderRegistry.getLoader('cloudinary');
    expect(loader.getImageUrl({ src: 'image', width: 128, quality: 95, format: ImageFormat.Jpeg })).toBe('root/f_jpg,w_128,q_95/image');
  });
});
