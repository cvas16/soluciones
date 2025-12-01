import { AuthService } from './../../../../core/services/auth.services';
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../../../shared/models/project.model';
import { Task } from '../../../../shared/models/task.model';
import { BoardColumn } from '../../components/board-column/board-column';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskDetailModal } from '../../components/task-detail-modal/task-detail-modal';
import { InviteMemberModal } from '../../components/invite-member-modal/invite-member-modal';
import { MilestoneListModal } from '../../components/milestone-list-modal/milestone-list-modal';

@Component({
  selector: 'app-project-page',
  standalone: true,
  imports: [CommonModule, NgIf, BoardColumn, DragDropModule, TaskDetailModal, InviteMemberModal,MilestoneListModal],
  templateUrl: './project-page.html',
  styleUrls: ['./project-page.css'],
})
export class ProjectPage implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private document = inject(DOCUMENT);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  projectId: number | null = null;
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
  showInviteModal = false;
  isOwner = false;

  boardColumns: string[] = [
    'Pendiente',
    'En Análisis',
    'En Desarrollo',
    'En Pruebas',
    'Finalizado',
    'Desestimado'
  ];
  showMilestoneModal = false;

  openMilestoneModal() {
    this.showMilestoneModal = true;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.projectId = Number(idParam);
    this.loadProjectDetails(this.projectId);
  }

  loadProjectDetails(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.projectService.getProjectWithTasks(id).subscribe({
      next: (data) => {
        this.project = data.project;
        console.log('Project members:', this.project?.members);
        if (this.project?.background) {
          this.document.body.style.background = this.project.background;
          this.document.body.style.backgroundSize = 'cover';
          this.document.body.style.backgroundPosition = 'center';
          this.document.body.style.backgroundRepeat = 'no-repeat';
          this.document.body.classList.add('has-project-background');
        }
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && this.project.ownerId) {
             this.isOwner = currentUser.id === Number(this.project.ownerId);
        }
        console.log('Project loaded, background:', this.project?.background);
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

  onMemberInvited(): void {
    if (this.projectId) {
      this.loadProjectDetails(this.projectId);
    }
  }

  ngOnDestroy(): void {
    this.document.body.style.background = '';
    this.document.body.style.backgroundSize = '';
    this.document.body.style.backgroundPosition = '';
    this.document.body.style.backgroundRepeat = '';
    this.document.body.classList.remove('has-project-background');
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
      const targetColumn = this.columns[task.status] ? task.status : 'Pendiente';
      if (task.status !== targetColumn) {
        task.status = targetColumn;
      }
      this.columns[targetColumn].push(task);
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
      const oldStatus = task.status;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      task.status = newStatus;
      this.projectService.updateTask(task.id, { status: newStatus }).subscribe({
        next: () => console.log('Estado guardado'),
        error: (err) => {
          console.error('Error al mover tarea:', err);

          let mensaje = 'No se pudo mover la tarea.';
          if (err.error && err.error.error) {
              mensaje = err.error.error;
          } else if (err.error && err.error.message) {
              mensaje = err.error.message;
          } else if (typeof err.error === 'string') {
              mensaje = err.error;
          }
          alert("⚠️ " + mensaje);
          if (this.projectId) this.loadProjectDetails(this.projectId);
        }
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
  onTaskDeleted(taskId: number): void {
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
    const targetColumn = this.columns[newStatus] ? newStatus : 'Pendiente';
    if (this.columns[targetColumn]) {
      this.columns[targetColumn].push(task);
    }
    this.projectService.updateTask(task.id, { status: newStatus }).subscribe({
      next: () => console.log(`Tarea marcada como ${newStatus}`),

      error: (err) => {
        console.error('Error del backend:', err);
        let mensaje = 'No se pudo actualizar la tarea.';
        if (err.error && err.error.error) {
            mensaje = err.error.error;
        }
        else if (err.error && err.error.message) {
            mensaje = err.error.message;
        }
        else if (typeof err.error === 'string') {
            mensaje = err.error;
        }

        alert("⚠️ " + mensaje);
        if (this.projectId) this.loadProjectDetails(this.projectId);
      }
    });
  }
  inviteUser(): void {
    if (!this.project) return;
    this.showInviteModal = true;
  }
}
