import { Route } from '@angular/router';

export const GESTION_DOCUMENTAL_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'docentes',
    pathMatch: 'full',
  },
  {
    path: 'docentes',
    loadComponent: () =>
      import('./docentes/docentes-documental.component').then(
        (m) => m.DocentesDocumentalComponent
      ),
  },
  {
    path: 'estudiantes',
    loadComponent: () =>
      import('./estudiantes/estudiantes-documental.component').then(
        (m) => m.EstudiantesDocumentalComponent
      ),
  },
];
