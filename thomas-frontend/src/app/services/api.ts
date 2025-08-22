import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Productos
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/products`);
  }

  getProduct(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/${id}`);
  }

  createProduct(productData: {
    name: string;
    description: string;
    price: number;
    initialStock: number;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/products`, productData);
  }

  updateProduct(id: number, product: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${id}`);
  }

  searchProducts(name?: string, minPrice?: number, maxPrice?: number): Observable<any[]> {
    let params = '';
    if (name) params += `name=${name}`;
    if (minPrice && maxPrice)
      params += (params ? '&' : '') + `minPrice=${minPrice}&maxPrice=${maxPrice}`;
    return this.http.get<any[]>(`${this.baseUrl}/products/search?${params}`);
  }

  // Inventarios
  getInventory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/inventory`);
  }

  getInventoryById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventory/${id}`);
  }

  createInventory(inventory: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/inventory`, inventory);
  }

  updateInventory(id: number, inventory: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/inventory/${id}`, inventory);
  }

  deleteInventory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/inventory/${id}`);
  }

  // Ordenes
  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/orders`);
  }

  getOrdersByUser(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/orders/user`);
  }

  getOrder(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders/${id}`);
  }

  createOrder(orderData: {
    products: { productId: number; quantity: number }[];
    isRandomOrder: boolean;
  }): Observable<any> {
    console.log(orderData);
    return this.http.post(`${this.baseUrl}/orders`, orderData);
  }

  updateOrder(id: number, orders: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/orders/${id}`, orders);
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/orders/${id}`);
  }

  // Usuarios
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
  }

  getUser(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${id}`);
  }

  createUser(users: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, users);
  }

  updateUser(id: number, users: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}`, users);
  }

  deactivateUser(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}/deactivate`, {});
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`);
  }

  // Reportes
  getActiveProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reports/active-products`);
  }

  getTopSold(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reports/top-sold`);
  }

  getTopClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reports/top-clients`);
  }
}
