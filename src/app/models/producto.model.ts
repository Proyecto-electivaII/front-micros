export interface Producto {
  id?: number;
  nombre: string;
  precio: number;
  inventarios?: Inventario[];
}

export interface Inventario {
  id?: number;
  cantidad: number;
  producto?: Producto;
}