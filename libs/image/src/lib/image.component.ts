import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { ImageLayout } from './image-layout';
import { ImageLoader } from './image-loader';
import { ImagePlaceholder } from './image-placeholder';

@Component({
  selector: 'nge-image[src]',
  template: `
    <div class="wrapper wrapper--{{ layout }}" [style.width]="wrapperWidth" [style.height]="wrapperHeight">
      <div class="sizer sizer--{{ layout }}" [style.padding-top]="sizerPaddingTop" *ngIf="showSizer">
        <img class="sizer__content" alt="" role="presentation" />
      </div>
      <img class="img" [src]="src" decoding="async" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      div.wrapper {
        display: block,
        overflow: hidden;
        box-sizing: border-box;
        margin:0
      }

      div.wrapper--fill {
        position: absolute;
        top: 0;
        left:0;
        bottom: 0;
        right:0,
      }

      div.wrapper--responsive {
        position: relative;
      }

      div.wrapper--intrinsic {
        display: inline-block;
        max-width: 100%;
        position: relative;
      }

      div.wrapper--fixed {
        display: inline-block;
        position: relative;
      }

      div.sizer {
        display: block;
        box-sizing: border-box;
      }

      div.sizer--intrinsic {
        max-width: 100%;
      }

      img.sizer__content {
        max-width: 100%;
        display: block;
        margin: 0;
        border: none;
        padding: 0;
      }

      img.img {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;

        box-sizing: border-box;
        padding: 0;
        border: none;
        margin: auto;

        display: block;
        width: 0;
        height: 0;
        min-width: 100%;
        max-width: 100%;
        min-height: 100%;
        max-height: 100%;
      }
    `,
  ],
})
export class ImageComponent implements OnChanges {
  /**
   * Source for the image, will be passed to the image loader
   */
  @Input() src = '';
  @Input() alt = '';
  @Input() width?: number;
  @Input() height?: number;
  @Input() layout: ImageLayout = 'responsive';
  @Input() priority = false;
  @Input() placeholder: ImagePlaceholder = 'empty';
  @Input() blurDataURL?: string;
  @Input() unoptimized = false;

  @Output() loadingComplete = new EventEmitter<void>();

  get showSizer() {
    return this.layout === 'intrinsic' || this.layout === 'responsive';
  }

  sizeRatio = 0;

  wrapperWidth = 'auto';
  wrapperHeight = 'auto';

  sizerPaddingTop = '0';

  constructor(private imageLoader: ImageLoader) {}

  ngOnChanges(): void {
    if (this.width == null || this.height == null || this.width <= 0) {
      throw new Error(`Image with src "${this.src}" must use "width" and "height" properties or "layout='fill'" property.`);
    }

    this.sizeRatio = this.height / this.width;

    this.wrapperWidth = this.layout === 'fixed' ? `${this.width}px` : 'auto';
    this.wrapperHeight = this.layout === 'fixed' ? `${this.height}px` : 'auto';

    this.sizerPaddingTop = this.layout === 'responsive' ? `${this.sizeRatio * 100}%` : 'auto';
  }
}
