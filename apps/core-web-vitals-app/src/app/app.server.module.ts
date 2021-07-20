import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ServerModule } from '@angular/platform-server';
import { Routes, RouterModule } from '@angular/router';

import { AppShellComponent } from './app-shell/app-shell.component';
import { AppComponent } from './app.component';
import { SharedModule } from './shared';

const routes: Routes = [{ path: 'shell', component: AppShellComponent }];

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'app' }),
    NoopAnimationsModule,
    ServerModule,
    RouterModule.forRoot(routes),
    SharedModule,
  ],
  declarations: [AppComponent, AppShellComponent],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
