import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
// 1. Importa 'of' y 'delay' de RxJS para simular
import { Observable, BehaviorSubject, tap, catchError, throwError, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment.development';

// Interfaz para la respuesta del login
interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);
  private router = inject(Router);

  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // --- MÉTODO LOGIN MODIFICADO ---
  login(credentials: { username: string; password: string }): Observable<LoginResponse> {

    console.warn('--- MODO DE SIMULACIÓN DE LOGIN ACTIVO ---');

    // --- INICIO DE SIMULACIÓN (Borra/Comenta esto después) ---
    // 2. Simula una respuesta exitosa del backend con un token falso
    return of({ token: 'un-token-falso-para-desarrollo' }).pipe(
      delay(500), // 3. Simula un pequeño retraso de red
      tap(response => {
        // 4. Esta lógica de 'tap' es la MISMA que la real y se ejecutará
        if (response && response.token) {
          localStorage.setItem('authToken', response.token);
          this.loggedIn.next(true); // Actualiza el estado de autenticación
          console.log('Login simulado exitoso, token falso guardado');
        }
      })
    );
    // --- FIN DE SIMULACIÓN ---

    /*
    // --- CÓDIGO REAL (Descomenta esto cuando conectes el backend) ---
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('authToken', response.token);
            this.loggedIn.next(true);
            console.log('Login exitoso, token guardado');
          } else {
             throw new Error('No se recibió token del servidor');
          }
        }),
        catchError(error => {
          console.error('Error en el login:', error);
          localStorage.removeItem('authToken');
          this.loggedIn.next(false);
          return throwError(() => new Error('Credenciales inválidas o error del servidor'));
        })
      );
    // --- FIN DE CÓDIGO REAL ---
    */
  }

  logout(): void {
    // ... (el resto del servicio se mantiene igual) ...
    localStorage.removeItem('authToken');
    this.loggedIn.next(false);
    console.log('Token eliminado, cerrando sesión');
    this.router.navigateByUrl('/auth/login');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  register(userData: any): Observable<any> {
    // ... (puedes simular esto también si lo necesitas) ...
    console.warn('--- MODO DE SIMULACIÓN DE REGISTRO ACTIVO ---');
    return of({ success: true }).pipe(
      delay(500),
      tap(() => console.log('Registro simulado exitoso'))
    );

    /*
    // --- CÓDIGO REAL ---
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap(() => console.log('Registro exitoso')),
      catchError(error => {
        console.error('Error en el registro:', error);
        return throwError(() => new Error('Error al registrar usuario'));
      })
    );
    */
  }
}
