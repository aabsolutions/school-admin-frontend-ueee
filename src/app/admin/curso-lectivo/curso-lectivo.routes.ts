import { Route } from '@angular/router';
import { AllCursoLectivoComponent } from './all-curso-lectivo/all-curso-lectivo.component';
import { Page404Component } from 'app/authentication/page404/page404.component';

export const CURSO_LECTIVO_ROUTE: Route[] = [
  { path: 'all', component: AllCursoLectivoComponent },
  { path: '**', component: Page404Component },
];
