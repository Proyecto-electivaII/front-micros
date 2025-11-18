import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { UsuarioService } from './usuario.service';
import { LoginRequest, AuthUser } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<AuthUser | null>;
  public currentUser: Observable<AuthUser | null>;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    // Inicializar con el usuario del localStorage si existe
    const storedUser = this.usuarioService.obtenerUsuarioActual();
    this.currentUserSubject = new BehaviorSubject<AuthUser | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Getter para obtener el valor actual del usuario
  public get currentUserValue(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  // Login
  login(credentials: LoginRequest): Observable<any> {
    return new Observable(observer => {
      this.usuarioService.login(credentials).subscribe({
        next: (response) => {
          // Guardar sesión en localStorage
          this.usuarioService.guardarSesion(response);
          
          // Crear objeto AuthUser
          const authUser: AuthUser = {
            id: response.usuario.id!,
            username: response.usuario.username,
            email: response.usuario.email,
            firstName: response.usuario.firstName,
            lastName: response.usuario.lastName,
            role: response.usuario.role,
            token: response.token
          };
          
          // Actualizar el BehaviorSubject
          this.currentUserSubject.next(authUser);
          
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  // Logout
  logout(): void {
    // Limpiar localStorage
    this.usuarioService.cerrarSesion();
    
    // Actualizar el BehaviorSubject
    this.currentUserSubject.next(null);
    
    // Redirigir al login
    this.router.navigate(['/login']);
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return this.usuarioService.estaAutenticado();
  }

  // Verificar si es administrador
  isAdmin(): boolean {
    return this.usuarioService.esAdministrador();
  }

  // Obtener el rol del usuario actual
  getUserRole(): 'ADMIN' | 'CUSTOMER' | null {
    const user = this.currentUserValue;
    return user?.role || null;
  }

  // Obtener el nombre completo del usuario actual
  getUserFullName(): string {
    const user = this.currentUserValue;
    if (user) {
      return `${user.firstName} ${user.lastName}`;
    }
    return '';
  }

  // Obtener el username del usuario actual
  getUsername(): string {
    const user = this.currentUserValue;
    return user?.username || '';
  }
}