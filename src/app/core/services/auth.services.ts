import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment.development';

interface LoginResponse {
  token: string;
}

@Injectable({providedIn: 'root'})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);
  private router = inject(Router);

  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }


  login(credentials: { username: string; password: string }): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
            localStorage.setItem('authToken', response.token);
            this.loggedIn.next(true);
            console.log('Login exitoso, token guardado');
          }),
        catchError(error => {
          console.error('Error en el login:', error);
          return throwError(() => new Error('Credenciales inválidas'));
        })
      );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.loggedIn.next(false);
    this.router.navigateByUrl('/auth/login');
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
}
