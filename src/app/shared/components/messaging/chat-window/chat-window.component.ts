import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnInit,
  OnChanges,
  AfterViewChecked,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgScrollbar } from 'ngx-scrollbar';
import { SubSink } from '@shared/sub-sink';
import { Conversation, Message } from '@core/service/messaging-api.service';
import { MessagingSocketService } from '@core/service/messaging-socket.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss'],
  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule, MatIconModule, NgScrollbar],
})
export class ChatWindowComponent implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  @Input() conversation!: Conversation;
  @Input() messages: Message[] = [];
  @Input() currentUserId = '';
  @Output() sendMessage = new EventEmitter<string>();

  @ViewChild(NgScrollbar) private scrollbarRef!: NgScrollbar;
  @ViewChild('messagesEnd') private messagesEnd?: ElementRef;

  messageContent = '';
  typingUser = '';
  private typingTimeout?: ReturnType<typeof setTimeout>;
  private shouldScroll = false;
  private subs = new SubSink();
  private typingInput$ = new Subject<void>();

  constructor(private socket: MessagingSocketService) {}

  ngOnInit(): void {
    this.subs.sink = this.socket.typing$.subscribe((ev) => {
      if (ev.conversationId === this.conversation._id && ev.userId !== this.currentUserId) {
        this.typingUser = ev.name;
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => (this.typingUser = ''), 3000);
      }
    });

    this.subs.sink = this.typingInput$.pipe(debounceTime(300)).subscribe(() => {
      this.socket.emitTyping(this.conversation._id);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages']) {
      this.shouldScroll = true;
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  onInput(): void {
    this.typingInput$.next();
  }

  submit(): void {
    const content = this.messageContent.trim();
    if (!content) return;
    this.sendMessage.emit(content);
    this.messageContent = '';
    this.shouldScroll = true;
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  isMine(msg: Message): boolean {
    return msg.senderId === this.currentUserId;
  }

  getConversationName(): string {
    if (this.conversation.type === 'group') return this.conversation.name ?? 'Grupo';
    const other = this.conversation.participants.find((p) => p.userId !== this.currentUserId);
    return other?.name ?? 'Conversación';
  }

  getAvatar(): string {
    const other = this.conversation.participants.find((p) => p.userId !== this.currentUserId);
    return other?.avatar ?? 'assets/images/user/user1.jpg';
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      if (this.scrollbarRef) {
        void this.scrollbarRef.scrollTo({ top: 999999 });
      }
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.typingTimeout);
    this.subs.unsubscribe();
  }
}
