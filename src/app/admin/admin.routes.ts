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
    path: 'materias',
    loadChildren: () =>
      import('./materias/materias.routes').then((m) => m.MATERIAS_ROUTE),
  },
  {
    path: 'carga-horaria',
    loadChildren: () =>
      import('./carga-horaria/carga-horaria.routes').then((m) => m.CARGA_HORARIA_ROUTE),
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
    path: 'gestion-documental',
    loadChildren: () =>
      import('./gestion-documental/gestion-documental.routes').then(
        (m) => m.GESTION_DOCUMENTAL_ROUTE
      ),
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
    path: 'area-estudio',
    loadChildren: () =>
      import('./area-estudio/area-estudio.routes').then((m) => m.AREA_ESTUDIO_ROUTE),
  },
  {
    path: 'institucion',
    loadChildren: () =>
      import('./institucion/institucion.routes').then((m) => m.INSTITUCION_ROUTE),
  },
  {
    path: 'messaging',
    loadChildren: () =>
      import('./messaging/messaging.routes').then((m) => m.ADMIN_MESSAGING_ROUTE),
  },
  {
    path: 'parents',
    loadChildren: () =>
      import('./parents/parents.routes').then((m) => m.PARENTS_ROUTE),
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./account/account.component').then((m) => m.AccountComponent),
  },
  {
    path: 'roles',
    loadChildren: () =>
      import('./roles/admin-roles.routes').then((m) => m.ROLES_ROUTE),
  },
  { path: '**', component: Page404Component },
];
