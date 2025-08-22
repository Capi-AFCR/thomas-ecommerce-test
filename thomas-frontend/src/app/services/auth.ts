import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('token');
    if (token) {
      this.currentUserSubject.next({ token });
    }
  }

  login(username: string, password: string): Observable<{ token: string; error: string }> {
    return this.http
      .post<{ token: string; error: string }>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response) => {
          let token = response.token;
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next({ token, username });
        })
      );
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role === 'ADMIN';
      } catch (e) {
        return false;
      }
    }
    return false;
  }
}
