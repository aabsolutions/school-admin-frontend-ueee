import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '@environments/environment';
import { TokenService } from './token.service';
import { AppNotification } from './notifications-api.service';

@Injectable({ providedIn: 'root' })
export class NotificationsSocketService implements OnDestroy {
  private socket?: Socket;
  readonly newNotification$ = new Subject<AppNotification>();

  constructor(private tokenService: TokenService) {}

  connect(): void {
    if (this.socket?.connected) return;

    const rawToken = this.tokenService.getBearerToken().replace(/^Bearer\s+/i, '').trim();
    const socketUrl = environment.apiUrl.replace('/api', '');

    this.socket = io(`${socketUrl}/notifications`, {
      auth: { token: rawToken },
      transports: ['polling', 'websocket'],
    });

    this.socket.on('new-notification', (n: AppNotification) => this.newNotification$.next(n));
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
