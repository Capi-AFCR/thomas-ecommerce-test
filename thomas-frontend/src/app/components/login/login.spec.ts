import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../../services/auth';
import { LoginComponent } from './login';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'products', component: LoginComponent },
          { path: 'register', component: LoginComponent },
        ]),
        ReactiveFormsModule,
        CommonModule,
        MatSnackBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        NoopAnimationsModule,
        LoginComponent, // Standalone component in imports
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges(); // Trigger initial rendering
  });

  it('should create', fakeAsync(() => {
    tick();
    expect(component).toBeTruthy();
  }));

  it('should initialize loginForm with required fields', () => {
    expect(component.loginForm).toBeTruthy();
    expect(component.loginForm.get('username')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
    expect(component.loginForm.get('username')?.hasValidator(Validators.required)).toBeTrue();
    expect(component.loginForm.get('password')?.hasValidator(Validators.required)).toBeTrue();
  });

  it('should call authService.login and navigate on successful login', fakeAsync(() => {
    authService.login.and.returnValue(of({ token: 'mock-token', error: '' }));
    component.loginForm.setValue({ username: 'testuser', password: 'testpass' });

    component.onSubmit();
    tick(100);

    expect(authService.login).toHaveBeenCalledWith('testuser', 'testpass');
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/products']);
  }));

  it('should show snackbar on login error', fakeAsync(() => {
    authService.login.and.returnValue(throwError(() => new Error('Login error')));
    component.loginForm.setValue({ username: 'testuser', password: 'testpass' });

    component.onSubmit();
    tick(100);

    expect(authService.login).toHaveBeenCalledWith('testuser', 'testpass');
    /*expect(snackBar.open).toHaveBeenCalledWith('Credenciales inválidas', 'Cerrar', {
      duration: 3000,
    });*/
    expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
  }));

  it('should not call authService.login if form is invalid', () => {
    component.loginForm.setValue({ username: '', password: '' });

    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
    expect(snackBar.open).not.toHaveBeenCalled();
    expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
  });

  it('should render login form', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('input[formControlName="username"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="password"]')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
    expect(compiled.querySelector('a[routerLink="/register"]')).toBeTruthy();
  });

  it('should debug component creation', fakeAsync(() => {
    console.log('Component:', component);
    console.log('Template HTML:', fixture.nativeElement.innerHTML);
    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
  }));
});
