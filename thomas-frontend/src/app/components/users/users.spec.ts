import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { UsersComponent } from './users';
import { NewUserComponent } from '../new-user/new-user';
import { of, throwError } from 'rxjs';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const mockUsers = [
    { id: 1, username: 'user1', email: 'user1@example.com', role: 'USER', active: true },
    { id: 2, username: 'user2', email: 'user2@example.com', role: 'ADMIN', active: false },
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getUsers',
      'createUser',
      'deactivateUser',
      'deleteUser',
    ]);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        CommonModule,
        MatSnackBarModule,
        MatDialogModule,
        MatCardModule,
        MatButtonModule,
        MatTableModule,
        NoopAnimationsModule,
        UsersComponent,
        NewUserComponent,
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    apiService.getUsers.and.returnValue(of(mockUsers));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize displayedColumns', () => {
    expect(component.displayedColumns).toEqual([
      'id',
      'username',
      'email',
      'role',
      'active',
      'actions',
    ]);
  });

  it('should call loadUsers on ngOnInit', fakeAsync(() => {
    spyOn(component, 'loadUsers');
    component.ngOnInit();
    tick();
    expect(component.loadUsers).toHaveBeenCalled();
  }));

  it('should load users', fakeAsync(() => {
    component.loadUsers();
    tick(100);
    fixture.detectChanges();

    expect(apiService.getUsers).toHaveBeenCalled();
    expect(component.users).toEqual(mockUsers);
  }));

  it('should open NewUserComponent dialog and create user on success', fakeAsync(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(
      of({
        username: 'newuser',
        password: 'newpass',
        email: 'newuser@example.com',
        role: 'USER',
      })
    );
    dialog.open.and.returnValue(dialogRefSpy);
    apiService.createUser.and.returnValue(of({}));
    spyOn(component, 'loadUsers');

    component.openNewUserDialog();
    tick(100);

    expect(dialog.open).toHaveBeenCalledWith(NewUserComponent, { width: '400px' });
    expect(apiService.createUser).toHaveBeenCalledWith({
      username: 'newuser',
      password: 'newpass',
      email: 'newuser@example.com',
      role: 'USER',
    });
    expect(component.loadUsers).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Usuario creado', 'Cerrar', { duration: 3000 });
  }));

  it('should not create user if dialog closes without result', fakeAsync(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(null));
    dialog.open.and.returnValue(dialogRefSpy);
    spyOn(component, 'loadUsers');

    component.openNewUserDialog();
    tick(100);

    expect(dialog.open).toHaveBeenCalledWith(NewUserComponent, { width: '400px' });
    expect(apiService.createUser).not.toHaveBeenCalled();
    expect(component.loadUsers).not.toHaveBeenCalled();
    expect(snackBar.open).not.toHaveBeenCalled();
  }));

  it('should show error snackbar on create user failure', fakeAsync(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(
      of({
        username: 'newuser',
        password: 'newpass',
        email: 'newuser@example.com',
        role: 'USER',
      })
    );
    dialog.open.and.returnValue(dialogRefSpy);
    apiService.createUser.and.returnValue(throwError(() => new Error('Create error')));
    spyOn(component, 'loadUsers');

    component.openNewUserDialog();
    tick(100);

    expect(apiService.createUser).toHaveBeenCalled();
    expect(component.loadUsers).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Error al crear', 'Cerrar', { duration: 3000 });
  }));

  it('should deactivate user and reload users on success', fakeAsync(() => {
    apiService.deactivateUser.and.returnValue(of({}));
    spyOn(component, 'loadUsers');

    component.deactivateUser(1);
    tick(100);

    expect(apiService.deactivateUser).toHaveBeenCalledWith(1);
    expect(component.loadUsers).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Usuario desactivado', 'Cerrar', { duration: 3000 });
  }));

  it('should show error snackbar on deactivate user failure', fakeAsync(() => {
    apiService.deactivateUser.and.returnValue(throwError(() => new Error('Deactivate error')));
    spyOn(component, 'loadUsers');

    component.deactivateUser(1);
    tick(100);

    expect(apiService.deactivateUser).toHaveBeenCalledWith(1);
    expect(component.loadUsers).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Error al desactivar', 'Cerrar', { duration: 3000 });
  }));

  it('should delete user and reload users on success', fakeAsync(() => {
    apiService.deleteUser.and.returnValue(of(null));
    spyOn(component, 'loadUsers');

    component.deleteUsuario(1);
    tick(100);

    expect(apiService.deleteUser).toHaveBeenCalledWith(1);
    expect(component.loadUsers).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Usuario eliminado', 'Cerrar', { duration: 3000 });
  }));

  it('should show error snackbar on delete user failure', fakeAsync(() => {
    apiService.deleteUser.and.returnValue(throwError(() => new Error('Delete error')));
    spyOn(component, 'loadUsers');

    component.deleteUsuario(1);
    tick(100);

    expect(apiService.deleteUser).toHaveBeenCalledWith(1);
    expect(component.loadUsers).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Error al eliminar', 'Cerrar', { duration: 3000 });
  }));

  it('should navigate to user detail', () => {
    component.goToDetail(1);
    expect(router.navigate).toHaveBeenCalledWith(['/users/1']);
  });

  it('should render users in the table', fakeAsync(() => {
    component.users = mockUsers;
    fixture.detectChanges();
    tick(100);

    const compiled = fixture.nativeElement;
    const tableRows = compiled.querySelectorAll('tr[mat-row]');
    expect(tableRows.length).toBe(2, 'Expected 2 table rows');
    expect(tableRows[0].querySelector('td:nth-child(1)')?.textContent).toContain(
      '1',
      'Expected ID'
    );
    expect(tableRows[0].querySelector('td:nth-child(2)')?.textContent).toContain(
      'user1',
      'Expected Username'
    );
    expect(tableRows[0].querySelector('td:nth-child(3)')?.textContent).toContain(
      'user1@example.com',
      'Expected Email'
    );
    expect(tableRows[0].querySelector('td:nth-child(4)')?.textContent).toContain(
      'USER',
      'Expected Role'
    );
    expect(tableRows[0].querySelector('td:nth-child(5)')?.textContent).toContain(
      'Sí',
      'Expected Active'
    );
    expect(
      tableRows[0].querySelector('td:nth-child(6) button:nth-child(1)')?.textContent
    ).toContain('Detalles', 'Expected Details Button');
    expect(
      tableRows[0].querySelector('td:nth-child(6) button:nth-child(2)')?.textContent
    ).toContain('Desactivar', 'Expected Deactivate Button');
    expect(
      tableRows[0].querySelector('td:nth-child(6) button:nth-child(3)')?.textContent
    ).toContain('Eliminar', 'Expected Delete Button');
  }));

  it('should render table headers', fakeAsync(() => {
    component.users = mockUsers;
    fixture.detectChanges();
    tick(100);

    const compiled = fixture.nativeElement;
    const headers = compiled.querySelectorAll('th[mat-header-cell]');
    expect(headers.length).toBe(6, 'Expected 6 table headers');
    expect(headers[0]?.textContent).toContain('ID');
    expect(headers[1]?.textContent).toContain('Nombre de Usuario');
    expect(headers[2]?.textContent).toContain('Email');
    expect(headers[3]?.textContent).toContain('Rol');
    expect(headers[4]?.textContent).toContain('Activo');
    expect(headers[5]?.textContent).toContain('Acciones');
  }));

  it('should render new user button', fakeAsync(() => {
    fixture.detectChanges();
    tick(100);

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('button[mat-raised-button]')).toBeTruthy();
    expect(compiled.querySelector('button[mat-raised-button]')?.textContent).toContain(
      'Nuevo Usuario'
    );
  }));
});
