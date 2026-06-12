import { Injectable } from '@angular/core';
import { switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { NgxRolesService, NgxPermissionsService } from 'ngx-permissions';
import { User } from '@core/models/interface';

@Injectable({
  providedIn: 'root',
})
export class StartupService {
  constructor(
    private rolesService: NgxRolesService,
    private permissonsService: NgxPermissionsService,
    private authService: AuthService
  ) {}

  /**
   * Load the application only after get the menu or other essential informations
   * such as permissions and roles.
   */

  // load(user: User) {
  //   return this.setPermissions(user);
  // }

  load() {
    return this.authService
      .change()
      .pipe(
        tap((user) => {
          return this.setPermissions(user);
        })
      )
      .subscribe();
  }

  private setPermissions(user: User) {
    const roleNames: string[] = user['roles']?.map((e: any) => e['name']) || [];
    const allPermissions = [...(user.permissions || []), ...roleNames];

    this.permissonsService.loadPermissions(allPermissions);
    this.rolesService.flushRoles();

    const role: any = {};
    roleNames.forEach((name) => {
      role[name] = allPermissions;
    });
    this.rolesService.addRolesWithPermissions(role);
  }
}
