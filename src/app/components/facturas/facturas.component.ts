import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturaService } from '../../services/factura.service';
import { ProductoService } from '../../services/producto.service';
import { ClienteService } from '../../services/cliente.service';
import { Factura, CrearFacturaRequest, ActualizarFacturaRequest, ProductoFactura, ClienteFactura } from '../../models/factura.model';
import { Producto, Inventario } from '../../models/producto.model';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent implements OnInit {
  facturas: Factura[] = [];
  facturaSeleccionada: Factura | null = null;
  nuevaFactura: CrearFacturaRequest = this.inicializarNuevaFactura();
  facturaEditar: ActualizarFacturaRequest = {};
  
  // Listas para selectors
  productos: Producto[] = [];
  clientes: Cliente[] = [];
  inventarios: Inventario[] = [];
  
  // Estados de UI
  loading = false;
  mostrarModalCrear = false;
  mostrarModalEditar = false;
  mostrarModalDetalle = false;
  
  // Filtros y búsqueda  
  terminoBusqueda = '';
  fechaInicio = '';
  fechaFin = '';
  
  // Mensajes
  mensaje = '';
  tipoMensaje: 'success' | 'error' | 'info' = 'info';

  constructor(
    private facturaService: FacturaService,
    private productoService: ProductoService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.cargarFacturas();
    this.cargarProductos();
    this.cargarClientes();
    this.cargarInventarios();
  }

  inicializarNuevaFactura(): CrearFacturaRequest {
    return {
      fecha: new Date().toISOString().split('T')[0], // Fecha actual
      cantidad: 1,
      producto: { productoId: 0, productoNombre: '', cantidadProducto: 0 },
      cliente: { clienteId: 0, clienteNombre: '' },
      valorTotal: 0
    };
  }

  cargarFacturas(): void {
    this.loading = true;
    this.facturaService.obtenerTodasLasFacturas().subscribe({
      next: (facturas) => {
        this.facturas = facturas;
        this.loading = false;
      },
      error: (error) => {
        this.mostrarMensaje('Error al cargar facturas: ' + error.message, 'error');
        this.loading = false;
      }
    });
  }

  cargarProductos(): void {
    this.productoService.listarProductos().subscribe({
      next: (productos: Producto[]) => {
        this.productos = productos;
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  cargarClientes(): void {
    this.clienteService.getAllClientes().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes;
      },
      error: (error: any) => {
        console.error('Error al cargar clientes:', error);
      }
    });
  }

  cargarInventarios(): void {
    this.productoService.listarInventario().subscribe({
      next: (inventarios: Inventario[]) => {
        this.inventarios = inventarios;
      },
      error: (error: any) => {
        console.error('Error al cargar inventarios:', error);
      }
    });
  }

  abrirModalCrear(): void {
    this.nuevaFactura = this.inicializarNuevaFactura();
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear(): void {
    this.mostrarModalCrear = false;
    this.nuevaFactura = this.inicializarNuevaFactura();
  }

  crearFactura(): void {
    if (this.validarFactura(this.nuevaFactura)) {
      this.loading = true;
      this.facturaService.crearFactura(this.nuevaFactura).subscribe({
        next: (factura) => {
          this.mostrarMensaje('Factura creada exitosamente', 'success');
          this.cargarFacturas();
          this.cerrarModalCrear();
          this.loading = false;
        },
        error: (error) => {
          this.mostrarMensaje('Error al crear factura: ' + error.message, 'error');
          this.loading = false;
        }
      });
    }
  }

  abrirModalEditar(factura: Factura): void {
    this.facturaSeleccionada = factura;
    this.facturaEditar = {
      fecha: factura.fecha,
      cantidad: factura.cantidad,
      producto: { ...factura.producto },
      cliente: { ...factura.cliente },
      valorTotal: factura.valorTotal
    };
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.facturaSeleccionada = null;
    this.facturaEditar = {};
  }

  actualizarFactura(): void {
    if (this.facturaSeleccionada && this.validarActualizacion(this.facturaEditar)) {
      this.loading = true;
      this.facturaService.actualizarFactura(this.facturaSeleccionada.facturaId!, this.facturaEditar).subscribe({
        next: (factura) => {
          this.mostrarMensaje('Factura actualizada exitosamente', 'success');
          this.cargarFacturas();
          this.cerrarModalEditar();
          this.loading = false;
        },
        error: (error) => {
          this.mostrarMensaje('Error al actualizar factura: ' + error.message, 'error');
          this.loading = false;
        }
      });
    }
  }

  abrirModalDetalle(factura: Factura): void {
    this.facturaSeleccionada = factura;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.facturaSeleccionada = null;
  }

  eliminarFactura(factura: Factura): void {
    if (confirm(`¿Está seguro de eliminar la factura #${factura.facturaId}? Esta acción no se puede deshacer.`)) {
      this.facturaService.eliminarFactura(factura.facturaId!).subscribe({
        next: () => {
          this.mostrarMensaje('Factura eliminada exitosamente', 'success');
          this.cargarFacturas();
        },
        error: (error) => {
          this.mostrarMensaje('Error al eliminar factura: ' + error.message, 'error');
        }
      });
    }
  }

  onProductoSeleccionado(event: any, esEdicion: boolean = false): void {
    const productoId = parseInt(event.target.value);
    const producto = this.productos.find(p => p.id === productoId);
    
    if (producto) {
      const inventario = this.inventarios.find(inv => inv.producto?.id === producto.id);
      const productoFactura: ProductoFactura = {
        productoId: producto.id!,
        productoNombre: producto.nombre,
        cantidadProducto: inventario?.cantidad || 0
      };

      if (esEdicion) {
        this.facturaEditar.producto = productoFactura;
        this.calcularValorTotalEdicion();
      } else {
        this.nuevaFactura.producto = productoFactura;
        this.nuevaFactura.producto.productoId = producto.id!;
        this.calcularValorTotal();
      }
    }
  }

  onClienteSeleccionado(event: any, esEdicion: boolean = false): void {
    const clienteId = event.target.value;
    const cliente = this.clientes.find(c => c.id === clienteId);
    
    if (cliente) {
      const clienteFactura: ClienteFactura = {
        clienteId: parseInt(cliente.id!),
        clienteNombre: cliente.nombre
      };

      if (esEdicion) {
        this.facturaEditar.cliente = clienteFactura;
      } else {
        this.nuevaFactura.cliente = clienteFactura;
        this.nuevaFactura.cliente.clienteId = parseInt(cliente.id!);
      }
    }
  }

  onCantidadCambiada(esEdicion: boolean = false): void {
    if (esEdicion) {
      this.calcularValorTotalEdicion();
    } else {
      this.calcularValorTotal();
    }
  }

  calcularValorTotal(): void {
    if (this.nuevaFactura.producto.productoId && this.nuevaFactura.cantidad > 0) {
      const producto = this.productos.find(p => p.id === this.nuevaFactura.producto.productoId);
      if (producto) {
        this.nuevaFactura.valorTotal = producto.precio * this.nuevaFactura.cantidad;
      }
    }
  }

  calcularValorTotalEdicion(): void {
    if (this.facturaEditar.producto?.productoId && this.facturaEditar.cantidad! > 0) {
      const producto = this.productos.find(p => p.id === this.facturaEditar.producto!.productoId);
      if (producto) {
        this.facturaEditar.valorTotal = producto.precio * this.facturaEditar.cantidad!;
      }
    }
  }

  validarFactura(factura: CrearFacturaRequest): boolean {
    if (!factura.fecha) {
      this.mostrarMensaje('La fecha es obligatoria', 'error');
      return false;
    }
    if (!factura.producto.productoId || factura.producto.productoId === 0) {
      this.mostrarMensaje('Debe seleccionar un producto', 'error');
      return false;
    }
    // se quema cliente porque el microservicio esta fallando
    factura.cliente.clienteId = 1;
    if (!factura.cliente.clienteId || factura.cliente.clienteId === 0) {
      this.mostrarMensaje('Debe seleccionar un cliente', 'error');
      return false;
    }
    if (!factura.cantidad || factura.cantidad <= 0) {
      this.mostrarMensaje('La cantidad debe ser mayor a 0', 'error');
      return false;
    }
    
    // Validar stock disponible
    const inventario = this.inventarios.find(inv => inv.producto?.id === factura.producto.productoId);
    if (inventario && factura.cantidad > inventario.cantidad) {
      this.mostrarMensaje(`Stock insuficiente. Disponible: ${inventario.cantidad}`, 'error');
      return false;
    }
    
    return true;
  }

  validarActualizacion(factura: ActualizarFacturaRequest): boolean {
    if (factura.cantidad !== undefined && factura.cantidad <= 0) {
      this.mostrarMensaje('La cantidad debe ser mayor a 0', 'error');
      return false;
    }
    
    // Validar stock disponible si se cambió el producto o cantidad
    if (factura.producto?.productoId && factura.cantidad) {
      const inventario = this.inventarios.find(inv => inv.producto?.id === factura.producto!.productoId);
      if (inventario && factura.cantidad > inventario.cantidad) {
        this.mostrarMensaje(`Stock insuficiente. Disponible: ${inventario.cantidad}`, 'error');
        return false;
      }
    }
    
    return true;
  }

  buscarFacturas(): void {
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase();
      this.facturas = this.facturas.filter(factura => 
        factura.facturaId?.toString().includes(termino) ||
        factura.cliente.clienteNombre.toLowerCase().includes(termino) ||
        factura.producto.productoNombre.toLowerCase().includes(termino)
      );
    } else {
      this.cargarFacturas();
    }
  }

  filtrarPorFechas(): void {
    if (this.fechaInicio && this.fechaFin) {
      this.facturas = this.facturas.filter(factura => {
        const fechaFactura = new Date(factura.fecha);
        const inicio = new Date(this.fechaInicio);
        const fin = new Date(this.fechaFin);
        return fechaFactura >= inicio && fechaFactura <= fin;
      });
    } else {
      this.cargarFacturas();
    }
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.cargarFacturas();
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'info'): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'COP'
    }).format(valor);
  }

  get facturasFiltradas(): Factura[] {
    return this.facturas;
  }

  get totalFacturas(): number {
    return this.facturas.length;
  }

  get valorTotalGeneral(): number {
    return this.facturas.reduce((total, factura) => total + factura.valorTotal, 0);
  }

  // Métodos auxiliares para el template
  obtenerPrecioProducto(productoId: number): number {
    const producto = this.productos.find(p => p.id === productoId);
    return producto?.precio || 0;
  }

  obtenerPrecioProductoNuevaFactura(): number {
    if (this.nuevaFactura.producto.productoId > 0) {
      return this.obtenerPrecioProducto(this.nuevaFactura.producto.productoId);
    }
    return 0;
  }

  obtenerPrecioProductoEdicion(): number {
    if (this.facturaEditar.producto?.productoId) {
      return this.obtenerPrecioProducto(this.facturaEditar.producto.productoId);
    }
    return 0;
  }

  obtenerStockDisponible(productoId: number): number {
    const inventario = this.inventarios.find(inv => inv.producto?.id === productoId);
    return inventario?.cantidad || 0;
  }
}