import { BuilderOutput } from '@angular-devkit/architect';
import { Options } from 'semantic-release';

import { ProjectDependency } from './project-dependency';

export interface PluginConfig extends Options {
  project: string;
  packageName: string;
  packageJson: string;
  changelog: string;
  outputPath: string;
  mode?: 'independent' | 'sync';
  releaseCommitMessage: string;
  dependencies: ProjectDependency[];
  build: () => Promise<BuilderOutput>;
}
