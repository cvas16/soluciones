import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../../shared/models/task.model';
import { ProjectService } from '../../services/project.service';
import { UserSummary } from '../../../../shared/models/user.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule],
  templateUrl: './task-detail-modal.html',
  styleUrls: ['./task-detail-modal.css'],
})
export class TaskDetailModal implements OnChanges{
  @Input() isVisible = false;
  @Input() task: Task | null = null;
  @Input() projectMembers: UserSummary[] = [];
  @Input() canAssign = false;
  @Output() closed = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<Task>();
  @Output() taskDeleted = new EventEmitter<number>();

  newAttachmentUrl: string = '';
  private projectService = inject(ProjectService);
  private http = inject(HttpClient);

  isUploading = false;
  editedTask: Partial<Task> = {};
  isSaving = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.editedTask = { ...this.task };
    }
  }

  getAssignedUserInitial(): string {
    if (this.editedTask.assignedUserId) {
      const user = this.projectMembers.find(m => m.id === this.editedTask.assignedUserId);
      if (user) {
        return user.username.charAt(0).toUpperCase();
      }
    }
    return '?';
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

  getAttachmentType(url: string): 'image' | 'video' | 'link' | 'file' {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.match(/\.(jpeg|jpg|gif|png|webp)$/) != null) return 'image';
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'video';
    if (lowerUrl.startsWith('http')) return 'link';
    return 'file';
  }

  getAttachmentName(url: string): string {
    if (url.includes('/api/files/')) {
        const parts = url.split('/');
        const filenameWithUuid = parts[parts.length - 1];
        const nameParts = filenameWithUuid.split('_');
        return nameParts.length > 1 ? nameParts.slice(1).join('_') : filenameWithUuid;
    }
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace('www.', '');
    } catch {
        return 'Enlace';
    }
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

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
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

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<{url: string}>('http://localhost:8080/api/files/upload', formData).subscribe({
      next: (res) => {
        if (!this.editedTask.attachments) {
          this.editedTask.attachments = [];
        }
        this.editedTask.attachments.push(res.url);
        this.isUploading = false;
      },
      error: (err) => {
        console.error('Error subiendo archivo', err);
        this.isUploading = false;
        alert('Error al subir archivo');
      }
    });
  }
}
