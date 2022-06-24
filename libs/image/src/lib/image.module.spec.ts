import { TestBed } from '@angular/core/testing';

import { defaultImageOptimizerConfig } from '@ng-easy/image-config';

import { ImageModule } from './image.module';
import { akamaiImageLoader, RuntimeImageLoader } from './loaders';
import { ImageLoaderRegistry } from './services';
import { IMAGE_OPTIMIZER_CONFIG } from './tokens';

describe('ImageModule', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ImageModule.forRoot({ loaders: [RuntimeImageLoader, akamaiImageLoader('root')] })] });
  });

  it('should compile', () => {
    expect(TestBed.inject(IMAGE_OPTIMIZER_CONFIG)).toBeTruthy();
  });

  it('should return default config if not provided', () => {
    expect(TestBed.inject(IMAGE_OPTIMIZER_CONFIG)).toBe(defaultImageOptimizerConfig);
  });

  it('should register loaders as classes and as factories', () => {
    const loaderRegistry = TestBed.inject(ImageLoaderRegistry);

    expect(loaderRegistry.getLoader('runtime')).toBeTruthy();
    expect(loaderRegistry.getLoader('akamai')).toBeTruthy();
  });
});
