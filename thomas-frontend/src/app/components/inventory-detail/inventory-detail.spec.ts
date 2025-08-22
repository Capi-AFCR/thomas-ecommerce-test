import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { InventoryDetailComponent } from './inventory-detail';
import { of, throwError } from 'rxjs';

describe('InventoryDetailComponent', () => {
  let component: InventoryDetailComponent;
  let fixture: ComponentFixture<InventoryDetailComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;

  const mockInventory = { id: 1, productId: 101, stock: 50 };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('1'),
      },
    },
  };

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getInventoryById',
      'updateInventory',
    ]);
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
        BrowserAnimationsModule,
        InventoryDetailComponent, // Standalone component in imports
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryDetailComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with stock field', () => {
    expect(component.inventoryForm).toBeDefined();
    expect(component.inventoryForm.get('stock')).toBeDefined();
    expect(component.inventoryForm.get('stock')?.value).toBe(0);
  });

  it('should load inventory data on ngOnInit', () => {
    apiService.getInventoryById.and.returnValue(of(mockInventory));

    fixture.detectChanges(); // Triggers ngOnInit

    expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    expect(apiService.getInventoryById).toHaveBeenCalledWith(1);
    expect(component.inventory).toEqual(mockInventory);
    expect(component.inventoryForm.get('stock')?.value).toBe(mockInventory.stock);
  });

  it('should update inventory and navigate on successful submit', () => {
    component.inventory = mockInventory;
    component.inventoryForm.setValue({ stock: 60 });
    apiService.updateInventory.and.returnValue(of({}));

    component.onSubmit();

    expect(apiService.updateInventory).toHaveBeenCalledWith(mockInventory.id, { stock: 60 });
    /*expect(snackBar.open).toHaveBeenCalledWith('Inventario actualizado', 'Cerrar', {
      duration: 3000,
    });*/
    expect(router.navigate).toHaveBeenCalledWith(['/inventory']);
  });

  it('should show error snackbar on update failure', () => {
    component.inventory = mockInventory;
    component.inventoryForm.setValue({ stock: 60 });
    apiService.updateInventory.and.returnValue(throwError(() => ({ status: 400 })));

    component.onSubmit();

    expect(apiService.updateInventory).toHaveBeenCalledWith(mockInventory.id, { stock: 60 });
    //expect(snackBar.open).toHaveBeenCalledWith('Error al actualizar', 'Cerrar', { duration: 3000 });
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should render form fields in the template', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('input[formControlName="stock"]')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should display inventory data in the form', () => {
    apiService.getInventoryById.and.returnValue(of(mockInventory));

    fixture.detectChanges(); // Triggers ngOnInit

    const stockInput = fixture.nativeElement.querySelector('input[formControlName="stock"]');
    expect(stockInput.value).toBe('50');
  });
});
