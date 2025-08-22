import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8080/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no queden solicitudes HTTP pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Pruebas para Productos
  it('should retrieve products from API', () => {
    const mockProducts = [
      { id: 1, name: 'Producto 1', price: 100, description: 'Descripción 1' },
      { id: 2, name: 'Producto 2', price: 200, description: 'Descripción 2' },
    ];

    service.getProducts().subscribe((products) => {
      expect(products.length).toBe(2);
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(`${baseUrl}/products`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should retrieve a product by ID', () => {
    const mockProduct = { id: 1, name: 'Producto 1', price: 100, description: 'Descripción 1' };

    service.getProduct(1).subscribe((product) => {
      expect(product).toEqual(mockProduct);
    });

    const req = httpMock.expectOne(`${baseUrl}/products/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  it('should handle error when product not found', () => {
    service.getProduct(999).subscribe({
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
      },
    });

    const req = httpMock.expectOne(`${baseUrl}/products/999`);
    expect(req.request.method).toBe('GET');
    req.flush('Product not found', { status: 404, statusText: 'Not Found' });
  });

  it('should create a product', () => {
    const newProduct = {
      name: 'Producto 3',
      description: 'Descripción 3',
      price: 300,
      initialStock: 10,
    };
    const mockResponse = { id: 3, ...newProduct };

    service.createProduct(newProduct).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/products`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newProduct);
    req.flush(mockResponse);
  });

  it('should update a product', () => {
    const updatedProduct = {
      nam: 'Producto 1 Actualizado',
      descripction: 'Descripción Actualizada',
      price: 150,
    };
    const mockResponse = { id: 1, ...updatedProduct };

    service.updateProduct(1, updatedProduct).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/products/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedProduct);
    req.flush(mockResponse);
  });

  it('should delete a product', () => {
    service.deleteProduct(1).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}/products/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should search products with name and price range', () => {
    const mockProducts = [{ id: 1, name: 'Producto 1', price: 100, description: 'Descripción 1' }];
    const name = 'Producto';
    const minPrice = 50;
    const maxPrice = 150;

    service.searchProducts(name, minPrice, maxPrice).subscribe((products) => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(
      `${baseUrl}/products/search?name=${name}&minPrice=${minPrice}&maxPrice=${maxPrice}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should search products with only name', () => {
    const mockProducts = [{ id: 1, name: 'Producto 1', price: 100, description: 'Descripción 1' }];
    const name = 'Producto';

    service.searchProducts(name).subscribe((products) => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(`${baseUrl}/products/search?name=${name}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  // Pruebas para Inventarios
  it('should retrieve inventories from API', () => {
    const mockInventories = [{ id: 1, productId: 1, stock: 10 }];

    service.getInventory().subscribe((inventories) => {
      expect(inventories.length).toBe(1);
      expect(inventories).toEqual(mockInventories);
    });

    const req = httpMock.expectOne(`${baseUrl}/inventory`);
    expect(req.request.method).toBe('GET');
    req.flush(mockInventories);
  });

  it('should retrieve an inventory by ID', () => {
    const mockInventory = { id: 1, productId: 1, stock: 10 };

    service.getInventoryById(1).subscribe((inventory) => {
      expect(inventory).toEqual(mockInventory);
    });

    const req = httpMock.expectOne(`${baseUrl}/inventory/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockInventory);
  });

  it('should create an inventory', () => {
    const newInventory = { productId: 1, stock: 20 };
    const mockResponse = { id: 1, ...newInventory };

    service.createInventory(newInventory).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/inventory`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newInventory);
    req.flush(mockResponse);
  });

  it('should update an inventory', () => {
    const updatedInventory = { productId: 1, stock: 30 };
    const mockResponse = { id: 1, ...updatedInventory };

    service.updateInventory(1, updatedInventory).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/inventory/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedInventory);
    req.flush(mockResponse);
  });

  it('should delete an inventory', () => {
    service.deleteInventory(1).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}/inventory/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // Pruebas para Órdenes
  it('should retrieve orders from API', () => {
    const mockOrders = [{ id: 1, userId: 1, total: 200 }];

    service.getOrders().subscribe((orders) => {
      expect(orders.length).toBe(1);
      expect(orders).toEqual(mockOrders);
    });

    const req = httpMock.expectOne(`${baseUrl}/orders`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });

  it('should retrieve an order by ID', () => {
    const mockOrder = { id: 1, userId: 1, total: 200 };

    service.getOrder(1).subscribe((order) => {
      expect(order).toEqual(mockOrder);
    });

    const req = httpMock.expectOne(`${baseUrl}/orders/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrder);
  });

  it('should create an order', () => {
    const newOrder = { products: [{ productId: 1, quantity: 2 }], isRandomOrder: false };
    const mockResponse = { id: 1, ...newOrder, total: 200 };

    service.createOrder(newOrder).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/orders`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newOrder);
    req.flush(mockResponse);
  });

  it('should update an order', () => {
    const updatedOrder = { total: 300 };
    const mockResponse = { id: 1, ...updatedOrder };

    service.updateOrder(1, updatedOrder).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/orders/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedOrder);
    req.flush(mockResponse);
  });

  it('should delete an order', () => {
    service.deleteOrder(1).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}/orders/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // Pruebas para Usuarios
  it('should retrieve users from API', () => {
    const mockUsers = [{ id: 1, username: 'testuser', email: 'test@example.com' }];

    service.getUsers().subscribe((users) => {
      expect(users.length).toBe(1);
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(`${baseUrl}/users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should retrieve a user by ID', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };

    service.getUser(1).subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${baseUrl}/users/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should create a user', () => {
    const newUser = { username: 'newuser', email: 'new@example.com' };
    const mockResponse = { id: 1, ...newUser };

    service.createUser(newUser).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/users`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUser);
    req.flush(mockResponse);
  });

  it('should update a user', () => {
    const updatedUser = { username: 'updateduser', email: 'updated@example.com' };
    const mockResponse = { id: 1, ...updatedUser };

    service.updateUser(1, updatedUser).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/users/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedUser);
    req.flush(mockResponse);
  });

  it('should deactivate a user', () => {
    const mockResponse = { id: 1, username: 'testuser', active: false };

    service.deactivateUser(1).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/users/1/deactivate`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush(mockResponse);
  });

  it('should delete a user', () => {
    service.deleteUser(1).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}/users/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // Pruebas para Reportes
  it('should retrieve active products', () => {
    const mockProducts = [{ id: 1, name: 'Producto 1', price: 100, stock: 10 }];

    service.getActiveProducts().subscribe((products) => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(`${baseUrl}/reports/active-products`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should retrieve top sold products', () => {
    const mockTopSold = [{ product: { id: 1, name: 'Producto 1' }, totalSold: 50 }];

    service.getTopSold().subscribe((topSold) => {
      expect(topSold).toEqual(mockTopSold);
    });

    const req = httpMock.expectOne(`${baseUrl}/reports/top-sold`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTopSold);
  });

  it('should retrieve top clients', () => {
    const mockTopClients = [{ id: 1, username: 'testuser', orderCount: 10 }];

    service.getTopClients().subscribe((topClients) => {
      expect(topClients).toEqual(mockTopClients);
    });

    const req = httpMock.expectOne(`${baseUrl}/reports/top-clients`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTopClients);
  });
});
