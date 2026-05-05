import { Route } from '@angular/router';

export const ADMIN_TRAMITOLOGIA_ROUTE: Route[] = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/tramite-dashboard.component').then((m) => m.TramiteDashboardComponent),
  },
  {
    path: 'plantillas',
    loadComponent: () =>
      import('./plantillas/plantillas-list/plantillas-list.component').then((m) => m.PlantillasListComponent),
  },
  {
    path: 'plantilla-form',
    loadComponent: () =>
      import('./plantillas/plantilla-form/plantilla-form.component').then((m) => m.PlantillaFormComponent),
  },
  {
    path: 'plantilla-form/:id',
    loadComponent: () =>
      import('./plantillas/plantilla-form/plantilla-form.component').then((m) => m.PlantillaFormComponent),
  },
  {
    path: 'bandeja',
    loadComponent: () =>
      import('./bandeja/bandeja.component').then((m) => m.BandejaComponent),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('@shared/components/tramitologia/tramite-detalle/tramite-detalle.component').then((m) => m.TramiteDetalleComponent),
  },
  {
    path: 'reportes',
    loadComponent: () =>
      import('./reportes/tramite-reportes.component').then((m) => m.TramiteReportesComponent),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
