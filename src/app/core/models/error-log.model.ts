export type ErrorSource = 'API' | 'App';

export interface ErrorLogEntry {
  id: number | string;
  source: ErrorSource;
  message: string;
}

/** Mirrors PlexRag.Application.Dtos, consumed via the /api/errors endpoints. */
export interface ErrorLogResponse {
  id: number | string;
  message: string;
}

export interface CreateErrorLogRequest {
  message: string;
}
