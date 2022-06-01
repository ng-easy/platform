import { Injectable } from '@angular/core';
import { defer, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map } from 'rxjs/operators';

// Reference: https://web.dev/browser-level-image-lazy-loading
@Injectable({ providedIn: 'root' })
export class IntersectionObserverService {
  private readonly intersections$ = new Subject<IntersectionObserverEntry[]>();
  private readonly intersectionObserver = new IntersectionObserver(
    (entries) => {
      this.intersections$.next(entries);
    },
    {
      // TODO: tweak distances
      // https://web.dev/browser-level-image-lazy-loading/
    }
  );

  isVisible(element: Element): Observable<boolean> {
    const intersectionObserver = this.intersectionObserver;
    if (intersectionObserver == null) {
      return of(true);
    }

    return defer(() => {
      intersectionObserver.observe(element);
      return this.intersections$;
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
      debounceTime(0), // To allow elements render one by one TODO: debounce request animation frame
      distinctUntilChanged(),
      finalize(() => intersectionObserver.unobserve(element))
    );
  }
}
