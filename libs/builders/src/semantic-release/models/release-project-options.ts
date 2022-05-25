import { BuilderOutput } from '@angular-devkit/architect';
import { Options } from 'semantic-release';

import { ProjectDependency } from './project-dependency';

export interface ReleaseProjectOptions extends Options {
  mode: 'independent' | 'sync' | 'tag';
  project: string;
  relatedProjects: string[];
  packageName: string;
  packageJson: string;
  changelogFile: string;
  outputPath: string;
  releaseCommitMessage: string;
  dependencies: ProjectDependency[];
  build: () => Promise<BuilderOutput>;
}
