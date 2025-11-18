import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';

declare var bootstrap: any;

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clienteSeleccionado: Cliente | null = null;
  clienteAEliminar: Cliente | null = null;
  
  // Formulario
  clienteForm = {
    nombre: '',
    correo: '',
    telefono: ''
  };
  
  // Filtros de búsqueda
  filtros = {
    nombre: '',
    correo: '',
    telefono: ''
  };
  
  // Estados
  cargando = false;
  guardando = false;
  eliminando = false;
  esEdicion = false;
  mensaje = '';
  tipoMensaje = '';

  constructor(
    private router: Router,
    private clienteService: ClienteService
  ) {}

  ngOnInit() {
    this.cargarClientes();
  }

  // ===== CRUD CLIENTES =====
  
  cargarClientes() {
    this.cargando = true;
    this.clienteService.getAllClientes().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes;
        this.cargando = false;
        this.mostrarMensaje('Clientes cargados correctamente', 'success');
      },
      error: (error: any) => {
        console.error('Error al cargar clientes:', error);
        this.cargando = false;
        this.mostrarMensaje('Error al cargar clientes', 'error');
      }
    });
  }

  abrirModalNuevo() {
    this.esEdicion = false;
    this.clienteSeleccionado = null;
    this.clienteForm = { nombre: '', correo: '', telefono: '' };
    this.abrirModal('modalCliente');
  }

  editarCliente(cliente: Cliente) {
    this.esEdicion = true;
    this.clienteSeleccionado = cliente;
    this.clienteForm = {
      nombre: cliente.nombre,
      correo: cliente.correo,
      telefono: cliente.telefono
    };
    this.abrirModal('modalCliente');
  }

  guardarCliente() {
    if (!this.clienteForm.nombre || !this.clienteForm.correo || !this.clienteForm.telefono) {
      this.mostrarMensaje('Complete todos los campos correctamente', 'error');
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.clienteForm.correo)) {
      this.mostrarMensaje('Ingrese un correo electrónico válido', 'error');
      return;
    }

    this.guardando = true;
    const clienteData: Cliente = {
      nombre: this.clienteForm.nombre,
      correo: this.clienteForm.correo,
      telefono: this.clienteForm.telefono
    };

    const operacion = this.esEdicion && this.clienteSeleccionado
      ? this.clienteService.updateCliente(this.clienteSeleccionado.id!, clienteData)
      : this.clienteService.createCliente(clienteData);

    operacion.subscribe({
      next: (cliente: Cliente) => {
        if (this.esEdicion) {
          const index = this.clientes.findIndex(c => c.id === this.clienteSeleccionado!.id);
          if (index !== -1) {
            this.clientes[index] = cliente;
          }
          this.mostrarMensaje('Cliente actualizado correctamente', 'success');
        } else {
          this.clientes.push(cliente);
          this.mostrarMensaje('Cliente creado correctamente', 'success');
        }
        
        this.guardando = false;
        this.cerrarModal('modalCliente');
      },
      error: (error: any) => {
        console.error('Error al guardar cliente:', error);
        this.guardando = false;
        this.mostrarMensaje('Error al guardar cliente', 'error');
      }
    });
  }

  confirmarEliminar(cliente: Cliente) {
    this.clienteAEliminar = cliente;
    this.abrirModal('modalEliminar');
  }

  eliminarCliente() {
    if (!this.clienteAEliminar?.id) return;

    this.eliminando = true;
    this.clienteService.deleteCliente(this.clienteAEliminar.id).subscribe({
      next: () => {
        this.clientes = this.clientes.filter(c => c.id !== this.clienteAEliminar!.id);
        this.eliminando = false;
        this.cerrarModal('modalEliminar');
        this.mostrarMensaje('Cliente eliminado correctamente', 'success');
      },
      error: (error: any) => {
        console.error('Error al eliminar cliente:', error);
        this.eliminando = false;
        this.mostrarMensaje('Error al eliminar cliente', 'error');
      }
    });
  }

  // ===== BÚSQUEDAS =====
  
  buscarClientes() {
    if (!this.filtros.nombre.trim() && !this.filtros.correo.trim() && !this.filtros.telefono.trim()) {
      this.cargarClientes();
      return;
    }
    
    this.cargando = true;
    this.clienteService.buscarClientes(
      this.filtros.nombre || undefined,
      this.filtros.correo || undefined,
      this.filtros.telefono || undefined
    ).subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes;
        this.cargando = false;
        this.mostrarMensaje(`Se encontraron ${clientes.length} clientes`, 'success');
      },
      error: (error: any) => {
        console.error('Error en búsqueda:', error);
        this.clientes = [];
        this.cargando = false;
        this.mostrarMensaje('Error en la búsqueda', 'error');
      }
    });
  }
  
  limpiarFiltros() {
    this.filtros = {
      nombre: '',
      correo: '',
      telefono: ''
    };
    this.cargarClientes();
  }

  verDetalle(cliente: Cliente) {
    this.clienteSeleccionado = cliente;
    this.abrirModal('modalDetalle');
  }

  // ===== UTILIDADES =====
  
  abrirModal(modalId: string) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
  }
  
  cerrarModal(modalId: string) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) {
      modal.hide();
    }
  }
  
  mostrarMensaje(mensaje: string, tipo: string) {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }
  
  navegarADashboard() {
    this.router.navigate(['/dashboard']);
  }
}