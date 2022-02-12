import SemanticReleaseError from '@semantic-release/error';
import { copySync, emptyDir, ensureDir, ensureDirSync, pathExistsSync } from 'fs-extra';
import { Context } from 'semantic-release';

import { InlinePlugin, ReleaseOptions, ReleaseProjectOptions } from '../models';

const needsBuild = new Map<string, boolean>();

async function verifyConditions(releaseOptions: ReleaseOptions, context: Context): Promise<void> {
  context.logger.log(`Nx Build Plugin: Verify conditions`);

  context.logger.log(JSON.stringify(releaseOptions, null, 2));

  if (releaseOptions.projects.length === 0) {
    throw new SemanticReleaseError(`No projects were found to be released`, 'EBUILD');
  }

  for (let i = 0; i < releaseOptions.projects.length; i++) {
    const options: ReleaseProjectOptions = releaseOptions.projects[i];
    await emptyDir(`${options.outputPath}-tar`);

    if (pathExistsSync(`${options.outputPath}/package.json`)) {
      context.logger.log(`Project was already built`);
    } else {
      needsBuild.set(options.outputPath, true);
      ensureDirSync(options.outputPath);

      // Add fake package.json so that npm plugin doesn't fail
      copySync(options.packageJson, `${options.outputPath}/package.json`);
    }
  }
}

async function prepare(releaseOptions: ReleaseOptions, context: Context): Promise<void> {
  context.logger.log(`Nx Build Plugin: Prepare`);

  for (let i = 0; i < releaseOptions.projects.length; i++) {
    const options: ReleaseProjectOptions = releaseOptions.projects[i];
    if (!needsBuild.get(options.outputPath)) {
      return;
    }

    await ensureDir(options.outputPath);
    context.logger.log(`Building project "${options.project}"`);
    const buildResult = await options.build();
    if (buildResult.success) {
      context.logger.log(`Project "${options.project}" was built successfully`);
    } else {
      if (buildResult.error != null) {
        context.logger.log(buildResult.error);
      }
      throw new SemanticReleaseError(`Project "${options.project}" build failed`, 'EBUILD');
    }
  }
}

export const inlinePluginBuild: InlinePlugin<ReleaseOptions> = { verifyConditions, prepare, name: 'build' };
