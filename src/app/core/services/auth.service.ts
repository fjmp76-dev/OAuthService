import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppUser } from '../models/user.model';
import { GoogleCredentialResponse } from '../models/google-identity';
import { decodeJwtPayload, GoogleIdTokenPayload, MicrosoftIdTokenPayload } from '../utils/jwt.util';
import { LocalStorageService, SESSION_KEY, TOKEN_KEY } from './local-storage.service';
import { UsersService } from './users.service';
import { GoogleIdentityService } from './google-identity.service';
import { MicrosoftIdentityService } from './microsoft-identity.service';

export type AuthMode = 'signin' | 'signup';
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

  /** Restores a previously persisted session on app bootstrap. */
  restoreSession(): void {
    const savedEmail = this.storage.getItem<string>(SESSION_KEY);
    if (!savedEmail) {
      return;
    }
    const user = this.usersService.findByEmail(savedEmail);
    if (!user) {
      this.storage.removeItem(SESSION_KEY);
      return;
    }
    const accessToken = this.storage.getItem<string>(TOKEN_KEY) ?? undefined;
    this.sessionSignal.set({ ...this.usersService.ensureAdminFlagConsistency(user), accessToken });
  }

  handleGoogleCredential(response: GoogleCredentialResponse, mode: AuthMode): AuthResult {
    const payload = decodeJwtPayload<GoogleIdTokenPayload>(response.credential);
    if (!payload?.email) {
      return { ok: false, message: 'Google sign-in failed. Please try again.' };
    }

    const existing = this.usersService.findByEmail(payload.email);

    if (mode === 'signin') {
      if (!existing) {
        return { ok: false, message: 'User not found. Please sign up first.' };
      }
      this.setSession(this.usersService.ensureAdminFlagConsistency(existing), response.credential);
      return { ok: true };
    }

    // signup
    if (existing) {
      return { ok: false, message: 'This user already exists. Please sign in instead.' };
    }
    const created = this.usersService.create(payload.email, payload.name ?? payload.email, payload.picture);
    this.setSession(created, response.credential);
    return { ok: true };
  }

  handleMicrosoftCredential(idToken: string, mode: AuthMode): AuthResult {
    const payload = decodeJwtPayload<MicrosoftIdTokenPayload>(idToken);
    const email = payload?.email ?? payload?.preferred_username;
    if (!email) {
      return { ok: false, message: 'Microsoft sign-in failed. Please try again.' };
    }

    const existing = this.usersService.findByEmail(email);

    if (mode === 'signin') {
      if (!existing) {
        return { ok: false, message: 'User not found. Please sign up first.' };
      }
      this.setSession(this.usersService.ensureAdminFlagConsistency(existing), idToken);
      return { ok: true };
    }

    // signup
    if (existing) {
      return { ok: false, message: 'This user already exists. Please sign in instead.' };
    }
    const created = this.usersService.create(email, payload?.name ?? email);
    this.setSession(created, idToken);
    return { ok: true };
  }

  logout(): void {
    this.sessionSignal.set(null);
    this.storage.removeItem(SESSION_KEY);
    this.storage.removeItem(TOKEN_KEY);
    this.googleIdentity.disableAutoSelect();
    void this.microsoftIdentity.logout().catch(() => {});
    void this.router.navigateByUrl('/login');
  }

  private setSession(user: AppUser, accessToken: string): void {
    this.sessionSignal.set({ ...user, accessToken });
    this.storage.setItem(SESSION_KEY, user.email);
    this.storage.setItem(TOKEN_KEY, accessToken);
  }
}
