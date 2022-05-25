import { BuilderOutput, createBuilder, BuilderContext } from '@angular-devkit/architect';
import { ProjectGraphDependency } from '@nrwl/tao/src/shared/project-graph';

import { failureOutput, getProjectsByTag, runSemanticRelease } from './lib';
import { SemanticReleaseWorkspaceSchema } from './workspace-schema';

const builder: any = createBuilder(semanticReleaseWorkspaceBuilder);
export default builder;

async function semanticReleaseWorkspaceBuilder(options: SemanticReleaseWorkspaceSchema, context: BuilderContext): Promise<BuilderOutput> {
  const { project: targetProject, target } = context.target ?? {};

  if (targetProject == null || target == null) {
    return failureOutput(context, `Invalid project`);
  }

  context.logger.info(`Configuration for semantic release:`);
  context.logger.info(JSON.stringify(options, null, 2));
  context.logger.info('');

  context.logger.info(`Starting release of projects with tag "${options.tag}":`);

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
  context.logger.info('');

  const projects: string[] = nodes.map(({ name }) => name);

  for (const project of projects) {
    const result: BuilderOutput = await runSemanticRelease({ ...options, mode: 'tag' }, context, project, projects);
    context.logger.info('');
    if (!result.success) {
      return result;
    }
  }

  return { success: true };
}
