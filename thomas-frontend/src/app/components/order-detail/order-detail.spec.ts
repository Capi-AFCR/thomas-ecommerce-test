import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { OrderDetailComponent } from './order-detail';
import { of, throwError } from 'rxjs';

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;

  const mockOrder = {
    id: 1,
    userId: 1,
    total: 300,
    orderDetail: [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ],
  };

  const mockProducts = [
    { id: 1, name: 'Product A', price: 100 },
    { id: 2, name: 'Product B', price: 200 },
  ];

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('1'),
      },
    },
  };

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getOrder', 'getProducts']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        CommonModule,
        MatSnackBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatTableModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
        OrderDetailComponent, // Standalone component in imports
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize displayedColumns', () => {
    expect(component.displayedColumns).toEqual(['name', 'quantity', 'price', 'subtotal']);
  });

  it('should load order and products on ngOnInit with valid ID', fakeAsync(() => {
    apiService.getOrder.and.returnValue(of(mockOrder));
    apiService.getProducts.and.returnValue(of(mockProducts));

    component.ngOnInit();
    tick(); // Resolve async calls
    fixture.detectChanges();

    expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    expect(apiService.getOrder).toHaveBeenCalledWith(1);
    expect(apiService.getProducts).toHaveBeenCalled();
    expect(component.order).toEqual(mockOrder);
    expect(component.products).toEqual(mockProducts);
    expect(component.isLoading).toBeFalse();
  }));

  it('should navigate to /orders and show snackbar on invalid ID', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

    component.ngOnInit();
    fixture.detectChanges();

    /*expect(snackBar.open).toHaveBeenCalledWith('ID de orden no válido', 'Cerrar', {
      duration: 3000,
    });*/
    expect(router.navigate).toHaveBeenCalledWith(['/orders']);
    expect(apiService.getOrder).not.toHaveBeenCalled();
    expect(apiService.getProducts).not.toHaveBeenCalled();
  });

  it('should show error snackbar and navigate on getOrder failure', fakeAsync(() => {
    apiService.getOrder.and.returnValue(throwError(() => new Error('Order fetch error')));
    apiService.getProducts.and.returnValue(of(mockProducts));

    component.loadOrderDetails(1);
    tick();
    fixture.detectChanges();

    expect(apiService.getOrder).toHaveBeenCalledWith(1);
    /*expect(snackBar.open).toHaveBeenCalledWith('Error al cargar detalles de la orden', 'Cerrar', {
      duration: 3000,
    });*/
    expect(router.navigate).toHaveBeenCalledWith(['/orders']);
  }));

  it('should show error snackbar on getProducts failure', fakeAsync(() => {
    apiService.getProducts.and.returnValue(throwError(() => ({ status: 500 })));

    component.loadProducts();
    tick();
    fixture.detectChanges();

    expect(apiService.getProducts).toHaveBeenCalled();
    /*expect(snackBar.open).toHaveBeenCalledWith('Error al cargar productos', 'Cerrar', {
      duration: 3000,
    });*/
  }));

  it('should navigate to /orders on goBack', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/orders']);
  });

  it('should render loading spinner when isLoading is true', () => {
    component.isLoading = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('mat-spinner')).toBeTruthy();
    expect(compiled.querySelector('table[mat-table]')).toBeFalsy();
  });

  it('should render order details table when isLoading is false', fakeAsync(() => {
    component.isLoading = false;
    component.order = mockOrder;
    component.products = mockProducts;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const tableRows = compiled.querySelectorAll('tr[mat-row]');
    expect(tableRows.length).toBe(2);
    expect(tableRows[0].querySelector('td:nth-child(1)').textContent).toContain('Product A');
    expect(tableRows[0].querySelector('td:nth-child(2)').textContent).toContain('2');
    expect(tableRows[0].querySelector('td:nth-child(3)').textContent).toContain('100');
    expect(tableRows[0].querySelector('td:nth-child(4)').textContent).toContain('200');
    expect(tableRows[1].querySelector('td:nth-child(1)').textContent).toContain('Product B');
    expect(tableRows[1].querySelector('td:nth-child(2)').textContent).toContain('1');
    expect(tableRows[1].querySelector('td:nth-child(3)').textContent).toContain('200');
    expect(tableRows[1].querySelector('td:nth-child(4)').textContent).toContain('200');
    expect(compiled.querySelector('p').textContent).toContain('Total: 300');
  }));

  it('should render table headers', () => {
    component.isLoading = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const headers = compiled.querySelectorAll('th[mat-header-cell]');
    expect(headers.length).toBe(4);
    expect(headers[0].textContent).toContain('Producto');
    expect(headers[1].textContent).toContain('Cantidad');
    expect(headers[2].textContent).toContain('Precio Unitario');
    expect(headers[3].textContent).toContain('Subtotal');
  });
});
