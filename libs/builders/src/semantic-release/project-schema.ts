import { JsonObject } from '@angular-devkit/core';

import { BranchSpecJson } from './models';

export interface SemanticReleaseProjectSchema extends JsonObject {
  dryRun: boolean;
  force: boolean;
  mode: 'independent' | 'sync';
  branches: Array<BranchSpecJson | string>;
  releaseCommitMessage: string;
  changelog: boolean;
  npm: boolean;
  github: boolean;
}
