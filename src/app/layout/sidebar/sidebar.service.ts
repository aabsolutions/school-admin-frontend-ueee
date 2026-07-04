import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { RouteInfo } from './sidebar.metadata';
import { LocalStorageService } from '@shared/services';
import { Role } from '@core/models/role';

const FIXED_ROLES = new Set<string>([Role.Teacher, Role.Student, Role.Parent]);

// Landing route after login for each fixed role — always shown regardless of
// sidebarPermissions configuration (mirrors the same exemption in auth.guard.ts).
const BASE_DASHBOARD: Record<string, string> = {
  [Role.Teacher]: '/teacher/dashboard',
  [Role.Student]: '/student/dashboard',
  [Role.Parent]: '/parent/dashboard',
};

@Injectable({ providedIn: 'root' })
export class SidebarService {
  constructor(
    private http: HttpClient,
    private store: LocalStorageService
  ) {}

  /**
   * Get sidebar menu items from JSON file, filtered by user role/permissions
   */
  getRouteInfo(): Observable<RouteInfo[]> {
    return this.http
      .get<{ routes: RouteInfo[] }>('assets/data/routes.json')
      .pipe(map((response) => this.filterRoutes(response.routes)));
  }

  private filterRoutes(routes: RouteInfo[]): RouteInfo[] {
    const currentUser = this.store.get('currentUser');
    const userRole: string = currentUser?.roles?.[0]?.name ?? '';
    const permissions: string[] = this.store.get('sidebarPermissions') ?? [];
    const permissionsConfigured: boolean = this.store.get('permissionsConfigured') ?? false;

    const filtered = routes
      .map((item) => this.filterItem(item, userRole, permissions, permissionsConfigured))
      .filter((item): item is RouteInfo => item !== null);

    return this.removeOrphanedGroupTitles(filtered);
  }

  /** Elimina group titles que no tienen ningún ítem visible inmediatamente debajo */
  private removeOrphanedGroupTitles(routes: RouteInfo[]): RouteInfo[] {
    return routes.filter((item, index) => {
      if (!item.groupTitle) return true;
      const next = routes[index + 1];
      return next !== undefined && !next.groupTitle;
    });
  }

  private filterItem(
    item: RouteInfo,
    userRole: string,
    permissions: string[],
    permissionsConfigured: boolean
  ): RouteInfo | null {
    // SuperAdmin: sees everything
    if (userRole === Role.SuperAdmin) {
      return item;
    }

    // Teacher / Student / Parent: static role[] array check, PLUS sidebarPermissions
    // once a SuperAdmin has explicitly saved a selection for this role.
    // permissionsConfigured=false → not configured yet → legacy unrestricted-by-role behavior.
    if (FIXED_ROLES.has(userRole)) {
      const hasRoleRestriction = !!item.role && item.role[0] !== '';
      if (hasRoleRestriction && !item.role.includes(userRole)) return null;

      const filteredSubmenu = item.submenu
        .map((sub) => this.filterItem(sub, userRole, permissions, permissionsConfigured))
        .filter((sub): sub is RouteInfo => sub !== null);

      // Container (no own path, has children): visible only if a child survived
      if (!item.path && item.submenu.length > 0) {
        if (filteredSubmenu.length === 0) return null;
        return { ...item, submenu: filteredSubmenu };
      }

      // Leaf item: enforce configured permissions, if any
      if (item.path && permissionsConfigured && !permissions.includes(item.path)) {
        return null;
      }

      return { ...item, submenu: filteredSubmenu };
    }

    // Admin + custom roles: use dynamic sidebarPermissions

    // Group titles: auto-visible (shown/hidden by surrounding context in sidebar component)
    if (item.groupTitle) {
      return item;
    }

    // Submenu container (path: "", has children): show only if at least one child is visible
    if (!item.path && item.submenu.length > 0) {
      const filteredSubmenu = item.submenu
        .map((sub) => this.filterItem(sub, userRole, permissions, permissionsConfigured))
        .filter((sub): sub is RouteInfo => sub !== null);
      if (filteredSubmenu.length === 0) return null;
      return { ...item, submenu: filteredSubmenu };
    }

    // Leaf item with path: check against permissions array
    if (item.path) {
      if (!permissions.includes(item.path)) return null;
      return { ...item, submenu: [] };
    }

    return null;
  }
}
