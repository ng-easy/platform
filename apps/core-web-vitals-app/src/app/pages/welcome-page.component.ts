import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'nge-welcome-page',
  template: `
    <h1>Welcome to {{ title }}!</h1>
    <button class="text-base font-medium rounded-lg p-3 bg-yellow-500">Hello</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomePageComponent {
  title = 'core-web-vitals';
}
