import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { NewOrderComponent } from '../new-order/new-order';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatSnackBarModule,
  ],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css'],
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  displayedColumns: string[] = ['id', 'date', 'total', 'user', 'actions'];

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    if (this.authService.isAdmin()) {
      this.apiService.getOrders().subscribe({
        next: (orders) => {
          this.orders = orders;
        },
        error: (err) => {
          console.error('Error al cargar órdenes:', err);
          this.snackBar.open('Error al cargar órdenes', 'Cerrar', { duration: 3000 });
        },
      });
    } else {
      this.apiService.getOrdersByUser().subscribe({
        next: (orders) => {
          this.orders = orders;
        },
        error: (err) => {
          console.error('Error al cargar órdenes:', err);
          this.snackBar.open('Error al cargar órdenes', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }

  openNewOrderDialog() {
    const dialogRef = this.dialog.open(NewOrderComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadOrders(); // Refrescar la lista de órdenes tras crear una nueva
        this.snackBar.open('Orden creada con éxito', 'Cerrar', { duration: 3000 });
      }
    });
  }

  deleteOrder(id: number) {
    this.apiService.deleteOrder(id).subscribe({
      next: () => {
        this.loadOrders();
        this.snackBar.open('Orden eliminada', 'Cerrar', { duration: 3000 });
      },
      error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 }),
    });
  }

  goToDetail(id: number) {
    this.router.navigate([`/orders/${id}`]);
  }
}
