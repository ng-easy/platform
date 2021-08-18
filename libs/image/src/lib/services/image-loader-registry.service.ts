import { Injectable } from '@angular/core';

import { ImageLoader } from '../loaders';

@Injectable({ providedIn: 'root' })
export class ImageLoaderRegistry {
  private readonly loaderMap = new Map<string, ImageLoader>();
  private defaultLoader: ImageLoader | null = null;

  registerLoaders(loaders: ImageLoader[]) {
    loaders.forEach((loader) => {
      // First loader is treated as the default one
      if (this.defaultLoader == null) {
        this.defaultLoader = loader;
      }

      if (this.loaderMap.has(loader.name)) {
        console.error(`Duplicated image loader with name "${loader.name}". Fix it by declaring image loaders only in one module.`);
      }

      this.loaderMap.set(loader.name, loader);
    });
  }

  getLoader(loaderName?: string | null): ImageLoader {
    if (loaderName == null) {
      if (this.defaultLoader == null) {
        throw new Error(`There are no image loaders configured, provide at least one in the configuration.`);
      }
      return this.defaultLoader;
    }

    const loader: ImageLoader | undefined = this.loaderMap.get(loaderName);
    if (loader == null) {
      throw new Error(`There is no image loader with name "loaderName".`);
    }
    return loader;
  }
}
