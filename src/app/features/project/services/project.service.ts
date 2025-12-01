import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, delay, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Project } from '../../../shared/models/project.model';
import { Task } from '../../../shared/models/task.model';
import { User } from '../../../shared/models/user.model';
import { Comment } from '../../../shared/models/comment.model';
import { SubTask } from '../../../shared/models/sub-task.model';
import { Dependency } from '../../../shared/models/dependency.model';
import { Tag } from '../../../shared/models/tag.model';
import { Milestone } from '../../../shared/models/milestone.model';
import { ActivityLog } from '../../../shared/models/activity-log.model';

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
  /*Proyecto*/
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/projects`);
  }

  createProject(projectData: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/projects`, projectData);
  }

  deleteProject(projectId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/projects/${projectId}`);
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/projects/${id}`);
  }

  /*Tareas*/
  getTasksForProject(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/projects/${projectId}/tasks`);
  }

  createTask(projectId: number, taskData: Partial<Task>): Observable<Task>{
    return this.http.post<Task>(`${this.apiUrl}/projects/${projectId}/tasks`, taskData);
  }

  updateTask(taskId: number, taskUpdate: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/tasks/${taskId}`, taskUpdate);
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${taskId}`);
  }

  getProjectWithTasks(projectId: number): Observable<ProjectDetailsResponse> {
    return forkJoin({
      project: this.getProjectById(projectId),
      tasks: this.getTasksForProject(projectId)
    });
  }
  /*Invitacion*/
  inviteMember(projectId: number, username: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/projects/${projectId}/members`,
      null,
      { params: { username } }
    );
  }
  /*Busqueda usuarios*/
  searchUsers(query: string, projectId?: number): Observable<User[]> {
    if (!query.trim()) return of([]);
    const url = projectId
        ? `${this.apiUrl}/projects/search-users`
        : `${this.apiUrl}/users/search`;

    return this.http.get<User[]>(url, {
      params: {
          query,
          projectId: projectId ? projectId.toString() : ''
      }
    });
  }
  /*Comentarios*/
  getComments(taskId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/tasks/${taskId}/comments`);
  }

  addComment(taskId: number, text: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/tasks/${taskId}/comments`, { text });
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`);
  }
  /*Sub tarea */
  getSubTasks(taskId: number): Observable<SubTask[]> {
    return this.http.get<SubTask[]>(`${this.apiUrl}/tasks/${taskId}/subtasks`);
  }

  createSubTask(taskId: number, title: string): Observable<SubTask> {
    return this.http.post<SubTask>(`${this.apiUrl}/tasks/${taskId}/subtasks`, { title });
  }

  updateSubTask(subTaskId: number, updates: Partial<SubTask>): Observable<SubTask> {
    return this.http.put<SubTask>(`${this.apiUrl}/subtasks/${subTaskId}`, updates);
  }

  deleteSubTask(subTaskId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/subtasks/${subTaskId}`);
  }
  /*Dependencia*/
  getDependencies(taskId: number): Observable<Dependency[]> {
    return this.http.get<Dependency[]>(`${this.apiUrl}/tasks/${taskId}/dependencies`);
  }

  addDependency(taskId: number, blockerTaskId: number): Observable<Dependency> {
    return this.http.post<Dependency>(`${this.apiUrl}/tasks/${taskId}/dependencies`, { blockerTaskId });
  }

  removeDependency(dependencyId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/dependencies/${dependencyId}`);
  }

  // --- ETIQUETA
  getTags(projectId: number): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/projects/${projectId}/tags`);
  }

  createTag(projectId: number, tag: Partial<Tag>): Observable<Tag> {
    return this.http.post<Tag>(`${this.apiUrl}/projects/${projectId}/tags`, tag);
  }

  addTagToTask(taskId: number, tagId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/tasks/${taskId}/tags/${tagId}`, {});
  }

  removeTagFromTask(taskId: number, tagId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${taskId}/tags/${tagId}`);
  }

  getMilestones(projectId: number): Observable<Milestone[]> {
    return this.http.get<Milestone[]>(`${this.apiUrl}/projects/${projectId}/milestones`);
  }

  createMilestone(projectId: number, milestone: any): Observable<Milestone> {
    return this.http.post<Milestone>(`${this.apiUrl}/projects/${projectId}/milestones`, milestone);
  }

  addTaskToMilestone(taskId: number, milestoneId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/tasks/${taskId}/milestone/${milestoneId}`, {});
  }

  deleteMilestone(milestoneId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/milestones/${milestoneId}`);
  }

  getProjectActivity(projectId: number): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.apiUrl}/projects/${projectId}/activity`);
  }
}
