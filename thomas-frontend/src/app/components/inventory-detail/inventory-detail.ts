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
  selector: 'app-inventory-detail',
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
  templateUrl: './inventory-detail.html',
  styleUrls: ['./inventory-detail.css'],
})
export class InventoryDetailComponent implements OnInit {
  inventoryForm: FormGroup;
  inventory: any;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.inventoryForm = this.fb.group({
      stock: [0],
    });
  }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.apiService.getInventoryById(id).subscribe((inventory) => {
      this.inventory = inventory;
      this.inventoryForm.patchValue(inventory);
    });
  }

  onSubmit() {
    this.apiService.updateInventory(this.inventory.id, this.inventoryForm.value).subscribe({
      next: () => {
        this.snackBar.open('Inventario actualizado', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/inventory']);
      },
      error: () => this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 }),
    });
  }
}
