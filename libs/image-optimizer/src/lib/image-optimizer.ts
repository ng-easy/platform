import sharp, { Sharp } from 'sharp';

import { ImageCache } from './image-cache';

export interface ImageOptimizerOptions {
  format: 'png' | 'jpg' | 'webp' | 'avif' | 'heif';
  width: number;
  quality: number;
}

export interface ImageOptimizer {
  test: (imageUri: string, buffer: Buffer) => boolean;
  optimize: (imageUri: string, buffer: Buffer, options: ImageOptimizerOptions, cache?: ImageCache) => Promise<Buffer>;
}

class JpgOptimizer implements ImageOptimizer {
  private readonly inputFileExtensions = ['jpg', 'webp', 'avif', 'heif'];
  private readonly inputFileExtensionRegex: RegExp[] = this.inputFileExtensions.map((extension) => getFileExtensionRegex(extension));

  test(imageUri: string): boolean {
    return this.inputFileExtensionRegex.some((extensionRegex) => extensionRegex.test(imageUri));
  }

  async optimize(imageUri: string, buffer: Buffer, options: ImageOptimizerOptions, cache?: ImageCache): Promise<Buffer> {
    const cachedImage: Buffer | null = (await cache?.retrieve(imageUri, options)) ?? null;
    if (cachedImage != null) {
      return cachedImage;
    }

    let sharpImage: Sharp = sharp(buffer).resize({ width: options.width });

    switch (options.format) {
      case 'jpg':
        sharpImage = sharpImage.jpeg({ quality: options.quality });
        break;
      case 'webp':
        sharpImage = sharpImage.webp({ quality: options.quality });
        break;
      case 'avif':
        sharpImage = sharpImage.avif({ quality: options.quality });
        break;
      case 'heif':
        sharpImage = sharpImage.heif({ quality: options.quality });
        break;
      default:
        throw new Error(`Output format ${options.format} not supported`);
    }

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
