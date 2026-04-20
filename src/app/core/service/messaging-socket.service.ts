import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '@environments/environment';
import { TokenService } from './token.service';
import { Message } from './messaging-api.service';

export interface TypingEvent {
  conversationId: string;
  userId: string;
  name: string;
}

export interface ReadEvent {
  conversationId: string;
  userId: string;
}

@Injectable({ providedIn: 'root' })
export class MessagingSocketService implements OnDestroy {
  private socket?: Socket;

  readonly newMessage$ = new Subject<{ message: Message; conversationId: string }>();
  readonly typing$ = new Subject<TypingEvent>();
  readonly messageRead$ = new Subject<ReadEvent>();
  readonly conversationUpdated$ = new Subject<any>();
  readonly connected$ = new BehaviorSubject<boolean>(false);

  constructor(private tokenService: TokenService) {}

  connect(): void {
    if (this.socket?.connected) return;

    const rawToken = this.tokenService.getBearerToken().replace(/^Bearer\s+/i, '').trim();
    const socketUrl = environment.apiUrl.replace('/api', '');

    this.socket = io(`${socketUrl}/messaging`, {
      auth: { token: rawToken },
      transports: ['polling', 'websocket'],
    });

    this.socket.on('connect', () => this.connected$.next(true));
    this.socket.on('disconnect', () => this.connected$.next(false));

    this.socket.on('new-message', (data) => this.newMessage$.next(data));
    this.socket.on('typing', (data) => this.typing$.next(data));
    this.socket.on('message-read', (data) => this.messageRead$.next(data));
    this.socket.on('conversation-updated', (data) => this.conversationUpdated$.next(data));
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
    this.connected$.next(false);
  }

  joinConversation(conversationId: string): void {
    this.socket?.emit('join-conversation', { conversationId });
  }

  leaveConversation(conversationId: string): void {
    this.socket?.emit('leave-conversation', { conversationId });
  }

  sendMessage(conversationId: string, content: string): void {
    this.socket?.emit('send-message', { conversationId, content });
  }

  emitTyping(conversationId: string): void {
    this.socket?.emit('typing', { conversationId });
  }

  markRead(conversationId: string): void {
    this.socket?.emit('mark-read', { conversationId });
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
