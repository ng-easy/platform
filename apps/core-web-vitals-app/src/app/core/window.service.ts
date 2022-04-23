import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

function getWindow(): any {
  return window;
}

@Injectable({ providedIn: 'root' })
export class WindowRefService {
  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  get nativeWindow(): Window | null {
    return isPlatformBrowser(this.platformId) ? getWindow() : null;
  }
}
