import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Producto, Inventario } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = environment.apiUrls.products;

  constructor(private http: HttpClient) { }

  // ----- Productos -----
  listarProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/listarProductos`);
  }

  crearProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/crear`, producto);
  }

  actualizarProducto(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/actualizar/${id}`, producto);
  }

  eliminarProducto(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }

  buscarProductoPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/buscarPorId/${id}`);
  }

  buscarProductoPorNombre(nombre: string): Observable<Producto> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<Producto>(`${this.apiUrl}/buscarPorNombre`, { params });
  }

  buscarProductosPorPrecio(precio: number, condicion: string): Observable<Producto[]> {
    const params = new HttpParams()
      .set('precio', precio.toString())
      .set('condicion', condicion);
    return this.http.get<Producto[]>(`${this.apiUrl}/buscarPorPrecio`, { params });
  }

  // ----- Inventario -----
  listarInventario(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${this.apiUrl}/inventario/listarInventario`);
  }

  actualizarStock(id: number, cantidad: number): Observable<Inventario> {
    const params = new HttpParams().set('cantidad', cantidad.toString());
    return this.http.patch<Inventario>(`${this.apiUrl}/actualizar-inventario/${id}`, null, { params });
  }
}
