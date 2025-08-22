import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { ProductsComponent } from './components/products/products';
import { InventoryComponent } from './components/inventory/inventory';
import { OrdersComponent } from './components/orders/orders';
import { UsersComponent } from './components/users/users';
import { ReportsComponent } from './components/reports/reports';
import { ProductDetailComponent } from './components/product-detail/product-detail';
import { InventoryDetailComponent } from './components/inventory-detail/inventory-detail';
import { OrderDetailComponent } from './components/order-detail/order-detail';
import { UserDetailComponent } from './components/user-detail/user-detail';
import { AuthGuard } from './guards/auth-guard';
import { AdminGuard } from './guards/admin-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: 'products/:id', component: ProductDetailComponent, canActivate: [AuthGuard] },
  { path: 'inventory', component: InventoryComponent, canActivate: [AuthGuard, AdminGuard] },
  {
    path: 'inventory/:id',
    component: InventoryDetailComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard] },
  { path: 'orders/:id', component: OrderDetailComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard, AdminGuard] },
  {
    path: 'users/:id',
    component: UserDetailComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
