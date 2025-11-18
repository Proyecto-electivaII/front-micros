import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { IaProductosComponent } from './components/ia-productos/ia-productos.component';
import { ProductosComponent } from './components/productos/productos.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { FacturasComponent } from './components/facturas/facturas.component';
import { AuthGuard, AdminGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Ruta por defecto - Login
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  // Login page (sin layout)
  { path: 'login', component: LoginComponent },
  
  // Rutas protegidas con layout principal
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'productos', component: ProductosComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'ia-productos', component: IaProductosComponent },
      { path: 'usuarios', component: UsuariosComponent, canActivate: [AdminGuard] },
      { path: 'facturas', component: FacturasComponent }
    ]
  },
  
  // Wildcard route - redirigir a login si no encuentra la ruta
  { path: '**', redirectTo: '/login' }
];
