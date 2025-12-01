import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Milestone } from '../../../../shared/models/milestone.model';

@Component({
  selector: 'app-milestone-list-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './milestone-list-modal.html',
  styleUrl: './milestone-list-modal.css',
})
export class MilestoneListModal implements OnInit{
  @Input() isVisible = false;
  @Input() projectId!: number;
  @Output() closed = new EventEmitter<void>();

  private projectService = inject(ProjectService);

  milestones: Milestone[] = [];
  newMilestoneName = '';
  newMilestoneDescription = '';
  newMilestoneStartDate = '';
  newMilestoneDate = '';
  isCreating = false;

  ngOnInit() {
  }

  loadMilestones() {
    if (!this.projectId) return;
    this.projectService.getMilestones(this.projectId).subscribe(data => {
      this.milestones = data;
    });
  }

  createMilestone() {
    if (!this.newMilestoneName.trim()) return;

    this.isCreating = true;
    const payload = {
      name: this.newMilestoneName,
      description: this.newMilestoneDescription,
      startDate: this.newMilestoneStartDate || null,
      endDate: this.newMilestoneDate || null
    };

    this.projectService.createMilestone(this.projectId, payload).subscribe({
      next: (milestone) => {
        this.milestones.push(milestone);
        this.newMilestoneName = '';
        this.newMilestoneDescription = '';
        this.newMilestoneStartDate = '';
        this.newMilestoneDate = '';
        this.isCreating = false;
      },
      error: () => this.isCreating = false
    });
  }

  deleteMilestone(id: number) {
    if(!confirm('¿Eliminar este hito?')) return;

    this.projectService.deleteMilestone(id).subscribe(() => {
      this.milestones = this.milestones.filter(m => m.id !== id);
    });
  }

  close() {
    this.closed.emit();
  }
  isOverdue(dateString: string): boolean {
    return new Date(dateString) < new Date();
  }
}
