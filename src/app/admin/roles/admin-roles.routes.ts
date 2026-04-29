import { Route } from '@angular/router';

export const ROLES_ROUTE: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./roles-list/roles-list.component').then(
        (m) => m.RolesListComponent
      ),
  },
];
