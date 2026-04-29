import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RolesService } from '../roles.service';
import { RoleConfig } from '@core/models/role-config.model';
import { RoleFormComponent } from '../role-form/role-form.component';
import { RolePermissionsComponent } from '../role-permissions/role-permissions.component';
import { MatCardHeader, MatCard, MatCardContent } from "@angular/material/card";

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCard,
    MatCardContent
],
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss'],
})
export class RolesListComponent implements OnInit {
  roles: RoleConfig[] = [];
  displayedColumns = ['displayName', 'name', 'type', 'permissions', 'actions'];
  loading = false;

  constructor(
    private rolesService: RolesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.loading = true;
    this.rolesService.getAll().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al cargar roles', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  openCreate() {
    const ref = this.dialog.open(RoleFormComponent, {
      width: '480px',
      data: { role: null },
    });
    ref.afterClosed().subscribe((created) => {
      if (created) this.loadRoles();
    });
  }

  openEdit(role: RoleConfig) {
    const ref = this.dialog.open(RoleFormComponent, {
      width: '480px',
      data: { role },
    });
    ref.afterClosed().subscribe((updated) => {
      if (updated) this.loadRoles();
    });
  }

  openPermissions(role: RoleConfig) {
    const ref = this.dialog.open(RolePermissionsComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { role },
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) this.loadRoles();
    });
  }

  deleteRole(role: RoleConfig) {
    if (
      !confirm(
        `¿Eliminar el rol "${role.displayName}"? Esta acción no se puede deshacer.`
      )
    )
      return;
    this.rolesService.delete(role._id).subscribe({
      next: () => {
        this.snackBar.open('Rol eliminado', 'Cerrar', { duration: 3000 });
        this.loadRoles();
      },
      error: (err) => {
        this.snackBar.open(
          err?.error?.message ?? 'Error al eliminar',
          'Cerrar',
          { duration: 3000 }
        );
      },
    });
  }
}
