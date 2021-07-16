import path from 'path';

import fs from 'fs-extra';
import prettyBytes from 'pretty-bytes';

import { getImageOptimizer, ImageOptimizer, ImageOptimizerOptions } from './image-optimizer';

const imageAssetPath = path.join(__dirname, '..', 'assets', 'code.jpg');

interface ImageOptimizationTest {
  options: ImageOptimizerOptions;
  expectedOptimizationRatio: number;
  actualOptimizationRatio?: number;
  optimizedSize?: number;
}

describe('@ng-easy/image-optimizer', () => {
  it('should return optimized images', async () => {
    const originalImage: Buffer = await fs.readFile(imageAssetPath);
    const imageOptimizer: ImageOptimizer = getImageOptimizer(imageAssetPath, originalImage);
    console.log(`Original size: ${prettyBytes(originalImage.byteLength)}`);

    const imageOptimizationTests: ImageOptimizationTest[] = [
      { options: { format: 'webp', width: 1080, quality: 70 }, expectedOptimizationRatio: 0.024 },
      { options: { format: 'avif', width: 1080, quality: 70 }, expectedOptimizationRatio: 0.025 },
      { options: { format: 'heif', width: 1080, quality: 70 }, expectedOptimizationRatio: 0.025 },
      { options: { format: 'jpg', width: 1080, quality: 70 }, expectedOptimizationRatio: 0.035 },
    ];

    for (const imageOptimizationTest of imageOptimizationTests) {
      const optimizedImage = await imageOptimizer.optimize(originalImage, imageOptimizationTest.options);
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
});
