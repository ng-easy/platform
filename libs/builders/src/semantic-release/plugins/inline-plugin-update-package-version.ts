import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { verifyConditions as gitVerifyConditions, prepare as gitPrepare } from '@semantic-release/git';
import { readFile, writeFile } from 'fs-extra';
import { Context, NextRelease, Options } from 'semantic-release';

import { InlinePlugin, ReleaseOptions, ReleaseProjectOptions } from '../models';

async function verifyConditions(projectOptions: ReleaseOptions, context: Context): Promise<void> {
  context.logger.log(`Nx Update Package Version: Verify conditions`);

  await gitVerifyConditions(createGitConfig(projectOptions, context), context);
}

async function prepare(releaseOptions: ReleaseOptions, context: Context): Promise<void> {
  context.logger.log(`Nx Update Package Version: Prepare`);

  const nextRelease: NextRelease = context.nextRelease as NextRelease;
  await updatePackageVersion(releaseOptions, nextRelease);
  await gitPrepare(createGitConfig(releaseOptions, context, true), context);
}

function createGitConfig(releaseOptions: ReleaseOptions, context: Context, log: boolean = false): Options {
  const assets: string[] = [];
  let message = '';

  if (log) {
    context.logger.log('Committing files:');
  }

  for (let i = 0; i < releaseOptions.projects.length; i++) {
    const options: ReleaseProjectOptions = releaseOptions.projects[i];
    assets.push(options.changelog, options.packageJson);

    if (log) {
      assets.forEach((asset) => context.logger.log(asset));
    }

    message = options.releaseCommitMessage.replace('${project}', options.project);
  }

  return { assets, message };
}

async function updatePackageVersion(releaseOptions: ReleaseOptions, nextRelease: NextRelease): Promise<void> {
  for (let i = 0; i < releaseOptions.projects.length; i++) {
    const options: ReleaseProjectOptions = releaseOptions.projects[i];
    const packageJson: JSONSchemaForNPMPackageJsonFiles = JSON.parse(await readFile(options.packageJson, { encoding: 'utf-8' }));
    packageJson.version = nextRelease.version;
    await writeFile(options.packageJson, JSON.stringify(packageJson, null, 2));
  }
}

export const inlinePluginUpdatePackageVersion: InlinePlugin<ReleaseOptions> = {
  verifyConditions,
  prepare,
  name: 'update-package-version',
};
