import { Route } from '@angular/router';
import { AllCursosComponent } from './all-cursos/all-cursos.component';
import { Page404Component } from 'app/authentication/page404/page404.component';

export const CURSOS_ROUTE: Route[] = [
  { path: 'all-cursos', component: AllCursosComponent },
  { path: '**', component: Page404Component },
];
