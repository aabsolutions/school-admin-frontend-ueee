import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subscription } from 'rxjs';
import { SubSink } from '@shared/sub-sink';
import {
  MessagingApiService,
  Conversation,
  Message,
} from '@core/service/messaging-api.service';
import { MessagingSocketService } from '@core/service/messaging-socket.service';
import { ConversationListComponent } from './conversation-list/conversation-list.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { NewConversationDialogComponent } from './new-conversation-dialog/new-conversation-dialog.component';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { AuthService } from '@core';

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgScrollbar,
    ConversationListComponent,
    ChatWindowComponent,
    BreadcrumbComponent,
  ],
})
export class MessagingComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  selectedConversation?: Conversation;
  messages: Message[] = [];
  loadingMessages = false;
  currentUserId = '';
  searchText = '';

  breadscrums = [{ title: 'Comunicaciones', items: [], active: 'Mensajes' }];

  private subs = new SubSink();
  private messagesSub?: Subscription;

  constructor(
    private api: MessagingApiService,
    private socket: MessagingSocketService,
    private dialog: MatDialog,
    private authService: AuthService,
  ) {}

  get filteredConversations(): Conversation[] {
    const q = this.searchText.trim().toLowerCase();
    if (!q) return this.conversations;
    return this.conversations.filter((c) =>
      this.getConversationName(c).toLowerCase().includes(q),
    );
  }

  ngOnInit(): void {
    this.currentUserId = String(this.authService.currentUserValue?.id ?? '');
    this.socket.connect();
    this.loadConversations();

    this.subs.sink = this.socket.newMessage$.subscribe(({ message, conversationId }) => {
      if (this.selectedConversation?._id === conversationId) {
        this.messages = [...this.messages, message];
        this.socket.markRead(conversationId);
      }
      this.updateLastMessage(conversationId, message);
    });

    this.subs.sink = this.socket.conversationUpdated$.subscribe((updated) => {
      this.conversations = this.conversations.map((c) =>
        c._id === updated._id ? { ...c, ...updated } : c,
      );
    });
  }

  loadConversations(): void {
    this.subs.sink = this.api.getConversations().subscribe((convs) => {
      this.conversations = convs;
    });
  }

  selectConversation(conv: Conversation): void {
    if (this.selectedConversation) {
      this.socket.leaveConversation(this.selectedConversation._id);
    }

    // Cancelar la carga anterior para evitar race conditions.
    this.messagesSub?.unsubscribe();

    this.selectedConversation = conv;
    this.loadingMessages = true;
    this.messages = [];
    this.socket.joinConversation(conv._id);
    this.socket.markRead(conv._id);

    this.messagesSub = this.api.getMessages(conv._id).subscribe({
      next: ({ data }) => {
        this.messages = data;
        this.loadingMessages = false;
      },
      error: () => {
        this.loadingMessages = false;
      },
    });
  }

  sendMessage(content: string): void {
    if (!this.selectedConversation || !content.trim()) return;
    this.socket.sendMessage(this.selectedConversation._id, content);
  }

  openNewConversationDialog(): void {
    const dialogRef = this.dialog.open(NewConversationDialogComponent, {
      width: '500px',
      data: { currentUserId: this.currentUserId },
    });

    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.subs.sink = this.api.createConversation(result).subscribe((conv) => {
          this.conversations = [conv, ...this.conversations];
          this.selectConversation(conv);
        });
      }
    });
  }

  getConversationName(conv: Conversation): string {
    if (conv.type === 'group') return conv.name ?? 'Grupo';
    const other = conv.participants.find((p) => p.userId !== this.currentUserId);
    return other?.name ?? 'Conversación';
  }

  private updateLastMessage(conversationId: string, message: Message): void {
    this.conversations = this.conversations.map((c) =>
      c._id === conversationId ? { ...c, lastMessage: message, updatedAt: message.createdAt } : c,
    );
    this.conversations.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  ngOnDestroy(): void {
    if (this.selectedConversation) {
      this.socket.leaveConversation(this.selectedConversation._id);
    }
    this.messagesSub?.unsubscribe();
    this.subs.unsubscribe();
  }
}
