import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatSnackBarModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css'],
})
export class ReportsComponent implements OnInit {
  activeProducts: any[] = [];
  topSold: any[] = [];
  topClients: any[] = [];
  displayedColumnsProducts: string[] = ['id', 'name', 'price'];
  displayedColumnsTopSold: string[] = ['id', 'name', 'sales'];
  displayedColumnsTopClients: string[] = ['id', 'username', 'orders'];

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadActiveProducts();
    this.loadTopSold();
    this.loadTopClients();
  }

  loadActiveProducts() {
    this.apiService.getActiveProducts().subscribe({
      next: (products) => {
        this.activeProducts = products;
      },
      error: () => {
        this.snackBar.open('Error al cargar productos activos', 'Cerrar', { duration: 3000 });
      },
    });
  }

  loadTopSold() {
    this.apiService.getTopSold().subscribe({
      next: (products) => {
        this.topSold = products;
      },
      error: () => {
        this.snackBar.open('Error al cargar productos más vendidos', 'Cerrar', { duration: 3000 });
      },
    });
  }

  loadTopClients() {
    this.apiService.getTopClients().subscribe({
      next: (clients) => {
        this.topClients = clients;
      },
      error: () => {
        this.snackBar.open('Error al cargar top clientes', 'Cerrar', { duration: 3000 });
      },
    });
  }
}
