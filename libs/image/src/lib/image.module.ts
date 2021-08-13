import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { defaultImageOptimizerConfig, ImageOptimizerConfig } from '@ng-easy/image-config';

import { DefaultImageLoader, ImageLoader } from './image-loader';
import { IMAGE_OPTIMIZER_CONFIG } from './image-optimizer-config';
import { ImageComponent } from './image.component';

export interface ImageModuleConfig {
  imageOptimizerConfig?: ImageOptimizerConfig;
}

@NgModule({
  declarations: [ImageComponent],
  imports: [CommonModule, HttpClientModule],
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
