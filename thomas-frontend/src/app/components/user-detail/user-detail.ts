import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './user-detail.html',
  styleUrls: ['./user-detail.css'],
})
export class UserDetailComponent implements OnInit {
  userForm: FormGroup;
  user: any;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      username: [''],
      email: ['', Validators.email],
      role: ['USER'],
    });
  }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.apiService.getUser(id).subscribe((user) => {
      this.user = user;
      this.userForm.patchValue(user);
    });
  }

  onSubmit() {
    this.apiService.updateUser(this.user.id, this.userForm.value).subscribe({
      next: () => {
        this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/users']);
      },
      error: () => this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 }),
    });
  }
}
