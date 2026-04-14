import { Route } from '@angular/router';
import { AllMateriasComponent } from './all-materias/all-materias.component';
import { Page404Component } from 'app/authentication/page404/page404.component';

export const MATERIAS_ROUTE: Route[] = [
  { path: 'all-materias', component: AllMateriasComponent },
  { path: '**', component: Page404Component },
];
