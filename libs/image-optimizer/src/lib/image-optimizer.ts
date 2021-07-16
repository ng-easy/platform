import sharp, { Sharp } from 'sharp';

export interface ImageOptimizerOptions {
  format: 'png' | 'jpg' | 'webp' | 'avif' | 'heif';
  width: number;
  quality: number;
}

export interface ImageOptimizer {
  test: (path: string, buffer: Buffer) => boolean;
  optimize: (buffer: Buffer, options: ImageOptimizerOptions) => Promise<Buffer>;
}

class JpgOptimizer implements ImageOptimizer {
  private readonly inputFileExtensions = ['jpg', 'webp', 'avif', 'heif'];
  private readonly inputFileExtensionRegex: RegExp[] = this.inputFileExtensions.map((extension) => getFileExtensionRegex(extension));

  test(path: string): boolean {
    return this.inputFileExtensionRegex.some((extensionRegex) => extensionRegex.test(path));
  }

  async optimize(buffer: Buffer, options: ImageOptimizerOptions): Promise<Buffer> {
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

    return await sharpImage.toBuffer();
  }
}

const ImageOptimizers: ImageOptimizer[] = [new JpgOptimizer()];

export function getImageOptimizer(path: string, buffer: Buffer): ImageOptimizer {
  const ImageOptimizer: ImageOptimizer | undefined = ImageOptimizers.find((importer) => importer.test(path, buffer));

  if (ImageOptimizer == null) {
    throw new Error(`File ${path} doesn't contain a supported image format`);
  }

  return ImageOptimizer;
}

function getFileExtensionRegex(extension: string): RegExp {
  return new RegExp(`\\.${extension}$`, 'i');
}
