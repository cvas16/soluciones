import { Routes } from '@angular/router';
import { AdminUsersPage } from './pages/admin-users-page/admin-users-page';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'users',
    component: AdminUsersPage
  },
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  }
];
