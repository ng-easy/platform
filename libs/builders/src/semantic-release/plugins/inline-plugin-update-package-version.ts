import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { verifyConditions as gitVerifyConditions, prepare as gitPrepare } from '@semantic-release/git';
import { readFile, writeFile } from 'fs-extra';
import { Context, NextRelease, Options } from 'semantic-release';

import { InlinePlugin, ReleaseProjectOptions } from '../models';

async function verifyConditions(projectOptions: ReleaseProjectOptions, context: Context): Promise<void> {
  context.logger.log(`Nx Update Package Version: Verify conditions`);

  await gitVerifyConditions(createGitConfig(projectOptions, context), context);
}

async function prepare(releaseOptions: ReleaseProjectOptions, context: Context): Promise<void> {
  context.logger.log(`Nx Update Package Version: Prepare`);

  const nextRelease: NextRelease = context.nextRelease as NextRelease;
  await updatePackageVersion(releaseOptions, nextRelease);
  await gitPrepare(createGitConfig(releaseOptions, context, true), context);
}

function createGitConfig(releaseOptions: ReleaseProjectOptions, context: Context, log: boolean = false): Options {
  const assets: string[] = [];
  let message = '';

  if (log) {
    context.logger.log('Updating package version on files:');
  }

  assets.push(releaseOptions.changelogFile, releaseOptions.packageJson);

  if (log) {
    assets.forEach((asset) => context.logger.log(`- ${asset}`));
  }

  message = releaseOptions.releaseCommitMessage.replace('${project}', releaseOptions.project);

  return { assets, message };
}

async function updatePackageVersion(releaseOptions: ReleaseProjectOptions, nextRelease: NextRelease): Promise<void> {
  const packageJson: JSONSchemaForNPMPackageJsonFiles = JSON.parse(await readFile(releaseOptions.packageJson, { encoding: 'utf-8' }));
  packageJson.version = nextRelease.version;
  await writeFile(releaseOptions.packageJson, JSON.stringify(packageJson, null, 2));
}

export const inlinePluginUpdatePackageVersion: InlinePlugin<ReleaseProjectOptions> = {
  verifyConditions,
  prepare,
  name: 'update-package-version',
};
