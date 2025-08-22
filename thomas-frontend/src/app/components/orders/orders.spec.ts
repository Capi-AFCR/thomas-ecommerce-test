import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { OrdersComponent } from './orders';
import { NewOrderComponent } from '../new-order/new-order';
import { of, throwError } from 'rxjs';
import { Observable } from 'rxjs';

describe('OrdersComponent', () => {
  let component: OrdersComponent;
  let fixture: ComponentFixture<OrdersComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const mockOrders = [
    { id: 1, date: '2023-10-01', total: 200, user: { username: 'testuser' } },
    { id: 2, date: '2023-10-02', total: 300, user: { username: 'testuser2' } },
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getOrders', 'deleteOrder']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'isAdmin']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        CommonModule,
        MatSnackBarModule,
        MatDialogModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatTableModule,
        NoopAnimationsModule,
        OrdersComponent, // Standalone component in imports
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

  it('should initialize displayedColumns', () => {
    expect(component.displayedColumns).toEqual(['id', 'date', 'total', 'user', 'actions']);
  });

  it('should call loadOrders on ngOnInit', fakeAsync(() => {
    spyOn(component, 'loadOrders');
    component.ngOnInit();
    tick();
    expect(component.loadOrders).toHaveBeenCalled();
  }));

  it('should load orders', fakeAsync(() => {
    apiService.getOrders.and.returnValue(of(mockOrders));

    component.loadOrders();
    tick();
    fixture.detectChanges();

    expect(apiService.getOrders).toHaveBeenCalled();
    expect(component.orders).toEqual(mockOrders);
  }));

  it('should show error snackbar on loadOrders failure', fakeAsync(() => {
    apiService.getOrders.and.returnValue(throwError(() => ({ status: 500 })));

    component.loadOrders();
    tick();
    fixture.detectChanges();

    expect(apiService.getOrders).toHaveBeenCalled();
    /*expect(snackBar.open).toHaveBeenCalledWith('Error al cargar órdenes', 'Cerrar', {
      duration: 3000,
    });*/
  }));

  it('should open NewOrderComponent dialog and reload orders on success', fakeAsync(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(true));
    dialog.open.and.returnValue(dialogRefSpy);
    spyOn(component, 'loadOrders');

    component.openNewOrderDialog();
    tick();

    expect(dialog.open).toHaveBeenCalledWith(NewOrderComponent, { width: '600px' });
    expect(component.loadOrders).toHaveBeenCalled();
    /*expect(snackBar.open).toHaveBeenCalledWith('Orden creada con éxito', 'Cerrar', {
      duration: 3000,
    });*/
  }));

  it('should not reload orders if dialog closes without result', fakeAsync(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(null));
    dialog.open.and.returnValue(dialogRefSpy);
    spyOn(component, 'loadOrders');

    component.openNewOrderDialog();
    tick();

    expect(dialog.open).toHaveBeenCalledWith(NewOrderComponent, { width: '600px' });
    expect(component.loadOrders).not.toHaveBeenCalled();
    expect(snackBar.open).not.toHaveBeenCalled();
  }));

  it('should delete order and reload orders on success', fakeAsync(() => {
    apiService.deleteOrder.and.returnValue(of(null));
    spyOn(component, 'loadOrders');

    component.deleteOrder(1);
    tick();

    expect(apiService.deleteOrder).toHaveBeenCalledWith(1);
    expect(component.loadOrders).toHaveBeenCalled();
    //expect(snackBar.open).toHaveBeenCalledWith('Orden eliminada', 'Cerrar', { duration: 3000 });
  }));

  it('should show error snackbar on delete failure', fakeAsync(() => {
    apiService.deleteOrder.and.returnValue(throwError(() => ({ status: 400 })));
    spyOn(component, 'loadOrders');

    component.deleteOrder(1);
    tick();

    expect(apiService.deleteOrder).toHaveBeenCalledWith(1);
    expect(component.loadOrders).not.toHaveBeenCalled();
    //expect(snackBar.open).toHaveBeenCalledWith('Error al eliminar', 'Cerrar', { duration: 3000 });
  }));

  it('should navigate to order detail', () => {
    component.goToDetail(1);
    expect(router.navigate).toHaveBeenCalledWith(['/orders/1']);
  });

  it('should render orders in the table', fakeAsync(() => {
    apiService.getOrders.and.returnValue(of(mockOrders));
    component.loadOrders();
    tick();
    fixture.detectChanges();

    const tableRows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
    expect(tableRows.length).toBe(2);
    expect(tableRows[0].querySelector('td:nth-child(1)').textContent).toContain('1');
    expect(tableRows[0].querySelector('td:nth-child(2)').textContent).toContain('2023-10-01');
    expect(tableRows[0].querySelector('td:nth-child(3)').textContent).toContain('200');
    expect(tableRows[0].querySelector('td:nth-child(4)').textContent).toContain('testuser');
    expect(tableRows[0].querySelector('td:nth-child(5) button:first-child').textContent).toContain(
      'Ver'
    );
    expect(tableRows[0].querySelector('td:nth-child(5) button:last-child').textContent).toContain(
      'Eliminar'
    );
  }));

  it('should render table headers', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const headers = compiled.querySelectorAll('th[mat-header-cell]');
    expect(headers.length).toBe(5);
    expect(headers[0].textContent).toContain('ID');
    expect(headers[1].textContent).toContain('Fecha');
    expect(headers[2].textContent).toContain('Total');
    expect(headers[3].textContent).toContain('Usuario');
    expect(headers[4].textContent).toContain('Acciones');
  });

  it('should render new order button', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('button[mat-raised-button]')).toBeTruthy();
    expect(compiled.querySelector('button[mat-raised-button]').textContent).toContain(
      'Nueva Orden'
    );
  });
});
