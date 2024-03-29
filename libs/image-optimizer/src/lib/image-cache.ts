import { createHash, Hash } from 'crypto';
import path from 'path';

import fs from 'fs-extra';

import { ImageOptimizerOptions } from './image-optimizer';

export interface ImageCache {
  persist(imageUri: string, file: Buffer, options: ImageOptimizerOptions): Promise<void>;
  retrieve(imageUri: string, options: ImageOptimizerOptions): Promise<Buffer | null>;
}

export type FilesystemImageCacheStrategy = 'hash' | 'composite';

export class FilesystemImageCache implements ImageCache {
  constructor(
    private readonly cacheFolder: string,
    private readonly strategy: FilesystemImageCacheStrategy = 'hash',
    private readonly expiryTime: number = 3600000 /* 1h */
  ) {}

  async persist(imageUri: string, file: Buffer, options: ImageOptimizerOptions): Promise<void> {
    const imageFile: string = path.join(this.cacheFolder, getImageCacheFile(this.strategy, imageUri, options));
    await fs.ensureDir(this.cacheFolder);
    await fs.writeFile(imageFile, file);
  }

  async retrieve(imageUri: string, options: ImageOptimizerOptions): Promise<Buffer | null> {
    const imageFile: string = path.join(this.cacheFolder, getImageCacheFile(this.strategy, imageUri, options));

    if (!(await fs.pathExists(imageFile))) {
      return null;
    }

    const stats: fs.Stats = await fs.stat(imageFile);
    if (isExpired(stats.ctime, this.expiryTime)) {
      await fs.remove(imageFile);
      return null;
    }

    return await fs.readFile(imageFile);
  }
}

function getImageCacheFile(strategy: FilesystemImageCacheStrategy, imageUri: string, options: ImageOptimizerOptions): string {
  switch (strategy) {
    case 'hash':
      return `${getHash(imageUri, options.width, options.quality)}.${options.format}`;
    case 'composite':
      return `${getBasename(imageUri)}-w-${options.width}-q-${options.quality}.${options.format}`;
    default:
      throw new Error('Image cache file strategy not implemented');
  }
}

function getHash(...items: (string | number | Buffer)[]): string {
  const hash: Hash = createHash('sha256');

  for (const item of items) {
    if (typeof item === 'number') {
      hash.update(String(item));
    } else {
      hash.update(item);
    }
  }
  // See https://en.wikipedia.org/wiki/Base64#Filenames
  return hash.digest('base64').replace(/\//g, '-');
}

function getBasename(imageUri: string): string {
  return path.basename(imageUri, path.extname(imageUri));
}

function isExpired(date: Date, expiryTime: number): boolean {
  const endTime: number = date.getTime() + expiryTime;
  const nowTime: number = new Date().getTime();
  return nowTime > endTime;
}
