import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../../shared/models/task.model';
import { ProjectService } from '../../services/project.service';
import { UserSummary } from '../../../../shared/models/user.model';
import { HttpClient } from '@angular/common/http';
import { Comment } from '../../../../shared/models/comment.model';
import { AuthService } from '../../../../core/services/auth.services';
import { SubTask } from '../../../../shared/models/sub-task.model';
import { Dependency } from '../../../../shared/models/dependency.model';
import { Tag } from '../../../../shared/models/tag.model';
import { Milestone } from '../../../../shared/models/milestone.model';

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

  comments: Comment[] = [];
  newCommentText: string = '';
  isSendingComment = false;
  currentUser = inject(AuthService).getCurrentUser()

  subTasks: SubTask[] = [];
  newSubTaskTitle = '';

  dependencies: Dependency[] = [];
  availableTasks: Task[] = [];
  selectedBlockerId: number | null = null;

  projectTags: Tag[] = [];
  showTagInput = false;
  newTagName = '';
  newTagColor = '#ff0000';

  milestones: Milestone[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.editedTask = { ...this.task };
      this.loadComments();
      this.loadSubTasks();
      this.loadDependencies();
      this.loadAvailableTasks();
      this.loadProjectTags();
      this.loadMilestones();
    }
    if (changes['projectMembers']) {
      console.log('TaskDetailModal projectMembers changed:', this.projectMembers);
    }
  }

  loadMilestones() {
    if (!this.task) return;
    this.projectService.getMilestones(this.task.projectId).subscribe(data => {
      this.milestones = data;
    });
  }

  onMilestoneChange(): void {
     if (!this.task || !this.editedTask.milestoneId) return;
     this.projectService.addTaskToMilestone(this.task.id, this.editedTask.milestoneId).subscribe();
  }

  loadProjectTags(): void {
    if (!this.task) return;
    this.projectService.getTags(this.task.projectId).subscribe({
      next: (tags) => this.projectTags = tags
    });
  }

  createTag(): void {
    if (!this.task || !this.newTagName.trim()) return;

    const newTag = { name: this.newTagName, color: this.newTagColor };

    this.projectService.createTag(this.task.projectId, newTag).subscribe({
      next: (tag) => {
        this.projectTags.push(tag);
        this.addTagToTask(tag);
        this.newTagName = '';
        this.showTagInput = false;
      }
    });
  }

  addTagToTask(tag: Tag): void {
    // Verificamos si ya la tiene
    if (this.editedTask.tags?.some(t => t.id === tag.id)) return;

    this.projectService.addTagToTask(this.task!.id, tag.id).subscribe({
      next: () => {
        this.editedTask.tags?.push(tag);
      }
    });
  }

  removeTag(tagId: number): void {
    this.projectService.removeTagFromTask(this.task!.id, tagId).subscribe({
      next: () => {
        this.editedTask.tags = this.editedTask.tags?.filter(t => t.id !== tagId);
      }
    });
  }

  loadDependencies(): void {
    if (!this.task) return;
    this.projectService.getDependencies(this.task.id).subscribe({
      next: (data) => this.dependencies = data,
      error: (err) => console.error(err)
    });
  }

  loadAvailableTasks(): void {
    if (!this.task) return;
    this.projectService.getTasksForProject(this.task.projectId).subscribe({
      next: (tasks) => {
        // Filtramos: No podemos bloquearnos a nosotros mismos
        this.availableTasks = tasks.filter(t => t.id !== this.task!.id);
      }
    });
  }

  addDependency(): void {
    if (!this.task || !this.selectedBlockerId) return;

    this.projectService.addDependency(this.task.id, this.selectedBlockerId).subscribe({
      next: (dep) => {
        this.dependencies.push(dep);
        this.selectedBlockerId = null;
      },
      error: (err) => alert(err.error?.message || 'Error al añadir dependencia')
    });
  }

  removeDependency(depId: number): void {
    this.projectService.removeDependency(depId).subscribe({
      next: () => {
        this.dependencies = this.dependencies.filter(d => d.id !== depId);
      }
    });
  }

  loadSubTasks(): void {
    if (!this.task) return;
    this.projectService.getSubTasks(this.task.id).subscribe({
      next: (data) => this.subTasks = data
    });
  }

  addSubTask(): void {
    if (!this.task || !this.newSubTaskTitle.trim()) return;
    this.projectService.createSubTask(this.task.id, this.newSubTaskTitle).subscribe({
      next: (subTask) => {
        this.subTasks.push(subTask);
        this.newSubTaskTitle = '';
      },
      error: (err) => console.error('Error creando sub-tarea', err)
    });
  }

  toggleSubTask(subTask: SubTask): void {
    const newStatus = !subTask.completed;

    subTask.completed = newStatus;

    this.projectService.updateSubTask(subTask.id, { completed: newStatus }).subscribe({
      error: () => {
        subTask.completed = !newStatus;
        alert('Error al actualizar sub-tarea');
      }
    });
  }

  deleteSubTaskItem(subTaskId: number): void {
    this.projectService.deleteSubTask(subTaskId).subscribe({
      next: () => {
        this.subTasks = this.subTasks.filter(st => st.id !== subTaskId);
      }
    });
  }

  getProgress(): number {
    if (this.subTasks.length === 0) return 0;
    const completed = this.subTasks.filter(t => t.completed).length;
    return Math.round((completed / this.subTasks.length) * 100);
  }

  loadComments(): void {
    if (!this.task) return;
    this.projectService.getComments(this.task.id).subscribe({
      next: (data) => this.comments = data,
      error: (err) => console.error('Error cargando comentarios', err)
    });
  }

  sendComment(): void {
    if (!this.task || !this.newCommentText.trim()) return;

    this.isSendingComment = true;
    this.projectService.addComment(this.task.id, this.newCommentText).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.newCommentText = '';
        this.isSendingComment = false;
      },
      error: (err) => {
        console.error(err);
        this.isSendingComment = false;
      }
    });
  }

  deleteComment(commentId: number): void {
    if (!confirm('¿Eliminar comentario?')) return;

    this.projectService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== commentId);
      }
    });
  }

  getAssignedUserInitial(): string {
    if (this.editedTask.assignedUserId) {
      const user = this.projectMembers.find(m => {
        if (typeof m === 'object') return (m as UserSummary).id === this.editedTask.assignedUserId;
        return m === this.editedTask.assignedUserId;
      });
      if (user) {
        if (typeof user === 'object') return (user as UserSummary).username.charAt(0).toUpperCase();
        return (user as string).charAt(0).toUpperCase();
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
        let mensaje = 'Error al guardar los cambios.';
        if (err.error && err.error.error) {
            mensaje = err.error.error;
        } else if (err.error && err.error.message) {
            mensaje = err.error.message;
        }
        alert("⚠️ " + mensaje);
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
