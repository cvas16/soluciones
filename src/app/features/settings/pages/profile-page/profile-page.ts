import { FormBuilder ,FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import { Component,OnInit,inject } from '@angular/core';
import { CommonModule} from '@angular/common';
import { UserProfile } from '../../services/user-profile';
import { Spinner } from '../../../../shared/components/spinner/spinner';
@Component({
  selector: 'app-profile-page',
  imports: [CommonModule,ReactiveFormsModule,Spinner],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  private fb = inject(FormBuilder);
  private userProfileService = inject(UserProfile);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  isLoading = true;
  isSavingProfile = false;
  isSavingPassword = false;

  profileError: string | null = null;
  passwordError: string | null = null;
  profileSuccess: string | null = null;
  passwordSuccess: string | null = null;

  ngOnInit(): void {
    // Inicializa los formularios
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

    this.loadUserProfile();
  }

  passwordMatchValidator(form: FormGroup) {
    const newPass = form.get('newPassword')?.value;
    const confirmPass = form.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.userProfileService.getUserProfile().subscribe({
      next: (user) => {
        this.profileForm.patchValue({
          username: user.username,
          email: user.email
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.profileError = 'No se pudieron cargar los datos del perfil.';
        this.isLoading = false;
      }
    });
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSavingProfile = true;
    this.profileError = null;
    this.profileSuccess = null;

    this.userProfileService.updateUserProfile(this.profileForm.value).subscribe({
      next: () => {
        this.isSavingProfile = false;
        this.profileSuccess = '¡Perfil actualizado con éxito!';
      },
      error: (err) => {
        this.isSavingProfile = false;
        this.profileError = err.message || 'Error al actualizar el perfil.';
      }
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSavingPassword = true;
    this.passwordError = null;
    this.passwordSuccess = null;

    this.userProfileService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.isSavingPassword = false;
        this.passwordSuccess = '¡Contraseña cambiada con éxito!';
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isSavingPassword = false;
        this.passwordError = err.message || 'Error al cambiar la contraseña.';
      }
    });
  }

  isInvalid(form: FormGroup, field: string): boolean | null {
    const control = form.get(field);
    return control && control.errors && (control.dirty || control.touched);
  }

  getErrorMessage(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (!control || !control.errors) return '';
    if (control.hasError('required')) return 'Este campo es requerido.';
    if (control.hasError('minlength')) return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
    if (control.hasError('email')) return 'Email no válido.';
    if (form.hasError('mismatch') && (field === 'confirmPassword')) return 'Las contraseñas no coinciden.';
    return 'Campo inválido.';
  }
}
