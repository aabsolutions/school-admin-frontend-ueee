import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Participant {
  userId: string;
  role: string;
  name: string;
  avatar?: string;
}

export interface Conversation {
  _id: string;
  type: 'direct' | 'group';
  participants: Participant[];
  name?: string;
  lastMessage?: Message;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: string;
  readBy: { userId: string; readAt: string }[];
  createdAt: string;
}

export interface CreateConversationPayload {
  type: 'direct' | 'group';
  participantIds: string[];
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class MessagingApiService {
  private readonly base = `${environment.apiUrl}/messaging`;

  constructor(private http: HttpClient) {}

  getConversations(): Observable<Conversation[]> {
    return this.http
      .get<{ data: Conversation[] }>(`${this.base}/conversations`)
      .pipe(map((r) => r.data));
  }

  createConversation(payload: CreateConversationPayload): Observable<Conversation> {
    return this.http
      .post<{ data: Conversation }>(`${this.base}/conversations`, payload)
      .pipe(map((r) => r.data));
  }

  getConversation(id: string): Observable<Conversation> {
    return this.http
      .get<{ data: Conversation }>(`${this.base}/conversations/${id}`)
      .pipe(map((r) => r.data));
  }

  updateConversation(id: string, payload: { name?: string; addParticipantIds?: string[] }): Observable<Conversation> {
    return this.http
      .patch<{ data: Conversation }>(`${this.base}/conversations/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  getMessages(conversationId: string, page = 1, limit = 30): Observable<{ data: Message[]; total: number }> {
    return this.http
      .get<{ data: { data: Message[]; total: number } }>(
        `${this.base}/conversations/${conversationId}/messages`,
        { params: { page, limit } },
      )
      .pipe(map((r) => r.data));
  }

  sendMessage(conversationId: string, content: string): Observable<Message> {
    return this.http
      .post<{ data: Message }>(`${this.base}/conversations/${conversationId}/messages`, { content })
      .pipe(map((r) => r.data));
  }

  markRead(conversationId: string): Observable<void> {
    return this.http
      .patch<void>(`${this.base}/conversations/${conversationId}/read`, {})
      .pipe(map(() => undefined));
  }

  getUnreadCount(): Observable<number> {
    return this.http
      .get<{ data: number }>(`${this.base}/unread-count`)
      .pipe(map((r) => r.data));
  }

  getUsers(): Observable<any[]> {
    return this.http
      .get<{ data: any[] }>(`${this.base}/users`)
      .pipe(map((r) => r.data));
  }
}
