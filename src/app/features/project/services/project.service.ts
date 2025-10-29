import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
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
    // Ejemplo si tuvieras datos mock
    // return of([{id: '1', name: 'Proyecto Alpha'}, {id: '2', name: 'TaskFlow App'}]);
  }


  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/projects/${id}`);
  }


  getTasksForProject(projectId: string): Observable<Task[]> {
    // Asume un endpoint como /api/projects/{projectId}/tasks
    return this.http.get<Task[]>(`${this.apiUrl}/projects/${projectId}/tasks`);
  }


  getProjectWithTasks(projectId: string): Observable<ProjectDetailsResponse> {
    return forkJoin({
      project: this.getProjectById(projectId),
      tasks: this.getTasksForProject(projectId)
    });
    // Si tu API devuelve todo junto en un solo endpoint, usa ese endpoint
    // return this.http.get<ProjectDetailsResponse>(`${this.apiUrl}/projects/${projectId}/details`);
  }

  createProject(projectData: { name: string; description?: string }): Observable<Project> {
      return this.http.post<Project>(`${this.apiUrl}/projects`, projectData);
  }

  // Añade métodos para crear, actualizar, eliminar tareas
  // createTask(projectId: string, taskData: Partial<Task>): Observable<Task> { ... }
  // updateTask(taskId: string, taskUpdate: Partial<Task>): Observable<Task> { ... }
  // deleteTask(taskId: string): Observable<void> { ... }
}
