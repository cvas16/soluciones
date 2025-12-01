import { ADMIN_ROUTES } from './features/project/admin.routes';
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Redirección Principal
  {
    path: '',
    loadChildren: () => import('./features/public/public.routes').then(r => r.PUBLIC_ROUTES)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(r => r.AUTH_ROUTES)
  },
  {
    path: 'project',
    loadChildren: () => import('./features/project/project.routes').then(r => r.PROJECT_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.routes').then(r => r.SETTINGS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/project/admin.routes').then(r => r.ADMIN_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }

];
