import { Route } from '@angular/router';
import { Page404Component } from 'app/authentication/page404/page404.component';

export const ADMIN_ASISTENCIAS_ROUTE: Route[] = [
  {
    path: 'config',
    loadComponent: () =>
      import('./config/attendance-config.component').then(
        (m) => m.AttendanceConfigComponent,
      ),
  },
  {
    path: 'reporte',
    loadComponent: () =>
      import('./reporte/attendance-report.component').then(
        (m) => m.AttendanceReportComponent,
      ),
  },
  {
    path: 'captura',
    loadComponent: () =>
      import('../../teacher/asistencias/registro/attendance-registro.component').then(
        (m) => m.AttendanceRegistroComponent,
      ),
  },
  { path: '**', redirectTo: 'config' },
];
