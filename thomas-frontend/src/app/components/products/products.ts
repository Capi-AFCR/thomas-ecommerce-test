import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NewProductComponent } from '../new-product/new-product';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  searchForm: FormGroup;
  displayedColumns: string[] = ['id', 'name', 'description', 'price', 'actions'];
  isLoading = true; // Para mostrar un indicador de carga
  errorMessage: string | null = null; // Para mostrar errores

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.searchForm = this.fb.group({
      name: [''],
      minPrice: [''],
      maxPrice: [''],
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.errorMessage = null;
    this.apiService.getProducts().subscribe({
      next: (products) => {
        console.log('Productos recibidos:', products); // Depuración
        this.products = products;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.errorMessage = 'Error al cargar productos: ' + (err.message || 'Ocurrió un error');
        this.isLoading = false;
        this.snackBar.open(this.errorMessage, 'Cerrar', { duration: 3000 });
      },
    });
  }

  onSearch() {
    this.isLoading = true;
    this.errorMessage = null;
    const { name, minPrice, maxPrice } = this.searchForm.value;
    this.apiService.searchProducts(name, minPrice, maxPrice).subscribe({
      next: (products) => {
        console.log('Resultados de búsqueda:', products); // Depuración
        this.products = products;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        this.errorMessage = 'Error en la búsqueda: ' + (err.message || 'Ocurrió un error');
        this.isLoading = false;
        this.snackBar.open(this.errorMessage, 'Cerrar', { duration: 3000 });
      },
    });
  }

  openNewProductDialog() {
    const dialogRef = this.dialog.open(NewProductComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.apiService.createProduct(result).subscribe({
          next: () => {
            this.loadProducts();
            this.snackBar.open('Producto creado', 'Cerrar', { duration: 3000 });
          },
          error: () => this.snackBar.open('Error al crear producto', 'Cerrar', { duration: 3000 }),
        });
      }
    });
  }

  deleteProduct(id: number) {
    this.apiService.deleteProduct(id).subscribe({
      next: () => {
        this.loadProducts();
        this.snackBar.open('Producto eliminado', 'Cerrar', { duration: 3000 });
      },
      error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 }),
    });
  }

  goToDetail(id: number) {
    this.router.navigate([`/products/${id}`]);
  }
}
