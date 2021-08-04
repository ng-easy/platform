import path from 'path';

import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import fs from 'fs-extra';

import {
  FilesystemImageCache,
  getImageOptimizer,
  ImageCache,
  ImageOptimizer,
  getValidatedImageOptimizerConfig,
  ImageOptimizerConfig,
  defaultImageOptimizerConfig,
  ImageFormat,
  dedupAndSortImageSizes,
} from '@ng-easy/image-optimizer';

interface Options extends JsonObject {
  assets: string[];
  outputPath: string;
  deviceSizes: number[];
  imageSizes: number[];
  quality: number | null;
  formats: ImageFormat[];
}

export default createBuilder(imageOptimizerBuilder);

export async function imageOptimizerBuilder(options: Options, context: BuilderContext): Promise<BuilderOutput> {
  context.logger.info(`Optimizing assets from from:`);
  options.assets.forEach((asset) => context.logger.info(`- ${getRelativePath(asset)}`));
  context.logger.info(`To folder: ${getRelativePath(options.outputPath)}`);

  const fileSystemCache: ImageCache = new FilesystemImageCache(options.outputPath, 'composite');
  const optimizationConfig: ImageOptimizerConfig = getValidatedImageOptimizerConfig({
    deviceSizes: options.deviceSizes.length === 0 ? defaultImageOptimizerConfig.deviceSizes : options.deviceSizes,
    imageSizes: options.imageSizes.length === 0 ? defaultImageOptimizerConfig.imageSizes : options.imageSizes,
    quality: options.quality ?? defaultImageOptimizerConfig.quality,
    formats: options.formats.length === 0 ? defaultImageOptimizerConfig.formats : options.formats,
  });
  const quality: number = optimizationConfig.quality;
  const imageSizes: number[] = dedupAndSortImageSizes([...optimizationConfig.deviceSizes, ...optimizationConfig.imageSizes]);

  for (const assetPath of options.assets) {
    if (!(await fs.pathExists(assetPath))) {
      context.logger.error(`Assets path ${assetPath} doesn't exist`);
      return { success: false };
    }

    for (const fileName of await fs.readdir(assetPath)) {
      const filePath: string = path.join(assetPath, fileName);
      context.logger.info(getRelativePath(filePath));

      const file = await fs.readFile(filePath);
      const imageOptimizer: ImageOptimizer = getImageOptimizer(filePath, file);
      const formats: ImageFormat[] = intersect(imageOptimizer.supportedFormats, optimizationConfig.formats);

      for (const width of imageSizes) {
        for (const format of formats) {
          await imageOptimizer.optimize(filePath, file, { format, width, quality }, fileSystemCache);
        }
      }
    }
  }

  return { success: true };
}

function getRelativePath(absolutePath: string): string {
  return absolutePath.replace(process.cwd(), '').replace(/^[/\\]+/, '');
}

function intersect<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return [...new Set(a)].filter((x) => setB.has(x));
}
