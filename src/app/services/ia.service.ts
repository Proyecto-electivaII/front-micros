import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface IaRequest {
  texto: string;
}

export interface IaResponse {
  productos?: any[];
  producto?: any;
  error?: string;
}

export interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class IaService {

  constructor(private http: HttpClient) { }

  preguntar(consulta: string): Observable<any> {
    const request: IaRequest = { texto: consulta };
    return this.http.post<any>(environment.apiUrls.IA, request);
  }
}