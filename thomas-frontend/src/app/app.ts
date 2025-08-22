import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}
