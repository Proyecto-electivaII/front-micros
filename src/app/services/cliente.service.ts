import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = environment.apiUrls.clients;

  constructor(private http: HttpClient) { }

  // ----- CRUD Clientes -----
  getAllClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}`);
  }

  getClienteById(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  createCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.apiUrl}`, cliente);
  }

  updateCliente(id: string, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  deleteCliente(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ----- Búsquedas -----
  buscarClientes(nombre?: string, correo?: string, telefono?: string): Observable<Cliente[]> {
    let params = new HttpParams();
    
    if (nombre) {
      params = params.set('nombre', nombre);
    }
    if (correo) {
      params = params.set('correo', correo);
    }
    if (telefono) {
      params = params.set('telefono', telefono);
    }
    
    return this.http.get<Cliente[]>(`${this.apiUrl}/buscar`, { params });
  }
}