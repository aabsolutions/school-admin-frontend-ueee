import { Route } from '@angular/router';

export const REPORTES_ROUTE: Route[] = [
  {
    path: 'directorio-docentes',
    loadComponent: () =>
      import('./directorio-docentes/directorio-docentes.component').then(
        (m) => m.DirectorioDocentesComponent
      ),
  },
  {
    path: 'directorio-estudiantes',
    loadComponent: () =>
      import('./directorio-estudiantes/directorio-estudiantes.component').then(
        (m) => m.DirectorioEstudiantesComponent
      ),
  },
  {
    path: 'cursos-stats',
    loadComponent: () =>
      import('./cursos-stats/cursos-stats.component').then(
        (m) => m.CursosStatsComponent
      ),
  },
  {
    path: 'reporte-expedientes',
    loadComponent: () =>
      import('./reporte-expedientes/reporte-expedientes.component').then(
        (m) => m.ReporteExpedientesComponent
      ),
  },
  {
    path: 'reporte-dece',
    loadComponent: () =>
      import('./reporte-dece/reporte-dece.component').then(
        (m) => m.ReporteDeceComponent
      ),
  },
  {
    path: 'reporte-medico-estudiantes',
    loadComponent: () =>
      import('./reporte-medico-estudiantes/reporte-medico-estudiantes.component').then(
        (m) => m.ReporteMedicoEstudiantesComponent
      ),
  },
  {
    path: 'reporte-medico-docentes',
    loadComponent: () =>
      import('./reporte-medico-docentes/reporte-medico-docentes.component').then(
        (m) => m.ReporteMedicoDocentesComponent
      ),
  },
];
