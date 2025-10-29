
import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { ProjectPage } from './pages/project-page/project-page';

export const PROJECT_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: DashboardPage
  },
  {
    path: ':id',
    component: ProjectPage
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {

    path: '**',
    redirectTo: 'dashboard'
  }
];
