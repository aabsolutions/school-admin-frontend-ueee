import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  MatTreeModule,
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FlatTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { RolesService } from '../roles.service';
import { RoleConfig } from '@core/models/role-config.model';
import { RouteInfo } from '../../../layout/sidebar/sidebar.metadata';

// Nested node (matches RouteInfo)
interface PermNode {
  title: string;
  path: string;
  groupTitle: boolean;
  children: PermNode[];
}

// Flat node for FlatTreeControl
interface FlatPermNode {
  title: string;
  path: string;
  groupTitle: boolean;
  level: number;
  expandable: boolean;
}

const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN'];

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTreeModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.scss'],
})
export class RolePermissionsComponent implements OnInit {
  treeControl = new FlatTreeControl<FlatPermNode>(
    (n) => n.level,
    (n) => n.expandable
  );

  private transformer = (node: PermNode, level: number): FlatPermNode => ({
    title: node.title,
    path: node.path,
    groupTitle: node.groupTitle,
    level,
    expandable: node.children.length > 0,
  });

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    (n) => n.level,
    (n) => n.expandable,
    (n) => n.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  /** Tracks which LEAF nodes (with path) are checked */
  selection = new SelectionModel<string>(true /* multiple */);

  loading = false;
  saving = false;

  constructor(
    private http: HttpClient,
    private rolesService: RolesService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<RolePermissionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { role: RoleConfig }
  ) {}

  ngOnInit() {
    this.loading = true;
    this.http
      .get<{ routes: RouteInfo[] }>('assets/data/routes.json')
      .subscribe({
        next: (res) => {
          const adminRoutes = res.routes.filter(
            (r) =>
              r.groupTitle ||
              r.role.some((role) => ADMIN_ROLES.includes(role))
          );
          this.dataSource.data = this.buildTree(adminRoutes);
          this.treeControl.expandAll();
          // Pre-select existing permissions
          this.data.role.sidebarPermissions.forEach((p) =>
            this.selection.select(p)
          );
          this.loading = false;
        },
      });
  }

  private buildTree(routes: RouteInfo[]): PermNode[] {
    return routes
      .filter((r) => {
        if (r.groupTitle) return false;
        // Excluir ítems con roles específicos que no incluyen ADMIN/SUPERADMIN
        // (ej: role: ["TEACHER"]) — son accesibles solo por ese rol, no por roles custom
        const hasRole = r.role && r.role[0] !== '';
        if (hasRole && !r.role.some((role) => ADMIN_ROLES.includes(role))) return false;
        return true;
      })
      .map((r) => ({
        title: r.title,
        path: r.path,
        groupTitle: r.groupTitle,
        children: this.buildTree(r.submenu ?? []),
      }))
      .filter((n) => n.children.length > 0 || !!n.path); // descartar contenedores vacíos
  }

  hasChild = (_: number, node: FlatPermNode) => node.expandable;

  /** Returns leaf descendant paths of a flat node */
  private getLeafPaths(node: FlatPermNode): string[] {
    const results: string[] = [];
    const index = this.treeControl.dataNodes.indexOf(node);
    for (let i = index + 1; i < this.treeControl.dataNodes.length; i++) {
      const n = this.treeControl.dataNodes[i];
      if (n.level <= node.level) break;
      if (!n.expandable && n.path) results.push(n.path);
    }
    return results;
  }

  isLeaf(node: FlatPermNode): boolean {
    return !node.expandable && !!node.path;
  }

  leafChecked(node: FlatPermNode): boolean {
    return this.selection.isSelected(node.path);
  }

  /** All leaves under a parent are checked */
  parentChecked(node: FlatPermNode): boolean {
    const leaves = this.getLeafPaths(node);
    return leaves.length > 0 && leaves.every((p) => this.selection.isSelected(p));
  }

  /** Some (but not all) leaves under a parent are checked */
  parentIndeterminate(node: FlatPermNode): boolean {
    const leaves = this.getLeafPaths(node);
    const checked = leaves.filter((p) => this.selection.isSelected(p));
    return checked.length > 0 && checked.length < leaves.length;
  }

  toggleLeaf(node: FlatPermNode) {
    this.selection.toggle(node.path);
  }

  toggleParent(node: FlatPermNode) {
    const leaves = this.getLeafPaths(node);
    if (this.parentChecked(node)) {
      this.selection.deselect(...leaves);
    } else {
      this.selection.select(...leaves);
    }
  }

  selectAll() {
    const allLeaves = this.treeControl.dataNodes
      .filter((n) => !n.expandable && n.path)
      .map((n) => n.path);
    this.selection.select(...allLeaves);
  }

  clearAll() {
    this.selection.clear();
  }

  save() {
    this.saving = true;
    this.rolesService
      .updatePermissions(this.data.role._id, this.selection.selected)
      .subscribe({
        next: (updated) => {
          this.saving = false;
          this.snackBar.open('Permisos guardados correctamente', 'Cerrar', {
            duration: 3000,
          });
          this.dialogRef.close(updated);
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open(
            err?.error?.message ?? 'Error al guardar permisos',
            'Cerrar',
            { duration: 3000 }
          );
        },
      });
  }
}
