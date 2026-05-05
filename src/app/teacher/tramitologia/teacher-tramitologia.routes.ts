import { Route } from '@angular/router';

export const TEACHER_TRAMITOLOGIA_ROUTE: Route[] = [
  {
    path: 'solicitar',
    loadComponent: () =>
      import('@shared/components/tramitologia/solicitar-tramite/solicitar-tramite.component').then((m) => m.SolicitarTramiteComponent),
  },
  {
    path: 'mis-tramites',
    loadComponent: () =>
      import('@shared/components/tramitologia/mis-tramites/mis-tramites.component').then((m) => m.MisTramitesComponent),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('@shared/components/tramitologia/tramite-detalle/tramite-detalle.component').then((m) => m.TramiteDetalleComponent),
  },
  { path: '', redirectTo: 'mis-tramites', pathMatch: 'full' },
];
