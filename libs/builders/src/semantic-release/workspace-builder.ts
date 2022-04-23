import { BuilderOutput, createBuilder, BuilderContext } from '@angular-devkit/architect';
import { ProjectGraphDependency } from '@nrwl/tao/src/shared/project-graph';

import { getProjectsByTag } from './lib';
import { SemanticReleaseWorkspaceSchema } from './workspace-schema';

const builder: any = createBuilder(semanticReleaseWorkspaceBuilder);
export default builder;

async function semanticReleaseWorkspaceBuilder(options: SemanticReleaseWorkspaceSchema, context: BuilderContext): Promise<BuilderOutput> {
  const { project } = context.target ?? {};

  if (project == null) {
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

  context.logger.info('');
  context.logger.info(`Using configuration:`);
  context.logger.info(JSON.stringify(options, null, 2));

  return { success: true };
}

function failureOutput(context: BuilderContext, error?: string): BuilderOutput {
  if (error != null) {
    context.logger.info(error);
  }
  return { success: false, error: error as unknown as string };
}
