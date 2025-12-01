import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.services';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../models/notification.model';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, NgIf, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  public isLoggedIn$: Observable<boolean>;
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;

  constructor() {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnInit(): void {
    this.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.loadNotifications();
      } else {
        this.notifications = [];
        this.unreadCount = 0;
      }
    });
  }
  loadNotifications() {
    this.notificationService.getMyNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.updateUnreadCount();
      },
      error: (err) => console.error('Error cargando notificaciones', err)
    });
  }
  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  toggleNotifications(event: Event) {
    event.stopPropagation(); // Evita que se cierre inmediatamente al hacer clic
    this.showNotifications = !this.showNotifications;

    // Si abrimos el menú, recargamos por si hay nuevas (opcional)
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  markAsRead(notification: Notification, event?: Event) {
    if (event) event.stopPropagation(); // Para no cerrar el menú si quieres

    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.isRead = true;
        this.updateUnreadCount();
      });
    }
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.updateUnreadCount();
    });
  }

  // Cierra el menú si haces clic fuera
  @HostListener('document:click')
  closeNotifications() {
    this.showNotifications = false;
  }
  get isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.roles?.includes('ROLE_ADMIN') || false;
  }
}
