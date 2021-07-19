import path from 'path';

import fs from 'fs-extra';
import prettyBytes from 'pretty-bytes';

import { FilesystemImageCache, ImageCache } from './image-cache';
import { getImageOptimizer, ImageFormat, ImageOptimizer, ImageOptimizerOptions } from './image-optimizer';

const imageUri = path.join(__dirname, '..', 'assets', 'code.jpg');

interface ImageOptimizationTest {
  options: ImageOptimizerOptions;
  expectedOptimizationRatio: number;
  actualOptimizationRatio?: number;
  optimizedSize?: number;
}

describe('@ng-easy/image-optimizer', () => {
  it('should return optimized images', async () => {
    const originalImage: Buffer = await fs.readFile(imageUri);
    const imageOptimizer: ImageOptimizer = getImageOptimizer(imageUri, originalImage);
    console.log(`Original size: ${prettyBytes(originalImage.byteLength)}`);

    const imageOptimizationTests: ImageOptimizationTest[] = [
      { options: { format: ImageFormat.Webp, width: 1080, quality: 70 }, expectedOptimizationRatio: 0.024 },
      { options: { format: ImageFormat.Avif, width: 1080, quality: 70 }, expectedOptimizationRatio: 0.025 },
      { options: { format: ImageFormat.Heif, width: 1080, quality: 70 }, expectedOptimizationRatio: 0.025 },
      { options: { format: ImageFormat.Jpeg, width: 1080, quality: 70 }, expectedOptimizationRatio: 0.035 },
    ];

    for (const imageOptimizationTest of imageOptimizationTests) {
      const optimizedImage = await imageOptimizer.optimize(imageUri, originalImage, imageOptimizationTest.options);
      imageOptimizationTest.actualOptimizationRatio = optimizedImage.byteLength / originalImage.length;
      imageOptimizationTest.optimizedSize = optimizedImage.byteLength;
    }

    console.table(
      imageOptimizationTests.map(({ options, actualOptimizationRatio, expectedOptimizationRatio, optimizedSize }) => ({
        optimization: `${options.format} w: ${options.width} q: ${options.quality}`,
        expectedOptimizationRatio,
        actualOptimizationRatio: parseFloat(actualOptimizationRatio?.toFixed(4) ?? '0'),
        size: prettyBytes(optimizedSize ?? 0),
      }))
    );

    imageOptimizationTests.forEach(({ actualOptimizationRatio, expectedOptimizationRatio }) => {
      expect(actualOptimizationRatio).toBeLessThan(expectedOptimizationRatio);
    });
  }, 10000);

  it('should use file cache with hash strategy', async () => {
    const originalImage: Buffer = await fs.readFile(imageUri);
    const imageOptimizer: ImageOptimizer = getImageOptimizer(imageUri, originalImage);
    const imageCache: ImageCache = new FilesystemImageCache(path.join(process.cwd(), 'tmp'), 'hash');

    const imageOptimizationTests: ImageOptimizationTest[] = [
      { options: { format: ImageFormat.Webp, width: 1080, quality: 70 }, expectedOptimizationRatio: 0.035 },
    ];

    for (const imageOptimizationTest of imageOptimizationTests) {
      const optimizedImage = await imageOptimizer.optimize(imageUri, originalImage, imageOptimizationTest.options, imageCache);
      imageOptimizationTest.actualOptimizationRatio = optimizedImage.byteLength / originalImage.length;
      imageOptimizationTest.optimizedSize = optimizedImage.byteLength;

      expect(await imageCache.retrieve(imageUri, imageOptimizationTest.options)).not.toBeNull();
    }
  }, 10000);

  it('should use file cache with composite strategy', async () => {
    const originalImage: Buffer = await fs.readFile(imageUri);
    const imageOptimizer: ImageOptimizer = getImageOptimizer(imageUri, originalImage);
    const imageCache: ImageCache = new FilesystemImageCache(path.join(process.cwd(), 'tmp'), 'composite');

    const imageOptimizationTests: ImageOptimizationTest[] = [
      { options: { format: ImageFormat.Webp, width: 1080, quality: 70 }, expectedOptimizationRatio: 0.035 },
    ];

    for (const imageOptimizationTest of imageOptimizationTests) {
      const optimizedImage = await imageOptimizer.optimize(imageUri, originalImage, imageOptimizationTest.options, imageCache);
      imageOptimizationTest.actualOptimizationRatio = optimizedImage.byteLength / originalImage.length;
      imageOptimizationTest.optimizedSize = optimizedImage.byteLength;

      expect(await imageCache.retrieve(imageUri, imageOptimizationTest.options)).not.toBeNull();
    }
  }, 10000);
});
