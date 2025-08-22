import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService, { provide: Router, useValue: routerSpy }],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.callFake((key: string) =>
      key === 'token' ? 'mock-token' : null
    );
    spyOn(localStorage, 'setItem').and.callFake(() => {});
    spyOn(localStorage, 'removeItem').and.callFake(() => {});
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize currentUserSubject with token from localStorage', () => {
    const currentUserSpy = jasmine.createSpyObj('BehaviorSubject', ['next']);
    spyOn((service as any).currentUserSubject, 'next').and.callThrough();
    localStorage.getItem = jasmine.createSpy('getItem').and.returnValue('mock-token');

    // Re-create service to trigger constructor
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService, { provide: Router, useValue: router }],
    });
    service = TestBed.inject(AuthService);

    expect(localStorage.getItem).toHaveBeenCalledWith('token');
    expect((service as any).currentUserSubject.next).toHaveBeenCalledWith({ token: 'mock-token' });
  });

  it('should login successfully and update currentUser', fakeAsync(() => {
    const mockResponse = { token: 'new-token', error: '' };
    let currentUserValue: any;
    service.currentUser.subscribe((value) => (currentUserValue = value));

    service.login('testuser', 'testpass').subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(currentUserValue).toEqual({ token: 'new-token', username: 'testuser' });
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'testuser', password: 'testpass' });
    req.flush(mockResponse);
    tick();

    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
  }));

  it('should handle login error', fakeAsync(() => {
    service.login('testuser', 'testpass').subscribe({
      error: (err) => {
        expect(err.status).toBe(401);
      },
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    tick();

    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect((service as any).currentUserSubject.next).not.toHaveBeenCalled();
  }));

  it('should register successfully', fakeAsync(() => {
    const mockUser = { username: 'newuser', email: 'newuser@example.com', role: 'USER' };
    const mockResponse = { id: 1, ...mockUser };

    service.register(mockUser).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockResponse);
    tick();
  }));

  it('should handle register error', fakeAsync(() => {
    const mockUser = { username: 'newuser', email: 'newuser@example.com', role: 'USER' };

    service.register(mockUser).subscribe({
      error: (err) => {
        expect(err.status).toBe(400);
      },
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    tick();
  }));

  it('should logout and clear currentUser', fakeAsync(() => {
    service.logout();
    tick();

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect((service as any).currentUserSubject.next).toHaveBeenCalledWith(null);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should return true for isAuthenticated when token exists', () => {
    localStorage.getItem = jasmine.createSpy('getItem').and.returnValue('mock-token');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should return false for isAuthenticated when no token exists', () => {
    localStorage.getItem = jasmine.createSpy('getItem').and.returnValue(null);
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should return true for isAdmin when token has ADMIN role', () => {
    const mockToken = 'header.' + btoa(JSON.stringify({ role: 'ADMIN' })) + '.signature';
    localStorage.getItem = jasmine.createSpy('getItem').and.returnValue(mockToken);
    expect(service.isAdmin()).toBeTrue();
  });

  it('should return false for isAdmin when token has non-ADMIN role', () => {
    const mockToken = 'header.' + btoa(JSON.stringify({ role: 'USER' })) + '.signature';
    localStorage.getItem = jasmine.createSpy('getItem').and.returnValue(mockToken);
    expect(service.isAdmin()).toBeFalse();
  });

  it('should return false for isAdmin when token is invalid', () => {
    localStorage.getItem = jasmine.createSpy('getItem').and.returnValue('invalid-token');
    expect(service.isAdmin()).toBeFalse();
  });

  it('should return false for isAdmin when no token exists', () => {
    localStorage.getItem = jasmine.createSpy('getItem').and.returnValue(null);
    expect(service.isAdmin()).toBeFalse();
  });
});
