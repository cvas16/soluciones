import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, delay, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';

interface ProjectDetailsResponse {
  project: Project;
  tasks: Task[];
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/projects`);
  }

  createProject(projectData: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/projects`, projectData);
  }

  deleteProject(projectId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/projects/${projectId}`);
  }

  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/projects/${id}`);
  }


  getTasksForProject(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/projects/${projectId}/tasks`);
  }

  createTask(projectId: string, taskData: Partial<Task>): Observable<Task>{
    return this.http.post<Task>(`${this.apiUrl}/projects/${projectId}/tasks`, taskData);
  }

  updateTask(taskId: string, taskUpdate: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/tasks/${taskId}`, taskUpdate);
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${taskId}`);
  }

  getProjectWithTasks(projectId: string): Observable<ProjectDetailsResponse> {
    return forkJoin({
      project: this.getProjectById(projectId),
      tasks: this.getTasksForProject(projectId)
    });
  }

}
