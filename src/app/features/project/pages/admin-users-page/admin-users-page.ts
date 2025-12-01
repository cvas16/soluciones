import { Component,OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AdminUser } from '../../../../shared/models/admin-user.model';
import { AuthService } from '../../../../core/services/auth.services';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users-page.html',
  styleUrl: './admin-users-page.css',
})
export class AdminUsersPage implements OnInit{

  private adminService = inject(AdminService);
  private authService = inject(AuthService); // Para no auto-bloquearse

  users: AdminUser[] = [];
  isLoading = true;
  currentUserId: number | undefined;

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUser()?.id;
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        alert('Error al cargar usuarios. ¿Eres administrador?');
      }
    });
  }

  toggleLock(user: AdminUser): void {
    if (user.id === this.currentUserId) {
      alert("No puedes bloquearte a ti mismo.");
      return;
    }

    if (!confirm(`¿${user.locked ? 'Desbloquear' : 'Bloquear'} a ${user.username}?`)) return;

    this.adminService.toggleUserLock(user.id).subscribe(() => {
      user.locked = !user.locked;
    });
  }

  toggleAdmin(user: AdminUser): void {
    const action = user.roles.includes('ROLE_ADMIN') ? 'Quitar admin a' : 'Hacer admin a';
    if (!confirm(`¿Estás seguro de ${action} ${user.username}?`)) return;

    this.adminService.toggleAdminRole(user.id).subscribe(() => {
      this.loadUsers();
    });
  }

  hasRole(user: AdminUser, role: string): boolean {
    return user.roles.includes(role);
  }
}
