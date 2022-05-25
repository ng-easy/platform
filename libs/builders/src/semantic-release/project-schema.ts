import { SemanticReleaseBaseSchema } from './base-schema';

export interface SemanticReleaseProjectSchema extends SemanticReleaseBaseSchema {
  mode: 'independent' | 'sync';
}
