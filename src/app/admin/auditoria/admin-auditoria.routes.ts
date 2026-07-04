import { Route } from '@angular/router';

export const AUDITORIA_ROUTE: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./auditoria-list/auditoria-list.component').then(
        (m) => m.AuditoriaListComponent
      ),
  },
];
