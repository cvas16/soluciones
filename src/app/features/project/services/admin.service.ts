import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { AdminUser } from '../../../shared/models/admin-user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;
  private http = inject(HttpClient);

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }

  toggleUserLock(userId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${userId}/lock`, {});
  }

  toggleAdminRole(userId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${userId}/role`, {});
  }

  forceDeleteProject(projectId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/projects/${projectId}`);
  }
}
