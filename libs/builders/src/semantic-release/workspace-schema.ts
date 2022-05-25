import { SemanticReleaseBaseSchema } from './base-schema';

export interface SemanticReleaseWorkspaceSchema extends SemanticReleaseBaseSchema {
  tag: string;
}
