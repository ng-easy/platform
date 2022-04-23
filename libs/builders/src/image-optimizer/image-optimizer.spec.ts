import path from 'path';

import { Architect, BuilderRun, BuilderOutput, ScheduleOptions } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { logging, schema } from '@angular-devkit/core';
import fs from 'fs-extra';

// eslint-disable-next-line import/no-named-as-default
import imageOptimizerBuilder from './index';
import { ImageOptimizerConfigJson } from './options';

const builderName = '@ng-easy/builders:image-optimizer';

describe(builderName, () => {
  let architect: Architect;
  let architectHost: TestingArchitectHost;

  beforeEach(async () => {
    const registry: schema.CoreSchemaRegistry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);

    architectHost = new TestingArchitectHost(__dirname, __dirname);
    architect = new Architect(architectHost, registry);
    const builderSchema = (await import('./schema.json')) as unknown as schema.JsonSchema;

    architectHost.addBuilder(builderName, imageOptimizerBuilder, '', builderSchema);
  });

  it('optimizes assets from a folder', async () => {
    const logger: any = new logging.Logger('');
    const logs: string[] = [];
    logger.subscribe((ev: logging.LogEntry) => logs.push(ev.message));

    const assetsPath: string = path.join(__dirname, 'assets');
    const outputPath: string = path.join(process.cwd(), 'tmp/libs/builders/image-optimizer');
    await fs.emptyDir(outputPath);

    const scheduleOptions: ScheduleOptions = { logger };
    const run: BuilderRun = await architect.scheduleBuilder(
      builderName,
      { assets: [assetsPath], outputPath, deviceSizes: [1080], imageSizes: [600], quality: 75 } as ImageOptimizerConfigJson,
      scheduleOptions
    );

    const output: BuilderOutput = await run.result;

    await run.stop();

    expect(output.success).toBe(true);
    expect(logs).toContain(path.normalize(`libs/builders/src/image-optimizer/assets/code.jpg`));

    const outputFiles = await fs.readdir(outputPath);
    expect(outputFiles.length).toBe(4); // 2 sizes * 2 formats = 4 files
  }, 20000);
});
