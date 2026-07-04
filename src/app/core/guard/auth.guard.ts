import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { LocalStorageService } from '@shared/services';
import { Role } from '@core/models/role';

const SYSTEM_ROLES = new Set<string>(Object.values(Role));
const FIXED_ROLES = new Set<string>([Role.Teacher, Role.Student, Role.Parent]);

// Landing route after login for each fixed role — always reachable regardless of
// sidebarPermissions configuration, so a SuperAdmin can never lock a role out of
// its own home screen by forgetting to tick it (previously caused a hard lockout /
// infinite redirect loop for Parent).
const BASE_DASHBOARD: Record<string, string> = {
  [Role.Teacher]: '/teacher/dashboard',
  [Role.Student]: '/student/dashboard',
  [Role.Parent]: '/parent/dashboard',
};

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private router: Router, private store: LocalStorageService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const currentUser = this.store.get('currentUser');
    if (!currentUser) {
      this.router.navigate(['/authentication/signin']);
      return false;
    }

    const userRole: string = currentUser.roles?.[0]?.name ?? '';
    if (!userRole) {
      this.router.navigate(['/authentication/signin']);
      return false;
    }

    // SuperAdmin: bypass all restrictions
    if (userRole === Role.SuperAdmin) return true;

    // Custom roles (not in system enum): treat as Admin, allow /admin/** only
    if (!SYSTEM_ROLES.has(userRole)) {
      if (!state.url.startsWith('/admin')) {
        this.router.navigate(['/admin/dashboard/main']);
        return false;
      }
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

    // Fixed roles: once a SuperAdmin has explicitly saved a permission selection
    // for this role, block direct URL navigation to items hidden from the menu.
    // Not configured yet → no extra restriction (legacy behavior).
    if (FIXED_ROLES.has(userRole)) {
      const permissionsConfigured: boolean = this.store.get('permissionsConfigured') ?? false;
      const permissions: string[] = this.store.get('sidebarPermissions') ?? [];
      if (permissionsConfigured) {
        const path = state.url.split('?')[0];
        const isBaseDashboard = path === BASE_DASHBOARD[userRole];
        const allowed = isBaseDashboard || permissions.some((p) => path === p || path.startsWith(`${p}/`));
        if (!allowed) {
          if (userRole === Role.Parent) {
            this.router.navigate(['/parent/dashboard']);
          } else {
            this.router.navigate(['/authentication/signin']);
          }
          return false;
        }
      }
    }

    return true;
  }
}
