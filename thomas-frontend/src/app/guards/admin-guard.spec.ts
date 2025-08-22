import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { AdminGuard } from './admin-guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(AdminGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is admin', () => {
    authService.isAdmin.and.returnValue(true);

    const result = guard.canActivate();

    expect(authService.isAdmin).toHaveBeenCalled();
    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and navigate to login when user is not admin', () => {
    authService.isAdmin.and.returnValue(false);

    const result = guard.canActivate();

    expect(authService.isAdmin).toHaveBeenCalled();
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
