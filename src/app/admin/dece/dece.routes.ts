import { Route } from '@angular/router';

export const DECE_ROUTE: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./all-dece/all-dece.component').then(
        (m) => m.AllDeceComponent,
      ),
  },
];
