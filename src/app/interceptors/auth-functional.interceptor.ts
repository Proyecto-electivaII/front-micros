import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🚀 INTERCEPTOR FUNCIONAL EJECUTÁNDOSE');
  console.log('📍 URL de la petición:', req.url);
  console.log('📍 URL objetivo:', environment.apiUrls.users);
  
  // Verificar si la petición es para el microservicio de usuarios
  const isUsuariosRequest = req.url.includes('localhost:8081/api/usuarios') || 
                           req.url.includes(environment.apiUrls.users) ||
                           req.url.startsWith(environment.apiUrls.users);
  
  console.log('🎯 ¿Es petición de usuarios?', isUsuariosRequest);
  
  // Obtener el token del localStorage
  const token = localStorage.getItem('token');
  console.log('🔑 Token en localStorage:', token ? 'SÍ' : 'NO');
  console.log('🔑 Token valor:', token);
  
  if (isUsuariosRequest && token) {
    console.log('✅ AGREGANDO TOKEN AL HEADER');
    const modifiedReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('📤 Headers agregados:', modifiedReq.headers.get('Authorization'));
    return next(modifiedReq);
  } else {
    console.log('❌ NO se agregó token. Razones:');
    console.log('   - Es petición usuarios:', isUsuariosRequest);
    console.log('   - Existe token:', !!token);
  }
  
  return next(req);
};