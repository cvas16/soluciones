import { Routes } from '@angular/router';


export const routes: Routes = [
{
  path: '',
  redirectTo: 'auth/login',
  pathMatch: 'full'
},
{
  path: 'auth',
    loadChildren: () => import('./auth-routes').then(r => r.AUTH_ROUTES)
}
];
