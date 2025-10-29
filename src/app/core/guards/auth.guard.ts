import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.services';


export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {


  const authService = inject(AuthService);
  const router = inject(Router);


  if (authService.isLoggedIn()) {
    return true;
  }else{

  console.log('AuthGuard: Usuario no autenticado, redirigiendo a login...');
  router.navigateByUrl('/auth/login');
  return false;
  }
};
