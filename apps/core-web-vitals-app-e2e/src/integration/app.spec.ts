// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../support/index.d.ts" />

import { getGreeting } from '../support/app.po';

interface Viewport {
  preset: Cypress.ViewportPreset;
  orientation?: Cypress.ViewportOrientation;
}

const sizes: Viewport[] = [
  { preset: 'iphone-6' },
  { preset: 'iphone-6', orientation: 'landscape' },
  { preset: 'ipad-2' },
  { preset: 'ipad-2', orientation: 'landscape' },
  { preset: 'macbook-15' },
];

describe('core-web-vitals', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    // Function helper example, see `../support/app.po.ts` file
    getGreeting().contains('Welcome to core-web-vitals!');
  });

  sizes.forEach(({ preset, orientation }) => {
    const device: string = `${preset} ${orientation || ''}`.trim();

    it(`should not have visual regressions for ${device}`, () => {
      cy.viewport(preset, orientation);
      cy.matchImageSnapshot();
    });
  });
});
