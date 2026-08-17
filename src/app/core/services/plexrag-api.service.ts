import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgentChatResponse, ChatRequest, SimpleChatResponse } from '../models/plexrag.model';

@Injectable({ providedIn: 'root' })
export class PlexRagApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  askSimple(question: string): Observable<SimpleChatResponse> {
    const body: ChatRequest = { question };
    return this.http.post<SimpleChatResponse>(`${this.baseUrl}/api/chat/simple`, body);
  }

  askAgent(question: string): Observable<AgentChatResponse> {
    const body: ChatRequest = { question };
    return this.http.post<AgentChatResponse>(`${this.baseUrl}/api/chat/agent`, body);
  }
}
