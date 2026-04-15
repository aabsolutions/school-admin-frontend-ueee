import { Route } from '@angular/router';
import { AllAreaEstudioComponent } from './all-area-estudio/all-area-estudio.component';
import { Page404Component } from '../../authentication/page404/page404.component';

export const AREA_ESTUDIO_ROUTE: Route[] = [
  { path: 'all', component: AllAreaEstudioComponent },
  { path: '', redirectTo: 'all', pathMatch: 'full' },
  { path: '**', component: Page404Component },
];
