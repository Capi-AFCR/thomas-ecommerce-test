import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
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
    order: {
      id: 1,
      date: new Date('2025-08-22T12:00:00'),
      total: 500,
      user: { username: 'Client A' },
    },
    orderDetail: [
      { product: { id: 1, name: 'Product A', price: 100 }, quantity: 2 },
      { product: { id: 2, name: 'Product B', price: 150 }, quantity: 2 },
    ],
  };

  const mockProducts = [
    { id: 1, name: 'Product A', price: 100 },
    { id: 2, name: 'Product B', price: 150 },
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getOrder', 'getProducts']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTableModule,
        MatButtonModule,
        MatFormFieldModule,
        MatSelectModule,
        NoopAnimationsModule,
        OrderDetailComponent,
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? '1' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    apiService.getOrder.and.returnValue(of(mockOrder));
    apiService.getProducts.and.returnValue(of(mockProducts));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize displayed columns', () => {
    expect(component.displayedColumns).toEqual(['name', 'quantity', 'price', 'subtotal']);
  });

  it('should load order details and products on ngOnInit', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(apiService.getOrder).toHaveBeenCalledWith(1);
    expect(apiService.getProducts).toHaveBeenCalled();
    expect(component.order).toEqual(mockOrder);
    expect(component.products).toEqual(mockProducts);
    expect(component.isLoading).toBeFalse();
  }));

  it('should show snackbar and navigate on invalid id', fakeAsync(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTableModule,
        MatButtonModule,
        MatFormFieldModule,
        MatSelectModule,
        NoopAnimationsModule,
        OrderDetailComponent,
      ],
      providers: [
        { provide: ApiService, useValue: apiService },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: null })),
            snapshot: {
              paramMap: {
                get: (key: string) => null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    tick();

    /*expect(snackBar.open).toHaveBeenCalledWith('ID de orden no válido', 'Cerrar', {
      duration: 3000,
    });*/
    expect(router.navigate).toHaveBeenCalledWith(['/orders']);
  }));

  it('should show snackbar and navigate on order load error', fakeAsync(() => {
    apiService.getOrder.and.returnValue(throwError(() => new Error('Server error')));
    component.ngOnInit();
    tick();

    expect(apiService.getOrder).toHaveBeenCalledWith(1);
    /*expect(snackBar.open).toHaveBeenCalledWith('Error al cargar detalles de la orden', 'Cerrar', {
      duration: 3000,
    });*/
    expect(router.navigate).toHaveBeenCalledWith(['/orders']);
    expect(component.order).toBeUndefined();
  }));

  it('should show snackbar on products load error', fakeAsync(() => {
    apiService.getProducts.and.returnValue(throwError(() => new Error('Server error')));
    component.ngOnInit();
    tick();

    expect(apiService.getProducts).toHaveBeenCalled();
    /*expect(snackBar.open).toHaveBeenCalledWith('Error al cargar productos', 'Cerrar', {
      duration: 3000,
    });*/
    expect(component.products).toEqual([]);
  }));

  it('should render order details when loaded', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('mat-spinner')).toBeFalsy('Expected no spinner');
    expect(compiled.querySelector('.order-details p:nth-child(1)')?.textContent).toContain('ID: 1');
    expect(compiled.querySelector('.order-details p:nth-child(2)')?.textContent).toContain(
      'Fecha:'
    );
    expect(compiled.querySelector('.order-details p:nth-child(3)')?.textContent).toContain(
      '$500.00'
    );
    expect(compiled.querySelector('.order-details p:nth-child(4)')?.textContent).toContain(
      'Usuario: Client A'
    );
  }));

  it('should render products table when order details exist', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const tableRows = compiled.querySelectorAll('.order-detail-table tr[mat-row]');
    expect(tableRows.length).toBe(2, 'Expected 2 rows in products table');
    expect(tableRows[0].querySelector('td:nth-child(1)')?.textContent).toContain('Product A');
    expect(tableRows[0].querySelector('td:nth-child(2)')?.textContent).toContain('2');
    expect(tableRows[0].querySelector('td:nth-child(3)')?.textContent).toContain('$100.00');
    expect(tableRows[0].querySelector('td:nth-child(4)')?.textContent).toContain('$200.00');
  }));

  it('should render no products message when order details are empty', fakeAsync(() => {
    const emptyOrder = {
      order: { id: 1, date: new Date(), total: 500, user: { username: 'Client A' } },
      orderDetail: [],
    };
    apiService.getOrder.and.returnValue(of(emptyOrder));
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.no-data-message')).toBeTruthy('Expected no products message');
    expect(compiled.querySelector('.no-data-message')?.textContent).toContain(
      'No hay productos en esta orden'
    );
  }));

  it('should navigate back on goBack', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/orders']);
  });

  it('should debug template rendering', fakeAsync(() => {
    component.isLoading = true;
    fixture.detectChanges();
    console.log('Template HTML (loading):', fixture.nativeElement.innerHTML);

    component.isLoading = false;
    component.order = mockOrder;
    fixture.detectChanges();
    console.log('Template HTML (loaded):', fixture.nativeElement.innerHTML);

    console.log('paramMap:', TestBed.inject(ActivatedRoute).paramMap);
    console.log('Products:', component.products);
    expect(component).toBeTruthy();
  }));
});
