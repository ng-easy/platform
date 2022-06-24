import { readJsonFile, writeJsonFile } from '@nrwl/devkit';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { prepare as gitPrepare } from '@semantic-release/git';
import { Context, NextRelease, Options } from 'semantic-release';

import { InlinePlugin, ReleaseProjectOptions } from '../models';

async function verifyConditions(releaseOptions: ReleaseProjectOptions, context: Context): Promise<void> {
  context.logger.log(`Nx Update Dependencies: Verify conditions`);

  for (let i = 0; i < releaseOptions.dependencies.length; i++) {
    const { project, packageJsonPath } = releaseOptions.dependencies[i];
    await gitPrepare(createGitConfig(releaseOptions.packageName, project, packageJsonPath, context), context);
  }
}

async function prepare(releaseOptions: ReleaseProjectOptions, context: Context): Promise<void> {
  context.logger.log(`Nx Update Dependencies: Prepare`);

  const nextRelease: NextRelease = context.nextRelease as NextRelease;

  if (releaseOptions.dependencies.length > 0) {
    const projects = releaseOptions.dependencies.map(({ project }) => project).join(', ');
    context.logger.log(`Will update version on projects: ${projects}`);
  }

  for (const dependency of releaseOptions.dependencies) {
    const { project, packageJsonPath } = dependency;
    updateDependencyPackage(releaseOptions.packageName, packageJsonPath, nextRelease.version, context);
    await gitPrepare(createGitConfig(releaseOptions.packageName, project, packageJsonPath, context, true), context);
  }
}

function updateDependencyPackage(packageName: string, depPackageJsonPath: string, version: string, context: Context) {
  const packageJson: JSONSchemaForNPMPackageJsonFiles = readJsonFile(depPackageJsonPath);

  if (packageJson.dependencies?.[packageName]) {
    packageJson.dependencies[packageName] = `^${version}`;
    context.logger.log(`Package ${depPackageJsonPath} updated with dependency ${packageName}@${version}`);
  } else {
    const peerDependencies = { ...packageJson.peerDependencies };
    peerDependencies[packageName] = `^${version}`;
    packageJson.peerDependencies = peerDependencies;
    context.logger.log(`Package ${depPackageJsonPath} updated with peer dependency ${packageName}@${version}`);
  }

  writeJsonFile(depPackageJsonPath, packageJson);
}

function createGitConfig(
  packageName: string,
  depProject: string,
  depPackageJsonPath: string,
  context: Context,
  log: boolean = false
): Options {
  const assets: string[] = [depPackageJsonPath];

  if (log) {
    context.logger.log(`Updating version of ${packageName} in file:`);
    assets.forEach((asset) => context.logger.log(`- ${asset}`));
  }

  return {
    assets,
    message: `fix(${depProject}): :arrow_up: update ${packageName} to \${nextRelease.version} [skip ci]`,
  };
}

export const inlinePluginUpdateDependencies: InlinePlugin<ReleaseProjectOptions> = {
  verifyConditions,
  prepare,
  name: 'update-dependencies',
};
