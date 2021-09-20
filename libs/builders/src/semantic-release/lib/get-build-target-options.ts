import { dirname, resolve, join } from 'path';

import { BuilderContext } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { readJsonFile } from '@nrwl/workspace/src/utilities/fileutils';

export interface BuildOptions {
  packageJson: string;
  outputPath: string;
}

export async function getBuildTargetOptions(context: BuilderContext, project: string): Promise<BuildOptions> {
  const {
    packageJson,
    outputPath,
    project: ngPackage,
  } = await context.getTargetOptions({ project, target: 'build' }).catch(() => ({} as JsonObject));

  // Infer from Nx project
  if (typeof packageJson === 'string' && typeof outputPath === 'string') {
    return { packageJson, outputPath };
  }

  // Infer from Angular project
  if (typeof ngPackage === 'string') {
    const { dest }: { dest: string } = readJsonFile(ngPackage);
    return {
      packageJson: join(dirname(ngPackage), 'package.json'),
      outputPath: resolve(dest),
    };
  }

  throw new Error(`Project "${project}" build target should define outputPath and packageJson, couldn't be inferred from its config`);
}
