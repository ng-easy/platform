import { Injectable } from '@angular/core';
import { animationFrameScheduler, defer, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, observeOn } from 'rxjs/operators';

export const defaultIntersectionObserverOptions: IntersectionObserverInit = {};

// Reference: https://web.dev/browser-level-image-lazy-loading
@Injectable({ providedIn: 'root' })
export class IntersectionObserverService {
  private readonly intersectionsMap = new Map<IntersectionObserverInit, Subject<IntersectionObserverEntry[]>>();
  private readonly intersectionObserverMap = new Map<IntersectionObserverInit, IntersectionObserver>();

  isVisible(element: Element, options: IntersectionObserverInit = defaultIntersectionObserverOptions): Observable<boolean> {
    if (!('IntersectionObserver' in window)) {
      return of(true);
    }

    const { intersectionObserver, intersections$ } = this.getIntersectionObserver(options);

    return defer(() => {
      intersectionObserver.observe(element);
      return intersections$;
    }).pipe(
      map((entries: IntersectionObserverEntry[]) => {
        // Entries collection can emit the same element multiple times in the same batch
        return entries
          .sort((entryA, entryB) => (entryA.time > entryB.time ? -1 : 1)) // Order by descending time to have first the last entry
          .find(({ target }) => target == element);
      }),
      // IntersectionObserver only emits entries that have changed, don't need to react if target element is not involved
      filter((entry): entry is IntersectionObserverEntry => !!entry),
      map((entry) => entry.isIntersecting),
      debounceTime(0), // To allow elements render one by one
      distinctUntilChanged(),
      observeOn(animationFrameScheduler), // Make sure rendering happens when there is an animation frame ready
      finalize(() => intersectionObserver.unobserve(element))
    );
  }

  private getIntersectionObserver(options: IntersectionObserverInit) {
    const newIntersections$ = this.intersectionsMap.get(options);
    const newIntersectionObserver = this.intersectionObserverMap.get(options);
    if (newIntersections$ && newIntersectionObserver) {
      return { intersections$: newIntersections$, intersectionObserver: newIntersectionObserver };
    }

    const intersections$ = new Subject<IntersectionObserverEntry[]>();
    const intersectionObserver = new IntersectionObserver((entries) => intersections$.next(entries), options);

    this.intersectionsMap.set(options, intersections$);
    this.intersectionObserverMap.set(options, intersectionObserver);

    return { intersections$, intersectionObserver };
  }
}
