import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { rowsAnimation } from '@shared';
import { AppUser } from './user.model';
import { UserService } from './user.service';
import { UserFormDialogComponent } from './dialogs/form-dialog/form-dialog.component';
import { UserDeleteComponent } from './dialogs/delete/delete.component';
import { UserResetPasswordComponent } from './dialogs/reset-password/reset-password.component';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  animations: [rowsAnimation],
  imports: [
    BreadcrumbComponent,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatCheckboxModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatChipsModule,
  ],
})
export class AllUsersComponent implements OnInit, OnDestroy {
  displayedColumns = ['username', 'name', 'email', 'role', 'isActive', 'actions'];

  dataSource = new MatTableDataSource<AppUser>([]);
  isLoading = true;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  breadscrums = [{ title: 'All Users', items: ['User Management'], active: 'All Users' }];

  constructor(
    public dialog: MatDialog,
    public userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  applyFilter(event: Event) {
    const val = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = val;
  }

  openDialog(action: 'add' | 'edit', user?: AppUser) {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      maxWidth: '100vw',
      data: { action, user: user ?? new AppUser() },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      if (action === 'add') {
        this.dataSource.data = [result, ...this.dataSource.data];
      } else {
        const idx = this.dataSource.data.findIndex((u) => u.id === result.id);
        if (idx !== -1) {
          this.dataSource.data[idx] = result;
          this.dataSource._updateChangeSubscription();
        }
      }
      this.notify(action === 'add' ? 'snackbar-success' : 'black', `${action === 'add' ? 'User created' : 'User updated'} successfully`);
    });
  }

  toggleStatus(user: AppUser) {
    this.userService.toggleStatus(user.id).subscribe({
      next: (updated) => {
        const idx = this.dataSource.data.findIndex((u) => u.id === updated.id);
        if (idx !== -1) {
          this.dataSource.data[idx] = updated;
          this.dataSource._updateChangeSubscription();
        }
      },
      error: console.error,
    });
  }

  resetPassword(user: AppUser) {
    const dialogRef = this.dialog.open(UserResetPasswordComponent, {
      data: { id: user.id, name: user.name, username: user.username },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.notify('snackbar-success', `Password reset to username for ${user.username}`);
    });
  }

  deleteItem(user: AppUser) {
    const dialogRef = this.dialog.open(UserDeleteComponent, {
      data: { id: user.id, name: user.name, username: user.username },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.dataSource.data = this.dataSource.data.filter((u) => u.id !== user.id);
      this.notify('snackbar-danger', 'User deleted successfully');
    });
  }

  private notify(color: string, text: string, from: MatSnackBarVerticalPosition = 'bottom', align: MatSnackBarHorizontalPosition = 'center') {
    this.snackBar.open(text, '', { duration: 2000, verticalPosition: from, horizontalPosition: align, panelClass: color });
  }

  getRoleColor(role: string): string {
    const map: Record<string, string> = {
      SUPERADMIN: 'primary',
      ADMIN: 'accent',
      TEACHER: 'warn',
      STUDENT: '',
    };
    return map[role] ?? '';
  }
}
