import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { AuthGuard } from './auth-guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);

    const result = guard.canActivate();

    expect(authService.isAuthenticated).toHaveBeenCalled();
    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and navigate to login when user is not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);

    const result = guard.canActivate();

    expect(authService.isAuthenticated).toHaveBeenCalled();
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
