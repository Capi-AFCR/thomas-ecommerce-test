import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { ProductDetailComponent } from './product-detail';
import { of, throwError } from 'rxjs';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('1'),
      },
    },
  };

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getProduct', 'updateProduct']);
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
        MatInputModule,
        MatButtonModule,
        NoopAnimationsModule,
        ProductDetailComponent, // Standalone component in imports
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    apiService.getProduct.and.returnValue(of(mockProduct));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with fields', () => {
    expect(component.productForm).toBeDefined();
    expect(component.productForm.get('name')).toBeDefined();
    expect(component.productForm.get('description')).toBeDefined();
    expect(component.productForm.get('price')).toBeDefined();
  });

  it('should load product data on ngOnInit', fakeAsync(() => {
    component.ngOnInit();
    tick(); // Resolve async calls
    fixture.detectChanges();

    expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    expect(apiService.getProduct).toHaveBeenCalledWith(1);
    expect(component.product).toEqual(mockProduct);
    expect(component.productForm.get('name')?.value).toBe(mockProduct.name);
    expect(component.productForm.get('description')?.value).toBe(mockProduct.description);
    expect(component.productForm.get('price')?.value).toBe(mockProduct.price);
  }));

  it('should update product and navigate on successful submit', fakeAsync(() => {
    component.product = mockProduct;
    component.productForm.setValue({
      name: 'Updated Product',
      description: 'Updated Description',
      price: 150,
    });
    apiService.updateProduct.and.returnValue(of({}));

    component.onSubmit();
    tick();

    expect(apiService.updateProduct).toHaveBeenCalledWith(mockProduct.id, {
      name: 'Updated Product',
      description: 'Updated Description',
      price: 150,
    });
    /*expect(snackBar.open).toHaveBeenCalledWith('Producto actualizado', 'Cerrar', {
      duration: 3000,
    });*/
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  }));

  it('should show error snackbar on update failure', fakeAsync(() => {
    component.product = mockProduct;
    component.productForm.setValue({
      name: 'Updated Product',
      description: 'Updated Description',
      price: 150,
    });
    apiService.updateProduct.and.returnValue(throwError(() => ({ status: 400 })));

    component.onSubmit();
    tick();

    expect(apiService.updateProduct).toHaveBeenCalledWith(mockProduct.id, {
      name: 'Updated Product',
      description: 'Updated Description',
      price: 150,
    });
    //expect(snackBar.open).toHaveBeenCalledWith('Error al actualizar', 'Cerrar', { duration: 3000 });
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should render form fields in the template', fakeAsync(() => {
    component.product = mockProduct;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('input[formControlName="name"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="description"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="price"]')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
  }));

  it('should display product data in the form', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('input[formControlName="name"]').value).toBe(mockProduct.name);
    expect(compiled.querySelector('input[formControlName="description"]').value).toBe(
      mockProduct.description
    );
    expect(compiled.querySelector('input[formControlName="price"]').value).toBe(
      mockProduct.price.toString()
    );
  }));
});
