export interface Factura {
  facturaId?: number;
  fecha: string;
  valorTotal: number;
  cantidad: number;
  producto: ProductoFactura;
  cliente: ClienteFactura;
}

export interface ProductoFactura {
  productoId: number;
  productoNombre: string;
  cantidadProducto: number;
}

export interface ClienteFactura {
  clienteId: number;
  clienteNombre: string;
}

export interface CrearFacturaRequest {
  fecha: string;
  cantidad: number;
  producto: ProductoFactura;
  cliente: ClienteFactura;
  valorTotal?: number; // Se puede calcular automáticamente
}

export interface ActualizarFacturaRequest {
  fecha?: string;
  cantidad?: number;
  producto?: ProductoFactura;
  cliente?: ClienteFactura;
  valorTotal?: number;
}