import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'nge-app-shell',
  template: `<mat-spinner></mat-spinner>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {}
