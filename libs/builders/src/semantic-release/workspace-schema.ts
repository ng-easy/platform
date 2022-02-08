import { JsonObject } from '@angular-devkit/core';

export interface SemanticReleaseWorkspaceSchema extends JsonObject {
  tag: string;
}
