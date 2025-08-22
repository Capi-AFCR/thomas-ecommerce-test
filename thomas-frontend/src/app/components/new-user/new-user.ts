import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-new-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './new-user.html',
  styleUrls: ['./new-user.css'],
})
export class NewUserComponent {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialogRef: MatDialogRef<NewUserComponent>,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.dialogRef.close(this.userForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
