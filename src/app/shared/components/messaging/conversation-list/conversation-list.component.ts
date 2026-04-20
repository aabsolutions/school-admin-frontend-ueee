import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '@core/service/messaging-api.service';

@Component({
  selector: 'app-conversation-list',
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ConversationListComponent {
  @Input() conversations: Conversation[] = [];
  @Input() selectedId?: string;
  @Input() currentUserId = '';
  @Output() selectConversation = new EventEmitter<Conversation>();

  getName(conv: Conversation): string {
    if (conv.type === 'group') return conv.name ?? 'Grupo';
    const other = conv.participants.find((p) => p.userId !== this.currentUserId);
    return other?.name ?? 'Conversación';
  }

  getAvatar(conv: Conversation): string {
    const other = conv.participants.find((p) => p.userId !== this.currentUserId);
    return other?.avatar ?? 'assets/images/user/user1.jpg';
  }

  getLastMessage(conv: Conversation): string {
    if (!conv.lastMessage) return 'Sin mensajes';
    const content = (conv.lastMessage as any).content ?? '';
    return content.length > 38 ? content.slice(0, 38) + '…' : content;
  }

  hasUnread(conv: Conversation): boolean {
    if (!conv.lastMessage) return false;
    const msg = conv.lastMessage as any;
    return !msg.readBy?.some((r: any) => r.userId === this.currentUserId);
  }
}
