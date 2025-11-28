import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { ProjectService } from '../../services/project.service';
@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-detail-modal.html',
  styleUrl: './task-detail-modal.css',
})
export class TaskDetailModal implements OnChanges{
  @Input() isVisible = false;
  @Input() task: Task | null = null; // La tarea a editar

  @Output() closed = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<Task>();
  @Output() taskDeleted = new EventEmitter<string>();

  private projectService = inject(ProjectService);

  editedTask: Partial<Task> = {};
  isSaving = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.editedTask = { ...this.task };
    }
  }

  close(): void {
    this.closed.emit();
  }

  save(): void {
    if (!this.task || !this.editedTask.title) return;

    this.isSaving = true;
    this.projectService.updateTask(this.task.id, this.editedTask).subscribe({
      next: (updatedTask) => {
        this.isSaving = false;
        this.taskUpdated.emit(updatedTask);
        this.close();
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
      }
    });
  }

  deleteTask(): void {
    if (!this.task || !confirm('¿Borrar esta tarea?')) return;

    this.isSaving = true;
    this.projectService.deleteTask(this.task.id).subscribe({
      next: () => {
        this.isSaving = false;
        this.taskDeleted.emit(this.task!.id);
        this.close();
      }
    });
  }
}
