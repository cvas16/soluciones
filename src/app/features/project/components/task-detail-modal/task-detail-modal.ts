import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { ProjectService } from '../../services/project.service';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule],
  templateUrl: './task-detail-modal.html',
  styleUrls: ['./task-detail-modal.css'],
})
export class TaskDetailModal implements OnChanges{
  @Input() isVisible = false;
  @Input() task: Task | null = null; // La tarea a editar
  @Input() projectMembers: string[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<Task>();
  @Output() taskDeleted = new EventEmitter<string>();
  newAttachmentUrl: string = '';
  private projectService = inject(ProjectService);

  editedTask: Partial<Task> = {};
  isSaving = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.editedTask = { ...this.task };
    }
  }
  addAttachment(): void {
    if (!this.newAttachmentUrl.trim()) return;

    if (!this.editedTask.attachments) {
        this.editedTask.attachments = [];
    }
    this.editedTask.attachments.push(this.newAttachmentUrl);
    this.newAttachmentUrl = '';
  }
  removeAttachment(index: number): void {
      this.editedTask.attachments?.splice(index, 1);
  }
  getTimeAgo(dateString?: string): string {
    if (!dateString) return 'Recientemente';

    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return 'Hace ' + Math.floor(interval) + ' años';
    interval = seconds / 2592000;
    if (interval > 1) return 'Hace ' + Math.floor(interval) + ' meses';
    interval = seconds / 86400;
    if (interval > 1) return 'Hace ' + Math.floor(interval) + ' días';
    interval = seconds / 3600;
    if (interval > 1) return 'Hace ' + Math.floor(interval) + ' horas';
    interval = seconds / 60;
    if (interval > 1) return 'Hace ' + Math.floor(interval) + ' minutos';

    return 'Hace unos segundos';
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

  assignUser(username: string): void {
      this.editedTask.assignedUserId = undefined;
      this.editedTask.assignedUsername = username;
  }
}
