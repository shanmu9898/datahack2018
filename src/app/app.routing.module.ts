import { UserComponent } from './pages/user/user.component';

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CrimeComponent} from './pages/crime/crime.component';

const APP_ROUTES: Routes = [
  {path: 'crime', component: CrimeComponent},
  {path: 'user', component: UserComponent}
];

export const routing = RouterModule.forRoot(APP_ROUTES);
