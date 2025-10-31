import { Routes } from '@angular/router';
import { ProfilePage } from './pages/profile-page/profile-page';

export const SETTINGS_ROUTES: Routes = [
  {
    path: 'profile',
    component: ProfilePage
  },
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full'
  }
];
