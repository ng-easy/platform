export enum ImageFormat {
  Png = 'png',
  Jpeg = 'jpeg',
  Webp = 'webp',
  Avif = 'avif',
  Heif = 'heif',
}

type ImageFormatRegexMap = { [key in ImageFormat]: RegExp };

const imageFormatRegexMap: ImageFormatRegexMap = Object.values(ImageFormat).reduce((map, format) => {
  map[format] = format === ImageFormat.Jpeg ? /\.jpe?g$/i : new RegExp(`\\.${format}$`, 'i');
  return map;
}, {} as ImageFormatRegexMap);

export function getImageFormat(src: string): ImageFormat {
  for (const format in imageFormatRegexMap) {
    const formatRegex: RegExp = imageFormatRegexMap[format as ImageFormat];
    if (formatRegex.test(src)) {
      return format as ImageFormat;
    }
  }

  throw new Error(`Image with src "${src}" has an unknown extension.`);
}
