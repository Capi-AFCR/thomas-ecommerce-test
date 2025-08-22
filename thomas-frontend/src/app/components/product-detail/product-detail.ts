import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css'],
})
export class ProductDetailComponent implements OnInit {
  productForm: FormGroup;
  product: any;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      name: [''],
      description: [''],
      price: [0],
    });
  }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.apiService.getProduct(id).subscribe((product) => {
      this.product = product;
      this.productForm.patchValue(product);
    });
  }

  onSubmit() {
    this.apiService.updateProduct(this.product.id, this.productForm.value).subscribe({
      next: () => {
        this.snackBar.open('Producto actualizado', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/products']);
      },
      error: () => this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 }),
    });
  }
}
