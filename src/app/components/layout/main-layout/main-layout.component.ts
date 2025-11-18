import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { AuthUser } from '../../../models/usuario.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  currentRoute = '';
  currentUser: AuthUser | null = null;
  private userSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Suscribirse a cambios en el usuario actual
    this.userSubscription = this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });

    // Detectar cambios de ruta para activar el nav correspondiente
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url.split('/')[1] || 'dashboard';
    });

    // Establecer ruta inicial
    this.currentRoute = this.router.url.split('/')[1] || 'dashboard';
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
      this.authService.logout();
    }
  }

  // Obtener el nombre completo del usuario
  getUserFullName(): string {
    return this.authService.getUserFullName();
  }

  // Obtener el username del usuario
  getUsername(): string {
    return this.authService.getUsername();
  }

  // Verificar si el usuario es administrador
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // Obtener el rol del usuario para mostrar
  getUserRoleDisplay(): string {
    const role = this.authService.getUserRole();
    return role === 'ADMIN' ? 'Administrador' : 'Cajero';
  }
}
