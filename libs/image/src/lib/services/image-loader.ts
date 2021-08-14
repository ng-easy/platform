import { Inject, Injectable } from '@angular/core';

import { ImageFormat, dedupAndSortImageSizes, getImageFormat, ImageOptimizerConfig, getImageMimeType } from '@ng-easy/image-config';

import { getQuality } from '../functions';
import { ImageUrlOptions, ImageSourcesOptions, ImageSources, ImageLayout } from '../models';
import { IMAGE_OPTIMIZER_CONFIG } from '../tokens';

const viewportWidthRe = /(^|\s)(1?\d?\d)vw/g;
const preferredOptimizedFormats: readonly ImageFormat[] = [ImageFormat.Webp, ImageFormat.Avif, ImageFormat.Heif, ImageFormat.Jpeg] as const;
const placeholderQuality = 15;
const placeholderWidth = 15;
const randomWidth: number = Math.floor(Math.random() * 1000) + 100;

/**
 * Provider that resolves image URLs.
 */
export abstract class ImageLoader {
  private readonly allSizes: readonly number[] = dedupAndSortImageSizes([
    ...this.imageOptimizerConfig.deviceSizes,
    ...this.imageOptimizerConfig.imageSizes,
  ]);
  private readonly deviceSizes: readonly number[] = dedupAndSortImageSizes(this.imageOptimizerConfig.deviceSizes);
  private readonly preferredOptimizedFormat: ImageFormat;

  readonly supportsOptimization: boolean = this.getImageUrl({
    src: 'test',
    width: randomWidth,
    quality: 75,
    format: ImageFormat.Jpeg,
  }).includes(randomWidth.toString());

  constructor(@Inject(IMAGE_OPTIMIZER_CONFIG) protected readonly imageOptimizerConfig: ImageOptimizerConfig) {
    const supportedFormats: Set<ImageFormat> = new Set([...imageOptimizerConfig.formats, ImageFormat.Jpeg]);
    const preferredOptimizedFormat: ImageFormat | undefined = preferredOptimizedFormats.find((preferredFormat) =>
      supportedFormats.has(preferredFormat)
    );
    if (preferredOptimizedFormat == null) {
      throw new Error(`There is not a supported preferred image optimizer format.`);
    }
    this.preferredOptimizedFormat = preferredOptimizedFormat;
  }

  abstract getImageUrl(options: ImageUrlOptions): string;

  getImageSources({ src, width, layout, sizes, unoptimized }: ImageSourcesOptions): ImageSources[] {
    if (unoptimized) {
      return [{ src, sizes: '', srcset: '', mimeType: getImageMimeType(src) }];
    }

    const { widths, kind } = this.getWidths(width, layout, sizes);
    const lastWidthIndex: number = widths.length - 1;
    const quality: number = getQuality(this.imageOptimizerConfig.quality);

    return this.getImageOptimizedFormats(src, unoptimized).map((format) => ({
      sizes: !sizes && kind === 'w' ? '100vw' : sizes,
      srcset: widths
        .map((width, index) => `${this.getImageUrl({ src, quality, width, format })} ${kind === 'w' ? width : index + 1}${kind}`)
        .join(', '),
      src: this.getImageUrl({ src, quality, width: widths[lastWidthIndex], format }),
      mimeType: getImageMimeType(format),
    }));
  }

  // TODO: use jpg format instead of preferredOptimizedFormat
  getPlaceholderSrc(src: string): string {
    return this.getImageUrl({
      src,
      quality: placeholderQuality,
      width: placeholderWidth,
      format: this.preferredOptimizedFormat,
    });
  }

  private getImageOptimizedFormats(src: string, unoptimized: boolean): ImageFormat[] {
    const format: ImageFormat = getImageFormat(src);

    if (format === ImageFormat.Png) {
      return [ImageFormat.Png];
    } else if (unoptimized) {
      return [format];
    } else {
      return [...new Set([this.preferredOptimizedFormat, ImageFormat.Jpeg])];
    }
  }

  private getWidths(width: number | undefined, layout: ImageLayout, sizes: string): { widths: number[]; kind: 'w' | 'x' } {
    if (sizes && (layout === 'fill' || layout === 'responsive')) {
      // Find all the "vw" percent sizes used in the sizes prop
      const percentSizes: number[] = [];
      for (let match; (match = viewportWidthRe.exec(sizes)); match) {
        percentSizes.push(parseInt(match[2]));
      }

      if (percentSizes.length) {
        const smallestRatio: number = Math.min(...percentSizes) * 0.01;
        return {
          widths: this.allSizes.filter((size: number) => size >= this.deviceSizes[0] * smallestRatio),
          kind: 'w',
        };
      }
      return { widths: [...this.allSizes], kind: 'w' };
    }

    if (width == null || layout === 'fill' || layout === 'responsive') {
      return { widths: [...this.deviceSizes], kind: 'w' };
    }

    const widths: number[] = [
      ...new Set(
        // > This means that most OLED screens that say they are 3x resolution,
        // > are actually 3x in the green color, but only 1.5x in the red and
        // > blue colors. Showing a 3x resolution image in the app vs a 2x
        // > resolution image will be visually the same, though the 3x image
        // > takes significantly more data. Even true 3x resolution screens are
        // > wasteful as the human eye cannot see that level of detail without
        // > something like a magnifying glass.
        // https://blog.twitter.com/engineering/en_us/topics/infrastructure/2019/capping-image-fidelity-on-ultra-high-resolution-devices.html
        [width, width * 2].map((w) => this.allSizes.find((p) => p >= w) || this.allSizes[this.allSizes.length - 1])
      ),
    ];
    return { widths, kind: 'x' };
  }
}

@Injectable()
export class DefaultImageLoader extends ImageLoader {
  getImageUrl({ src, width, quality, format }: ImageUrlOptions) {
    return `${src}?w=${width}&q=${quality}&fm=${format}`;
  }
}
