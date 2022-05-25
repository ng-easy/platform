import { BuilderOutput, BuilderContext } from '@angular-devkit/architect';
import { Result, default as semanticRelease, BranchSpec, PluginSpec } from 'semantic-release';

import { createLoggerStream } from './create-logger-stream';

export interface RunSemanticReleaseOptions {
  project: string;
  tagFormat: string;
  branches: ReadonlyArray<BranchSpec>;
  dryRun: boolean;
  force: boolean;
  plugins: PluginSpec[];
}

export async function runSemanticRelease(options: RunSemanticReleaseOptions, context: BuilderContext): Promise<BuilderOutput> {
  try {
    const result: Result = await semanticRelease(
      {
        tagFormat: options.tagFormat,
        branches: options.branches,
        extends: undefined,
        dryRun: options.dryRun,
        plugins: options.plugins,
        ci: !options.force,
      },
      {
        env: { ...process.env } as { [key: string]: string },
        cwd: '.',
        stdout: createLoggerStream(context),
        stderr: createLoggerStream(context),
      }
    );

    if (result) {
      const { nextRelease } = result;
      context.logger.info(`The "${options.project}" project was released with version ${nextRelease.version}`);
    } else {
      context.logger.info(`No new release for the "${options.project}" project`);
    }
  } catch (err) {
    if (err instanceof Error) {
      context.logger.info(`${err.name}: ${err.message}`);
    }
    return { success: false, error: `The automated release failed with error: ${err}` };
  }

  return { success: true };
}
