import { Component, OnInit, inject, OnDestroy } from '@angular/core'; // 1. Añade OnDestroy
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { Subject, takeUntil } from 'rxjs'; // 2. Importa Subject y takeUntil
// 3. Importa tu Modal y Spinner
import { Modal } from '../../../../shared/components/modal/modal';
import { Spinner } from '../../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-dashboard-page',
  standalone: true, // <-- 4. ¡AÑADE ESTA LÍNEA!
  // 5. Añade Modal y Spinner a los imports
  imports: [ CommonModule, RouterLink, Spinner, Modal ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit, OnDestroy { // 6. Implementa OnDestroy
  private projectService = inject(ProjectService);
  private destroy$ = new Subject<void>(); // 7. Añade Subject para desuscripción

  // --- 8. Propiedades que faltaban ---
  projects: Project[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  isCreatingProject = false;
  deletingProjectId: string | null = null; // Para spinner en el botón
  showDeleteModal = false; // Controla la visibilidad del modal
  projectToDeleteId: string | null = null; // Guarda el ID del proyecto a eliminar
  projectToDeleteName: string | null = null; // Guarda el nombre para mostrarlo
  // --- Fin de propiedades que faltaban ---

  ngOnInit(): void {
    this.loadProjects();
  }

  // 9. Implementa ngOnDestroy para limpiar suscripciones
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.projectService.getProjects().pipe(
      takeUntil(this.destroy$) // Se desuscribe al destruir
    ).subscribe({
      next: (data) => {
        this.projects = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando proyectos:', err);
        // ¡Este es el error de conexión que ves! Se soluciona en el Paso 4.
        this.errorMessage = err.message || 'No se pudieron cargar los proyectos.';
        this.isLoading = false;
      }
    });
  }

  createNewProject(): void {
    const newProjectName = prompt('Nombre del nuevo proyecto:');

    if (newProjectName && newProjectName.trim()) {
      this.isCreatingProject = true;
      this.errorMessage = null;

      this.projectService.createProject({ name: newProjectName.trim() }).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (newProject) => {
          this.projects.push(newProject);
          this.isCreatingProject = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Error al crear el proyecto.';
          this.isCreatingProject = false;
        }
      });
    }
  }

  // --- 10. Métodos que faltaban para el Modal ---

  /** (A) Se llama al hacer clic en el botón de basura. Solo ABRE el modal. */
  openDeleteModal(project: Project): void {
    this.projectToDeleteId = project.id;
    this.projectToDeleteName = project.name;
    this.showDeleteModal = true;
    this.errorMessage = null; // Limpia errores antiguos
  }

  /** (B) Se llama cuando el modal emite (closed) (clic en X, Cancelar o fondo) */
  onModalClose(): void {
    this.showDeleteModal = false;
    this.projectToDeleteId = null;
    this.projectToDeleteName = null;
  }

  /** (C) Se llama cuando el modal emite (confirmed) */
  onModalConfirm(): void {
    this.showDeleteModal = false; // Cierra el modal

    if (!this.projectToDeleteId) return; // Seguridad

    this.deletingProjectId = this.projectToDeleteId; // Activa el spinner del botón
    const idToDelete = this.projectToDeleteId;

    this.projectService.deleteProject(idToDelete).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        // Éxito: Quita el proyecto de la lista
        this.projects = this.projects.filter(p => p.id !== idToDelete);
        this.deletingProjectId = null;
        this.projectToDeleteId = null;
        this.projectToDeleteName = null;
      },
      error: (err) => {
        // Error: Muestra mensaje
        this.errorMessage = err.message || 'Error al eliminar el proyecto.';
        this.deletingProjectId = null;
        this.projectToDeleteId = null;
        this.projectToDeleteName = null;
      }
    });
  }
}
