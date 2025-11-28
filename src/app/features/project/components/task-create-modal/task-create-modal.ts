import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Task } from '../../../../shared/models/task.model';
@Component({
  selector: 'app-task-create-modal',
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule],
  templateUrl: './task-create-modal.html',
  styleUrls: ['./task-create-modal.css'],
})
export class TaskCreateModal implements OnChanges{
  @Input() isVisible = false;
  @Input() projectId!: string;
  @Input() status: string = 'Pendiente';

  @Output() closed = new EventEmitter<void>();
  @Output() taskCreated = new EventEmitter<Task>();

  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);

  taskForm: FormGroup;
  isSaving = false;

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
      if (changes['isVisible'] && this.isVisible) {
          this.taskForm.reset();
      }
  }

  close(): void {
    this.isVisible = false;
    this.closed.emit();
  }

  save(): void {
    if (this.taskForm.invalid) return;

    this.isSaving = true;
    const newTaskData = {
        ...this.taskForm.value,
        status: this.status
    };

    this.projectService.createTask(this.projectId, newTaskData).subscribe({
      next: (task) => {
        this.isSaving = false;
        this.taskCreated.emit(task);
        this.close();
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
      }
    });
  }
}
