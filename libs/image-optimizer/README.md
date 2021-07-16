# @ng-easy/image-optimizer (WIP, not ready for production)

[![npm latest version](https://img.shields.io/npm/v/@ng-easy/image-optimizer/latest.svg)](https://www.npmjs.com/package/@ng-easy/image-optimizer) [![README](https://img.shields.io/badge/README--green.svg)](/libs/image-optimizer/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/libs/image-optimizer/CHANGELOG.md)

Node library that implements image optimizations for web images. Use internally the super-fast [sharp](https://sharp.pixelplumbing.com/) library.

## Usage

```ts
import fs from 'fs-extra';
import { getImageOptimizer, ImageOptimizerOptions } from '@ng-easy/image-optimizer';

const imageAssetPath = 'image.jpg';
const originalImage: Buffer = await fs.readFile(imageAssetPath);
const options: ImageOptimizerOptions = { format: 'webp', width: 1080, quality: 70 };
const imageOptimizer: ImageOptimizer = getImageOptimizer(imageAssetPath, originalImage);
const optimizedImage = await imageOptimizer.optimize(originalImage, imageOptimizationTest.options); // Optimized image as a Buffer
```
