import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule,BoardColumn,DragDropModule,TaskDetailModal],
  templateUrl: './project-page.html',
  styleUrl: './project-page.css',
})
export class ProjectPage implements OnInit{
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);

  projectId: string | null = null;
  project: Project | null = null;
  tasks: Task[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  selectedTask: Task | null = null;
  isTaskModalVisible = false;


  boardColumns: string[] = ['Pendiente', 'En Progreso', 'Hecho'];

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');

    if (!this.projectId) {
      console.error('No se encontró ID de proyecto en la ruta');
      this.errorMessage = 'ID de proyecto inválido.';
      this.isLoading = false;
      // Podrías redirigir al dashboard
      // this.router.navigateByUrl('/project/dashboard');
      return;
    }

    this.loadProjectDetails(this.projectId);
  }

  loadProjectDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    // Llama a un método del servicio para obtener los detalles Y las tareas
    this.projectService.getProjectWithTasks(id).subscribe({
      next: (data) => {
        // Asumiendo que el servicio devuelve { project: Project, tasks: Task[] }
        this.project = data.project;
        this.tasks = data.tasks;
        this.isLoading = false;
        console.log('Detalles del proyecto cargados:', data);
      },
      error: (err) => {
        console.error('Error cargando detalles del proyecto:', err);
        this.errorMessage = 'No se pudo cargar el proyecto.';
        this.isLoading = false;
      }
    });
  }

  // Función para obtener las tareas de una columna específica
  getTasksForColumn(columnName: string): Task[] {
    // Asumiendo que cada tarea tiene una propiedad 'status' o 'board'
    return this.tasks.filter(task => task.status === columnName); // Ajusta la propiedad
  }

  onTaskDrop(event: CdkDragDrop<Task[]>) {
    console.log('Drop event en ProjectPage:', event);

    // event.previousContainer.data -> Array de tareas de la columna ORIGEN
    // event.container.data -> Array de tareas de la columna DESTINO
    // event.previousIndex -> Índice en la columna origen
    // event.currentIndex -> Índice en la columna destino
    // event.item.data -> La tarea que se movió (si la pusiste en [cdkDragData])

    if (event.previousContainer === event.container) {
      // Mover dentro de la misma columna
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      console.log('Movido dentro de la misma columna');
      // Aquí podrías llamar a un servicio para guardar el nuevo orden si es necesario
    } else {
      // Mover a una columna diferente
      const taskToMove = event.previousContainer.data[event.previousIndex];
      const newStatus = this.getColumnTitleFromContainerId(event.container.id); // Necesitas una forma de saber el status de la nueva columna

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      console.log(`Movido a columna: ${newStatus}`);

      taskToMove.status = newStatus;
    }

    this.tasks = [
      ...this.getTasksForColumn(this.boardColumns[0]),
      ...this.getTasksForColumn(this.boardColumns[1]),
      ...this.getTasksForColumn(this.boardColumns[2])
      ];
  }

  private getColumnTitleFromContainerId(containerId: string): string {
    return containerId;
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
    const index = this.tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      const newTasks = [...this.tasks];
      newTasks[index] = updatedTask;
      this.tasks = newTasks;
    }
  }
  onTaskDeleted(taskId: string): void {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
  }
}
