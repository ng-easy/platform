import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { WelcomePageComponent } from './pages';
import { SharedModule } from './shared';

const routes: Routes = [
  { path: '', component: WelcomePageComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  declarations: [AppComponent, WelcomePageComponent],
  imports: [BrowserModule.withServerTransition({ appId: 'app' }), BrowserAnimationsModule, RouterModule.forRoot(routes), SharedModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
