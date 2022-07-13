import { BuilderContext, BuilderOutput, createBuilder, targetFromTargetString } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { CheerioAPI } from 'cheerio';

import { createFavicon } from './create-favicon';
import { FaviconConfig, faviconConfigs } from './favicon-configs';
import { addFaviconIndex, loadIndex, removeFavicon, saveIndex } from './html';
import { addFaviconManifest, readManifest, saveManifest, WebManifest } from './manifest';

interface Options extends JsonObject {
  browserTarget: string;
  favicon: string;
  background: string | null;
}

interface BrowserBuilderSchema {
  outputPath: string;
  index: string;
}

const builder: any = createBuilder(faviconsBuilder);
export default builder;

async function faviconsBuilder(options: Options, context: BuilderContext): Promise<BuilderOutput> {
  context.reportStatus(`Generating favicons from ${options.favicon}`);

  const browserTarget = targetFromTargetString(options.browserTarget);
  const rawBrowserOptions = (await context.getTargetOptions(browserTarget)) as JsonObject & BrowserBuilderSchema;
  context.logger.debug(JSON.stringify(rawBrowserOptions, null, 2));

  const favicon: string = options.favicon;
  const outputPath: string = rawBrowserOptions.outputPath;
  const index: string = rawBrowserOptions.index;
  const background: string | null = options.background;

  const indexDocument: CheerioAPI = await loadIndex(outputPath, index);
  const manifest: WebManifest = await readManifest(outputPath, indexDocument);
  removeFavicon(indexDocument);

  // Iterate in reverse order to have them nicely ordered in index.html
  for (let i = faviconConfigs.length - 1; i >= 0; i--) {
    const faviconConfig: FaviconConfig = faviconConfigs[i];
    const iconName: string | null = await createFavicon(context, favicon, outputPath, { ...faviconConfig.config, background });
    addFaviconIndex(indexDocument, iconName, faviconConfig);
    addFaviconManifest(manifest, iconName, faviconConfig);
    context.reportProgress(i, faviconConfigs.length);
  }

  await saveManifest(context, outputPath, manifest, indexDocument);
  await saveIndex(outputPath, index, indexDocument);

  return { success: true };
}
