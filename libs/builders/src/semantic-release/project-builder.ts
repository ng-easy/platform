import { BuilderOutput, createBuilder, BuilderContext } from '@angular-devkit/architect';

import { runSemanticRelease, failureOutput } from './lib';
import { SemanticReleaseProjectSchema } from './project-schema';

const builder: any = createBuilder(semanticReleaseProjectBuilder);
export default builder;

async function semanticReleaseProjectBuilder(options: SemanticReleaseProjectSchema, context: BuilderContext): Promise<BuilderOutput> {
  const { project, target } = context.target ?? {};

  if (project == null || target == null) {
    return failureOutput(context, `Invalid project`);
  }

  context.logger.info(`Configuration for semantic release:`);
  context.logger.info(JSON.stringify(options, null, 2));

  return await runSemanticRelease(options, context, project);
}
