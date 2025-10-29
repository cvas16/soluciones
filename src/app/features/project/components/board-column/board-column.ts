import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskCard } from '../task-card/task-card';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-board-column',
  standalone:true,
  imports: [CommonModule,TaskCard,DragDropModule],
  templateUrl: './board-column.html',
  styleUrl: './board-column.css',
})
export class BoardColumn {
  @Input() columnTitle: string = '';
  @Input() tasks: Task[] = [];
  @Output() taskDropped = new EventEmitter<CdkDragDrop<Task[]>>();

  drop(event: CdkDragDrop<Task[]>) {
    console.log('Drop event en BoardColumn:', event);
    this.taskDropped.emit(event);
  }
}
