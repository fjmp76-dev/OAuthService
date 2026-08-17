import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login-page').then((m) => m.LoginPage)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layout/app-shell').then((m) => m.AppShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'plexrag' },
      {
        path: 'plexrag',
        loadChildren: () => import('./features/plexrag/plexrag.routes').then((m) => m.PLEXRAG_ROUTES)
      },
      {
        path: 'indexing',
        canActivate: [adminGuard],
        loadChildren: () => import('./features/indexing/indexing.routes').then((m) => m.INDEXING_ROUTES)
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadChildren: () => import('./features/users/users.routes').then((m) => m.USERS_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: 'plexrag' }
];
