import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';
import { jwtInterceptor } from './jwt-interceptor';

describe('jwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.callFake((key: string) =>
      key === 'token' ? 'mock-token' : null
    );
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  it('should add Authorization header with token when token exists', fakeAsync(() => {
    localStorage.getItem = jasmine.createSpy('getItem').and.returnValue('mock-token');

    httpClient.get('/test').subscribe((response) => {
      expect(response).toBeTruthy();
    });
    tick();

    const req = httpMock.expectOne('/test');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush({}); // Complete the request
  }));

  it('should not add Authorization header when no token exists', fakeAsync(() => {
    localStorage.getItem = jasmine.createSpy('getItem').and.returnValue(null);

    httpClient.get('/test').subscribe((response) => {
      expect(response).toBeTruthy();
    });
    tick();

    const req = httpMock.expectOne('/test');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({}); // Complete the request
  }));

  it('should call next handler with cloned request when token exists', fakeAsync(() => {
    const nextSpy = jasmine
      .createSpy('next')
      .and.returnValue(of(new HttpResponse({ status: 200, body: {} })));
    const mockRequest = new HttpRequest('GET', '/test', null);
    const clonedRequest = new HttpRequest('GET', '/test', null, {
      headers: new HttpHeaders({ Authorization: 'Bearer mock-token' }),
    });

    spyOn(mockRequest, 'clone').and.returnValue(clonedRequest);

    jwtInterceptor(mockRequest, nextSpy).subscribe((response) => {
      expect(response).toBeTruthy();
    });
    tick();

    expect(mockRequest.clone).toHaveBeenCalledWith({
      setHeaders: {
        Authorization: `Bearer mock-token`,
      },
    });
    expect(nextSpy).toHaveBeenCalledWith(clonedRequest);
  }));

  it('should call next handler with original request when no token exists', fakeAsync(() => {
    localStorage.getItem = jasmine.createSpy('getItem').and.returnValue(null);
    const nextSpy = jasmine
      .createSpy('next')
      .and.returnValue(of(new HttpResponse({ status: 200, body: {} })));
    const mockRequest = new HttpRequest('GET', '/test', null);

    jwtInterceptor(mockRequest, nextSpy).subscribe((response) => {
      expect(response).toBeTruthy();
    });
    tick();

    expect(nextSpy).toHaveBeenCalledWith(mockRequest);
  }));
});
