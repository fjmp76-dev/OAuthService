import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppUser } from '../models/user.model';
import { GoogleCredentialResponse } from '../models/google-identity';
import { decodeJwtPayload, GoogleIdTokenPayload, MicrosoftIdTokenPayload } from '../utils/jwt.util';
import { LocalStorageService, SESSION_KEY, TOKEN_KEY } from './local-storage.service';
import { UsersService } from './users.service';
import { GoogleIdentityService } from './google-identity.service';
import { MicrosoftIdentityService } from './microsoft-identity.service';

export type AuthResult = { ok: true } | { ok: false; message: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(LocalStorageService);
  private readonly usersService = inject(UsersService);
  private readonly googleIdentity = inject(GoogleIdentityService);
  private readonly microsoftIdentity = inject(MicrosoftIdentityService);
  private readonly router = inject(Router);

  private readonly sessionSignal = signal<AppUser | null>(null);
  readonly session = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly isAdmin = computed(() => this.sessionSignal()?.isAdmin ?? false);

  /** Restores a previously persisted session on app bootstrap, re-validating the user against the API. */
  async restoreSession(): Promise<void> {
    const savedEmail = this.storage.getItem<string>(SESSION_KEY);
    const accessToken = this.storage.getItem<string>(TOKEN_KEY) ?? undefined;
    if (!savedEmail || !accessToken) {
      this.clearStoredSession();
      return;
    }

    try {
      await this.usersService.loadAll(accessToken);
    } catch {
      this.clearStoredSession();
      return;
    }

    const user = this.usersService.findByEmail(savedEmail);
    if (!user) {
      this.clearStoredSession();
      return;
    }
    this.sessionSignal.set({ ...this.usersService.ensureAdminFlagConsistency(user), accessToken });
  }

  /** Signs the user in, auto-registering them on first login — no separate sign-up step. */
  async handleGoogleCredential(response: GoogleCredentialResponse): Promise<AuthResult> {
    const payload = decodeJwtPayload<GoogleIdTokenPayload>(response.credential);
    if (!payload?.email) {
      return { ok: false, message: 'Google sign-in failed. Please try again.' };
    }

    await this.usersService.loadAll(response.credential);
    const existing = this.usersService.findByEmail(payload.email);

    if (existing) {
      const user = { ...this.usersService.ensureAdminFlagConsistency(existing), pictureUrl: payload.picture };
      this.setSession(user, response.credential);
      return { ok: true };
    }

    const created = await this.usersService.create(
      payload.email,
      payload.name ?? payload.email,
      payload.picture,
      response.credential
    );
    this.setSession(created, response.credential);
    return { ok: true };
  }

  /** Signs the user in, auto-registering them on first login — no separate sign-up step. */
  async handleMicrosoftCredential(idToken: string): Promise<AuthResult> {
    const payload = decodeJwtPayload<MicrosoftIdTokenPayload>(idToken);
    const email = payload?.email ?? payload?.preferred_username;
    if (!email) {
      return { ok: false, message: 'Microsoft sign-in failed. Please try again.' };
    }

    await this.usersService.loadAll(idToken);
    const existing = this.usersService.findByEmail(email);

    if (existing) {
      this.setSession(this.usersService.ensureAdminFlagConsistency(existing), idToken);
      return { ok: true };
    }

    const created = await this.usersService.create(email, payload?.name ?? email, undefined, idToken);
    this.setSession(created, idToken);
    return { ok: true };
  }

  logout(): void {
    this.clearStoredSession();
    this.googleIdentity.disableAutoSelect();
    void this.microsoftIdentity.logout().catch(() => {});
    void this.router.navigateByUrl('/login');
  }

  private setSession(user: AppUser, accessToken: string): void {
    this.sessionSignal.set({ ...user, accessToken });
    this.storage.setItem(SESSION_KEY, user.email);
    this.storage.setItem(TOKEN_KEY, accessToken);
  }

  private clearStoredSession(): void {
    this.sessionSignal.set(null);
    this.storage.removeItem(SESSION_KEY);
    this.storage.removeItem(TOKEN_KEY);
  }
}
