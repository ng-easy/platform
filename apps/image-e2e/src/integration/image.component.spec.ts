// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../support/index.d.ts" />

interface Viewport {
  name: string;
  width: number;
  height: number;
}

const iPadLandscape: Viewport = { name: 'iPad 2 landscape', width: 1024, height: 720 };
const iPhone4Portrait: Viewport = { name: 'iPhone 4 portrait', width: 640, height: 960 };

const sizes: Viewport[] = [iPadLandscape, iPhone4Portrait];

describe('@ng-easy/image', () => {
  ['intrinsic', 'fixed', 'responsive', 'fill', 'list'].forEach((layout) => {
    describe(`${layout} layout`, () => {
      beforeEach(() => cy.visit(`/iframe.html?id=imagecomponent--${layout}`));

      sizes.forEach(({ name, width, height }) => {
        it(`should not have visual regressions for ${name} (${width}x${height}px)`, () => {
          cy.viewport(width, height);
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(layout === 'list' ? 4000 : 1000); // Give enough time to load the images
          cy.matchImageSnapshot();
        });
      });
    });
  });
});
