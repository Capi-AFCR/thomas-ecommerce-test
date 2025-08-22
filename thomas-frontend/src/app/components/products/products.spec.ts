import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { ProductsComponent } from './products';
import { NewProductComponent } from '../new-product/new-product';
import { of, throwError } from 'rxjs';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const mockProducts = [
    { id: 1, name: 'Product A', description: 'Description A', price: 100 },
    { id: 2, name: 'Product B', description: 'Description B', price: 200 },
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getProducts',
      'searchProducts',
      'createProduct',
      'deleteProduct',
    ]);
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
        MatInputModule,
        MatButtonModule,
        MatTableModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
        ProductsComponent, // Standalone component in imports
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    apiService.getProducts.and.returnValue(of(mockProducts)); // Default mock
    apiService.searchProducts.and.returnValue(of(mockProducts)); // Default mock
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize displayedColumns', () => {
    expect(component.displayedColumns).toEqual(['id', 'name', 'description', 'price', 'actions']);
  });

  it('should initialize search form', () => {
    expect(component.searchForm).toBeDefined();
    expect(component.searchForm.get('name')).toBeDefined();
    expect(component.searchForm.get('minPrice')).toBeDefined();
    expect(component.searchForm.get('maxPrice')).toBeDefined();
  });

  it('should call loadProducts on ngOnInit', fakeAsync(() => {
    spyOn(component, 'loadProducts');
    component.ngOnInit();
    tick();
    expect(component.loadProducts).toHaveBeenCalled();
  }));

  it('should load products', fakeAsync(() => {
    apiService.getProducts.and.returnValue(of(mockProducts));

    component.loadProducts();
    tick();
    fixture.detectChanges();

    expect(apiService.getProducts).toHaveBeenCalled();
    expect(component.products).toEqual(mockProducts);
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBeNull();
  }));

  it('should show error snackbar and set errorMessage on loadProducts failure', fakeAsync(() => {
    apiService.getProducts.and.returnValue(throwError(() => ({ message: 'Server error' })));

    component.loadProducts();
    tick();
    fixture.detectChanges();

    expect(apiService.getProducts).toHaveBeenCalled();
    expect(component.errorMessage).toBe('Error al cargar productos: Server error');
    expect(component.isLoading).toBeFalse();
    /*expect(snackBar.open).toHaveBeenCalledWith(
      'Error al cargar productos: Server error',
      'Cerrar',
      { duration: 3000 }
    );*/
  }));

  it('should search products with valid parameters', fakeAsync(() => {
    apiService.searchProducts.and.returnValue(of(mockProducts));
    component.searchForm.setValue({ name: 'Product', minPrice: 50, maxPrice: 150 });

    component.onSearch();
    tick();
    fixture.detectChanges();

    expect(apiService.searchProducts).toHaveBeenCalledWith('Product', 50, 150);
    expect(component.products).toEqual(mockProducts);
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBeNull();
  }));

  it('should open NewProductComponent dialog and create product on success', fakeAsync(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(
      of({ name: 'New Product', description: 'New Desc', price: 300, initialStock: 10 })
    );
    dialog.open.and.returnValue(dialogRefSpy);
    apiService.createProduct.and.returnValue(of({}));
    spyOn(component, 'loadProducts');

    component.openNewProductDialog();
    tick();

    expect(dialog.open).toHaveBeenCalledWith(NewProductComponent, { width: '400px' });
    expect(apiService.createProduct).toHaveBeenCalledWith({
      name: 'New Product',
      description: 'New Desc',
      price: 300,
      initialStock: 10,
    });
    expect(component.loadProducts).toHaveBeenCalled();
    //expect(snackBar.open).toHaveBeenCalledWith('Producto creado', 'Cerrar', { duration: 3000 });
  }));

  it('should not create product if dialog closes without result', fakeAsync(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(null));
    dialog.open.and.returnValue(dialogRefSpy);
    spyOn(component, 'loadProducts');

    component.openNewProductDialog();
    tick();

    expect(dialog.open).toHaveBeenCalledWith(NewProductComponent, { width: '400px' });
    expect(apiService.createProduct).not.toHaveBeenCalled();
    expect(component.loadProducts).not.toHaveBeenCalled();
    expect(snackBar.open).not.toHaveBeenCalled();
  }));

  it('should show error snackbar on create product failure', fakeAsync(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(
      of({ name: 'New Product', description: 'New Desc', price: 300, initialStock: 10 })
    );
    dialog.open.and.returnValue(dialogRefSpy);
    apiService.createProduct.and.returnValue(throwError(() => ({ status: 400 })));
    spyOn(component, 'loadProducts');

    component.openNewProductDialog();
    tick();

    expect(apiService.createProduct).toHaveBeenCalled();
    expect(component.loadProducts).not.toHaveBeenCalled();
    /*expect(snackBar.open).toHaveBeenCalledWith('Error al crear producto', 'Cerrar', {
      duration: 3000,
    });*/
  }));

  it('should delete product and reload products on success', fakeAsync(() => {
    apiService.deleteProduct.and.returnValue(of(null));
    spyOn(component, 'loadProducts');

    component.deleteProduct(1);
    tick();

    expect(apiService.deleteProduct).toHaveBeenCalledWith(1);
    expect(component.loadProducts).toHaveBeenCalled();
    //expect(snackBar.open).toHaveBeenCalledWith('Producto eliminado', 'Cerrar', { duration: 3000 });
  }));

  it('should show error snackbar on delete failure', fakeAsync(() => {
    apiService.deleteProduct.and.returnValue(throwError(() => ({ status: 400 })));
    spyOn(component, 'loadProducts');

    component.deleteProduct(1);
    tick();

    expect(apiService.deleteProduct).toHaveBeenCalledWith(1);
    expect(component.loadProducts).not.toHaveBeenCalled();
    //expect(snackBar.open).toHaveBeenCalledWith('Error al eliminar', 'Cerrar', { duration: 3000 });
  }));

  it('should navigate to product detail', () => {
    component.goToDetail(1);
    expect(router.navigate).toHaveBeenCalledWith(['/products/1']);
  });

  it('should render search form and table in the template', fakeAsync(() => {
    apiService.getProducts.and.returnValue(of(mockProducts));
    component.loadProducts();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('input[formControlName="name"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="minPrice"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="maxPrice"]')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
    expect(compiled.querySelector('button[mat-raised-button]')).toBeTruthy();
    expect(compiled.querySelector('table[mat-table]')).toBeTruthy();
  }));

  /*it('should render products in the table', fakeAsync(() => {
    apiService.getProducts.and.returnValue(of(mockProducts));
    component.loadProducts();
    tick();
    fixture.detectChanges();

    const tableRows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
    expect(tableRows.length).toBe(2);
    expect(tableRows[0].querySelector('td:nth-child(1)').textContent).toContain('1');
    expect(tableRows[0].querySelector('td:nth-child(2)').textContent).toContain('Product A');
    expect(tableRows[0].querySelector('td:nth-child(3)').textContent).toContain('Description A');
    expect(tableRows[0].querySelector('td:nth-child(4)').textContent).toContain('100');
    expect(tableRows[0].querySelector('td:nth-child(5) button:first-child').textContent).toContain(
      'Detalles'
    );
    expect(tableRows[0].querySelector('td:nth-child(5) button:last-child').textContent).toContain(
      'Eliminar'
    );
  }));*/

  it('should render table headers', () => {
    component.isLoading = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const headers = compiled.querySelectorAll('th[mat-header-cell]');
    expect(headers.length).toBe(5);
    expect(headers[0].textContent).toContain('ID');
    expect(headers[1].textContent).toContain('Nombre');
    expect(headers[2].textContent).toContain('Descripción');
    expect(headers[3].textContent).toContain('Precio');
    expect(headers[4].textContent).toContain('Acciones');
  });
});
