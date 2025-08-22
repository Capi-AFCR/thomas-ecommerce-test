import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ApiService } from '../../services/api';
import { ReportsComponent } from './reports';
import { of, throwError } from 'rxjs';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockTopClients = [
    { id: 1, username: 'Client A', orders: 1000 },
    { id: 2, username: 'Client B', orders: 2000 },
  ];

  const mockActiveProducts = [
    { id: 1, name: 'Product A', price: 50 },
    { id: 2, name: 'Product B', price: 100 },
  ];

  const mockTopSold = [
    { id: 1, name: 'Product A', sales: 500 },
    { id: 2, name: 'Product B', sales: 300 },
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getTopClients',
      'getActiveProducts',
      'getTopSold',
    ]);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        ReportsComponent, // Standalone component in imports
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    apiService.getTopClients.and.returnValue(of(mockTopClients));
    apiService.getActiveProducts.and.returnValue(of(mockActiveProducts));
    apiService.getTopSold.and.returnValue(of(mockTopSold));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize displayed columns', () => {
    expect(component.displayedColumnsTopClients).toEqual(['id', 'username', 'orders']);
    expect(component.displayedColumnsProducts).toEqual(['id', 'name', 'price']);
    expect(component.displayedColumnsTopSold).toEqual(['id', 'name', 'sales']);
  });

  it('should load data on ngOnInit', fakeAsync(() => {
    component.ngOnInit();
    tick(100);
    fixture.detectChanges();

    expect(apiService.getActiveProducts).toHaveBeenCalled();
    expect(apiService.getTopSold).toHaveBeenCalled();
    expect(apiService.getTopClients).toHaveBeenCalled();
    expect(component.activeProducts).toEqual(mockActiveProducts);
    expect(component.topSold).toEqual(mockTopSold);
    expect(component.topClients).toEqual(mockTopClients);
  }));

  it('should handle error on getTopClients', fakeAsync(() => {
    spyOn(console, 'error'); // Mock console.error to avoid uncaught exception
    apiService.getTopClients.and.returnValue(throwError(() => new Error('Server error')));

    component.loadTopClients();
    tick(100);
    fixture.detectChanges();

    expect(apiService.getTopClients).toHaveBeenCalled();
    //expect(snackBar.open).toHaveBeenCalledWith('Error al cargar top clientes', 'Cerrar', { duration: 3000 });
    expect(component.topClients).toEqual([]);
  }));

  it('should handle error on getActiveProducts', fakeAsync(() => {
    spyOn(console, 'error'); // Mock console.error to avoid uncaught exception
    apiService.getActiveProducts.and.returnValue(throwError(() => new Error('Server error')));

    component.loadActiveProducts();
    tick(100);
    fixture.detectChanges();

    expect(apiService.getActiveProducts).toHaveBeenCalled();
    //expect(snackBar.open).toHaveBeenCalledWith('Error al cargar productos activos', 'Cerrar', { duration: 3000 });
    expect(component.activeProducts).toEqual([]);
  }));

  it('should handle error on getTopSold', fakeAsync(() => {
    spyOn(console, 'error'); // Mock console.error to avoid uncaught exception
    apiService.getTopSold.and.returnValue(throwError(() => new Error('Server error')));

    component.loadTopSold();
    tick(100);
    fixture.detectChanges();

    expect(apiService.getTopSold).toHaveBeenCalled();
    //expect(snackBar.open).toHaveBeenCalledWith('Error al cargar productos más vendidos', 'Cerrar', { duration: 3000 });
    expect(component.topSold).toEqual([]);
  }));

  it('should render table headers for top clients', fakeAsync(() => {
    component.topClients = mockTopClients;
    fixture.detectChanges();
    tick();

    const compiled = fixture.nativeElement;
    const headers = compiled.querySelectorAll('th[mat-header-cell]');
    expect(headers.length).toBe(3, 'Expected 3 headers for top clients');
    expect(headers[0]?.textContent).toContain('ID');
    expect(headers[1]?.textContent).toContain('Usuario');
    expect(headers[2]?.textContent).toContain('Órdenes');
  }));

  it('should render top clients table', fakeAsync(() => {
    component.topClients = mockTopClients;
    fixture.detectChanges();
    tick();

    const compiled = fixture.nativeElement;
    const tableRows = compiled.querySelectorAll('tr[mat-row]');
    expect(tableRows.length).toBe(2, 'Expected 2 rows for top clients');
    expect(tableRows[0].querySelector('td:nth-child(1)')?.textContent).toContain(
      '1',
      'Expected ID'
    );
    expect(tableRows[0].querySelector('td:nth-child(2)')?.textContent).toContain(
      'Client A',
      'Expected Name'
    );
    expect(tableRows[0].querySelector('td:nth-child(3)')?.textContent).toContain(
      '1000',
      'Expected Total Spent'
    );
  }));

  it('should render table headers for active products', fakeAsync(() => {
    component.activeProducts = mockActiveProducts;
    fixture.detectChanges();
    tick();

    const compiled = fixture.nativeElement;
    const headers = compiled.querySelectorAll('th[mat-header-cell]');
    expect(headers.length).toBe(3, 'Expected 3 headers for active products');
    expect(headers[0]?.textContent).toContain('ID');
    expect(headers[1]?.textContent).toContain('Nombre');
    expect(headers[2]?.textContent).toContain('Precio');
  }));

  it('should render active products table', fakeAsync(() => {
    component.activeProducts = mockActiveProducts;
    fixture.detectChanges();
    tick();

    const compiled = fixture.nativeElement;
    const tableRows = compiled.querySelectorAll('tr[mat-row]');
    expect(tableRows.length).toBe(2, 'Expected 2 rows for active products');
    expect(tableRows[0].querySelector('td:nth-child(1)')?.textContent).toContain(
      '1',
      'Expected ID'
    );
    expect(tableRows[0].querySelector('td:nth-child(2)')?.textContent).toContain(
      'Product A',
      'Expected Name'
    );
    expect(tableRows[0].querySelector('td:nth-child(3)')?.textContent).toContain(
      '50',
      'Expected Stock'
    );
  }));

  it('should render table headers for top sold products', fakeAsync(() => {
    component.topSold = mockTopSold;
    fixture.detectChanges();
    tick();

    const compiled = fixture.nativeElement;
    const headers = compiled.querySelectorAll('th[mat-header-cell]');
    expect(headers.length).toBe(3, 'Expected 3 headers for top sold products');
    expect(headers[0]?.textContent).toContain('ID');
    expect(headers[1]?.textContent).toContain('Nombre');
    expect(headers[2]?.textContent).toContain('Ventas');
  }));

  it('should render top sold products table', fakeAsync(() => {
    component.topSold = mockTopSold;
    fixture.detectChanges();
    tick();

    const compiled = fixture.nativeElement;
    const tableRows = compiled.querySelectorAll('tr[mat-row]');
    expect(tableRows.length).toBe(2, 'Expected 2 rows for top sold products');
    expect(tableRows[0].querySelector('td:nth-child(1)')?.textContent).toContain(
      '1',
      'Expected ID'
    );
    expect(tableRows[0].querySelector('td:nth-child(2)')?.textContent).toContain(
      'Product A',
      'Expected Name'
    );
    expect(tableRows[0].querySelector('td:nth-child(3)')?.textContent).toContain(
      '500',
      'Expected Total Sold'
    );
  }));

  it('should debug template rendering', fakeAsync(() => {
    component.topClients = mockTopClients;
    component.activeProducts = mockActiveProducts;
    component.topSold = mockTopSold;
    fixture.detectChanges();
    tick();
    console.log('Template HTML:', fixture.nativeElement.innerHTML);
    console.log('Top Clients:', component.topClients);
    console.log('Active Products:', component.activeProducts);
    console.log('Top Sold:', component.topSold);
    expect(component).toBeTruthy();
  }));
});
