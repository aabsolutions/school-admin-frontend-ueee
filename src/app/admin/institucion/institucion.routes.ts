import { Route } from '@angular/router';
import { InstitucionComponent } from './institucion.component';
import { Page404Component } from '../../authentication/page404/page404.component';

export const INSTITUCION_ROUTE: Route[] = [
  { path: '', component: InstitucionComponent },
  { path: '**', component: Page404Component },
];
