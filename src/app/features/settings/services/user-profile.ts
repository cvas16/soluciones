import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserProfile {
  constructor() { }
  getUserProfile(): Observable<any> {
    console.warn('--- MODO SIMULACIÓN: getUserProfile ---');
    const mockUser = {
      username: 'usuario_simulado',
      email: 'usuario@simulado.com'
    };
    return of(mockUser).pipe(delay(500));
  }

  updateUserProfile(profileData: { username: string; email: string }): Observable<any> {
    console.warn('--- MODO SIMULACIÓN: updateUserProfile ---');
    console.log('Datos a actualizar (simulado):', profileData);
    return of({ success: true, user: profileData }).pipe(delay(1000));
  }

  changePassword(passwordData: any): Observable<any> {
    console.warn('--- MODO SIMULACIÓN: changePassword ---');
    if (passwordData.currentPassword !== '123456') {
      return throwError(() => new Error('La contraseña actual es incorrecta')).pipe(delay(1000));
    }
    console.log('Contraseña cambiada (simulado)');
    return of({ success: true }).pipe(delay(1000));
  }
}
