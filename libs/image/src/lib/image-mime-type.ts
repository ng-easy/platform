import { ImageFormat } from '@ng-easy/image-config';

import { getImageFormat } from './image-optimizer-config';

export class ImageMimeTypeTag {
  private __brand = 'mimeType';
}

export type ImageMimeType = string & ImageMimeTypeTag;

type ImageMimeTypeMap = { [key in ImageFormat]: ImageMimeType };

const imageTypeMap: ImageMimeTypeMap = Object.values(ImageFormat).reduce((map, format) => {
  map[format] = `image/${format}` as ImageMimeType;
  return map;
}, {} as ImageMimeTypeMap);

export function getImageMimeType(format: ImageFormat): ImageMimeType;
export function getImageMimeType(src: string): ImageMimeType;
export function getImageMimeType(srcOrFormat: ImageFormat | string): ImageMimeType {
  if (imageTypeMap[srcOrFormat as ImageFormat]) {
    return imageTypeMap[srcOrFormat as ImageFormat];
  }
  const format: ImageFormat = getImageFormat(srcOrFormat);
  return imageTypeMap[format];
}
