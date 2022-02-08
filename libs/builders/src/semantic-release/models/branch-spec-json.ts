import { JsonObject } from '@angular-devkit/core';

export interface BranchSpecJson extends JsonObject {
  name: string;
  channel: string | false | null;
  range: string | null;
  prerelease: string | boolean | null;
}
