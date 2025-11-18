import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario, RegistroUsuarioRequest, ActualizarUsuarioRequest, UsuarioStats } from '../../models/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuarioSeleccionado: Usuario | null = null;
  nuevoUsuario: RegistroUsuarioRequest = this.inicializarNuevoUsuario();
  usuarioEditar: ActualizarUsuarioRequest = {};
  estadisticas: UsuarioStats | null = null;
  
  // Estados de UI
  loading = false;
  mostrarModalCrear = false;
  mostrarModalEditar = false;
  mostrarModalEstadisticas = false;
  
  // Filtros y búsqueda
  terminoBusqueda = '';
  filtroRole: 'TODOS' | 'ADMIN' | 'CUSTOMER' = 'TODOS';
  
  // Mensajes
  mensaje = '';
  tipoMensaje: 'success' | 'error' | 'info' = 'info';

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarEstadisticas();
  }

  inicializarNuevoUsuario(): RegistroUsuarioRequest {
    return {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'CUSTOMER'
    };
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.usuarioService.obtenerTodosLosUsuarios().subscribe({
      next: (response) => {
        console.log('🔍 Respuesta del servidor:', response);
        // Si la respuesta es un array directamente
        if (Array.isArray(response)) {
          this.usuarios = response;
          console.log('✅ Usuarios cargados:', this.usuarios);
        } 
        // Si viene en formato ApiResponse
        else if (response.success) {
          this.usuarios = response.data;
        } else {
          this.mostrarMensaje(response.message || 'Error desconocido', 'error');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar usuarios:', error);
        this.mostrarMensaje('Error al cargar usuarios: ' + error.message, 'error');
        this.loading = false;
      }
    });
  }

  cargarEstadisticas(): void {
    this.usuarioService.obtenerEstadisticas().subscribe({
      next: (response) => {
        if (response.success) {
          this.estadisticas = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  buscarUsuarios(): void {
    if (this.terminoBusqueda.trim()) {
      this.loading = true;
      this.usuarioService.buscarUsuarios(this.terminoBusqueda).subscribe({
        next: (response) => {
          if (response.success) {
            this.usuarios = response.data;
          } else {
            this.mostrarMensaje(response.message, 'error');
          }
          this.loading = false;
        },
        error: (error) => {
          this.mostrarMensaje('Error en la búsqueda: ' + error.message, 'error');
          this.loading = false;
        }
      });
    } else {
      this.cargarUsuarios();
    }
  }

  filtrarPorRole(): void {
    if (this.filtroRole === 'TODOS') {
      this.cargarUsuarios();
    } else {
      this.loading = true;
      this.usuarioService.obtenerUsuariosPorRole(this.filtroRole).subscribe({
        next: (response) => {
          if (response.success) {
            this.usuarios = response.data;
          } else {
            this.mostrarMensaje(response.message, 'error');
          }
          this.loading = false;
        },
        error: (error) => {
          this.mostrarMensaje('Error al filtrar usuarios: ' + error.message, 'error');
          this.loading = false;
        }
      });
    }
  }

  abrirModalCrear(): void {
    this.nuevoUsuario = this.inicializarNuevoUsuario();
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear(): void {
    this.mostrarModalCrear = false;
    this.nuevoUsuario = this.inicializarNuevoUsuario();
  }

  crearUsuario(): void {
    if (this.validarUsuario(this.nuevoUsuario)) {
      this.loading = true;
      this.usuarioService.registrarUsuario(this.nuevoUsuario).subscribe({
        next: (response) => {
          if (response.success) {
            this.mostrarMensaje('Usuario creado exitosamente', 'success');
            this.cargarUsuarios();
            this.cargarEstadisticas();
            this.cerrarModalCrear();
          } else {
            this.mostrarMensaje(response.message, 'error');
          }
          this.loading = false;
        },
        error: (error) => {
          this.mostrarMensaje('Error al crear usuario: ' + error.message, 'error');
          this.loading = false;
        }
      });
    }
  }

  abrirModalEditar(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.usuarioEditar = {
      username: usuario.username,
      email: usuario.email,
      firstName: usuario.firstName,
      lastName: usuario.lastName,
      role: usuario.role
    };
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.usuarioSeleccionado = null;
    this.usuarioEditar = {};
  }

  actualizarUsuario(): void {
    if (this.usuarioSeleccionado && this.validarActualizacion(this.usuarioEditar)) {
      this.loading = true;
      this.usuarioService.actualizarUsuario(this.usuarioSeleccionado.id!, this.usuarioEditar).subscribe({
        next: (response) => {
          if (response.success) {
            this.mostrarMensaje('Usuario actualizado exitosamente', 'success');
            this.cargarUsuarios();
            this.cerrarModalEditar();
          } else {
            this.mostrarMensaje(response.message, 'error');
          }
          this.loading = false;
        },
        error: (error) => {
          this.mostrarMensaje('Error al actualizar usuario: ' + error.message, 'error');
          this.loading = false;
        }
      });
    }
  }

  cambiarEstadoUsuario(usuario: Usuario): void {
    const nuevoEstado = !usuario.enabled;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    if (confirm(`¿Está seguro de ${accion} al usuario ${usuario.username}?`)) {
      this.usuarioService.cambiarEstadoUsuario(usuario.id!, nuevoEstado).subscribe({
        next: (response) => {
          if (response.success) {
            this.mostrarMensaje(`Usuario ${accion}do exitosamente`, 'success');
            this.cargarUsuarios();
            this.cargarEstadisticas();
          } else {
            this.mostrarMensaje(response.message, 'error');
          }
        },
        error: (error) => {
          this.mostrarMensaje(`Error al ${accion} usuario: ` + error.message, 'error');
        }
      });
    }
  }

  eliminarUsuario(usuario: Usuario): void {
    if (confirm(`¿Está seguro de eliminar al usuario ${usuario.username}? Esta acción no se puede deshacer.`)) {
      this.usuarioService.eliminarUsuario(usuario.id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.mostrarMensaje('Usuario eliminado exitosamente', 'success');
            this.cargarUsuarios();
            this.cargarEstadisticas();
          } else {
            this.mostrarMensaje(response.message, 'error');
          }
        },
        error: (error) => {
          this.mostrarMensaje('Error al eliminar usuario: ' + error.message, 'error');
        }
      });
    }
  }

  abrirModalEstadisticas(): void {
    this.mostrarModalEstadisticas = true;
  }

  cerrarModalEstadisticas(): void {
    this.mostrarModalEstadisticas = false;
  }

  validarUsuario(usuario: RegistroUsuarioRequest): boolean {
    if (!usuario.username?.trim()) {
      this.mostrarMensaje('El nombre de usuario es obligatorio', 'error');
      return false;
    }
    if (usuario.username.length < 3 || usuario.username.length > 50) {
      this.mostrarMensaje('El nombre de usuario debe tener entre 3 y 50 caracteres', 'error');
      return false;
    }
    if (!usuario.email?.trim()) {
      this.mostrarMensaje('El email es obligatorio', 'error');
      return false;
    }
    if (!this.validarEmail(usuario.email)) {
      this.mostrarMensaje('Debe ingresar un email válido', 'error');
      return false;
    }
    if (!usuario.password?.trim()) {
      this.mostrarMensaje('La contraseña es obligatoria', 'error');
      return false;
    }
    if (usuario.password.length < 6) {
      this.mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
      return false;
    }
    if (!usuario.firstName?.trim()) {
      this.mostrarMensaje('El nombre es obligatorio', 'error');
      return false;
    }
    if (!usuario.lastName?.trim()) {
      this.mostrarMensaje('El apellido es obligatorio', 'error');
      return false;
    }
    return true;
  }

  validarActualizacion(usuario: ActualizarUsuarioRequest): boolean {
    if (usuario.username && (usuario.username.length < 3 || usuario.username.length > 50)) {
      this.mostrarMensaje('El nombre de usuario debe tener entre 3 y 50 caracteres', 'error');
      return false;
    }
    if (usuario.email && !this.validarEmail(usuario.email)) {
      this.mostrarMensaje('Debe ingresar un email válido', 'error');
      return false;
    }
    return true;
  }

  validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'info'): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }

  getRoleDisplayName(role: string): string {
    return role === 'ADMIN' ? 'Administrador' : 'Cajero';
  }

  getEstadoDisplayName(enabled: boolean): string {
    return enabled ? 'Activo' : 'Inactivo';
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.cargarUsuarios();
  }

  get usuariosFiltrados(): Usuario[] {
    return this.usuarios;
  }
}