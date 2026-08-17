import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IndexStatus } from '../models/index-status.model';
import { LibrarySection } from '../models/library-section.model';

@Injectable({ providedIn: 'root' })
export class IndexingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getLibrarySections(): Observable<LibrarySection[]> {
    return this.http.get<LibrarySection[]>(`${this.baseUrl}/api/library/sections`);
  }

  getIndexStatus(): Observable<IndexStatus> {
    return this.http.get<IndexStatus>(`${this.baseUrl}/api/index/status`);
  }

  /** Mirrors PlexApiClient.TriggerReindexAsync, which only checks response.IsSuccessStatusCode. */
  triggerReindex(): Observable<boolean> {
    return this.http
      .post(`${this.baseUrl}/api/index/refresh`, null, { observe: 'response' })
      .pipe(map((res) => res.ok));
  }
}
