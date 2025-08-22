import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NewUserComponent } from './new-user';

describe('NewUserComponent', () => {
  let component: NewUserComponent;
  let fixture: ComponentFixture<NewUserComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<NewUserComponent>>;

  beforeEach(async () => {
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
        NoopAnimationsModule,
        NewUserComponent,
      ],
      providers: [{ provide: MatDialogRef, useValue: dialogRefSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(NewUserComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<NewUserComponent>>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize userForm with required fields', () => {
    expect(component.userForm).toBeTruthy();
    expect(component.userForm.get('username')).toBeTruthy();
    expect(component.userForm.get('password')).toBeTruthy();
    expect(component.userForm.get('email')).toBeTruthy();
    expect(component.userForm.get('role')).toBeTruthy();
    expect(component.userForm.get('username')?.hasValidator(Validators.required)).toBeTrue();
    expect(component.userForm.get('password')?.hasValidator(Validators.required)).toBeTrue();
    expect(component.userForm.get('email')?.hasValidator(Validators.required)).toBeTrue();
    expect(component.userForm.get('email')?.hasValidator(Validators.email)).toBeTrue();
    expect(component.userForm.get('role')?.hasValidator(Validators.required)).toBeTrue();
  });

  it('should close dialog with form values on submit when valid', fakeAsync(() => {
    component.userForm.setValue({
      username: 'newuser',
      password: 'newpass',
      email: 'newuser@example.com',
      role: 'USER',
    });

    component.onSubmit();
    tick();

    expect(dialogRef.close).toHaveBeenCalledWith({
      username: 'newuser',
      password: 'newpass',
      email: 'newuser@example.com',
      role: 'USER',
    });
  }));

  it('should not close dialog if form is invalid', () => {
    component.userForm.setValue({
      username: '',
      password: '',
      email: '',
      role: '',
    });

    component.onSubmit();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog without result on cancel', () => {
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should render user form', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('input[formControlName="username"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="password"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="email"]')).toBeTruthy();
    expect(compiled.querySelector('mat-select[formControlName="role"]')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
    expect(compiled.querySelector('button[mat-stroked-button]')).toBeTruthy();
  }));

  it('should debug component creation', fakeAsync(() => {
    console.log('Component:', component);
    console.log('Template HTML:', fixture.nativeElement.innerHTML);
    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
  }));
});
