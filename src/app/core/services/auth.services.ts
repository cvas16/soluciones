import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError, of } from 'rxjs';
import { environment } from '../../../environments/environment.development';
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

  // BehaviorSubject para mantener el estado de autenticación (opcional pero útil)
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable(); // Observable para suscribirse

  // Señal para el estado de autenticación (alternativa moderna)
  // isLoggedInSignal = signal<boolean>(this.hasToken());

  /** Verifica si hay un token en localStorage */
  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('authToken', response.token);
            this.loggedIn.next(true); // Actualiza el BehaviorSubject
            // this.isLoggedInSignal.set(true); // Actualiza la señal
            console.log('Login exitoso, token guardado');
          } else {
             // Si la API no devuelve token, lanza un error o maneja como fallo
             throw new Error('No se recibió token del servidor');
          }
        }),
        catchError(error => {
          console.error('Error en el login:', error);
          localStorage.removeItem('authToken'); // Asegura que no quede token viejo
          this.loggedIn.next(false);
          // this.isLoggedInSignal.set(false);
          return throwError(() => new Error('Credenciales inválidas o error del servidor')); // Propaga un error manejable
        })
      );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.loggedIn.next(false);
    // this.isLoggedInSignal.set(false);
    console.log('Token eliminado, cerrando sesión');
    this.router.navigateByUrl('/auth/login');
  }

  /** Método usado por el AuthGuard */
  isLoggedIn(): boolean {
    // Podrías añadir lógica de validación de expiración aquí si decodificas el token
    const token = this.getToken();
    // Aquí podrías decodificar el token y verificar la fecha de expiración
    // import { jwtDecode } from 'jwt-decode'; // Necesitarías instalar jwt-decode
    // if (token) {
    //   try {
    //     const decoded: { exp: number } = jwtDecode(token);
    //     const isExpired = Date.now() >= decoded.exp * 1000;
    //     if (isExpired) {
    //       this.logout(); // Cierra sesión si expiró
    //       return false;
    //     }
    //     return true;
    //   } catch (error) {
    //     console.error("Error decodificando token", error);
    //     this.logout(); // Token inválido, cierra sesión
    //     return false;
    //   }
    // }
    return !!token; // Verificación simple por ahora
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Método de Registro (Ejemplo)
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap(() => console.log('Registro exitoso')),
      catchError(error => {
        console.error('Error en el registro:', error);
        return throwError(() => new Error('Error al registrar usuario'));
      })
    );
  }
}
