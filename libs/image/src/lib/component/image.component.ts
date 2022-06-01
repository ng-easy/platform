import { coerceNumberProperty, NumberInput } from '@angular/cdk/coercion';
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  isDevMode,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Inject,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, of, Subject, filter, map, startWith, switchMap, take, BehaviorSubject } from 'rxjs';

import { ImageLoader } from '../loaders';
import { ImageLayout, ImagePlaceholder, ObjectFit, ImageSources } from '../models';
import { IntersectionObserverService, ImageLoaderRegistry } from '../services';
import { LAZY_LOAD_SUPPORT } from '../tokens';

@Component({
  selector: 'image[src]',
  templateUrl: 'image.component.html',
  styleUrls: ['image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent implements OnChanges, AfterViewInit {
  @ViewChild('image', { static: false }) readonly image?: ElementRef<HTMLImageElement>;

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
  @Input() get width(): number | undefined {
    return this._width;
  }
  set width(v: NumberInput) {
    this._width = v != null ? Math.max(0, coerceNumberProperty(v)) : undefined;
  }
  private _width?: number;

  /**
   * The height of the image, in pixels. Must be an integer without a unit.
   * Required, except for those with `layout="fill"`.
   */
  @Input() get height(): number | undefined {
    return this._height;
  }
  set height(v: NumberInput) {
    this._height = v != null ? Math.max(0, coerceNumberProperty(v)) : undefined;
  }
  private _height?: number;

  /**
   * The layout behavior of the image as the viewport changes size. Defaults to `intrinsic`.
   * TODO: confirm functionality with next.js
   * * When `fixed,` the image dimensions will not change as the viewport changes (no responsiveness) similar to the native img element.
   * * When `intrinsic`, the image will scale the dimensions down for smaller viewports but maintain the original dimensions for larger viewports.
   * * When `responsive`, the image will scale the dimensions down for smaller viewports and scale up for larger viewports.
   * * When `fill`, the image will stretch both width and height to the dimensions of the parent element, provided the parent element is relative. This is usually paired with the objectFit property.
   */
  @Input() layout: ImageLayout = 'intrinsic';

  /**
   * The name of the loader to be used. If in configuration there is only one, this property can be omitted, the default will be used.
   */
  @Input() set loader(loaderName: string) {
    this.imageLoader = this.imageLoaderRegistry.getLoader(loaderName);
  }

  /**
   * A string mapping media queries to device sizes. Defaults to `100vw`.
   * We recommend setting sizes when using `layout="responsive"` or `layout="fill"` and your image will not be the same width as the viewport.
   */
  @Input() sizes = '100vw';

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
   *
   * If not provided inline and the loader supports optimization a small placeholder will be fetched automatically.
   */
  @Input() blurDataURL?: string;

  /**
   * When true, the source image will be served as-is instead of changing quality, size, or format. Defaults to `false`.
   */
  @Input() unoptimized = false;

  /**
   * The image fit when using `layout="fill"`.
   */
  @Input() objectFit: ObjectFit = 'cover';

  /**
   * The image fit when using `layout="fill"`.
   */
  @Input() objectPosition = '50% 50%';

  /**
   * Output emits once the image is completely loaded and the placeholder has been removed.
   */
  @Output() loadingComplete = new EventEmitter<void>();

  private imageLoader: ImageLoader = this.imageLoaderRegistry.getLoader();

  get loading(): 'eager' | 'lazy' {
    return this.priority ? 'eager' : 'lazy';
  }

  get showSizer(): boolean {
    return this.layout === 'intrinsic' || this.layout === 'responsive';
  }

  get sizeRatio(): number {
    return this.height == null || this.width == null ? 0 : this.height / this.width;
  }

  get sizerPaddingTop(): string {
    return this.layout === 'responsive' ? `${this.sizeRatio * 100}%` : 'auto';
  }

  get wrapperWidth(): string {
    return this.layout === 'fixed' ? `${this.width ?? 0}px` : 'auto';
  }

  get wrapperHeight(): string {
    return this.layout === 'fixed' ? `${this.height ?? 0}px` : 'auto';
  }

  private readonly ngOnChanges$ = new Subject<void>();
  private readonly changes$: Observable<void> = this.ngOnChanges$.pipe(startWith(undefined as void));

  readonly sizerSvg$: Observable<SafeUrl | null> = this.changes$.pipe(
    map(() => {
      if (this.layout !== 'intrinsic') {
        return null;
      }

      // Create a placeholder svg and convert it to base64
      const sizerSvg: string = this.window.btoa(
        `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg" version="1.1"/>`
      );

      return this.domSanitizer.bypassSecurityTrustUrl(`data:image/svg+xml;base64,${sizerSvg}`);
    })
  );

  readonly sources$: Observable<ImageSources[]> = this.changes$.pipe(
    map(() =>
      this.imageLoader.getImageSources({
        src: this.src,
        width: this.width,
        layout: this.layout,
        sizes: this.sizes,
        unoptimized: this.unoptimized,
      })
    )
  );

  private readonly isImageLoaded$ = new BehaviorSubject(false);

  readonly blurFilter$: Observable<string> = this.changes$.pipe(
    switchMap(() => this.isImageLoaded$),
    map((isImageLoaded) => {
      if (this.placeholder === 'blur' && this.blurDataURL && !isImageLoaded) {
        return `blur(20px)`;
      } else {
        return 'none';
      }
    })
  );

  readonly blurBackgroundImage$: Observable<string> = this.changes$.pipe(
    map(() => {
      if (this.placeholder === 'blur') {
        return this.blurDataURL ? `url("${this.blurDataURL}")` : `url("${this.imageLoader.getPlaceholderSrc(this.src)}")`;
      } else {
        return 'none';
      }
    })
  );

  readonly isVisible$: Observable<boolean> = this.changes$.pipe(
    switchMap(() => (this.lazyLoadingSupport || this.priority ? of(true) : this.intersection.isVisible(this.elementRef.nativeElement))),
    filter((isVisible) => isVisible),
    take(1)
  );

  constructor(
    private readonly imageLoaderRegistry: ImageLoaderRegistry,
    private readonly window: Window,
    private readonly domSanitizer: DomSanitizer,
    private readonly elementRef: ElementRef,
    private readonly intersection: IntersectionObserverService,
    @Inject(LAZY_LOAD_SUPPORT) private readonly lazyLoadingSupport: boolean
  ) {}

  ngOnChanges() {
    this.validateInputs();
    this.ngOnChanges$.next();
  }

  ngAfterViewInit() {
    if (this.image?.nativeElement.complete) {
      // In case the image was rendered by SSR and already completed
      this.onLoad();
    }
  }

  getImageMime(_: number, { mimeType: mime }: ImageSources) {
    return mime;
  }

  // TODO: fix this being called twice
  onLoad() {
    if (!this.image) {
      return;
    }

    if (this.image.nativeElement.src.startsWith('data:')) {
      this.isImageLoaded$.next(true);
    } else {
      const decodePromise: Promise<void> = 'decode' in this.image.nativeElement ? this.image.nativeElement.decode() : Promise.resolve();

      decodePromise
        .catch(() => null)
        .then(() => {
          this.isImageLoaded$.next(true);
          this.loadingComplete.emit();
        });
    }

    if (isDevMode() && this.layout === 'fixed') {
      // Check if the size of the image was OK, can help while developing
      const { naturalWidth, naturalHeight } = this.image.nativeElement;

      if (this.width != null && this.width != naturalWidth) {
        console.warn(`Image with src "${this.src}" should have "width" of ${naturalWidth}.`);
      }

      if (this.height != null && this.height != naturalHeight) {
        console.warn(`Image with src "${this.src}" should have "height" of ${naturalHeight}.`);
      }
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  private validateInputs() {
    if (this.src.startsWith('data:')) {
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
      this.unoptimized = true;
      this.priority = false;
    }

    if (this.layout !== 'fill' && (this.width == null || this.height == null || this.width <= 0 || this.height <= 0)) {
      throw new Error(`Image with src "${this.src}" must use "width" and "height" properties or "layout='fill'" property.`);
    }

    if (!isDevMode()) {
      return;
    }

    // TODO: optimize production build

    if (this.layout === 'fill' && (this.width != null || this.height != null)) {
      console.warn(`Image with src "${this.src}" and "layout='fill'" has unused properties assigned. Please remove "width" and "height".`);
    }

    if (this.alt.trim().length === 0) {
      console.warn(`Image with src "${this.src}" must use an "alt" property.`);
    }

    if (!this.unoptimized && !this.imageLoader.supportsWidth) {
      console.warn(
        `Image with src "${this.src}" uses a loader that does not implement width. Please implement it or use the "unoptimized" property instead.`
      );
    }

    if (this.placeholder === 'blur') {
      if (this.layout !== 'fill' && (this.width ?? 0) * (this.height ?? 0) < 1600) {
        console.warn(
          `Image with src "${this.src}" is smaller than 40x40. Consider removing the "placeholder='blur'" property to improve performance.`
        );
      }

      if (!this.blurDataURL && !this.imageLoader.supportsWidth) {
        console.warn(
          `Image with src "${this.src}" has "placeholder='blur'" property but is missing the "blurDataURL" property. ` +
            `Placeholder could be fetched from the loader, but it doesn't support optimization. ` +
            `Please implement it, or pass an inline "blurDataURL".`
        );
      }
    }
  }

  // TODO: unit tests
  // TODO: in SSR use as background color the predominant one
  // TODO: generate blur placeholder in SSR
  // TODO: implement priority adding preload to head in SSR
}
