import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrls: ['./modal.css']
})
export class Modal {
  @Input() isVisible = false;
  @Input() title = 'Confirmación';
  @Input() confirmType: 'danger' | 'primary' = 'primary';

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  get confirmButtonClass(): string {
    return this.confirmType === 'danger' ? 'btn-danger' : 'btn-primary';
  }

  onBackdropClick() {
    this.close();
  }

  close() {
    this.closed.emit();
  }

  confirm() {
    this.confirmed.emit();
  }
}
