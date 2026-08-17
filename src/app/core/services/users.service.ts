import { Injectable, inject, signal } from '@angular/core';
import { ADMIN_EMAILS, AppUser } from '../models/user.model';
import { LocalStorageService, USERS_KEY } from './local-storage.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly storage = inject(LocalStorageService);

  private readonly usersSignal = signal<AppUser[]>(this.storage.getItem<AppUser[]>(USERS_KEY) ?? []);
  readonly users = this.usersSignal.asReadonly();

  getAll(): AppUser[] {
    return this.usersSignal();
  }

  findByEmail(email: string): AppUser | undefined {
    return this.usersSignal().find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  isAdmin(email: string)
  {
    return ADMIN_EMAILS.toLowerCase().split(',').includes(email.toLowerCase());
  }


  create(email: string, name: string, pictureUrl?: string): AppUser {
    const user: AppUser = {
      email,
      name,
      isAdmin: this.isAdmin(email),
      createdAt: new Date().toISOString(),
      pictureUrl
    };
    console.log(user)
    const next = [...this.usersSignal(), user];
    this.usersSignal.set(next);
    this.persist(next);
    return user;
  }

  delete(email: string): void {
    if (this.isAdmin(email)) {
      return;
    }
    const next = this.usersSignal().filter((u) => u.email.toLowerCase() !== email.toLowerCase());
    this.usersSignal.set(next);
    this.persist(next);
  }

  /** Forces isAdmin=true for the fixed admin email, even if the stored record says otherwise. */
  ensureAdminFlagConsistency(user: AppUser): AppUser {
    if (user.isAdmin) {
      const fixed: AppUser = { ...user, isAdmin: true };
      const next = this.usersSignal().map((u) => (u.email.toLowerCase() === fixed.email.toLowerCase() ? fixed : u));
      this.usersSignal.set(next);
      this.persist(next);
      return fixed;
    }
    return user;
  }

  private persist(users: AppUser[]): void {
    this.storage.setItem(USERS_KEY, users);
  }
}
