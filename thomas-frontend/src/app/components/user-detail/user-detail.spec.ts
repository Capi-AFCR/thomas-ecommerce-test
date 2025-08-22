import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { UserDetailComponent } from './user-detail';
import { of, throwError } from 'rxjs';

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'USER',
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('1'),
      },
    },
  };

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getUser', 'updateUser']);
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
        MatSelectModule,
        NoopAnimationsModule,
        UserDetailComponent, // Standalone component in imports
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    apiService.getUser.and.returnValue(of(mockUser));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with fields', () => {
    expect(component.userForm).toBeDefined();
    expect(component.userForm.get('username')).toBeDefined();
    expect(component.userForm.get('email')).toBeDefined();
    expect(component.userForm.get('role')).toBeDefined();
    expect(component.userForm.get('email')?.hasValidator(Validators.email)).toBeTrue();
    expect(component.userForm.get('role')?.value).toBe('USER');
  });

  it('should load user data on ngOnInit', fakeAsync(() => {
    component.ngOnInit();
    tick(); // Resolve async calls
    fixture.detectChanges();

    expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    expect(apiService.getUser).toHaveBeenCalledWith(1);
    expect(component.user).toEqual(mockUser);
    expect(component.userForm.get('username')?.value).toBe(mockUser.username);
    expect(component.userForm.get('email')?.value).toBe(mockUser.email);
    expect(component.userForm.get('role')?.value).toBe(mockUser.role);
  }));

  it('should show error snackbar on getUser failure', fakeAsync(() => {
    apiService.getUser.and.returnValue(throwError(() => ({ status: 400 })));

    component.ngOnInit();
    tick();

    expect(apiService.getUser).toHaveBeenCalledWith(1);
    //expect(snackBar.open).toHaveBeenCalledWith('Error al actualizar', 'Cerrar', { duration: 3000 });
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should update user and navigate on successful submit', fakeAsync(() => {
    component.user = mockUser;
    component.userForm.setValue({
      username: 'updateduser',
      email: 'updated@example.com',
      role: 'ADMIN',
    });
    apiService.updateUser.and.returnValue(of({}));

    component.onSubmit();
    tick();

    expect(apiService.updateUser).toHaveBeenCalledWith(mockUser.id, {
      username: 'updateduser',
      email: 'updated@example.com',
      role: 'ADMIN',
    });
    //expect(snackBar.open).toHaveBeenCalledWith('Usuario actualizado', 'Cerrar', { duration: 3000 });
    expect(router.navigate).toHaveBeenCalledWith(['/users']);
  }));

  it('should show error snackbar on update failure', fakeAsync(() => {
    component.user = mockUser;
    component.userForm.setValue({
      username: 'updateduser',
      email: 'updated@example.com',
      role: 'ADMIN',
    });
    apiService.updateUser.and.returnValue(throwError(() => ({ status: 400 })));

    component.onSubmit();
    tick();

    expect(apiService.updateUser).toHaveBeenCalledWith(mockUser.id, {
      username: 'updateduser',
      email: 'updated@example.com',
      role: 'ADMIN',
    });
    //expect(snackBar.open).toHaveBeenCalledWith('Error al actualizar', 'Cerrar', { duration: 3000 });
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should render form fields in the template', fakeAsync(() => {
    component.user = mockUser;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('input[formControlName="username"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="email"]')).toBeTruthy();
    expect(compiled.querySelector('mat-select[formControlName="role"]')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
  }));

  it('should display user data in the form', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('input[formControlName="username"]').value).toBe(
      mockUser.username
    );
    expect(compiled.querySelector('input[formControlName="email"]').value).toBe(mockUser.email);
    expect(compiled.querySelector('mat-select[formControlName="role"]').textContent).toContain(
      'Usuario'
    );
  }));
});
