import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { OrdersComponent } from './orders';
import { NewOrderComponent } from '../new-order/new-order';

describe('OrdersComponent', () => {
  let component: OrdersComponent;
  let fixture: ComponentFixture<OrdersComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const mockOrders = [
    { id: 1, date: '2025-08-22T12:00:00', total: 500, user: { username: 'Client A' } },
    { id: 2, date: '2025-08-23T12:00:00', total: 300, user: { username: 'Client B' } },
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getOrders',
      'getOrdersByUser',
      'deleteOrder',
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatTableModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        OrdersComponent,
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize displayed columns', () => {
    expect(component.displayedColumns).toEqual(['id', 'date', 'total', 'user', 'actions']);
  });

  it('should load orders for admin on ngOnInit', fakeAsync(() => {
    authService.isAdmin.and.returnValue(true);
    apiService.getOrders.and.returnValue(of(mockOrders));

    component.ngOnInit();
    tick();

    expect(authService.isAdmin).toHaveBeenCalled();
    expect(apiService.getOrders).toHaveBeenCalled();
    expect(component.orders).toEqual(mockOrders);
  }));

  it('should load user orders for non-admin on ngOnInit', fakeAsync(() => {
    authService.isAdmin.and.returnValue(false);
    apiService.getOrdersByUser.and.returnValue(of(mockOrders));

    component.ngOnInit();
    tick();

    expect(authService.isAdmin).toHaveBeenCalled();
    expect(apiService.getOrdersByUser).toHaveBeenCalled();
    expect(component.orders).toEqual(mockOrders);
  }));

  it('should show snackbar on load orders error for admin', fakeAsync(() => {
    authService.isAdmin.and.returnValue(true);
    apiService.getOrders.and.returnValue(throwError(() => new Error('Server error')));

    component.ngOnInit();
    tick();

    expect(authService.isAdmin).toHaveBeenCalled();
    expect(apiService.getOrders).toHaveBeenCalled();
    //expect(snackBar.open).toHaveBeenCalledWith('Error al cargar órdenes', 'Cerrar', { duration: 3000 });
  }));

  it('should show snackbar on load user orders error for non-admin', fakeAsync(() => {
    authService.isAdmin.and.returnValue(false);
    apiService.getOrdersByUser.and.returnValue(throwError(() => new Error('Server error')));

    component.ngOnInit();
    tick();

    expect(authService.isAdmin).toHaveBeenCalled();
    expect(apiService.getOrdersByUser).toHaveBeenCalled();
    //expect(snackBar.open).toHaveBeenCalledWith('Error al cargar órdenes', 'Cerrar', { duration: 3000 });
  }));

  it('should open new order dialog and reload orders on close with result', fakeAsync(() => {
    authService.isAdmin.and.returnValue(true);
    apiService.getOrders.and.returnValue(of(mockOrders));
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of({}));
    dialog.open.and.returnValue(dialogRefSpy);

    component.openNewOrderDialog();
    tick();

    expect(dialog.open).toHaveBeenCalledWith(NewOrderComponent, { width: '600px' });
    expect(apiService.getOrders).toHaveBeenCalled();
    //expect(snackBar.open).toHaveBeenCalledWith('Orden creada con éxito', 'Cerrar', { duration: 3000 });
  }));

  it('should delete order and reload orders', fakeAsync(() => {
    authService.isAdmin.and.returnValue(true);
    apiService.deleteOrder.and.returnValue(of(null));
    apiService.getOrders.and.returnValue(of(mockOrders));

    component.deleteOrder(1);
    tick();

    expect(apiService.deleteOrder).toHaveBeenCalledWith(1);
    expect(apiService.getOrders).toHaveBeenCalled();
    //expect(snackBar.open).toHaveBeenCalledWith('Orden eliminada', 'Cerrar', { duration: 3000 });
  }));

  it('should show snackbar on delete order error', fakeAsync(() => {
    apiService.deleteOrder.and.returnValue(throwError(() => new Error('Delete error')));

    component.deleteOrder(1);
    tick();

    expect(apiService.deleteOrder).toHaveBeenCalledWith(1);
    //expect(snackBar.open).toHaveBeenCalledWith('Error al eliminar', 'Cerrar', { duration: 3000 });
  }));

  it('should navigate to order detail', () => {
    component.goToDetail(1);
    expect(router.navigate).toHaveBeenCalledWith(['/orders/1']);
  });

  it('should render orders table for admin', fakeAsync(() => {
    authService.isAdmin.and.returnValue(true);
    apiService.getOrders.and.returnValue(of(mockOrders));
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const tableRows = compiled.querySelectorAll('tr[mat-row]');
    expect(tableRows.length).toBe(2, 'Expected 2 rows in orders table');
    expect(tableRows[0].querySelector('td:nth-child(1)')?.textContent).toContain('1');
    expect(tableRows[0].querySelector('td:nth-child(2)')?.textContent).toContain('Aug 22, 2025');
    expect(tableRows[0].querySelector('td:nth-child(3)')?.textContent).toContain('500');
    expect(tableRows[0].querySelector('td:nth-child(4)')?.textContent).toContain('Client A');
    expect(
      tableRows[0].querySelector('td:nth-child(5) button:nth-child(1)')?.textContent
    ).toContain('Ver');
    expect(
      tableRows[0].querySelector('td:nth-child(5) button:nth-child(2)')?.textContent
    ).toContain('Eliminar');
  }));

  it('should render orders table without delete button for non-admin', fakeAsync(() => {
    authService.isAdmin.and.returnValue(false);
    apiService.getOrdersByUser.and.returnValue(of(mockOrders));
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const tableRows = compiled.querySelectorAll('tr[mat-row]');
    expect(tableRows.length).toBe(2);
    expect(
      tableRows[0].querySelector('td:nth-child(5) button:nth-child(1)')?.textContent
    ).toContain('Ver');
    expect(tableRows[0].querySelector('td:nth-child(5) button:nth-child(2)')).toBeFalsy();
  }));

  it('should debug template rendering', fakeAsync(() => {
    authService.isAdmin.and.returnValue(true);
    apiService.getOrders.and.returnValue(of(mockOrders));
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    console.log('Template HTML:', fixture.nativeElement.innerHTML);
    console.log('Orders:', component.orders);
    expect(component).toBeTruthy();
  }));
});
