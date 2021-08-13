import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { defaultImageOptimizerConfig, ImageOptimizerConfig } from '@ng-easy/image-config';

import { ImageComponent } from './component';
import { DefaultImageLoader, ImageLoader } from './services';
import { IMAGE_OPTIMIZER_CONFIG } from './tokens';

export interface ImageModuleConfig {
  imageOptimizerConfig?: ImageOptimizerConfig;
}

@NgModule({
  declarations: [ImageComponent],
  imports: [CommonModule],
  exports: [ImageComponent],
})
export class ImageModule {
  static forRoot({ imageOptimizerConfig }: ImageModuleConfig): ModuleWithProviders<ImageModule> {
    return {
      ngModule: ImageModule,
      providers: [
        { provide: ImageLoader, useClass: DefaultImageLoader },
        { provide: IMAGE_OPTIMIZER_CONFIG, useValue: imageOptimizerConfig ?? defaultImageOptimizerConfig },
        { provide: Window, useValue: window },
      ],
    };
  }
}
