import { BuilderOutput } from '@angular-devkit/architect';
import { Options } from 'semantic-release';

import { ProjectDependency } from './project-dependency';

export interface ReleaseProjectOptions {
  project: string;
  packageName: string;
  packageJson: string;
  changelog: string;
  outputPath: string;
  releaseCommitMessage: string;
  dependencies: ProjectDependency[];
  build: () => Promise<BuilderOutput>;
}

export interface ReleaseOptions extends Options {
  mode: 'independent' | 'sync';
  projects: ReleaseProjectOptions[];
}
