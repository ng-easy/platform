import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges, isDevMode } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { ImageLayout } from './image-layout';
import { ImageLoader } from './image-loader';
import { ImagePlaceholder } from './image-placeholder';

@Component({
  selector: 'image[src]',
  template: `
    <div class="wrapper wrapper--{{ layout }}" [style.width]="wrapperWidth" [style.height]="wrapperHeight">
      <div class="sizer sizer--{{ layout }}" [style.padding-top]="sizerPaddingTop" *ngIf="showSizer">
        <img *ngIf="sizerSvg as sizerSrc" [src]="sizerSvg" class="sizer__content" aria-hidden="true" alt="" role="presentation" />
      </div>
      <img class="img" [src]="src" [alt]="alt" decoding="async" [style.objectFit]="objectFit" [style.objectPosition]="objectPosition" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      div.wrapper {
        display: block;
        overflow: hidden;
        box-sizing: border-box;
        margin: 0;
      }

      div.wrapper--fill {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
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
   * Required, must be a path string. This can be either an absolute external URL, or an internal path depending on the loader.
   */
  @Input() src = '';

  /**
   * The `alt` attribute provides alternative information for an image if a user for some reason cannot view it
   * (because of slow connection, an error in the src attribute, or if the user uses a screen reader).
   */
  @Input() alt = '';

  /**
   * The width of the image, in pixels. Must be an integer without a unit.
   * Required, except for those with `layout="fill"`.
   */
  @Input() width?: number;

  /**
   * The height of the image, in pixels. Must be an integer without a unit.
   * Required, except for those with `layout="fill"`.
   */
  @Input() height?: number;

  /**
   * The layout behavior of the image as the viewport changes size. Defaults to `intrinsic`.
   *
   * * When `fixed,` the image dimensions will not change as the viewport changes (no responsiveness) similar to the native img element.
   * * When `intrinsic`, the image will scale the dimensions down for smaller viewports but maintain the original dimensions for larger viewports.
   * * When `responsive`, the image will scale the dimensions down for smaller viewports and scale up for larger viewports.
   * * When `fill`, the image will stretch both width and height to the dimensions of the parent element, provided the parent element is relative. This is usually paired with the objectFit property.
   */
  @Input() layout: ImageLayout = 'intrinsic';

  /**
   * When true, the image will be considered high priority and preload.
   * Should only be used when the image is visible above the fold. Defaults to false.
   * Is used only in server-side rendering.
   */
  @Input() priority = false;

  /**
   * A placeholder to use while the image is loading in base, possible values are blur or empty. Defaults to `empty`.
   *
   * When `blur`, the `blurDataURL` property will be used as the placeholder.
   * If using server-side rendering then `blurDataURL` will automatically be populated.
   *
   * When `empty`, there will be no placeholder while the image is loading, only empty space.
   */
  @Input() placeholder: ImagePlaceholder = 'empty';

  /**
   * A Data URL to be used as a placeholder image before the `src` image successfully loads. Only takes effect when combined with `placeholder="blur"`.
   * Must be a base64-encoded image. It will be enlarged and blurred, so a very small image (10px or less) is recommended. Including larger images as placeholders may harm your application performance.
   */
  @Input() blurDataURL?: string;

  /**
   * When true, the source image will be served as-is instead of changing quality, size, or format. Defaults to `false`.
   */
  @Input() unoptimized = false;

  /**
   * The image fit when using `layout="fill"`.
   */
  @Input() objectFit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' = 'cover';

  /**
   * The image fit when using `layout="fill"`.
   */
  @Input() objectPosition = '50% 50%';

  /**
   * Output emits once the image is completely loaded and the placeholder has been removed.
   */
  @Output() loadingComplete = new EventEmitter<void>();

  get showSizer() {
    return this.layout === 'intrinsic' || this.layout === 'responsive';
  }

  sizeRatio = 0;

  wrapperWidth = 'auto';
  wrapperHeight = 'auto';

  sizerPaddingTop = '0';
  sizerSvg: SafeUrl | null = null;

  constructor(private readonly imageLoader: ImageLoader, private readonly window: Window, private readonly domSanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    if (this.width == null || this.height == null || this.width <= 0) {
      throw new Error(`Image with src "${this.src}" must use "width" and "height" properties or "layout='fill'" property.`);
    }

    this.sizeRatio = this.height / this.width;

    this.wrapperWidth = this.layout === 'fixed' ? `${this.width}px` : 'auto';
    this.wrapperHeight = this.layout === 'fixed' ? `${this.height}px` : 'auto';

    this.sizerPaddingTop = this.layout === 'responsive' ? `${this.sizeRatio * 100}%` : 'auto';

    const sizerSvg = this.toBase64(`<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg" version="1.1"/>`);
    this.sizerSvg = this.layout === 'intrinsic' ? this.domSanitizer.bypassSecurityTrustUrl(`data:image/svg+xml;base64,${sizerSvg}`) : null;

    if (isDevMode() && this.alt.trim().length === 0) {
      console.warn(`Image with src "${this.src}" must use an "alt" property.`);
    }
  }

  private toBase64(str: string): string {
    return this.window.btoa(str);
  }

  // TODO: use sizes with responsive
  // TODO: width and height should be required only when not layout=fill, otherwise complain if provided
  // TODO: generate blur placeholder in SSR
  // TODO: check image size in SSR
  // TODO: use loader, pass settings
  // TODO: check if loader works https://github.com/vercel/next.js/blob/807d1ec7ef5925a4fa4b93b61ab72a8c5760531b/packages/next/client/image.tsx#L426
  // TODO: handle data: src https://github.com/vercel/next.js/blob/807d1ec7ef5925a4fa4b93b61ab72a8c5760531b/packages/next/client/image.tsx#L345
  // TODO: warn if placeholder provided but original size is smaller than 40x40
  // TODO: if placeholder blur, make sure data is provided https://github.com/vercel/next.js/blob/807d1ec7ef5925a4fa4b93b61ab72a8c5760531b/packages/next/client/image.tsx#L400
  // TODO: support intersection observer
  // TODO: implement priority adding preload to head in SSR
  // TODO: provide default image loaders https://github.com/vercel/next.js/blob/807d1ec7ef5925a4fa4b93b61ab72a8c5760531b/packages/next/client/image.tsx#L651
  // TODO: unit tests
  // TODO: visual diff tests
  // TODO: Export storybook to GitHub pages
}
