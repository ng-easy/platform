import sharp, { Sharp } from 'sharp';

import { ImageCache } from './image-cache';

export enum ImageFormat {
  Png = 'png',
  Jpeg = 'jpeg',
  Webp = 'webp',
  Avif = 'avif',
  Heif = 'heif',
}

export interface ImageOptimizerOptions {
  format: ImageFormat;
  width: number;
  quality: number;
}

export interface ImageOptimizer {
  readonly supportedFormats: ImageFormat[];
  test: (imageUri: string, buffer: Buffer) => boolean;
  optimize: (imageUri: string, buffer: Buffer, options: ImageOptimizerOptions, cache?: ImageCache) => Promise<Buffer>;
}

class JpgOptimizer implements ImageOptimizer {
  readonly supportedFormats = [ImageFormat.Jpeg, ImageFormat.Webp, ImageFormat.Avif, ImageFormat.Heif];
  private readonly fileExtensionRegex: RegExp[] = this.supportedFormats
    .map((extension) => getFileExtensionRegex(extension))
    .concat([/\.jpg/i]);

  test(imageUri: string): boolean {
    return this.fileExtensionRegex.some((extensionRegex) => extensionRegex.test(imageUri));
  }

  async optimize(imageUri: string, buffer: Buffer, options: ImageOptimizerOptions, cache?: ImageCache): Promise<Buffer> {
    const cachedImage: Buffer | null = (await cache?.retrieve(imageUri, options)) ?? null;
    if (cachedImage != null) {
      return cachedImage;
    }

    const sharpImage: Sharp = sharp(buffer).resize({ width: options.width })[options.format]({ quality: options.quality });
    const optimizedImage: Buffer = await sharpImage.toBuffer();
    await cache?.persist(imageUri, optimizedImage, options);

    return optimizedImage;
  }
}

const ImageOptimizers: ImageOptimizer[] = [new JpgOptimizer()];

export function getImageOptimizer(imageUri: string, buffer: Buffer): ImageOptimizer {
  const ImageOptimizer: ImageOptimizer | undefined = ImageOptimizers.find((importer) => importer.test(imageUri, buffer));

  if (ImageOptimizer == null) {
    throw new Error(`File ${imageUri} doesn't contain a supported image format`);
  }

  return ImageOptimizer;
}

function getFileExtensionRegex(extension: string): RegExp {
  return new RegExp(`\\.${extension}$`, 'i');
}
