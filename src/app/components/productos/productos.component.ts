import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';

declare var bootstrap: any;

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  inventarios: any[] = [];
  productoSeleccionado: Producto | null = null;
  productoAEliminar: Producto | null = null;
  
  // Formulario
  productoForm = {
    nombre: '',
    precio: 0
  };
  
  // Filtros de búsqueda
  filtros = {
    nombre: '',
    precio: 0,
    condicionPrecio: 'mayor'
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
    private productoService: ProductoService
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarInventarios();
  }

  // ===== CRUD PRODUCTOS =====
  
  cargarProductos() {
    this.cargando = true;
    this.productoService.listarProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.cargando = false;
        this.mostrarMensaje('Productos cargados correctamente', 'success');
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.cargando = false;
        this.mostrarMensaje('Error al cargar productos', 'error');
      }
    });
  }
  
  cargarInventarios() {
    this.productoService.listarInventario().subscribe({
      next: (inventarios) => {
        this.inventarios = inventarios;
      },
      error: (error) => {
        console.error('Error al cargar inventarios:', error);
      }
    });
  }

  abrirModalNuevo() {
    this.esEdicion = false;
    this.productoSeleccionado = null;
    this.productoForm = { nombre: '', precio: 0 };
    this.abrirModal('modalProducto');
  }

  editarProducto(producto: Producto) {
    this.esEdicion = true;
    this.productoSeleccionado = producto;
    this.productoForm = {
      nombre: producto.nombre,
      precio: producto.precio
    };
    this.abrirModal('modalProducto');
  }

  guardarProducto() {
    if (!this.productoForm.nombre || this.productoForm.precio <= 0) {
      this.mostrarMensaje('Complete todos los campos correctamente', 'error');
      return;
    }

    this.guardando = true;
    const productoData: Producto = {
      nombre: this.productoForm.nombre,
      precio: this.productoForm.precio
    };

    const operacion = this.esEdicion && this.productoSeleccionado
      ? this.productoService.actualizarProducto(this.productoSeleccionado.id!, productoData)
      : this.productoService.crearProducto(productoData);

    operacion.subscribe({
      next: (producto) => {
        if (this.esEdicion) {
          const index = this.productos.findIndex(p => p.id === this.productoSeleccionado!.id);
          if (index !== -1) {
            this.productos[index] = producto;
          }
          this.mostrarMensaje('Producto actualizado correctamente', 'success');
        } else {
          this.productos.push(producto);
          this.mostrarMensaje('Producto creado correctamente', 'success');
        }
        
        this.guardando = false;
        this.cargarInventarios(); // Recargar inventarios después de crear/actualizar
        this.cerrarModal('modalProducto');
      },
      error: (error) => {
        console.error('Error al guardar producto:', error);
        this.guardando = false;
        this.mostrarMensaje('Error al guardar producto', 'error');
      }
    });
  }

  confirmarEliminar(producto: Producto) {
    this.productoAEliminar = producto;
    this.abrirModal('modalEliminar');
  }

  eliminarProducto() {
    if (!this.productoAEliminar?.id) return;

    this.eliminando = true;
    this.productoService.eliminarProducto(this.productoAEliminar.id).subscribe({
      next: (response) => {
        this.cargarProductos(); // Recargar productos después de eliminar
        this.cargarInventarios(); // Recargar inventarios después de eliminar
        this.eliminando = false;
        this.productoAEliminar = null; // Limpiar referencia
        this.mostrarMensaje('Producto eliminado correctamente', 'success');
        this.cerrarModal('modalEliminar');
      },
      error: (error) => {
        console.error('Error al eliminar producto:', error);
        this.eliminando = false;
        this.mostrarMensaje('Error al eliminar producto', 'error');
      }
    });
  }

  // ===== BÚSQUEDAS =====
  
  buscarPorNombre() {
    if (!this.filtros.nombre.trim()) {
      this.cargarProductos();
      return;
    }
    
    this.cargando = true;
    this.productoService.buscarProductoPorNombre(this.filtros.nombre).subscribe({
      next: (producto: Producto) => {
        this.productos = [producto];
        this.cargando = false;
        this.mostrarMensaje('Producto encontrado', 'success');
      },
      error: (error: any) => {
        console.error('Error en búsqueda:', error);
        this.productos = [];
        this.cargando = false;
        this.mostrarMensaje('Producto no encontrado', 'error');
      }
    });
  }
  
  buscarPorPrecio() {
    if (!this.filtros.precio || !this.filtros.condicionPrecio) {
      this.mostrarMensaje('Complete los campos de búsqueda por precio', 'error');
      return;
    }
    
    this.cargando = true;
    this.productoService.buscarProductosPorPrecio(this.filtros.precio, this.filtros.condicionPrecio).subscribe({
      next: (productos: Producto[]) => {
        this.productos = productos;
        this.cargando = false;
        this.mostrarMensaje(`Se encontraron ${productos.length} productos`, 'success');
      },
      error: (error: any) => {
        console.error('Error en búsqueda por precio:', error);
        this.productos = [];
        this.cargando = false;
        this.mostrarMensaje('No se encontraron productos', 'error');
      }
    });
  }
  
  limpiarFiltros() {
    this.filtros = {
      nombre: '',
      precio: 0,
      condicionPrecio: 'mayor'
    };
    this.cargarProductos();
  }

  // ===== INVENTARIO =====
  
  verInventario() {
    this.abrirModal('modalInventario');
  }
  
  actualizarStock(inventario: any, nuevaCantidad: number) {
    this.productoService.actualizarStock(inventario.producto.id, nuevaCantidad).subscribe({
      next: (inventarioActualizado) => {
        const index = this.inventarios.findIndex(i => i.id === inventario.id);
        if (index !== -1) {
          this.inventarios[index] = inventarioActualizado;
        }
        this.mostrarMensaje('Stock actualizado correctamente', 'success');
      },
      error: (error) => {
        console.error('Error al actualizar stock:', error);
        this.mostrarMensaje('Error al actualizar stock', 'error');
      }
    });
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
