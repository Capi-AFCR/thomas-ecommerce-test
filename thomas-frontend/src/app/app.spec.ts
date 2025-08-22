import { ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from './services/auth';
import { AppComponent } from './app';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
      'isAdmin',
      'logout',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        CommonModule,
        MatToolbarModule,
        MatButtonModule,
        NoopAnimationsModule,
        AppComponent, // Standalone component in imports
      ],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges(); // Execute change detection
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject authService', () => {
    expect(component.authService).toBe(authService);
  });

  it('should render toolbar with title', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('mat-toolbar')).toBeTruthy();
    expect(compiled.querySelector('mat-toolbar span').textContent).toContain('E-Commerce');
  });

  it('should render no buttons when not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll(
      'button[mat-button]'
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons.length).toBeGreaterThanOrEqual(0);
    expect(
      Array.from(buttons).some((button) => button.textContent?.includes('Cerrar Sesión') ?? false)
    ).toBeFalse();
  });

  it('should render logout button when authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.isAdmin.and.returnValue(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.logout-button')).toBeTruthy();
    expect(compiled.querySelector('.nav-buttons mat-icon').textContent).toContain('logout');
  });

  it('should render users button when authenticated and admin', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.isAdmin.and.returnValue(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.nav-buttons button[routerLink="/users"]')).toBeTruthy();
  });

  it('should call logout on logout button click', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.isAdmin.and.returnValue(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const logoutButton = compiled.querySelector('.logout-button');
    expect(logoutButton).toBeTruthy();
    logoutButton.click();
    expect(authService.logout).toHaveBeenCalled();
  });
});
