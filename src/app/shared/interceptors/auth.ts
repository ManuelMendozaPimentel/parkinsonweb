import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // IMPORTANTE: Siempre permitir peticiones de login/registro sin autenticación
    if (req.url.includes('/auth/login') || req.url.includes('/auth/registro') || 
        req.url.includes('/auth/verificar-codigo') || req.url.includes('/auth/reenviar-codigo')) {
      return next.handle(req);
    }

    // Solo ejecutar en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const token = this.authService.getToken();
      
      if (token) {
        const clonedReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next.handle(clonedReq);
      }
    }
    
    return next.handle(req);
  }
}