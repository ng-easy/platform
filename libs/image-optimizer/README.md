# @ng-easy/image-optimizer

[![CI](https://github.com/ng-easy/platform/actions/workflows/ci.yml/badge.svg)](https://github.com/ng-easy/platform/actions/workflows/ci.yml) [![npm latest version](https://img.shields.io/npm/v/@ng-easy/image-optimizer/latest.svg)](https://www.npmjs.com/package/@ng-easy/image-optimizer) [![README](https://img.shields.io/badge/README--green.svg)](/libs/image-optimizer/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/libs/image-optimizer/CHANGELOG.md) ![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)

Node library that implements image optimizations for the web. It uses internally the super-fast [sharp](https://sharp.pixelplumbing.com/) library.

## Usage

```ts
import fs from 'fs-extra';
import { getImageOptimizer, ImageOptimizerOptions, ImageOptimizer, ImageCache, FilesystemImageCache } from '@ng-easy/image-optimizer';

// Read the original image from the filesystem
const imageAssetPath = 'image.jpg';
const originalImage: Buffer = await fs.readFile(imageAssetPath);

// Get the optimizer and instantiate a cache (optional)
const imageOptimizer: ImageOptimizer = getImageOptimizer(imageAssetPath, originalImage);
const imageCache: ImageCache = new FilesystemImageCache(path.join(process.cwd(), 'tmp'));

// Run the optimization and get the resulting buffer
const options: ImageOptimizerOptions = { format: 'webp', width: 1080, quality: 70 };
const optimizedImage = await imageOptimizer.optimize(originalImage, imageOptimizationTest.options, imageCache);
```

## Supported file types

- jpg, webp, heif, avif
- _Pending: png_
