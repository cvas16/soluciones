import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfile {
  private apiUrl = `${environment.apiUrl}/users`;
  private http = inject(HttpClient);

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  updateUserProfile(data: { username: string; email: string }): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, data);
  }

  changePassword(data: any): Observable<void> {
    // POST a /api/users/password
    return this.http.post<void>(`${this.apiUrl}/password`, data);
  }
}
