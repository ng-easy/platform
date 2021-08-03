import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { DefaultImageLoader, ImageLoader } from './image-loader';
import { ImageComponent } from './image.component';

@NgModule({
  declarations: [ImageComponent],
  imports: [CommonModule],
  exports: [ImageComponent],
})
export class ImageModule {
  static forRoot(): ModuleWithProviders<ImageModule> {
    return {
      ngModule: ImageModule,
      providers: [
        { provide: ImageLoader, useClass: DefaultImageLoader },
        { provide: Window, useValue: window },
      ],
    };
  }
}
