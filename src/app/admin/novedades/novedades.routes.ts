import { Route } from '@angular/router';

export const NOVEDADES_ROUTE: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./all-novedades/all-novedades.component').then(
        (m) => m.AllNovedadesComponent,
      ),
  },
  {
    path: 'reporte',
    loadComponent: () =>
      import('./reporte-novedades/reporte-novedades.component').then(
        (m) => m.ReporteNovedadesComponent,
      ),
  },
];
