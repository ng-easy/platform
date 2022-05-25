import SemanticReleaseError from '@semantic-release/error';
import { copySync, emptyDir, ensureDir, ensureDirSync, pathExistsSync } from 'fs-extra';
import { Context } from 'semantic-release';

import { InlinePlugin, ReleaseProjectOptions } from '../models';

const needsBuild = new Map<string, boolean>();

async function verifyConditions(releaseOptions: ReleaseProjectOptions, context: Context): Promise<void> {
  context.logger.log(`Nx Build Plugin: Verify conditions`);

  context.logger.log(JSON.stringify(releaseOptions, null, 2));

  await emptyDir(`${releaseOptions.outputPath}-tar`);

  if (pathExistsSync(`${releaseOptions.outputPath}/package.json`)) {
    context.logger.log(`Project was already built`);
  } else {
    needsBuild.set(releaseOptions.outputPath, true);
    ensureDirSync(releaseOptions.outputPath);

    // Add fake package.json so that npm plugin doesn't fail
    copySync(releaseOptions.packageJson, `${releaseOptions.outputPath}/package.json`);
  }
}

async function prepare(releaseOptions: ReleaseProjectOptions, context: Context): Promise<void> {
  context.logger.log(`Nx Build Plugin: Prepare`);

  if (!needsBuild.get(releaseOptions.outputPath)) {
    return;
  }

  await ensureDir(releaseOptions.outputPath);
  context.logger.log(`Building project "${releaseOptions.project}"`);
  const buildResult = await releaseOptions.build();
  if (buildResult.success) {
    context.logger.log(`Project "${releaseOptions.project}" was built successfully`);
  } else {
    if (buildResult.error != null) {
      context.logger.log(buildResult.error);
    }
    throw new SemanticReleaseError(`Project "${releaseOptions.project}" build failed`, 'EBUILD');
  }
}

export const inlinePluginBuild: InlinePlugin<ReleaseProjectOptions> = { verifyConditions, prepare, name: 'build' };
