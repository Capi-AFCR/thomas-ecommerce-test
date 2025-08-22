import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule],
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

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadActiveProducts();
    this.loadTopSold();
    this.loadTopClients();
  }

  loadTopSold() {
    this.apiService.getTopSold().subscribe((data) => (this.topSold = data));
  }

  loadActiveProducts() {
    this.apiService.getActiveProducts().subscribe((data) => (this.activeProducts = data));
  }

  loadTopClients() {
    this.apiService.getTopClients().subscribe((data) => (this.topClients = data));
  }
}
