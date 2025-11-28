import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model';
import { BoardColumn } from '../../components/board-column/board-column';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskDetailModal } from '../../components/task-detail-modal/task-detail-modal';

@Component({
  selector: 'app-project-page',
  standalone:true,
  imports: [CommonModule, NgIf,BoardColumn,DragDropModule,TaskDetailModal],
  templateUrl: './project-page.html',
  styleUrls: ['./project-page.css'],
})
export class ProjectPage implements OnInit{
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);

  projectId: string | null = null;
  project: Project | null = null;
  columns: { [key: string]: Task[] } = {
    'Pendiente': [],
    'En Análisis': [],
    'En Desarrollo': [],
    'En Pruebas': [],
    'Finalizado': [],
    'Desestimado': []
  };
  isLoading = true;
  errorMessage: string | null = null;
  selectedTask: Task | null = null;
  isTaskModalVisible = false;

  boardColumns: string[] = [
    'Pendiente',
    'En Análisis',
    'En Desarrollo',
    'En Pruebas',
    'Finalizado',
    'Desestimado'
  ];

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');

    if (!this.projectId) {
      console.error('No se encontró ID de proyecto en la ruta');
      this.errorMessage = 'ID de proyecto inválido.';
      this.isLoading = false;
      this.router.navigateByUrl('/project/dashboard');
      return;
    }

    this.loadProjectDetails(this.projectId);
  }

  loadProjectDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.projectService.getProjectWithTasks(id).subscribe({
      next: (data) => {
        this.project = data.project;
        this.organizeTasks(data.tasks);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'No se pudo cargar el proyecto.';
        this.isLoading = false;
      }
    });
  }
  private organizeTasks(allTasks: Task[]) {
    this.columns = {
      'Pendiente': [],
      'En Análisis': [],
      'En Desarrollo': [],
      'En Pruebas': [],
      'Finalizado': [],
      'Desestimado': []
    };

    allTasks.forEach(task => {
      if (task.status === 'En Progreso') task.status = 'En Desarrollo';
      if (task.status === 'Hecho') task.status = 'Finalizado';

      if (this.columns[task.status]) {
        this.columns[task.status].push(task);
      } else {
        this.columns['Pendiente'].push(task);
      }
    });
  }

  getTasksForColumn(columnName: string): Task[] {
    return this.columns[columnName] || [];
  }

  onTaskDrop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.item.data as Task;
      const newStatus = event.container.id;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      task.status = newStatus;
      this.projectService.updateTask(task.id, { status: newStatus }).subscribe({
        next: () => console.log('Estado guardado en BD'),
        error: (err) => console.error('Error guardando movimiento:', err)
      });
    }
  }

  openTaskDetail(task: Task): void {
    this.selectedTask = task;
    this.isTaskModalVisible = true;
  }

  onTaskModalClose(): void {
    this.isTaskModalVisible = false;
    this.selectedTask = null;
  }
  onTaskUpdated(updatedTask: Task): void {
    if (this.projectId) {
      this.loadProjectDetails(this.projectId);
    }
  }
  onTaskDeleted(taskId: string): void {
    if (this.projectId) {
      this.loadProjectDetails(this.projectId);
    }
  }
  onQuickStatusChange(event: { task: Task, newStatus: string }): void {
    const { task, newStatus } = event;
    const oldStatus = task.status;
    if (this.columns[oldStatus]) {
      this.columns[oldStatus] = this.columns[oldStatus].filter(t => t.id !== task.id);
    }
    task.status = newStatus;
    if (this.columns[newStatus]) {
      this.columns[newStatus].push(task);
    } else {
       this.columns['Pendiente'].push(task);
    }
    this.projectService.updateTask(task.id, { status: newStatus }).subscribe({
      next: () => console.log(`Tarea marcada como ${newStatus}`),
      error: (err) => {
        console.error('Error actualizando estado:', err);
      }
    });
  }
}
