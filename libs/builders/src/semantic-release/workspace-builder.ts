import { dirname } from 'path';

import { BuilderOutput, createBuilder, BuilderContext, BuilderRun } from '@angular-devkit/architect';
import { readJsonFile } from '@nrwl/devkit';
import { ProjectGraphDependency } from '@nrwl/tao/src/shared/project-graph';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { PluginSpec } from 'semantic-release';

import {
  failureOutput,
  getBuildTargetOptions,
  getGenerateNotesOptions,
  getGithubOptions,
  getProjectDependencies,
  getProjectsByTag,
} from './lib';
import { InlinePluginSpec, ReleaseProjectOptions } from './models';
import { inlinePluginAnalyzeCommits, inlinePluginBuild, inlinePluginUpdatePackageVersion, inlinePluginUpdateDependencies } from './plugins';
import { SemanticReleaseWorkspaceSchema } from './workspace-schema';

const builder: any = createBuilder(semanticReleaseWorkspaceBuilder);
export default builder;

// eslint-disable-next-line sonarjs/cognitive-complexity
async function semanticReleaseWorkspaceBuilder(options: SemanticReleaseWorkspaceSchema, context: BuilderContext): Promise<BuilderOutput> {
  const { project: targetProject, target } = context.target ?? {};

  if (targetProject == null || target == null) {
    return failureOutput(context, `Invalid project`);
  }

  context.logger.info(`Starting release of projects with tag "${options.tag}", detected projects:`);

  // Finding projects with tag and their dependencies
  const { nodes, dependencies } = await getProjectsByTag(options.tag, context);

  if (nodes.length === 0) {
    context.logger.info(`No projects found for this tag`);
    return { success: true };
  }

  nodes.forEach((node) => {
    const nodeDependencies: ProjectGraphDependency[] = dependencies[node.name] ?? [];
    if (nodeDependencies.length > 0) {
      const nodeDependenciesList = nodeDependencies.map((dep) => `"${dep.target}"`).join(', ');
      context.logger.info(`  - Project "${node.name}", depends on ${nodeDependenciesList}`);
    } else {
      context.logger.info(`  - Project "${node.name}"`);
    }
  });

  // Prepare plugins for semantic release
  context.logger.info('');
  context.logger.info(`Using configuration:`);
  context.logger.info(JSON.stringify(options, null, 2));

  for (const node of nodes) {
    // Validate source package json
    const project: string = node.name;
    const { packageJson, outputPath } = await getBuildTargetOptions(context, project);
    const sourcePackageJson: JSONSchemaForNPMPackageJsonFiles = readJsonFile(packageJson);
    const packageName: string | undefined = sourcePackageJson.name;
    if (packageName == null) {
      return failureOutput(context, `File ${packageJson} doesn't have a valid package name`);
    }

    // Prepare plugins for semantic release
    context.logger.info(`Starting semantic release for project "${project}" with package name ${packageName} from path ${outputPath}`);

    const releaseProjectOptions: ReleaseProjectOptions = {
      mode: 'tag',
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

    context.logger.info(`Finished semantic release for project "${project}" with package name ${packageName} from path ${outputPath}`);
  }

  return { success: true };
}
