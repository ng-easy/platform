import { readJsonFile, writeJsonFile } from '@nrwl/tao/src/utils/fileutils';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { prepare as gitPrepare } from '@semantic-release/git';
import { Context, NextRelease, Options } from 'semantic-release';

import { PluginConfig } from './plugin-config';

async function verifyConditions(pluginConfig: PluginConfig, context: Context): Promise<void> {
  for (let i = 0; i < pluginConfig.dependencies.length; i++) {
    const { project, packageJsonPath } = pluginConfig.dependencies[i];
    await gitPrepare(createGitConfig(pluginConfig.packageName, project, packageJsonPath, context), context);
  }
}

async function prepare(pluginConfig: PluginConfig, context: Context): Promise<void> {
  const nextRelease: NextRelease = context.nextRelease as NextRelease;

  for (let i = 0; i < pluginConfig.dependencies.length; i++) {
    const { project, packageJsonPath } = pluginConfig.dependencies[i];
    updateDependencyPackage(pluginConfig.packageName, packageJsonPath, nextRelease.version, context);
    await gitPrepare(createGitConfig(pluginConfig.packageName, project, packageJsonPath, context), context);
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

function createGitConfig(packageName: string, depProject: string, depPackageJsonPath: string, context: Context): Options {
  const assets: string[] = [depPackageJsonPath];
  context.logger.log('Committing files:');
  assets.forEach((asset) => context.logger.log(asset));

  return {
    assets,
    message: `fix(${depProject}): :arrow_up: update ${packageName} to \${nextRelease.version} [skip ci]`,
  };
}

export = { verifyConditions, prepare };
