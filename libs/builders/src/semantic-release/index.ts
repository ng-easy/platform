import { dirname } from 'path';

import { BuilderOutput, createBuilder, BuilderContext, BuilderRun } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { readJsonFile } from '@nrwl/workspace/src/utilities/fileutils';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { emptyDir } from 'fs-extra';
import semanticRelease, { Result } from 'semantic-release';

import {
  createLoggerStream,
  getAnalyzeCommitsOptions,
  getGenerateNotesOptions,
  calculateProjectDependencies,
  getGithubOptions,
} from './lib';
import { PluginConfig } from './plugins/plugin-config';
import { SemanticReleaseSchema } from './schema';

const buildPlugin = require.resolve('./plugins/build');
const updatePackageVersionPlugin = require.resolve('./plugins/update-package-version');
const updateDependenciesPlugin = require.resolve('./plugins/update-dependencies');

export default createBuilder(semanticReleaseBuilder);

async function semanticReleaseBuilder(options: SemanticReleaseSchema, context: BuilderContext): Promise<BuilderOutput> {
  context.logger.info(`Running initial validations...`);

  const { project } = context.target ?? {};

  if (project == null) {
    return failureOutput(context, `Invalid project`);
  }

  // Validate build target
  const buildTargetOptions = await context.getTargetOptions({ project, target: 'build' }).catch(() => ({} as JsonObject));
  const { packageJson, outputPath } = buildTargetOptions;
  if (typeof packageJson !== 'string') {
    return failureOutput(context, `Project "${project}" doesn't have option packageJson in build target`);
  }
  if (typeof outputPath !== 'string') {
    return failureOutput(context, `Project "${project}" doesn't have option outputPath in build target`);
  }
  await emptyDir(`${outputPath}-tar`);

  // Validate source package json
  const sourcePackageJson: JSONSchemaForNPMPackageJsonFiles = readJsonFile(packageJson);
  const packageName: string | undefined = sourcePackageJson.name;
  if (packageName == null) {
    return failureOutput(context, `File ${packageJson} doesn't have a valid package name`);
  }

  // Launch semantic release
  context.logger.info(`Starting semantic release for project "${project}"`);
  const pluginConfig: PluginConfig = {
    project,
    packageName,
    packageJson,
    outputPath,
    changelog: `${dirname(packageJson)}/CHANGELOG.md`,
    dependencies: calculateProjectDependencies(context),
    build: async () => {
      const buildRun: BuilderRun = await context.scheduleTarget({ project, target: 'build' }, { withDeps: true });
      return await buildRun.result;
    },
  };

  try {
    const result: Result = await semanticRelease(
      {
        tagFormat: `${packageName}@\${version}`,
        branches: ['master', 'main', 'next', { name: 'beta', prerelease: true }, { name: 'alpha', prerelease: true }],
        extends: undefined,
        dryRun: options.dryRun,
        plugins: [
          ['@semantic-release/commit-analyzer', getAnalyzeCommitsOptions(project, options.mode)],
          ['@semantic-release/release-notes-generator', getGenerateNotesOptions(project)],
          ['@semantic-release/changelog', { changelogFile: pluginConfig.changelog }],
          [buildPlugin, pluginConfig],
          ['@semantic-release/npm', { pkgRoot: outputPath, tarballDir: `${outputPath}-tar` }],
          ['@semantic-release/github', getGithubOptions(outputPath, packageName)],
          [updatePackageVersionPlugin, pluginConfig],
          [updateDependenciesPlugin, pluginConfig],
        ],
        ci: !options.force,
      },
      {
        env: { ...process.env } as { [key: string]: string },
        cwd: '.',
        stdout: createLoggerStream(context) as unknown as NodeJS.WriteStream,
        stderr: createLoggerStream(context) as unknown as NodeJS.WriteStream,
      }
    );

    if (result) {
      const { nextRelease } = result;
      context.logger.info(`The "${project}" project was released with version ${nextRelease.version}`);
    } else {
      context.logger.info(`No new release for the "${project}" project`);
    }
  } catch (err) {
    if (err instanceof Error) {
      context.logger.info(`${err.name}: ${err.message}`);
    }
    return { success: false, error: `The automated release failed with error: ${err}` };
  }

  return { success: true };
}

function failureOutput(context: BuilderContext, error?: string): BuilderOutput {
  if (error != null) {
    context.logger.info(error);
  }
  return { success: false, error: error as unknown as string };
}
