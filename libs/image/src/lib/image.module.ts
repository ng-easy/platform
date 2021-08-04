import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { DefaultImageLoader, ImageLoader } from './image-loader';
import { defaultImageOptimizerConfig, ImageOptimizerConfig, IMAGE_OPTIMIZER_CONFIG } from './image-optimizer-config';
import { ImageComponent } from './image.component';

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
