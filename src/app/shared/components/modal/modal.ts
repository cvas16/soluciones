import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './modal.html',
  styleUrls: ['./modal.css']
})
export class Modal {


  @Input() isVisible: boolean = false;


  @Input() title: string = 'Confirmación';


  @Input() confirmType: 'primary' | 'danger' = 'primary';


  @Output() confirmed = new EventEmitter<void>();


  @Output() closed = new EventEmitter<void>();


  onBackdropClick(): void {
    this.closed.emit(); // Emite el evento para cerrar
  }


  onModalClick(event: MouseEvent): void {
    event.stopPropagation();
  }


  onConfirm(): void {
    this.confirmed.emit();
  }


  onClose(): void {
    this.closed.emit();
  }


  getConfirmButtonClass(): string {
    if (this.confirmType === 'danger') {
      return 'btn btn-danger'; // Botón rojo
    }
    return 'btn btn-primary'; // Botón azul por defecto
  }
}
