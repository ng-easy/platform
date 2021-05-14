import path from 'path';

import { BuilderContext } from '@angular-devkit/architect';
import fs from 'fs-extra';
import imageminPngquant from 'imagemin-pngquant';
import imagemin from 'imagemin';
import jimp from 'jimp';
import sharp from 'sharp';
import { optimize } from 'svgo';
import color from 'tinycolor2';
import toIco from 'to-ico';
import xml from 'xml2js';

import { importEsm } from '../core';

export interface PngFaviconOptions {
  type: 'png';
  width: number;
  height: number;
  padding?: number;
  optimize?: boolean;
  background: string | null;
}

export interface IcoFaviconOptions {
  type: 'ico';
  /**
   * Ignored, added for type compatibility
   */
  background: string | null;
}

export interface SvgFaviconOptions {
  type: 'svg';
  /**
   * Ignored, added for type compatibility
   */
  background: string | null;
}

type SourceExtensions = '.svg' | '.png';

const maxIconSize = 512;

/**
 * https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
 */
export async function createFavicon(
  context: BuilderContext,
  source: string,
  outputPath: string,
  options: PngFaviconOptions | IcoFaviconOptions | SvgFaviconOptions
): Promise<string | null> {
  let favicon: { iconFile: Buffer; iconName: string };

  const file: Buffer = await fs.readFile(source);
  const filename: string = path.parse(source).name;
  const ext: string = path.parse(source).ext;

  if (!isValidSourceExtension(ext)) {
    throw new Error(`Unsupported extension for source favicon ${filename}${ext}`);
  }

  switch (options.type) {
    case 'png':
      favicon = await createFaviconPng(file, filename, ext, options);
      break;
    case 'ico':
      favicon = await createFaviconIco(file, filename, ext);
      break;
    case 'svg':
      if (ext === '.svg') {
        favicon = createFaviconSvg(file, filename);
      } else {
        context.logger.warn(`Skipping generation of svg favicon since the source is not a svg file.`);
        return null;
      }
      break;
  }

  const outputFile = `${outputPath}/${favicon.iconName}`;
  await fs.writeFile(outputFile, favicon.iconFile);

  context.logger.info(`Favicon generated at ${outputFile}`);
  return favicon.iconName;
}

async function createFaviconPng(
  file: Buffer,
  filename: string,
  ext: SourceExtensions,
  options: PngFaviconOptions
): Promise<{ iconFile: Buffer; iconName: string }> {
  const iconWidth: number = options.width - 2 * (options.padding ?? 0);
  const iconHeight: number = options.height - 2 * (options.padding ?? 0);

  const background: number = options.background ? parseColor(options.background) : 0; // Transparent if not provided
  const canvas: jimp = await jimp.create(options.width, options.height, background);

  let renderedIcon: jimp;

  switch (ext) {
    case '.svg':
      renderedIcon = await renderSvg(file, iconWidth, iconHeight);
      break;
    case '.png':
      renderedIcon = await renderPng(file, iconWidth, iconHeight);
      break;
  }

  canvas.composite(renderedIcon, options.padding ?? 0, options.padding ?? 0);

  let iconFile: Buffer = await canvas.getBufferAsync(jimp.MIME_PNG);

  if (options.optimize ?? true) {
    const imagemin = await importEsm('imagemin');
    const buffer: (buffer: Buffer, options?: imagemin.BufferOptions) => Promise<Buffer> = imagemin.buffer;
    iconFile = await buffer(iconFile, { plugins: [imageminPngquant({ quality: [0.3, 0.5] })] });
  }

  const iconName = `${filename}-${options.width}x${options.height}.png`;
  return { iconFile, iconName };
}

async function createFaviconIco(file: Buffer, filename: string, ext: SourceExtensions): Promise<{ iconFile: Buffer; iconName: string }> {
  const { iconFile: smallIconFile } = await createFaviconPng(file, filename, ext, {
    type: 'png',
    width: 16,
    height: 16,
    optimize: false,
    background: null,
  });
  const { iconFile: bigIconFile } = await createFaviconPng(file, filename, ext, {
    type: 'png',
    width: 32,
    height: 32,
    optimize: false,
    background: null,
  });

  const iconName = `${filename}.ico`;
  return { iconFile: await toIco([smallIconFile, bigIconFile]), iconName };
}

function createFaviconSvg(file: Buffer, filename: string): { iconFile: Buffer; iconName: string } {
  const svg: string = optimize(file.toString()).data;
  const iconName = `${filename}.svg`;
  return { iconFile: Buffer.from(svg), iconName };
}

async function renderSvg(file: Buffer, width: number, height: number): Promise<jimp> {
  const background: sharp.Color = { r: 255, g: 255, b: 255, alpha: 1 };
  file = await ensureSvgSize(file);

  const renderedSvg: Buffer = await sharp(file).resize({ background, width, height, fit: sharp.fit.contain }).toBuffer();
  return jimp.read(renderedSvg);
}

async function renderPng(file: Buffer, width: number, height: number): Promise<jimp> {
  const pngFile: jimp = await jimp.read(file);
  return pngFile.contain(width, height, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE);
}

/**
 * sharp renders the SVG in its source width and height with 72 DPI which can
 * cause a blurry result in case the source SVG is defined in lower size than
 * the target size. To avoid this, resize the source SVG to the needed size
 * before passing it to sharp by increasing its width and/or height
 * attributes.
 *
 * Currently it seems this won't be fixed in sharp, so we need a workaround:
 * https://github.com/lovell/sharp/issues/729#issuecomment-284708688
 *
 * They suggest setting the image density to a "resized" density based on the
 * target render size but this does not seem to work with favicons and may
 * cause other errors with "unnecessarily high" image density values.
 */
async function ensureSvgSize(file: Buffer): Promise<Buffer> {
  const svg: string = optimize(file.toString(), { plugins: ['removeDimensions'] }).data;
  const svgDoc = await xml.parseStringPromise(svg);
  let [, , svgWidth, svgHeight] = svgDoc.svg.$.viewBox.split(/[ ,]+/g);

  if (svgWidth >= maxIconSize && svgHeight >= maxIconSize) {
    return file;
  } else if (svgWidth > svgHeight) {
    svgHeight = Math.round(svgHeight * (maxIconSize / svgWidth));
    svgWidth = maxIconSize;
  } else {
    svgWidth = Math.round(svgWidth * (maxIconSize / svgHeight));
    svgHeight = maxIconSize;
  }

  svgDoc.svg.$.width = svgWidth;
  svgDoc.svg.$.height = svgHeight;

  const builder = new xml.Builder();
  const modifiedSvg: string = builder.buildObject(svgDoc);

  return Buffer.from(modifiedSvg);
}

function isValidSourceExtension(ext: string): ext is SourceExtensions {
  return ext === '.svg' || ext === '.png';
}

function parseColor(hex: string): number {
  const { r, g, b, a } = color(hex).toRgb();
  return jimp.rgbaToInt(r, g, b, a * 255);
}
