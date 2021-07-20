// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

addMatchImageSnapshotCommand({
  customSnapshotsDir: './src/snapshots',
  customDiffDir: '../../dist/cypress/apps/core-web-vitals-e2e/snapshot-diffs',
  failureThreshold: 0.03,
  failureThresholdType: 'percent',
  comparisonMethod: 'ssim',
  customDiffConfig: { ssim: 'fast' } as any,
  blur: 2.5,
});
