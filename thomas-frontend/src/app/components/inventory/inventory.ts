import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatSnackBarModule,
  ],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.css'],
})
export class InventoryComponent implements OnInit {
  inventory: any[] = [];
  displayedColumns: string[] = ['id', 'product', 'stock', 'actions'];

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.apiService.getInventory().subscribe((inventory) => (this.inventory = inventory));
  }

  deleteInventory(id: number) {
    this.apiService.deleteInventory(id).subscribe({
      next: () => {
        this.loadInventory();
        this.snackBar.open('Inventario eliminado', 'Cerrar', { duration: 3000 });
      },
      error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 }),
    });
  }

  goToDetail(id: number) {
    this.router.navigate([`/inventory/${id}`]);
  }
}
