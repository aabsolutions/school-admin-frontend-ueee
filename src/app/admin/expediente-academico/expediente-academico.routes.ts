import { Route } from '@angular/router';

export const EXPEDIENTE_ACADEMICO_ROUTE: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./all-expediente-academico/all-expediente-academico.component').then(
        (m) => m.AllExpedienteAcademicoComponent,
      ),
  },
];
