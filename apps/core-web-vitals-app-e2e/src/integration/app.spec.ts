// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../support/index.d.ts" />

import { getGreeting } from '../support/app.po';

interface Viewport {
  name: string;
  width: number;
  height: number;
}

const iPadPortrait: Viewport = { name: 'iPad 2 portrait', width: 720, height: 1024 };
const iPadLandscape: Viewport = { name: 'iPad 2 landscape', width: 1024, height: 720 };
const iPhone4Portrait: Viewport = { name: 'iPhone 4 portrait', width: 640, height: 960 };
const iPhone4Landscape: Viewport = { name: 'iPhone 4 landscape', width: 960, height: 640 };
const iMac: Viewport = { name: 'iMac', width: 2560, height: 1440 };

const sizes: Viewport[] = [iPadLandscape, iPadPortrait, iPhone4Landscape, iPhone4Portrait, iMac];

describe('core-web-vitals', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    // Function helper example, see `../support/app.po.ts` file
    getGreeting().contains('Welcome to core-web-vitals!');
  });

  sizes.forEach(({ name, width, height }) => {
    it(`should not have visual regressions for ${name} (${width}x${height}px)`, () => {
      cy.viewport(width, height);
      cy.matchImageSnapshot();
    });
  });
});
