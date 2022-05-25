import { JsonObject } from '@angular-devkit/core';

import { BranchSpecJson } from './models';

export interface SemanticReleaseWorkspaceSchema extends JsonObject {
  dryRun: boolean;
  force: boolean;
  tag: string;
  branches: Array<BranchSpecJson | string>;
  releaseCommitMessage: string;
  changelog: boolean;
  npm: boolean;
  github: boolean;
}
