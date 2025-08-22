import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { RegisterComponent } from './register';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        MatSnackBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        BrowserAnimationsModule,
        RegisterComponent, // Include standalone component in imports
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges(); // Execute ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with required fields', () => {
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get('username')).toBeDefined();
    expect(component.registerForm.get('password')).toBeDefined();
    expect(component.registerForm.get('email')).toBeDefined();
    expect(component.registerForm.get('role')).toBeDefined();
    expect(component.registerForm.get('role')?.value).toBe('USER');
  });

  it('should have invalid form when fields are empty', () => {
    expect(component.registerForm.valid).toBeFalse();
    expect(component.registerForm.get('username')?.valid).toBeFalse();
    expect(component.registerForm.get('password')?.valid).toBeFalse();
    expect(component.registerForm.get('email')?.valid).toBeFalse();
    expect(component.registerForm.get('role')?.valid).toBeTrue(); // Default value 'USER'
  });

  it('should have invalid password when length is less than 6', () => {
    component.registerForm.setValue({
      username: 'testuser',
      password: '12345', // Less than 6 characters
      email: 'test@example.com',
      role: 'USER',
    });
    expect(component.registerForm.valid).toBeFalse();
    expect(component.registerForm.get('password')?.errors).toEqual({
      minlength: { requiredLength: 6, actualLength: 5 },
    });
  });

  it('should have invalid email when format is incorrect', () => {
    component.registerForm.setValue({
      username: 'testuser',
      password: '123456',
      email: 'invalid-email', // Invalid format
      role: 'USER',
    });
    expect(component.registerForm.valid).toBeFalse();
    expect(component.registerForm.get('email')?.errors).toEqual({ email: true });
  });

  it('should have valid form when all fields are correctly filled', () => {
    component.registerForm.setValue({
      username: 'testuser',
      password: '123456',
      email: 'test@example.com',
      role: 'USER',
    });
    expect(component.registerForm.valid).toBeTrue();
  });

  it('should call authService.register and navigate on successful registration', () => {
    authService.register.and.returnValue(of({}));
    component.registerForm.setValue({
      username: 'testuser',
      password: '123456',
      email: 'test@example.com',
      role: 'USER',
    });
    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      username: 'testuser',
      password: '123456',
      email: 'test@example.com',
      role: 'USER',
    });
    //expect(snackBar.open).toHaveBeenCalledWith('Usuario registrado', 'Cerrar', { duration: 3000 });
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should show error snackbar on registration failure', () => {
    authService.register.and.returnValue(
      throwError(() => ({ status: 400, error: { message: 'Error al registrar' } }))
    );
    component.registerForm.setValue({
      username: 'testuser',
      password: '123456',
      email: 'test@example.com',
      role: 'USER',
    });
    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      username: 'testuser',
      password: '123456',
      email: 'test@example.com',
      role: 'USER',
    });
    //expect(snackBar.open).toHaveBeenCalledWith('Error al registrar', 'Cerrar', { duration: 3000 });
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should not call authService.register if form is invalid', () => {
    component.registerForm.setValue({
      username: '',
      password: '',
      email: '',
      role: 'USER',
    });
    component.onSubmit();

    expect(authService.register).not.toHaveBeenCalled();
    expect(snackBar.open).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should render form fields in the template', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('input[formControlName="username"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="password"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="email"]')).toBeTruthy();
    expect(compiled.querySelector('mat-select[formControlName="role"]')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
  });
});
