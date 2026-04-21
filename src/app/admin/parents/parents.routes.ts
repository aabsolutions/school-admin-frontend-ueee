import { Route } from '@angular/router';

export const PARENTS_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'all-parents',
    pathMatch: 'full',
  },
  {
    path: 'all-parents',
    loadComponent: () =>
      import('./all-parents/all-parents.component').then((m) => m.AllParentsComponent),
  },
  {
    path: 'add-parent',
    loadComponent: () =>
      import('./add-parent/add-parent.component').then((m) => m.AddParentComponent),
  },
  {
    path: 'edit-parent/:id',
    loadComponent: () =>
      import('./edit-parent/edit-parent.component').then((m) => m.EditParentComponent),
  },
];
