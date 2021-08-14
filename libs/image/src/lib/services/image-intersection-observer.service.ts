import { ApplicationRef, Injectable } from '@angular/core';
import { defer, Observable, of, Subject } from 'rxjs';
import { delay, distinctUntilChanged, finalize, map, takeUntil, tap } from 'rxjs/operators';

// Reference: https://web.dev/browser-level-image-lazy-loading
@Injectable({ providedIn: 'root' })
export class ImageIntersectionObserver {
  private readonly browserSupportsLazyLoading: boolean = 'loading' in HTMLImageElement.prototype;
  private readonly intersections$ = new Subject<IntersectionObserverEntry[]>();
  private readonly intersectionObserver = new IntersectionObserver(
    (entries) => {
      this.intersections$.next(entries);
    },
    {
      // TODO: tweak distances
      root: this.appRef.components[0]?.location.nativeElement,
    }
  );

  constructor(private readonly appRef: ApplicationRef) {}

  isVisible(element: Element, priority: boolean): Observable<boolean> {
    if (this.browserSupportsLazyLoading || priority) {
      return of(true);
    }

    const complete$ = new Subject<void>();
    return defer(() => {
      this.intersectionObserver.observe(element);
      return this.intersections$;
    }).pipe(
      takeUntil(complete$.pipe(delay(0))),
      map((entries: IntersectionObserverEntry[]) => {
        const entry: IntersectionObserverEntry | undefined = entries.find((entry) => entry.target === element);
        return entry?.isIntersecting ?? false;
      }),
      distinctUntilChanged(),
      tap((visible) => {
        if (visible) {
          complete$.next();
          complete$.complete();
        }
      }),
      finalize(() => this.intersectionObserver.unobserve(element))
    );
  }
}
