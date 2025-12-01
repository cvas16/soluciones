import { Component, EventEmitter, Input, Output, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { ActivityLog } from '../../../../shared/models/activity-log.model';

@Component({
  selector: 'app-activity-log-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-log-modal.html',
  styleUrl: './activity-log-modal.css',
})
export class ActivityLogModal implements OnChanges {
  @Input() isVisible = false;
  @Input() projectId!: number;
  @Output() closed = new EventEmitter<void>();

  private projectService = inject(ProjectService);

  logs: ActivityLog[] = [];
  isLoading = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && this.isVisible && this.projectId) {
      this.loadActivity();
    }
  }

  loadActivity() {
    this.isLoading = true;
    this.projectService.getProjectActivity(this.projectId).subscribe({
      next: (data) => {
        this.logs = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  close() {
    this.closed.emit();
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Hace un momento';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} días`;
  }

  getIconForAction(action: string): string {
    switch (action) {
      case 'TASK_CREATED': return 'bi-plus-circle-fill text-success';
      case 'STATUS_CHANGED': return 'bi-arrow-right-circle-fill text-primary';
      case 'PRIORITY_CHANGED': return 'bi-exclamation-circle-fill text-warning';
      case 'ASSIGNED_USER': return 'bi-person-check-fill text-info';
      case 'TASK_UPDATED': return 'bi-pencil-fill text-secondary';
      default: return 'bi-info-circle-fill text-muted';
    }
  }
}
