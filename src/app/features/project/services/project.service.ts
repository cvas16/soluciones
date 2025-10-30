import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, delay, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model'; // Asegúrate que la ruta sea correcta

interface ProjectDetailsResponse {
  project: Project;
  tasks: Task[];
}

// Creamos datos falsos para que el servicio los devuelva
const MOCK_PROJECTS: Project[] = [
  { id: '1', name: 'Proyecto TaskFlow (Angular)', description: 'Desarrollar el frontend' },
  { id: '2', name: 'Proyecto TaskFlow (Spring)', description: 'Desarrollar el backend' },
  { id: '3', name: 'Documentación', description: 'Escribir el README y guías' }
];

const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Crear componente Login', status: 'Hecho', projectId: '1' },
  { id: 't2', title: 'Crear componente Dashboard', status: 'En Progreso', projectId: '1' },
  { id: 't3', title: 'Crear componente Tablero', status: 'Pendiente', projectId: '1' },
  { id: 't4', title: 'Definir modelo User', status: 'Hecho', projectId: '2' },
  { id: 't5', title: 'Configurar Spring Security', status: 'Pendiente', projectId: '2' },
];
// --- FIN DE DATOS SIMULADOS ---


@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  /** Obtiene todos los proyectos (SIMULADO) */
  getProjects(): Observable<Project[]> {
    console.warn('--- MODO DE SIMULACIÓN DE GET-PROJECTS ACTIVO ---');
    // Simula la obtención de proyectos
    return of([...MOCK_PROJECTS]).pipe(delay(1000)); // Simula 1 segundo de carga

    /*
    // --- CÓDIGO REAL ---
    return this.http.get<Project[]>(`${this.apiUrl}/projects`).pipe(
      catchError(err => {
        console.error('Error cargando proyectos:', err);
        return throwError(() => new Error('No se pudieron cargar los proyectos'));
      })
    );
    */
  }

  /** Obtiene un proyecto por ID (SIMULADO) */
  getProjectById(id: string): Observable<Project> {
    const project = MOCK_PROJECTS.find(p => p.id === id);
    if (!project) {
      return throwError(() => new Error('Proyecto no encontrado'));
    }
    return of(project).pipe(delay(300));

    // --- CÓDIGO REAL ---
    // return this.http.get<Project>(`${this.apiUrl}/projects/${id}`);
  }

  /** Obtiene tareas de un proyecto (SIMULADO) */
  getTasksForProject(projectId: string): Observable<Task[]> {
    const tasks = MOCK_TASKS.filter(t => t.projectId === projectId);
    return of(tasks).pipe(delay(300));

    // --- CÓDIGO REAL ---
    // return this.http.get<Task[]>(`${this.apiUrl}/projects/${projectId}/tasks`);
  }

  /** Obtiene proyecto y tareas (SIMULADO) */
  getProjectWithTasks(projectId: string): Observable<ProjectDetailsResponse> {
    return forkJoin({
      project: this.getProjectById(projectId), // Llama a los métodos simulados
      tasks: this.getTasksForProject(projectId)
    }).pipe(
       catchError(err => {
         console.error('Error en forkJoin getProjectWithTasks:', err);
         return throwError(() => err);
       })
    );
  }

  /** Crea un proyecto (SIMULADO) */
  createProject(projectData: { name: string; description?: string }): Observable<Project> {
    console.warn('--- MODO DE SIMULACIÓN DE CREATE-PROJECT ACTIVO ---');
    const newProject: Project = {
      id: Math.random().toString(36).substring(2, 9), // ID aleatorio
      name: projectData.name,
      description: projectData.description
    };
    MOCK_PROJECTS.push(newProject);
    return of(newProject).pipe(delay(500));

    // --- CÓDIGO REAL ---
    // return this.http.post<Project>(`${this.apiUrl}/projects`, projectData);
  }

  deleteProject(projectId: string): Observable<void> {
    console.warn('--- MODO DE SIMULACIÓN DE DELETE-PROJECT ACTIVO ---');

    const index = MOCK_PROJECTS.findIndex(p => p.id === projectId);
    if (index > -1) {
      MOCK_PROJECTS.splice(index, 1);
    }
    return of(undefined).pipe(
      delay(500),
      tap(() => console.log(`Proyecto ${projectId} eliminado (simulado)`))
    );

    // --- CÓDIGO REAL ---
    // return this.http.delete<void>(`${this.apiUrl}/projects/${projectId}`);
  }
}
