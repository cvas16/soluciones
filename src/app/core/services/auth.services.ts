import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment.development';

interface LoginResponse {
  token: string;
  id: number;
  username: string;
  roles: string[];
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

    return this.http.post<any>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
            localStorage.setItem('authToken', response.token);
            const userToSave = {
            id: response.id,
            username: response.username,
            roles: response.roles
        };
            console.log('Guardando usuario en LS:', userToSave);

        localStorage.setItem('currentUser', JSON.stringify(userToSave));
        this.loggedIn.next(true);
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): { id: number, username: string, roles: string[] } | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  hasRole(role: string): boolean {
      const user = this.getCurrentUser();
      return user ? user.roles.includes(role) : false;
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
