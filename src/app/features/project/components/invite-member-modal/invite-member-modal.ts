import { Component, EventEmitter, Input, Output, inject,OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { User } from '../../../../shared/models/user.model';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, switchMap, distinctUntilChanged, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-invite-member-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invite-member-modal.html',
  styleUrl: './invite-member-modal.css',
})
export class InviteMemberModal implements OnInit, OnDestroy{
  @Input() isVisible = false;
  @Input() projectId!: number;

  @Output() closed = new EventEmitter<void>();
  @Output() memberInvited = new EventEmitter<void>();

  private projectService = inject(ProjectService);

  usernameToInvite = '';
  isLoading = false;
  errorMessage: string | null = null;

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  searchResults: User[] = [];
  showDropdown = false;

  ngOnInit() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) =>{
        if (!query || query.length < 2) {
            return of([]);
        }
        return this.projectService.searchUsers(query, Number(this.projectId)).pipe(
            catchError(err => {
                console.error('Error en autocompletado:', err);
                return of([]);
            })
        );
    })
  ).subscribe({
      next: (users) => {
        this.searchResults = users;
        this.showDropdown = users.length > 0;
      }
    });
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }

  onSearch(event: any) {
    const query = event.target.value;
    this.usernameToInvite = query;
    this.errorMessage = null;
    this.searchSubject.next(query);
  }

  selectUser(user: User) {
    this.usernameToInvite = user.username;
    this.showDropdown = false;
  }

  close(): void {
    this.isVisible = false;
    this.usernameToInvite = '';
    this.searchResults = [];
    this.showDropdown = false;
    this.errorMessage = null;
    this.closed.emit();
  }

  invite(): void {
    if (!this.usernameToInvite.trim()) return;
    this.isLoading = true;
    this.errorMessage = null;
    this.projectService.inviteMember(this.projectId, this.usernameToInvite.trim()).subscribe({
      next: () => {
        this.isLoading = false;
        this.memberInvited.emit();
        alert(`¡${this.usernameToInvite} ha sido invitado!`);
        this.close();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = 'No se pudo invitar. Verifica que el usuario exista y no sea ya miembro.';
      }
    });
  }
}
