import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

  gradients = [
    'linear-gradient(135deg, #0052cc 0%, #2684ff 100%)',
    'linear-gradient(135deg, #ff991f 0%, #ffc400 100%)',
    'linear-gradient(135deg, #36b37e 0%, #57d9a3 100%)',
    'linear-gradient(135deg, #ff5630 0%, #ff8f73 100%)',
    'linear-gradient(135deg, #6554c0 0%, #8777d9 100%)',
  ];

  images = [
    "url('https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&w=1000&q=80')",
    "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80')",
    "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80')",
    "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80')",
    "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80')",
  ];

  selectedBackground: string = this.gradients[0];
  projectForm: FormGroup;
  isSaving = false;

  constructor() {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  selectBackground(bg: string) {
    this.selectedBackground = bg;
  }

  close(): void {
    this.isVisible = false;
    this.projectForm.reset();
    this.selectedBackground = this.gradients[0];
    this.closed.emit();
  }

  save(): void {
    if (this.projectForm.invalid) return;

    this.isSaving = true;
    const projectData = {
      ...this.projectForm.value,
      background: this.selectedBackground
    };

    this.projectService.createProject(projectData).subscribe({
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
