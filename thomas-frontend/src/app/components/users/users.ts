import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';
import { NewUserComponent } from '../new-user/new-user';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  displayedColumns: string[] = ['id', 'username', 'email', 'role', 'active', 'actions'];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.apiService.getUsers().subscribe((users) => (this.users = users));
  }

  openNewUserDialog() {
    const dialogRef = this.dialog.open(NewUserComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.register(result).subscribe({
          next: () => {
            this.loadUsers();
            this.snackBar.open('Usuario registrado', 'Cerrar', { duration: 3000 });
          },
          error: () => this.snackBar.open('Error al crear', 'Cerrar', { duration: 3000 }),
        });
      }
    });
  }

  deactivateUser(id: number) {
    this.apiService.deactivateUser(id).subscribe({
      next: () => {
        this.loadUsers();
        this.snackBar.open('Usuario desactivado', 'Cerrar', { duration: 3000 });
      },
      error: () => this.snackBar.open('Error al desactivar', 'Cerrar', { duration: 3000 }),
    });
  }

  deleteUsuario(id: number) {
    this.apiService.deleteUser(id).subscribe({
      next: () => {
        this.loadUsers();
        this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 3000 });
      },
      error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 }),
    });
  }

  goToDetail(id: number) {
    this.router.navigate([`/users/${id}`]);
  }
}
