import { TestBed } from '@angular/core/testing';

import { defaultImageOptimizerConfig } from '@ng-easy/image-config';

import { RuntimeImageLoader } from '../loaders';
import { ImageLoaderRegistry } from './image-loader-registry.service';

describe('ImageLoaderRegistry', () => {
  let imageLoaderRegistry: ImageLoaderRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    imageLoaderRegistry = TestBed.inject(ImageLoaderRegistry);
  });

  it('should compile', () => {
    expect(imageLoaderRegistry).toBeTruthy();
  });

  it('should fail if no image loaders provided', () => {
    expect(() => {
      imageLoaderRegistry.getLoader();
    }).toThrowError('There are no image loaders configured, provide at least one in the configuration.');
  });

  it('should fail if requested loader does not exist', () => {
    expect(() => {
      imageLoaderRegistry.getLoader('loader');
    }).toThrowError(`There is no image loader with name "loader".`);
  });

  it('should return named loaders', () => {
    const imageLoader = new RuntimeImageLoader(defaultImageOptimizerConfig);
    imageLoaderRegistry.registerLoaders([imageLoader]);

    expect(imageLoaderRegistry.getLoader(imageLoader.name)).toBe(imageLoader);
  });

  it('should return first registered loader as default', () => {
    const imageLoader = new RuntimeImageLoader(defaultImageOptimizerConfig);
    imageLoaderRegistry.registerLoaders([imageLoader]);

    expect(imageLoaderRegistry.getLoader()).toBe(imageLoader);
  });

  it('should fail if registering two loaders with the same name', () => {
    const imageLoader = new RuntimeImageLoader(defaultImageOptimizerConfig);

    expect(() => {
      imageLoaderRegistry.registerLoaders([imageLoader, imageLoader]);
    }).toThrowError(`Duplicated image loader with name "runtime". Fix it by declaring image loaders only in one module.`);
  });
});
