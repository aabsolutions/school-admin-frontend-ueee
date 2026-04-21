import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { LocalStorageService } from '@shared/services';
import { Role } from '@core/models/role';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private router: Router, private store: LocalStorageService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.store.get('currentUser');
    if (currentUser) {
      const userRole = currentUser.roles?.[0]?.name;
      if (!userRole) {
        this.router.navigate(['/authentication/signin']);
        return false;
      }

      // SUPERADMIN bypasses all role restrictions
      if (userRole === Role.SuperAdmin) {
        return true;
      }

      // Redirect parent to their area if trying to access non-parent routes
      if (userRole === Role.Parent && !state.url.startsWith('/parent')) {
        this.router.navigate(['/parent/dashboard']);
        return false;
      }

      // Check if the route requires a specific role and if the user's role matches
      if (route.data['role'] && route.data['role'].indexOf(userRole) === -1) {
        if (userRole === Role.Parent) {
          this.router.navigate(['/parent/dashboard']);
        } else {
          this.router.navigate(['/authentication/signin']);
        }
        return false;
      }
      return true;
    }

    this.router.navigate(['/authentication/signin']);
    return false;
  }
}
