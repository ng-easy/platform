import { JsonObject } from '@angular-devkit/core';

export type SemanticReleaseCommitScope = 'project' | 'all';

export interface BranchSpecJson extends JsonObject {
  name: string;
  channel: string | false | null;
  range: string | null;
  prerelease: string | boolean | null;
}

export interface SemanticReleaseSchema extends JsonObject {
  dryRun: boolean;
  force: boolean;
  mode: 'independent' | 'sync';
  branches: Array<BranchSpecJson | string>;
  releaseCommitMessage: string;
  changelog: boolean;
  npm: boolean;
  github: boolean;
}
