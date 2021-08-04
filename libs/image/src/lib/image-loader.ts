import { Inject, Injectable } from '@angular/core';

import { ImageLayout } from './image-layout';
import { dedupAndSortImageSizes, ImageOptimizerConfig, IMAGE_OPTIMIZER_CONFIG } from './image-optimizer-config';

const viewportWidthRe = /(^|\s)(1?\d?\d)vw/g;

/**
 * Provider that resolves image URLs.
 */
export abstract class ImageLoader {
  // TODO: memoize
  private get allSizes(): number[] {
    return dedupAndSortImageSizes([...this.imageOptimizerConfig.deviceSizes, ...this.imageOptimizerConfig.imageSizes]);
  }

  // TODO: memoize
  private get deviceSizes(): number[] {
    return dedupAndSortImageSizes(this.imageOptimizerConfig.deviceSizes);
  }

  constructor(protected readonly imageOptimizerConfig: ImageOptimizerConfig) {}

  abstract loader(options: { src: string; width: number; quality: number }): string;

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
      return { widths: this.allSizes, kind: 'w' };
    }

    if (width == null || layout === 'fill' || layout === 'responsive') {
      return { widths: this.deviceSizes, kind: 'w' };
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

  getImageAttributes(
    src: string,
    width: number | undefined,
    layout: ImageLayout,
    sizes: string,
    unoptimized: boolean
  ): { src: string; srcset: string; sizes: string } {
    if (unoptimized) {
      return { src, sizes: '', srcset: '' };
    }

    const { widths, kind } = this.getWidths(width, layout, sizes);
    const lastWidthIndex: number = widths.length - 1;
    const quality: number = this.imageOptimizerConfig.quality;

    return {
      sizes: !sizes && kind === 'w' ? '100vw' : sizes,
      srcset: widths.map((width, index) => `${this.loader({ src, quality, width })} ${kind === 'w' ? width : index + 1}${kind}`).join(', '),
      src: this.loader({ src, quality, width: widths[lastWidthIndex] }),
    };
  }
}

@Injectable()
export class DefaultImageLoader extends ImageLoader {
  constructor(@Inject(IMAGE_OPTIMIZER_CONFIG) imageOptimizerConfig: ImageOptimizerConfig) {
    super(imageOptimizerConfig);
  }

  loader({ src, width, quality }: { src: string; width: number; quality: number }) {
    return `${src}?w=${width}&q=${quality}`;
  }
}
