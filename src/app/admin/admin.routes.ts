import { Route } from '@angular/router';
import { Page404Component } from 'app/authentication/page404/page404.component';

export const ADMIN_ROUTE: Route[] = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTE),
  },
  {
    path: 'teachers',
    loadChildren: () =>
      import('./teachers/admin-teachers.routes').then(
        (m) => m.ADMIN_TEACHER_ROUTE
      ),
  },
  {
    path: 'students',
    loadChildren: () =>
      import('./students/admin-students.routes').then(
        (m) => m.ADMIN_STUDENT_ROUTE
      ),
  },
  {
    path: 'courses',
    loadChildren: () =>
      import('./courses/courses.routes').then((m) => m.COURSE_ROUTE),
  },
  {
    path: 'departments',
    loadChildren: () =>
      import('./departments/departments.routes').then(
        (m) => m.DEPARTMENT_ROUTE
      ),
  },
  {
    path: 'cursos',
    loadChildren: () =>
      import('./cursos/cursos.routes').then((m) => m.CURSOS_ROUTE),
  },
  {
    path: 'curso-lectivo',
    loadChildren: () =>
      import('./curso-lectivo/curso-lectivo.routes').then((m) => m.CURSO_LECTIVO_ROUTE),
  },
  {
    path: 'lista-nomina',
    loadChildren: () =>
      import('./lista-nomina/lista-nomina.routes').then((m) => m.LISTA_NOMINA_ROUTE),
  },
  {
    path: 'reportes',
    loadChildren: () =>
      import('./reportes/reportes.routes').then((m) => m.REPORTES_ROUTE),
  },
  {
    path: 'expedientes',
    loadChildren: () =>
      import('./expedientes/expedientes.routes').then((m) => m.EXPEDIENTES_ROUTE),
  },
  {
    path: 'dece',
    loadChildren: () =>
      import('./dece/dece.routes').then((m) => m.DECE_ROUTE),
  },
  {
    path: 'enrollments',
    loadChildren: () =>
      import('./enrollments/enrollments.routes').then((m) => m.ENROLLMENT_ROUTE),
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./users/users.routes').then((m) => m.USERS_ROUTE),
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./account/account.component').then((m) => m.AccountComponent),
  },
  { path: '**', component: Page404Component },
];
