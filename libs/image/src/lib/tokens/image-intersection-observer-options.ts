import { InjectionToken } from '@angular/core';

import { NavigatorConnection } from '@ng-easy/image-config';

// https://web.dev/browser-level-image-lazy-loading/#improved-data-savings-and-distance-from-viewport-thresholds
export const dataSavingImageIntersectionObserverOptions: IntersectionObserverInit = { root: document.body, rootMargin: '1250px' };
export const normalImageIntersectionObserverOptions: IntersectionObserverInit = { root: document.body, rootMargin: '2500px' };

export const IMAGE_INTERSECTION_OBSERVER_OPTIONS = new InjectionToken<IntersectionObserverInit>(
  '@ng-easy/image:image-intersection-observer-options',
  {
    providedIn: 'root',
    factory: () => {
      if (!('connection' in window.navigator)) {
        return normalImageIntersectionObserverOptions;
      }

      const connection: NavigatorConnection = (window.navigator as any).connection;

      if (connection.saveData) {
        return dataSavingImageIntersectionObserverOptions;
      }

      switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
        case '3g':
          return dataSavingImageIntersectionObserverOptions;
        case '4g':
          return normalImageIntersectionObserverOptions;
      }
    },
  }
);
