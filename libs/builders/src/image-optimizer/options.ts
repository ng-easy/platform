import { JsonObject } from '@angular-devkit/core';

import { ImageFormat, ImageQualityNetwork } from '@ng-easy/image-config';

export interface ImageQualityNetworkJson extends JsonObject, ImageQualityNetwork {}

export interface ImageOptimizerConfigJson extends JsonObject {
  assets: string[];
  outputPath: string;
  deviceSizes: number[];
  imageSizes: number[];
  quality: number | ImageQualityNetworkJson | null;
  formats: ImageFormat[];
}
