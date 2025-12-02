import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../../../shared/models/project.model';
import { Subject, takeUntil } from 'rxjs';
import { Modal } from '../../../../shared/components/modal/modal';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { ProjectCreateModal } from '../../components/project-create-modal/project-create-modal';
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [ CommonModule, NgIf, RouterLink, Spinner, Modal ,ProjectCreateModal],
  templateUrl: './dashboard-page.html',
  styleUrls: ['./dashboard-page.css'],
})
export class DashboardPage implements OnInit, OnDestroy {
  private projectService = inject(ProjectService);
  private destroy$ = new Subject<void>();
  projects: Project[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  deletingProjectId: number | null = null;
  showDeleteModal = false;
  projectToDeleteId: number | null = null;
  projectToDeleteName: string | null = null;
  showCreateModal= false;

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.projectService.getProjects().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.projects = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando proyectos:', err);
        this.errorMessage = err.message || 'No se pudieron cargar los proyectos.';
        this.isLoading = false;
      }
    });
  }

  createNewProject(): void {
    this.showCreateModal = true;
  }

  onProjectCreated(): void {
    this.loadProjects();
  }

  openDeleteModal(project: Project): void {
    this.projectToDeleteId = project.id;
    this.projectToDeleteName = project.name;
    this.showDeleteModal = true;
    this.errorMessage = null;
  }

  onModalClose(): void {
    this.showDeleteModal = false;
    this.projectToDeleteId = null;
    this.projectToDeleteName = null;
  }

  onModalConfirm(): void {
   this.showDeleteModal = false;

    if (this.projectToDeleteId === null) return;

    this.deletingProjectId = this.projectToDeleteId;
    const idToDelete = this.projectToDeleteId;

    this.projectService.deleteProject(idToDelete).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.projects = this.projects.filter(p => p.id !== idToDelete);
        this.deletingProjectId = null;
        this.projectToDeleteId = null;
        this.projectToDeleteName = null;
      },
      error: (err) => {
        console.error('Error al eliminar proyecto:', err);
        this.deletingProjectId = null;
        this.projectToDeleteId = null;
        this.projectToDeleteName = null;

        let mensaje = 'No se pudo eliminar el proyecto.';

        if (err.status === 403) {
             mensaje = 'No tienes permiso para eliminar este proyecto (solo el dueño puede hacerlo).';
        } else if (err.error && err.error.error) {
             mensaje = err.error.error;
        } else if (err.error && err.error.message) {
             mensaje = err.error.message;
        }
        this.errorMessage = mensaje;

        setTimeout(() => this.errorMessage = null, 5000);
      }
    });
  }
}
