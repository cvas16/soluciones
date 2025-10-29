import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
@Component({
  selector: 'app-dashboard-page',
  imports: [ CommonModule,RouterLink],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit{
  private projectService = inject(ProjectService);

  projects: Project[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando proyectos:', err);
        this.errorMessage = 'No se pudieron cargar los proyectos.';
        this.isLoading = false;
      }
    });
  }

  // Podrías añadir un método para crear un nuevo proyecto
  createNewProject(): void {
    console.log('TODO: Implementar creación de proyecto');
    // const newProjectName = prompt('Nombre del nuevo proyecto:');
    // if (newProjectName) {
    //   this.projectService.createProject({ name: newProjectName }).subscribe(() => {
    //     this.loadProjects(); // Recargar la lista
    //   });
    // }
  }
}
