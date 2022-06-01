import { InjectionToken } from '@angular/core';

export const LAZY_LOAD_SUPPORT = new InjectionToken<boolean>('@ng-easy/image:lazy-load-support', {
  providedIn: 'root',
  factory: () => {
    return 'loading' in HTMLImageElement.prototype;
  },
});
