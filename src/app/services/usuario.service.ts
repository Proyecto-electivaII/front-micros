import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario, RegistroUsuarioRequest, ActualizarUsuarioRequest, UsuarioStats, ApiResponse, LoginRequest, LoginResponse, AuthUser } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = environment.apiUrls.users;

  constructor(private http: HttpClient) {}

  // Registrar nuevo usuario
  registrarUsuario(usuario: RegistroUsuarioRequest): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(`${this.apiUrl}/registro`, usuario);
  }

  // Obtener todos los usuarios
  obtenerTodosLosUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  // Obtener usuario por ID
  obtenerUsuarioPorId(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`);
  }

  // Obtener usuarios por rol
  obtenerUsuariosPorRole(role: 'ADMIN' | 'CUSTOMER'): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(`${this.apiUrl}/role/${role}`);
  }

  // Buscar usuarios
  buscarUsuarios(termino: string): Observable<ApiResponse<Usuario[]>> {
    const params = new HttpParams().set('termino', termino);
    return this.http.get<ApiResponse<Usuario[]>>(`${this.apiUrl}/buscar`, { params });
  }

  // Obtener estadísticas de usuarios
  obtenerEstadisticas(): Observable<ApiResponse<UsuarioStats>> {
    return this.http.get<ApiResponse<UsuarioStats>>(`${this.apiUrl}/estadisticas`);
  }

  // Actualizar usuario
  actualizarUsuario(id: number, usuario: ActualizarUsuarioRequest): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`, usuario);
  }

  // Cambiar estado del usuario (activar/desactivar)
  cambiarEstadoUsuario(id: number, enabled: boolean): Observable<ApiResponse<Usuario>> {
    return this.http.patch<ApiResponse<Usuario>>(`${this.apiUrl}/${id}/estado`, { enabled });
  }

  // Eliminar usuario
  eliminarUsuario(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
  }

  // ===== FUNCIONES DE AUTENTICACIÓN =====

  // Login de usuario
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  // Obtener perfil del usuario autenticado
  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/perfil`);
  }

  // Guardar datos de sesión en localStorage
  guardarSesion(loginResponse: LoginResponse): void {
    const authUser: AuthUser = {
      id: loginResponse.usuario.id!,
      username: loginResponse.usuario.username,
      email: loginResponse.usuario.email,
      firstName: loginResponse.usuario.firstName,
      lastName: loginResponse.usuario.lastName,
      role: loginResponse.usuario.role,
      token: loginResponse.token
    };
    
    localStorage.setItem('authUser', JSON.stringify(authUser));
    localStorage.setItem('token', loginResponse.token);
  }

  // Obtener usuario actual del localStorage
  obtenerUsuarioActual(): AuthUser | null {
    const authUserStr = localStorage.getItem('authUser');
    if (authUserStr) {
      try {
        return JSON.parse(authUserStr);
      } catch (error) {
        console.error('Error parsing authUser from localStorage:', error);
        this.cerrarSesion();
        return null;
      }
    }
    return null;
  }

  // Obtener token del localStorage
  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  // Verificar si el usuario está autenticado
  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    const user = this.obtenerUsuarioActual();
    return !!(token && user);
  }

  // Verificar si el usuario es administrador
  esAdministrador(): boolean {
    const user = this.obtenerUsuarioActual();
    return user?.role === 'ADMIN';
  }

  // Cerrar sesión y limpiar localStorage
  cerrarSesion(): void {
    localStorage.removeItem('authUser');
    localStorage.removeItem('token');
    localStorage.clear(); // Limpia todo el localStorage
  }
}