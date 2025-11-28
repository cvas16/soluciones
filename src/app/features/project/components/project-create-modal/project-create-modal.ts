import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder,FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-project-create-modal',
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule],
  templateUrl: './project-create-modal.html',
  styleUrls: ['./project-create-modal.css'],
})
export class ProjectCreateModal {
  @Input() isVisible = false;
  @Output() closed = new EventEmitter<void>();
  @Output() projectCreated = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);

  projectForm: FormGroup;
  isSaving = false;

  constructor() {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  close(): void {
    this.isVisible = false;
    this.projectForm.reset();
    this.closed.emit();
  }

  save(): void {
    if (this.projectForm.invalid) return;

    this.isSaving = true;
    this.projectService.createProject(this.projectForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.projectCreated.emit();
        this.close();
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
      }
    });
  }
}
