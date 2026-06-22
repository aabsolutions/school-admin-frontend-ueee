import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { TeachersService } from '../../teachers.service';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  id?: string | number;
  ids?: string[];
  name?: string;
  department?: string;
  mobile?: string;
}

@Component({
    selector: 'app-teachers-delete',
    templateUrl: './delete.component.html',
    styleUrls: ['./delete.component.scss'],
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatButtonModule,
        MatDialogClose,
    ]
})
export class TeachersDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<TeachersDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public teachersService: TeachersService
  ) {}

  get isBulk(): boolean {
    return Array.isArray(this.data.ids) && this.data.ids.length > 0;
  }

  confirmDelete(): void {
    if (this.isBulk) {
      this.teachersService.deleteTeachersBulk(this.data.ids!).subscribe({
        next: (response) => this.dialogRef.close(response),
        error: (error) => console.error('Bulk Delete Error:', error),
      });
    } else {
      this.teachersService.deleteTeacher(this.data.id!).subscribe({
        next: (response) => this.dialogRef.close(response),
        error: (error) => console.error('Delete Error:', error),
      });
    }
  }
}
