// En: src/app/features/auth/auth.routes.ts
import { Routes } from '@angular/router';
import { LoginPage } from './login-page/login-page';
import { RegisterPage } from './register-page/register-page';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
