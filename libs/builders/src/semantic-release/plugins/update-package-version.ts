import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { verifyConditions as gitVerifyConditions, prepare as gitPrepare } from '@semantic-release/git';
import { readFile, writeFile } from 'fs-extra';
import { Context, NextRelease, Options } from 'semantic-release';

import { PluginConfig } from './plugin-config';

async function verifyConditions(pluginConfig: PluginConfig, context: Context): Promise<void> {
  await gitVerifyConditions(createGitConfig(pluginConfig, context), context);
}

async function prepare(pluginConfig: PluginConfig, context: Context): Promise<void> {
  const nextRelease: NextRelease = context.nextRelease as NextRelease;
  await updatePackageVersion(pluginConfig, nextRelease);
  await gitPrepare(createGitConfig(pluginConfig, context), context);
}

function createGitConfig(pluginConfig: PluginConfig, context: Context): Options {
  const assets: string[] = [pluginConfig.changelog, pluginConfig.packageJson];
  context.logger.log('Committing files:');
  assets.forEach((asset) => context.logger.log(asset));
  const message = pluginConfig.releaseCommitMessage.replace('${project}', pluginConfig.project);
  return { assets, message };
}

async function updatePackageVersion(pluginConfig: PluginConfig, nextRelease: NextRelease): Promise<void> {
  const packageJson: JSONSchemaForNPMPackageJsonFiles = JSON.parse(await readFile(pluginConfig.packageJson, { encoding: 'utf-8' }));
  packageJson.version = nextRelease.version;
  await writeFile(pluginConfig.packageJson, JSON.stringify(packageJson, null, 2));
}

export = { verifyConditions, prepare };
