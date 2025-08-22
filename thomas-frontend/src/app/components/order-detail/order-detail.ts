import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.css'],
})
export class OrderDetailComponent implements OnInit {
  order: any;
  products: any[] = [];
  displayedColumns: string[] = ['name', 'quantity', 'price', 'subtotal'];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrderDetails(+id);
      this.loadProducts();
    } else {
      this.snackBar.open('ID de orden no válido', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/orders']);
    }
  }

  loadOrderDetails(id: number) {
    this.apiService.getOrder(id).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
        console.log('Orden cargada:', order);
      },
      error: (err) => {
        console.error('Error al cargar orden:', err);
        this.snackBar.open('Error al cargar detalles de la orden', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/orders']);
      },
    });
  }

  loadProducts() {
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        console.log('Productos cargados:', products);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 });
      },
    });
  }

  goBack() {
    this.router.navigate(['/orders']);
  }
}
