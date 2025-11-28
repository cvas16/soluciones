import { Task } from './../../models/task.model';
import { Component, Input,Output, EventEmitter} from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-task-card',
  standalone:true,
  templateUrl: './task-card.html',
  styleUrls: ['./task-card.css'],
  imports: [CommonModule, NgIf],
})
export class TaskCard {
  @Input() task: Task | null = null;
  @Output() statusChange = new EventEmitter<string>();

  isCompleted(): boolean {
    return this.task?.status === 'Finalizado';
  }
  toggleCompletion() {
    if (!this.task) return;
    const newStatus = this.isCompleted() ? 'Pendiente' : 'Finalizado';
    this.statusChange.emit(newStatus);
  }
  getBadgeClass(): string {
    switch (this.task?.status) {
      case 'Hecho': return 'bg-success'; // Verde
      case 'En Progreso': return 'bg-primary'; // Azul
      default: return 'bg-secondary'; // Gris
    }
  }
}
