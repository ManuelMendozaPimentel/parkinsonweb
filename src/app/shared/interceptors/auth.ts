import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {
    console.log('✅ AuthInterceptor instanciado');  // ← Agrega esta línea
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔐 Interceptor ejecutándose para:', req.url);  // ← Agrega esta línea
    
    const token = this.authService.getToken();
    console.log('🔐 Token existe?:', !!token);
    
    if (token) {
      const clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      console.log('🔐 Token agregado a la petición');
      return next.handle(clonedReq);
    }
    
    console.log('🔐 No hay token');
    return next.handle(req);
  }
}