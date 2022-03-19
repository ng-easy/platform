import { readJsonFile, writeJsonFile } from '@nrwl/devkit';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { prepare as gitPrepare } from '@semantic-release/git';
import { Context, NextRelease, Options } from 'semantic-release';

import { InlinePlugin, ReleaseOptions, ReleaseProjectOptions } from '../models';

async function verifyConditions(releaseOptions: ReleaseOptions, context: Context): Promise<void> {
  context.logger.log(`Nx Update Dependencies: Verify conditions`);

  for (let i = 0; i < releaseOptions.projects.length; i++) {
    const options: ReleaseProjectOptions = releaseOptions.projects[i];

    for (let i = 0; i < options.dependencies.length; i++) {
      const { project, packageJsonPath } = options.dependencies[i];
      await gitPrepare(createGitConfig(options.packageName, project, packageJsonPath, context), context);
    }
  }
}

async function prepare(releaseOptions: ReleaseOptions, context: Context): Promise<void> {
  context.logger.log(`Nx Update Dependencies: Prepare`);

  const nextRelease: NextRelease = context.nextRelease as NextRelease;

  for (let i = 0; i < releaseOptions.projects.length; i++) {
    const options: ReleaseProjectOptions = releaseOptions.projects[i];

    for (let i = 0; i < options.dependencies.length; i++) {
      const { project, packageJsonPath } = options.dependencies[i];
      updateDependencyPackage(options.packageName, packageJsonPath, nextRelease.version, context);
      await gitPrepare(createGitConfig(options.packageName, project, packageJsonPath, context, true), context);
    }
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

export const inlinePluginUpdateDependencies: InlinePlugin<ReleaseOptions> = {
  verifyConditions,
  prepare,
  name: 'update-dependencies',
};
