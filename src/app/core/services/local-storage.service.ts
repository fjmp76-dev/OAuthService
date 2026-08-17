import { Injectable } from '@angular/core';

export const USERS_KEY = 'oauth-service.users';
export const SESSION_KEY = 'oauth-service.session';
export const TOKEN_KEY = 'oauth-service.token';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  getItem<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage unavailable (private mode, quota, etc.) — fail silently, session just won't persist.
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}
