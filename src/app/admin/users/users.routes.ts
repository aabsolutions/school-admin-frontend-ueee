import { Route } from '@angular/router';

export const USERS_ROUTE: Route[] = [
  {
    path: 'all-users',
    loadComponent: () =>
      import('./all-users/all-users.component').then((m) => m.AllUsersComponent),
  },
  {
    path: 'add-user',
    loadComponent: () =>
      import('./add-user/add-user.component').then((m) => m.AddUserComponent),
  },
  { path: '', redirectTo: 'all-users', pathMatch: 'full' },
];
