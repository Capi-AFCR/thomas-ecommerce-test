import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-new-order',
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
    MatTableModule,
    MatSnackBarModule,
  ],
  templateUrl: './new-order.html',
  styleUrls: ['./new-order.css'],
})
export class NewOrderComponent implements OnInit {
  products: any[] = [];
  orderForm: FormGroup;
  addedProductsColumns: string[] = ['product', 'quantity', 'actions'];
  isRandomOrder = false;
  maxRandomProducts = 3;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<NewOrderComponent>
  ) {
    this.orderForm = this.fb.group({
      selectedProductId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      products: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 });
      },
    });
  }

  get addedProductsFormArray(): FormArray {
    return this.orderForm.get('products') as FormArray;
  }

  get addedProductsData() {
    return this.addedProductsFormArray.controls.map((control, index) => ({
      index,
      product: this.getProductName(control.get('productId')?.value),
      quantity: control.get('quantity')?.value,
    }));
  }

  getProductName(productId: number): string {
    const product = this.products.find((p) => p.id === productId);
    return product ? product.name : '';
  }

  addProduct() {
    if (this.orderForm.get('selectedProductId')?.valid && this.orderForm.get('quantity')?.valid) {
      const { selectedProductId, quantity } = this.orderForm.value;
      const productGroup = this.fb.group({
        productId: [selectedProductId, Validators.required],
        quantity: [quantity, [Validators.required, Validators.min(1)]],
      });
      this.addedProductsFormArray.push(productGroup);
      this.orderForm.patchValue({ selectedProductId: '', quantity: 1 });
    } else {
      this.snackBar.open('Por favor, selecciona un producto y una cantidad válida', 'Cerrar', {
        duration: 3000,
      });
    }
  }

  addRandomProducts() {
    if (this.products.length === 0) {
      this.snackBar.open('No hay productos disponibles para pedidos aleatorios', 'Cerrar', {
        duration: 3000,
      });
      return;
    }
    this.orderForm.setControl('products', this.fb.array([]));
    this.isRandomOrder = true;
    const numProducts = Math.floor(Math.random() * this.maxRandomProducts) + 1;
    const shuffledProducts = [...this.products].sort(() => Math.random() - 0.5);
    const selectedProducts = shuffledProducts.slice(0, numProducts);
    selectedProducts.forEach((product) => {
      const productGroup = this.fb.group({
        productId: [product.id, Validators.required],
        quantity: [Math.floor(Math.random() * 5) + 1, [Validators.required, Validators.min(1)]],
      });
      this.addedProductsFormArray.push(productGroup);
    });
    this.snackBar.open(`Añadidos ${numProducts} productos aleatorios`, 'Cerrar', {
      duration: 3000,
    });
  }

  removeAddedProduct(index: number) {
    this.addedProductsFormArray.removeAt(index);
  }

  calculateTotal(): number {
    let total = 0;
    const products = this.orderForm.value.products;
    for (const p of products) {
      const product = this.products.find((prod) => prod.id === p.productId);
      if (product) {
        total += product.price * p.quantity;
      }
    }
    return total;
  }

  onSubmit() {
    const products = this.orderForm.value.products.map((p: any) => ({
      productId: p.productId,
      quantity: p.quantity,
    }));
    const orderData = {
      products,
      isRandomOrder: this.isRandomOrder,
    };
    this.apiService.createOrder(orderData).subscribe({
      next: () => {
        this.snackBar.open('Orden creada', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al crear orden:', err);
        this.snackBar.open('Error al crear orden', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
