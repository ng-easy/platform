import path from 'path';

import { Architect, BuilderRun, BuilderOutput } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { logging, schema } from '@angular-devkit/core';
import { Logger } from '@angular-devkit/core/src/logger';

// eslint-disable-next-line import/no-named-as-default
import imageOptimizerBuilder from './index';

describe('@ng-easy/builders:image-optimizer', () => {
  let architect: Architect;
  let architectHost: TestingArchitectHost;

  beforeEach(async () => {
    const registry: schema.CoreSchemaRegistry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);

    architectHost = new TestingArchitectHost(__dirname, __dirname);
    architect = new Architect(architectHost, registry);
    const builderSchema: schema.JsonSchema = await import('./schema.json');

    architectHost.addBuilder('@ng-easy/builders:image-optimizer', imageOptimizerBuilder, '', builderSchema);
  });

  it('optimizes assets from a folder', async () => {
    const logger: Logger = new logging.Logger('');
    const logs: string[] = [];
    logger.subscribe((ev) => logs.push(ev.message));

    const assetsPath: string = path.join(__dirname, 'assets');
    const outputPath: string = path.join(process.cwd(), 'tmp');

    const run: BuilderRun = await architect.scheduleBuilder(
      '@ng-easy/builders:image-optimizer',
      { assets: [assetsPath], outputPath },
      { logger }
    );

    const output: BuilderOutput = await run.result;

    await run.stop();

    expect(output.success).toBe(true);
    expect(logs).toContain(`To folder: tmp`);
    expect(logs).toContain(path.normalize(`libs/builders/src/image-optimizer/assets/code.jpg`));
  });
});
