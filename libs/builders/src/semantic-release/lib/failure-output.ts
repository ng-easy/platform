import { BuilderContext, BuilderOutput } from '@angular-devkit/architect';

export function failureOutput(context: BuilderContext, error?: string): BuilderOutput {
  if (error != null) {
    context.logger.info(error);
  }
  return { success: false, error: error as unknown as string };
}
