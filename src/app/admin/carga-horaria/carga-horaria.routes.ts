import { Route } from '@angular/router';
import { CargaHorariaComponent } from './carga-horaria.component';
import { Page404Component } from 'app/authentication/page404/page404.component';

export const CARGA_HORARIA_ROUTE: Route[] = [
  { path: '', component: CargaHorariaComponent },
  { path: '**', component: Page404Component },
];
