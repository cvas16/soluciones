// En: src/app/app.routes.ts

import { Routes } from '@angular/router';
// Asumiendo que has creado y movido tu guardia a core/guards/
import { authGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  // Redirección Principal
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },

  // Carga perezosa de las RUTAS de autenticación
  {
    path: 'auth',
    // Corregido: apunta a la carpeta features/auth
    loadChildren: () => import('./features/auth/auth.routes').then(r => r.AUTH_ROUTES)
  },
  {
    path: 'project',
    // Corregido: apunta a la carpeta features/project
    loadChildren: () => import('./features/project/project.routes').then(r => r.PROJECT_ROUTES),
    canActivate: [authGuard] // Protege este grupo de rutas
  },


  {
    path: '**',
    redirectTo: 'auth/login' // O redirige a una página 404 si la creas
  }
];
