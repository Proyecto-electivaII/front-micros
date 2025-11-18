import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🚀 INTERCEPTOR EJECUTÁNDOSE');
    console.log('📍 URL de la petición:', request.url);
    console.log('📍 URL objetivo:', environment.apiUrls.users);
    
    // Verificar múltiples formas de coincidencia
    const isUsuariosRequest = request.url.includes('localhost:8081/api/usuarios') || 
                             request.url.includes(environment.apiUrls.users) ||
                             request.url.startsWith(environment.apiUrls.users);
    
    console.log('🎯 ¿Es petición de usuarios?', isUsuariosRequest);
    
    // SIEMPRE intentar agregar el token para debug
    const token = localStorage.getItem('token');
    console.log('🔑 Token en localStorage:', token);
    
    if (isUsuariosRequest && token) {
      console.log('✅ AGREGANDO TOKEN AL HEADER');
      const modifiedRequest = request.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('📤 Headers finales:', modifiedRequest.headers.keys());
      return next.handle(modifiedRequest);
    } else {
      console.log('❌ NO se agregó token. Razones:');
      console.log('   - Es petición usuarios:', isUsuariosRequest);
      console.log('   - Existe token:', !!token);
    }
    
    return next.handle(request);
  }
}