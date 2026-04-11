import { Route } from '@angular/router';

export const EXPEDIENTES_ROUTE: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./all-expedientes/all-expedientes.component').then(
        (m) => m.AllExpedientesComponent,
      ),
  },
];
