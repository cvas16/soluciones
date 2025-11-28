import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.services';

@Component({
  selector: 'app-register-page',
  standalone:true,
  imports: [CommonModule, NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.html',
  styleUrls: ['./register-page.css'],
})
export class RegisterPage implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm!: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onRegister(): void {
     if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    const userData = this.registerForm.value;
    this.authService.register(userData).subscribe({
      next: () => {
        this.isLoading = false;
        console.log('Registro exitoso');
        // Considera usar un servicio de notificaciones en lugar de alert
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        this.router.navigateByUrl('/auth/login');
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Error en el registro. Inténtalo de nuevo.';
        console.error('Error en registro:', error);
      }
    });
  }

  isInvalidField(field: string): boolean | null {
    const control = this.registerForm.get(field);

    return control && control.errors && (control.dirty || control.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (!control || !control.errors) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Este campo es requerido.';
    }
    if (control.hasError('minlength')) {
      const requiredLength = control.errors['minlength'].requiredLength;
      return `Debe tener al menos ${requiredLength} caracteres.`;
    }
    if (control.hasError('email')) {
      return 'Por favor, introduce un email válido.';
    }
    return 'Campo inválido.';
  }
}
