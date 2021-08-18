import { CommonModule } from '@angular/common';
import { Inject, ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';

import { defaultImageOptimizerConfig, ImageOptimizerConfig } from '@ng-easy/image-config';

import { ImageComponent } from './component';
import { ImageLoader } from './loaders';
import { ImageLoaderRegistry } from './services';
import { IMAGE_OPTIMIZER_CONFIG } from './tokens';

export interface ImageModuleConfig {
  imageOptimizerConfig?: ImageOptimizerConfig;
  loaders: (Type<ImageLoader> | (() => ImageLoader))[];
}

@NgModule({
  declarations: [ImageComponent],
  imports: [CommonModule],
  exports: [ImageComponent],
})
export class ImageModule {
  static forRoot({ imageOptimizerConfig, loaders }: ImageModuleConfig): ModuleWithProviders<ImageModule> {
    const classLoaders: Type<ImageLoader>[] = loaders.filter((loader): loader is Type<ImageLoader> => loader.prototype != null);
    const factoryLoaders: (() => ImageLoader)[] = loaders.filter((loader): loader is () => ImageLoader => loader.prototype == null);

    return {
      ngModule: ImageModule,
      providers: [
        ...classLoaders.map((loader): Provider => ({ provide: ImageLoader, useClass: loader, multi: true })),
        ...factoryLoaders.map((loader): Provider => ({ provide: ImageLoader, useFactory: loader, multi: true })),
        { provide: IMAGE_OPTIMIZER_CONFIG, useValue: imageOptimizerConfig ?? defaultImageOptimizerConfig },
        { provide: Window, useValue: window },
      ],
    };
  }

  constructor(@Inject(ImageLoader) loaders: ImageLoader[], loaderRegistry: ImageLoaderRegistry) {
    loaderRegistry.registerLoaders(loaders);
  }
}
