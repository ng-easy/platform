import { dirname } from 'path';

import { BuilderOutput, createBuilder, BuilderContext, BuilderRun } from '@angular-devkit/architect';
import { readJsonFile } from '@nrwl/devkit';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { BranchSpec, PluginSpec, Result, default as semanticRelease } from 'semantic-release';

import {
  createLoggerStream,
  getAnalyzeCommitsOptions,
  getGenerateNotesOptions,
  getProjectDependencies,
  getGithubOptions,
  getBuildTargetOptions,
  AnalyzeCommitsOptions,
} from './lib';
import { InlinePluginSpec, ReleaseOptions, ReleaseProjectOptions } from './models';
import { inlinePluginBuild } from './plugins/inline-plugin-build';
import { inlinePluginUpdateDependencies } from './plugins/inline-plugin-update-dependencies';
import { inlinePluginUpdatePackageVersion } from './plugins/inline-plugin-update-package-version';
import { SemanticReleaseProjectSchema } from './project-schema';

const builder: any = createBuilder(semanticReleaseProjectBuilder);
export default builder;

async function semanticReleaseProjectBuilder(options: SemanticReleaseProjectSchema, context: BuilderContext): Promise<BuilderOutput> {
  const { project } = context.target ?? {};

  if (project == null) {
    return failureOutput(context, `Invalid project`);
  }

  // Validate source package json
  const { packageJson, outputPath } = await getBuildTargetOptions(context, project);
  const sourcePackageJson: JSONSchemaForNPMPackageJsonFiles = readJsonFile(packageJson);
  const packageName: string | undefined = sourcePackageJson.name;
  if (packageName == null) {
    return failureOutput(context, `File ${packageJson} doesn't have a valid package name`);
  }

  // Launch semantic release
  context.logger.info(`Starting semantic release for project "${project}" with package name ${packageName} from path ${outputPath}`);
  context.logger.info(`Using configuration:`);
  context.logger.info(JSON.stringify(options, null, 2));

  const releaseProjectOptions: ReleaseProjectOptions = {
    project,
    packageName,
    packageJson,
    outputPath,
    releaseCommitMessage: options.releaseCommitMessage,
    changelog: `${dirname(packageJson)}/CHANGELOG.md`,
    dependencies: await getProjectDependencies(context),
    build: async () => {
      const buildRun: BuilderRun = await context.scheduleTarget({ project, target: 'build' });
      return await buildRun.result;
    },
  };
  const releaseOptions: ReleaseOptions = {
    projects: [releaseProjectOptions],
  };

  const analyzeCommitOptions: AnalyzeCommitsOptions = getAnalyzeCommitsOptions([project], options.mode);

  context.logger.info(`Regex to match commits: ${analyzeCommitOptions.parserOpts.headerPattern.source}`);
  context.logger.info('');

  const commitAnalyzerPlugin: PluginSpec = ['@semantic-release/commit-analyzer', analyzeCommitOptions];
  const releaseNotesPlugin: PluginSpec = ['@semantic-release/release-notes-generator', getGenerateNotesOptions([project])];
  const changelogPlugin: PluginSpec = ['@semantic-release/changelog', { changelogFile: releaseProjectOptions.changelog }];
  const buildPlugin: InlinePluginSpec<ReleaseOptions> = [inlinePluginBuild, releaseOptions];
  const npmPlugin: PluginSpec = ['@semantic-release/npm', { pkgRoot: outputPath, tarballDir: `${outputPath}-tar` }];
  const githubPlugin: PluginSpec = ['@semantic-release/github', getGithubOptions(outputPath, packageName)];
  const updatePackageVersionPlugin: InlinePluginSpec<ReleaseOptions> = [inlinePluginUpdatePackageVersion, releaseOptions];
  const updateDependenciesPlugin: InlinePluginSpec<ReleaseOptions> = [inlinePluginUpdateDependencies, releaseOptions];

  const plugins = [
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
        branches: options.branches as ReadonlyArray<BranchSpec>,
        extends: undefined,
        dryRun: options.dryRun,
        plugins,
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
