import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskCard } from '../task-card/task-card';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskCreateModal } from '../task-create-modal/task-create-modal';
@Component({
  selector: 'app-board-column',
  standalone:true,
  imports: [CommonModule ,TaskCard,DragDropModule,TaskCreateModal],
  templateUrl: './board-column.html',
  styleUrls: ['./board-column.css'],
})
export class BoardColumn {
  @Input() columnTitle: string = '';
  @Input() tasks: Task[] = [];
  @Input() projectId!: string;
  @Output() taskDropped = new EventEmitter<CdkDragDrop<Task[]>>();
  @Output() taskClicked = new EventEmitter<Task>();
  @Output() taskAdded = new EventEmitter<Task>();
  @Output() taskMoved = new EventEmitter<{task: Task, newStatus: string}>();

  showCreateTaskModal = false;

  drop(event: CdkDragDrop<Task[]>) {
    console.log('Drop event en BoardColumn:', event);
    this.taskDropped.emit(event);
  }
  onTaskClick(task: Task) {
    this.taskClicked.emit(task);
  }

  openCreateTaskModal() {
    this.showCreateTaskModal = true;
  }

  onTaskCreated(newTask: Task) {
    this.tasks.push(newTask);
  }
  onTaskStatusChange(task: Task, newStatus: string) {
    this.taskMoved.emit({ task, newStatus });
  }
}
