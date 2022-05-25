import { JsonObject } from '@angular-devkit/core';
import { BranchSpec } from 'semantic-release';

export type BranchSpecJson = BranchSpec & JsonObject;
