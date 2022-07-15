import { dirname } from 'path';

import { BuilderOutput, BuilderContext, BuilderRun } from '@angular-devkit/architect';
import { readJsonFile } from '@nrwl/devkit';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { Result, default as semanticRelease, PluginSpec } from 'semantic-release';

import { BranchSpecJson, InlinePluginSpec, ReleaseProjectOptions } from '../models';
import {
  inlinePluginAnalyzeCommits,
  inlinePluginBuild,
  inlinePluginUpdateDependencies,
  inlinePluginUpdatePackageVersion,
} from '../plugins';
import { createLoggerStream } from './create-logger-stream';
import { failureOutput } from './failure-output';
import { getBuildTargetOptions } from './get-build-target-options';
import { getGenerateNotesOptions } from './get-generate-notes-options';
import { getGithubOptions } from './get-github-options';
import { getProjectDependencies } from './get-project-dependencies';
import { getGitCurrentSha, getGitPullRebase, getGitRemoteHeadSha, getGitStatus } from './git';

export interface RunSemanticReleaseOptions {
  branches: BranchSpecJson[];
  changelog: boolean;
  dryRun: boolean;
  force: boolean;
  github: boolean;
  npm: boolean;
  releaseCommitMessage: string;
  verbose: boolean;
  forceGitPullRebase: boolean;
}

export async function runSemanticRelease(
  options: RunSemanticReleaseOptions,
  context: BuilderContext,
  project: string,
  relatedProjects: string[] = []
): Promise<BuilderOutput> {
  // Validate source package json
  const { packageJson, outputPath } = await getBuildTargetOptions(context, project);
  const sourcePackageJson: JSONSchemaForNPMPackageJsonFiles = readJsonFile(packageJson);
  const packageName: string | undefined = sourcePackageJson.name;
  if (packageName == null) {
    return failureOutput(context, `File ${packageJson} doesn't have a valid package name`);
  }

  // Prepare plugins for semantic release
  context.logger.info(`Starting semantic release for project "${project}" with package name ${packageName} from path ${outputPath}`);

  if (options.verbose) {
    await logGitStatus(context);
  }

  if (options.forceGitPullRebase) {
    await logPullRebase(context);
  }

  const releaseProjectOptions: ReleaseProjectOptions = {
    project,
    relatedProjects: relatedProjects.filter((relatedProject) => relatedProject !== project),
    packageName,
    packageJson,
    outputPath,
    releaseCommitMessage: options.releaseCommitMessage,
    changelogFile: `${dirname(packageJson)}/CHANGELOG.md`,
    dependencies: await getProjectDependencies(context, project, relatedProjects),
    build: async () => {
      const buildRun: BuilderRun = await context.scheduleTarget({ project, target: 'build' });
      return await buildRun.result;
    },
  };

  const commitAnalyzerPlugin: InlinePluginSpec<ReleaseProjectOptions> = [inlinePluginAnalyzeCommits, releaseProjectOptions];
  const releaseNotesPlugin: PluginSpec = ['@semantic-release/release-notes-generator', getGenerateNotesOptions([project])];
  const changelogPlugin: PluginSpec = ['@semantic-release/changelog', releaseProjectOptions];
  const buildPlugin: InlinePluginSpec<ReleaseProjectOptions> = [inlinePluginBuild, releaseProjectOptions];
  const npmPlugin: PluginSpec = ['@semantic-release/npm', { pkgRoot: outputPath, tarballDir: `${outputPath}-tar` }];
  const githubPlugin: PluginSpec = ['@semantic-release/github', getGithubOptions(outputPath, packageName)];
  const updatePackageVersionPlugin: InlinePluginSpec<ReleaseProjectOptions> = [inlinePluginUpdatePackageVersion, releaseProjectOptions];
  const updateDependenciesPlugin: InlinePluginSpec<ReleaseProjectOptions> = [inlinePluginUpdateDependencies, releaseProjectOptions];

  const plugins: PluginSpec[] = [
    commitAnalyzerPlugin,
    releaseNotesPlugin,
    options.changelog ? changelogPlugin : null,
    buildPlugin,
    options.npm ? npmPlugin : null,
    options.github ? githubPlugin : null,
    updatePackageVersionPlugin,
    updateDependenciesPlugin,
  ].filter((plugin: PluginSpec | InlinePluginSpec<any> | null): plugin is PluginSpec => plugin != null) as PluginSpec[];

  try {
    const result: Result = await semanticRelease(
      {
        tagFormat: `${packageName}@\${version}`,
        branches: options.branches,
        extends: undefined,
        dryRun: options.dryRun,
        plugins: plugins,
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

async function logGitStatus(context: BuilderContext) {
  context.logger.info('Git current commit:');
  context.logger.info(await getGitCurrentSha());
  context.logger.info('');

  context.logger.info('Git remote commit:');
  context.logger.info(await getGitRemoteHeadSha());
  context.logger.info('');

  context.logger.info('Git status:');
  context.logger.info(await getGitStatus());
  context.logger.info('');
}

async function logPullRebase(context: BuilderContext) {
  context.logger.info('Git rebase:');
  context.logger.info(await getGitPullRebase());
  context.logger.info('');
}
