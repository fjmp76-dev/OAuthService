import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ADMIN_EMAILS, AppUser, CreateUserRequest, UserResponse } from '../models/user.model';

function authHeaders(token?: string): HttpHeaders | undefined {
  return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  private readonly usersSignal = signal<AppUser[]>([]);
  readonly users = this.usersSignal.asReadonly();

  /**
   * Fetches the user directory from the API. `token` is required to look users up before a session
   * exists (sign-in/sign-up checks, session restore) — the freshly obtained Google/Microsoft ID token
   * is passed explicitly since the auth interceptor only attaches an already-established session's token.
   */
  async loadAll(token?: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.get<UserResponse[]>(`${this.baseUrl}/api/users`, { headers: authHeaders(token) })
    );
    this.usersSignal.set(response.map((r) => this.toAppUser(r)));
  }

  getAll(): AppUser[] {
    return this.usersSignal();
  }

  findByEmail(email: string): AppUser | undefined {
    return this.usersSignal().find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  isAdmin(email: string): boolean {
    return ADMIN_EMAILS.toLowerCase().split(',').includes(email.toLowerCase());
  }

  async create(email: string, name: string, pictureUrl?: string, token?: string): Promise<AppUser> {
    const body: CreateUserRequest = {
      email,
      name,
      role: this.isAdmin(email) ? 'Admin' : 'User',
      createdAt: new Date().toISOString()
    };
    const response = await firstValueFrom(
      this.http.post<UserResponse>(`${this.baseUrl}/api/users`, body, { headers: authHeaders(token) })
    );
    const user = this.toAppUser(response, pictureUrl);
    this.usersSignal.update((users) => [...users, user]);
    return user;
  }

  async delete(email: string): Promise<void> {
    if (this.isAdmin(email)) {
      return;
    }
    await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/api/users/${encodeURIComponent(email)}`));
    this.usersSignal.update((users) => users.filter((u) => u.email.toLowerCase() !== email.toLowerCase()));
  }

  /** Forces isAdmin=true for the fixed admin email, in case the API's role disagrees (there is no update endpoint to correct it server-side). */
  ensureAdminFlagConsistency(user: AppUser): AppUser {
    if (this.isAdmin(user.email) && !user.isAdmin) {
      const fixed: AppUser = { ...user, isAdmin: true };
      this.usersSignal.update((users) =>
        users.map((u) => (u.email.toLowerCase() === fixed.email.toLowerCase() ? fixed : u))
      );
      return fixed;
    }
    return user;
  }

  private toAppUser(response: UserResponse, pictureUrl?: string): AppUser {
    return {
      email: response.email,
      name: response.name,
      isAdmin: this.isAdmin(response.email),
      createdAt: response.createdAt,
      pictureUrl
    };
  }
}
