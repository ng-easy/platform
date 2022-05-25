import { dirname } from 'path';

import { BuilderOutput, createBuilder, BuilderContext, BuilderRun } from '@angular-devkit/architect';
import { readJsonFile } from '@nrwl/devkit';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { BranchSpec, PluginSpec } from 'semantic-release';

import {
  getGenerateNotesOptions,
  getProjectDependencies,
  getGithubOptions,
  getBuildTargetOptions,
  runSemanticRelease,
  failureOutput,
} from './lib';
import { InlinePluginSpec, ReleaseProjectOptions } from './models';
import { inlinePluginAnalyzeCommits, inlinePluginBuild, inlinePluginUpdateDependencies, inlinePluginUpdatePackageVersion } from './plugins';
import { SemanticReleaseProjectSchema } from './project-schema';

const builder: any = createBuilder(semanticReleaseProjectBuilder);
export default builder;

async function semanticReleaseProjectBuilder(options: SemanticReleaseProjectSchema, context: BuilderContext): Promise<BuilderOutput> {
  const { project, target } = context.target ?? {};

  if (project == null || target == null) {
    return failureOutput(context, `Invalid project`);
  }

  // Validate source package json
  const { packageJson, outputPath } = await getBuildTargetOptions(context, project);
  const sourcePackageJson: JSONSchemaForNPMPackageJsonFiles = readJsonFile(packageJson);
  const packageName: string | undefined = sourcePackageJson.name;
  if (packageName == null) {
    return failureOutput(context, `File ${packageJson} doesn't have a valid package name`);
  }

  // Prepare plugins for semantic release
  context.logger.info(`Starting semantic release for project "${project}" with package name ${packageName} from path ${outputPath}`);
  context.logger.info(`Using configuration:`);
  context.logger.info(JSON.stringify(options, null, 2));

  const releaseProjectOptions: ReleaseProjectOptions = {
    mode: options.mode,
    project,
    relatedProjects: [],
    packageName,
    packageJson,
    outputPath,
    releaseCommitMessage: options.releaseCommitMessage,
    changelogFile: `${dirname(packageJson)}/CHANGELOG.md`,
    dependencies: await getProjectDependencies(context, project),
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

  // Launch semantic release

  return await runSemanticRelease(
    {
      branches: options.branches as BranchSpec[],
      dryRun: options.dryRun,
      force: options.force,
      plugins,
      project,
      tagFormat: `${packageName}@\${version}`,
    },
    context
  );
}
