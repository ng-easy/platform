import path from 'path';

import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import fs from 'fs-extra';

import {
  FilesystemImageCache,
  getImageOptimizer,
  ImageCache,
  ImageFormat,
  ImageOptimizer,
  ImageOptimizerOptions,
} from '@ng-easy/image-optimizer';

type PartialJsonObject<T> = { [P in keyof T]: T[P] | null };

interface Options extends JsonObject, PartialJsonObject<ImageOptimizerOptions> {
  assets: string[];
  outputPath: string;
}

export default createBuilder(imageOptimizerBuilder);

export async function imageOptimizerBuilder(options: Options, context: BuilderContext): Promise<BuilderOutput> {
  context.logger.info(`Optimizing assets from from:`);
  options.assets.forEach((asset) => context.logger.info(`- ${getRelativePath(asset)}`));
  context.logger.info(`To folder: ${getRelativePath(options.outputPath)}`);

  const fileSystemCache: ImageCache = new FilesystemImageCache(options.outputPath, 'composite');
  const optimizationOptions: ImageOptimizerOptions = { format: ImageFormat.Webp, width: 1080, quality: 70 };

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
      await imageOptimizer.optimize(filePath, file, optimizationOptions, fileSystemCache);
    }
  }

  return { success: true };
}

function getRelativePath(absolutePath: string): string {
  return absolutePath.replace(process.cwd(), '').replace(/^[/\\]+/, '');
}
