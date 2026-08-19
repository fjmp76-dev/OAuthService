import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateErrorLogRequest, ErrorLogEntry, ErrorLogResponse, ErrorSource } from '../models/error-log.model';

/** message is stored server-side as "[Source] text" since the API only has a single free-text field. */
const SOURCE_PREFIX = /^\[(API|App)\]\s?(.*)$/s;

@Injectable({ providedIn: 'root' })
export class ErrorLogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  private readonly entriesSignal = signal<ErrorLogEntry[]>([]);
  readonly entries = this.entriesSignal.asReadonly();

  async loadAll(): Promise<void> {
    const response = await firstValueFrom(this.http.get<ErrorLogResponse[]>(`${this.baseUrl}/api/errors`));
    this.entriesSignal.set(response.map((r) => this.toEntry(r)));
  }

  /** Best-effort: posts to the API and swallows failures so a broken logger can't crash the app it's logging for. */
  log(source: ErrorSource, message: string): void {
    const body: CreateErrorLogRequest = { message: `[${source}] ${message}` };
    firstValueFrom(this.http.post<ErrorLogResponse>(`${this.baseUrl}/api/errors`, body))
      .then((response) => {
        const entry = this.toEntry(response);
        this.entriesSignal.update((entries) => [entry, ...entries]);
      })
      .catch(() => {});
  }

  async remove(id: number | string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/api/errors/${id}`));
    this.entriesSignal.update((entries) => entries.filter((e) => e.id !== id));
  }

  /** No bulk-delete endpoint exists, so this deletes every entry one by one. */
  async clear(): Promise<void> {
    await Promise.all(this.entriesSignal().map((entry) => firstValueFrom(this.http.delete<void>(`${this.baseUrl}/api/errors/${entry.id}`))));
    this.entriesSignal.set([]);
  }

  private toEntry(response: ErrorLogResponse): ErrorLogEntry {
    const match = SOURCE_PREFIX.exec(response.message);
    return match
      ? { id: response.id, source: match[1] as ErrorSource, message: match[2] }
      : { id: response.id, source: 'App', message: response.message };
  }
}
