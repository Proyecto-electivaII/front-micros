import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Factura, CrearFacturaRequest, ActualizarFacturaRequest } from '../models/factura.model';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private apiUrl = environment.apiUrls.billing;

  constructor(private http: HttpClient) {}

  // Obtener todas las facturas
  obtenerTodasLasFacturas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.apiUrl}`);
  }

  // Obtener factura por ID
  obtenerFacturaPorId(id: number): Observable<Factura> {
    return this.http.get<Factura>(`${this.apiUrl}/${id}`);
  }

  // Crear nueva factura
  crearFactura(factura: CrearFacturaRequest): Observable<Factura> {
    return this.http.post<Factura>(`${this.apiUrl}`, factura);
  }

  // Actualizar factura
  actualizarFactura(id: number, factura: ActualizarFacturaRequest): Observable<Factura> {
    return this.http.put<Factura>(`${this.apiUrl}/${id}`, factura);
  }

  // Eliminar factura
  eliminarFactura(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}