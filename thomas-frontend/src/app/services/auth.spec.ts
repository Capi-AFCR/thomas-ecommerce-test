import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let currentUserSubjectSpy: jasmine.SpyObj<BehaviorSubject<any>>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const behaviorSubjectSpy = jasmine.createSpyObj('BehaviorSubject', ['next'], {
      asObservable: () => new BehaviorSubject<any>(null).asObservable(),
      value: null,
    });

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.callFake((key: string) => (key === 'token' ? null : null));
    spyOn(localStorage, 'setItem').and.callFake(() => {});
    spyOn(localStorage, 'removeItem').and.callFake(() => {});

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useFactory: () => {
            const serviceInstance = new AuthService(TestBed.inject(HttpClient), routerSpy);
            Object.defineProperty(serviceInstance, 'currentUserSubject', {
              value: behaviorSubjectSpy,
              writable: true,
            });
            Object.defineProperty(serviceInstance, 'currentUser', {
              value: behaviorSubjectSpy.asObservable(),
            });
            return serviceInstance;
          },
        },
        { provide: Router, useValue: routerSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    service = TestBed.inject(AuthService);

    // Replace currentUserSubject with spy
    Object.defineProperty(service, 'currentUserSubject', {
      value: behaviorSubjectSpy,
      writable: true,
    });
    Object.defineProperty(service, 'currentUser', {
      value: behaviorSubjectSpy.asObservable(),
    });
    currentUserSubjectSpy = behaviorSubjectSpy;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and set token', fakeAsync(() => {
    const mockResponse = { token: 'mock-token', error: '' };
    service.login('testuser', 'testpass').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'testuser', password: 'testpass' });
    req.flush(mockResponse);
    tick();

    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token');
    expect(currentUserSubjectSpy.next).toHaveBeenCalledWith({
      token: 'mock-token',
      username: 'testuser',
    });
  }));

  it('should handle login error', fakeAsync(() => {
    let errorCaught = false;
    service.login('testuser', 'testpass').subscribe({
      next: () => fail('Expected error'),
      error: () => {
        errorCaught = true;
      },
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.error(new ErrorEvent('Login error'));
    tick();

    expect(errorCaught).toBeTrue();
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(currentUserSubjectSpy.next).not.toHaveBeenCalled();
  }));

  it('should logout and clear currentUser', fakeAsync(() => {
    localStorage.setItem('token', 'mock-token');
    service.logout();
    tick();

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(currentUserSubjectSpy.next).toHaveBeenCalledWith(null);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should return true for isAuthenticated when token exists', () => {
    localStorage.getItem = jasmine.createSpy('getItem').and.returnValue('mock-token');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should return false for isAuthenticated when no token', () => {
    localStorage.getItem = jasmine.createSpy('getItem').and.returnValue(null);
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should return true for isAdmin when user is admin', () => {
    const mockToken = btoa(JSON.stringify({ role: 'ADMIN' }));
    localStorage.getItem = jasmine
      .createSpy('getItem')
      .and.returnValue(`header.${mockToken}.signature`);
    expect(service.isAdmin()).toBeTrue();
  });

  it('should return false for isAdmin when user is not admin', () => {
    const mockToken = btoa(JSON.stringify({ role: 'USER' }));
    localStorage.getItem = jasmine
      .createSpy('getItem')
      .and.returnValue(`header.${mockToken}.signature`);
    expect(service.isAdmin()).toBeFalse();
  });

  it('should return false for isAdmin when token is invalid', () => {
    localStorage.getItem = jasmine.createSpy('getItem').and.returnValue('invalid-token');
    expect(service.isAdmin()).toBeFalse();
  });

  it('should debug service initialization', () => {
    localStorage.getItem = jasmine.createSpy('getItem').and.returnValue('mock-token');
    const newService = new AuthService(TestBed.inject(HttpClient), router);
    Object.defineProperty(newService, 'currentUserSubject', {
      value: currentUserSubjectSpy,
      writable: true,
    });
    console.log('currentUserSubject.next calls:', currentUserSubjectSpy.next.calls.all());
    expect(newService).toBeTruthy();
  });
});
