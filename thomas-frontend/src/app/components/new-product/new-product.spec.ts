import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NewProductComponent } from './new-product';

describe('NewProductComponent', () => {
  let component: NewProductComponent;
  let fixture: ComponentFixture<NewProductComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<NewProductComponent>>;

  const mockDialogData = {};

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        FormsModule,
        NoopAnimationsModule,
        NewProductComponent, // Standalone component in imports
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewProductComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<NewProductComponent>>;
    fixture.detectChanges(); // Execute change detection
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize product with default values', () => {
    expect(component.product).toEqual({
      name: '',
      description: '',
      price: 0,
      initialStock: 0,
    });
  });

  it('should close dialog with product data on valid submit', () => {
    component.product = {
      name: 'Test Product',
      description: 'Test Description',
      price: 10,
      initialStock: 50,
    };

    component.onSubmit();

    expect(dialogRef.close).toHaveBeenCalledWith(component.product);
  });

  it('should not close dialog on invalid submit', () => {
    component.product = {
      name: '',
      description: '',
      price: -1, // Invalid price
      initialStock: -1, // Invalid stock
    };

    component.onSubmit();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog without data on cancel', () => {
    component.onCancel();

    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should bind product data to form inputs', fakeAsync(() => {
    component.product = {
      name: 'Test Product',
      description: 'Test Description',
      price: 10,
      initialStock: 50,
    };
    fixture.detectChanges();
    tick(); // Ensure change detection completes

    const compiled = fixture.nativeElement;
    const nameInput = compiled.querySelector('input[name="name"]');
    const descriptionInput = compiled.querySelector('input[name="description"]');
    const priceInput = compiled.querySelector('input[name="price"]');
    const initialStockInput = compiled.querySelector('input[name="initialStock"]');

    // Debug: Check if inputs exist
    expect(nameInput).toBeTruthy('Name input not found');
    expect(descriptionInput).toBeTruthy('Description input not found');
    expect(priceInput).toBeTruthy('Price input not found');
    expect(initialStockInput).toBeTruthy('InitialStock input not found');

    expect(nameInput.value).toBe('Test Product');
    expect(descriptionInput.value).toBe('Test Description');
    expect(priceInput.value).toBe('10');
    expect(initialStockInput.value).toBe('50');
  }));
});
