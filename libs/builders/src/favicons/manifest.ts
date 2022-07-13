import * as path from 'path';

import { BuilderContext } from '@angular-devkit/architect';
import { JSONSchemaForWebApplicationManifestFiles } from '@schemastore/web-manifest';
import { CheerioAPI } from 'cheerio';
import { Element } from 'domhandler';
import * as fs from 'fs-extra';

import { writeFormatted } from '../core';
import { FaviconConfig } from './favicon-configs';

export type WebManifest = JSONSchemaForWebApplicationManifestFiles;

export async function readManifest(outputPath: string, indexDocument: CheerioAPI): Promise<WebManifest> {
  const manifestFileName: string = getManifestFileName(indexDocument);
  const manifestFilePath = path.join(outputPath, manifestFileName);

  if (await fs.pathExists(manifestFilePath)) {
    return JSON.parse((await fs.readFile(manifestFilePath)).toString());
  } else {
    return { name: indexDocument('head title').text(), icons: [] };
  }
}

export function addFaviconManifest(manifest: WebManifest, iconName: string | null, faviconConfig: FaviconConfig): void {
  if (faviconConfig.dest !== 'manifest' || iconName == null) {
    return;
  }

  const config = faviconConfig.config;

  if (config.type !== 'png') {
    return;
  }

  manifest.icons = manifest.icons.filter(({ src }) => src != iconName);

  manifest.icons.push({
    src: iconName,
    type: faviconConfig.type,
    sizes: `${config.width}x${config.height}`,
  });
}

export async function saveManifest(
  context: BuilderContext,
  outputPath: string,
  manifest: WebManifest,
  indexDocument: CheerioAPI
): Promise<void> {
  const manifestFileName: string = getManifestFileName(indexDocument);
  const manifestFilePath = path.join(outputPath, manifestFileName);

  await writeFormatted(manifestFilePath, JSON.stringify(manifest));

  indexDocument('head link[rel="manifest"]').remove();
  indexDocument('head base').after(`<link rel="manifest" href="${manifestFileName}">`);

  context.logger.info(`Manifest generated at ${manifestFilePath}`);
}

export function getManifestFileName(indexDocument: CheerioAPI): string {
  const manifest: Element | undefined = indexDocument('head link[rel="manifest"]')[0];
  return manifest == null ? 'manifest.webmanifest' : manifest.attribs.href;
}
