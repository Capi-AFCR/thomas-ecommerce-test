import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ApiService } from '../../services/api';
import { NewOrderComponent } from './new-order';
import { of, throwError } from 'rxjs';

describe('NewOrderComponent', () => {
  let component: NewOrderComponent;
  let fixture: ComponentFixture<NewOrderComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<NewOrderComponent>>;

  const mockProducts = [
    { id: 1, name: 'Product A', price: 100 },
    { id: 2, name: 'Product B', price: 200 },
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getProducts', 'createOrder']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatTableModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        NewOrderComponent,
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewOrderComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<NewOrderComponent>>;
    apiService.getProducts.and.returnValue(of(mockProducts));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize orderForm and load products on ngOnInit', fakeAsync(() => {
    component.ngOnInit();
    tick(100);
    expect(component.orderForm).toBeTruthy();
    expect(component.orderForm.get('selectedProductId')).toBeTruthy();
    expect(component.orderForm.get('quantity')).toBeTruthy();
    expect(component.orderForm.get('products')).toBeTruthy();
    expect(
      component.orderForm.get('selectedProductId')?.hasValidator(Validators.required)
    ).toBeTrue();
    expect(component.orderForm.get('quantity')?.hasValidator(Validators.required)).toBeTrue();
    expect(component.orderForm.get('quantity')?.hasValidator(Validators.min(1))).toBeTrue();
    expect(apiService.getProducts).toHaveBeenCalled();
    expect(component.products).toEqual(mockProducts);
  }));

  it('should add product to products FormArray when valid', fakeAsync(() => {
    component.products = mockProducts;
    component.orderForm.setValue({ selectedProductId: 1, quantity: 2, products: [] });
    component.addProduct();
    tick();

    expect(component.addedProductsFormArray.length).toBe(1);
    expect(component.addedProductsFormArray.at(0).value).toEqual({ productId: 1, quantity: 2 });
    expect(component.addedProductsData).toEqual([{ index: 0, product: 'Product A', quantity: 2 }]);
    expect(component.orderForm.get('selectedProductId')?.value).toBe('');
    expect(component.orderForm.get('quantity')?.value).toBe(1);
  }));

  it('should show snackbar and not add product if form is invalid', fakeAsync(() => {
    component.products = mockProducts;
    component.orderForm.setValue({ selectedProductId: '', quantity: 0, products: [] });
    component.addProduct();
    tick();

    expect(component.addedProductsFormArray.length).toBe(0);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Por favor, selecciona un producto y una cantidad válida',
      'Cerrar',
      { duration: 3000 }
    );
  }));

  it('should add random products and set isRandomOrder', fakeAsync(() => {
    component.products = mockProducts;
    spyOn(Math, 'random').and.returnValues(0.4, 0.5); // 2 products, quantity 3
    component.addRandomProducts();
    tick();

    expect(component.isRandomOrder).toBeTrue();
    expect(component.addedProductsFormArray.length).toBe(2);
    expect(component.addedProductsData[0].product).toBe('Product A');
    expect(component.addedProductsData[0].quantity).toBe(3);
    expect(snackBar.open).toHaveBeenCalledWith('Añadidos 2 productos aleatorios', 'Cerrar', {
      duration: 3000,
    });
  }));

  it('should show snackbar if no products available for random order', fakeAsync(() => {
    component.products = [];
    component.addRandomProducts();
    tick();

    expect(component.addedProductsFormArray.length).toBe(0);
    expect(snackBar.open).toHaveBeenCalledWith(
      'No hay productos disponibles para pedidos aleatorios',
      'Cerrar',
      { duration: 3000 }
    );
  }));

  it('should remove product from products FormArray', () => {
    component.products = mockProducts;
    component.orderForm.setValue({ selectedProductId: 1, quantity: 2, products: [] });
    component.addProduct();
    component.removeAddedProduct(0);

    expect(component.addedProductsFormArray.length).toBe(0);
    expect(component.addedProductsData).toEqual([]);
  });

  it('should calculate total', () => {
    component.products = mockProducts;
    component.orderForm.setValue({ selectedProductId: '', quantity: 1, products: [] });
    component.addProduct();
    component.orderForm.setValue({ selectedProductId: 2, quantity: 1, products: [] });
    component.addProduct();

    expect(component.calculateTotal()).toBe(300); // 1 * 100 + 1 * 200
  });

  it('should close dialog with order data on submit', fakeAsync(() => {
    component.products = mockProducts;
    component.orderForm.setValue({ selectedProductId: 1, quantity: 2, products: [] });
    component.addProduct();
    component.isRandomOrder = true;
    component.onSubmit();
    tick();

    expect(dialogRef.close).toHaveBeenCalledWith(true);
    expect(apiService.createOrder).toHaveBeenCalledWith({
      products: [{ productId: 1, quantity: 2 }],
      isRandomOrder: true,
    });
    expect(snackBar.open).toHaveBeenCalledWith('Orden creada', 'Cerrar', { duration: 3000 });
  }));

  it('should show error snackbar on submit failure', fakeAsync(() => {
    component.products = mockProducts;
    component.orderForm.setValue({ selectedProductId: 1, quantity: 2, products: [] });
    component.addProduct();
    apiService.createOrder.and.returnValue(throwError(() => new Error('Order error')));
    component.onSubmit();
    tick();

    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Error al crear orden', 'Cerrar', {
      duration: 3000,
    });
  }));

  it('should not submit if no products added', () => {
    component.onSubmit();
    expect(apiService.createOrder).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog on cancel', () => {
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should render order form and table', fakeAsync(() => {
    component.products = mockProducts;
    component.orderForm.setValue({ selectedProductId: 1, quantity: 2, products: [] });
    component.addProduct();
    fixture.detectChanges();
    tick(100);

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('mat-select[formControlName="selectedProductId"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="quantity"]')).toBeTruthy();
    expect(compiled.querySelector('button[color="warn"]')).toBeTruthy();
    expect(compiled.querySelector('button[color="accent"]')).toBeTruthy();
    expect(compiled.querySelector('table[mat-table]')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
    expect(compiled.querySelector('button[mat-stroked-button]')).toBeTruthy();
    const tableRows = compiled.querySelectorAll('tr[mat-row]');
    expect(tableRows.length).toBe(1);
    expect(tableRows[0].querySelector('td:nth-child(1)')?.textContent).toContain('Product A');
    expect(tableRows[0].querySelector('td:nth-child(2)')?.textContent).toContain('2');
  }));
});
