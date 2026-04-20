import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MessagingApiService } from '@core/service/messaging-api.service';

@Component({
  selector: 'app-new-conversation-dialog',
  templateUrl: './new-conversation-dialog.component.html',
  styleUrls: ['./new-conversation-dialog.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatRadioModule,
    MatProgressSpinnerModule,
  ],
})
export class NewConversationDialogComponent implements OnInit {
  type: 'direct' | 'group' = 'direct';
  groupName = '';
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  selectedUsers: any[] = [];
  searchControl = new FormControl('');
  loading = true;

  constructor(
    private api: MessagingApiService,
    public dialogRef: MatDialogRef<NewConversationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentUserId: string },
  ) {}

  ngOnInit(): void {
    this.api.getUsers().subscribe({
      next: (users) => {
        this.allUsers = users.filter((u) => u._id !== this.data.currentUserId);
        this.filteredUsers = [...this.allUsers];
        this.loading = false;
      },
      error: () => (this.loading = false),
    });

    this.searchControl.valueChanges.subscribe((q) => {
      const query = (q ?? '').toLowerCase();
      this.filteredUsers = this.allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query),
      );
    });
  }

  toggleUser(user: any): void {
    const idx = this.selectedUsers.findIndex((u) => u._id === user._id);
    if (idx === -1) {
      if (this.type === 'direct') {
        this.selectedUsers = [user];
      } else {
        this.selectedUsers.push(user);
      }
    } else {
      this.selectedUsers.splice(idx, 1);
    }
  }

  isSelected(user: any): boolean {
    return this.selectedUsers.some((u) => u._id === user._id);
  }

  canCreate(): boolean {
    if (this.selectedUsers.length === 0) return false;
    if (this.type === 'direct') return this.selectedUsers.length === 1;
    return this.groupName.trim().length > 0 && this.selectedUsers.length >= 1;
  }

  create(): void {
    if (!this.canCreate()) return;
    this.dialogRef.close({
      type: this.type,
      participantIds: this.selectedUsers.map((u) => u._id),
      name: this.type === 'group' ? this.groupName.trim() : undefined,
    });
  }
}
