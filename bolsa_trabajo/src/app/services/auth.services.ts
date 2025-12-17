import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  // Truco: Si environment.apiUrl termina en '/api', lo quitamos para acceder a '/auth'
  // Si tu backend tiene auth dentro de api (/api/auth), quita el .replace
  private authUrl = environment.apiUrl.replace('/api', '') + '/auth';

  private usuarioSubject = new BehaviorSubject<any>(this.leerUsuarioDelStorage());
  public usuario$ = this.usuarioSubject.asObservable();

  constructor() {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.authUrl}/login`, { email, password });
  }

  registro(email: string, password: string, id_rol: number): Observable<any> {
    return this.http.post(`${this.authUrl}/registro`, { email, password, id_rol });
  }

  solicitarRecuperacion(email: string): Observable<any> {
    return this.http.post(`${this.authUrl}/recuperar-password`, { email });
  }

  restablecerPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.authUrl}/restablecer-password`, {
      token,
      newPassword,
    });
  }

  // --- MÉTODOS DE SESIÓN (SSR SAFE) ---

  guardarSesion(token: string, usuario: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
    }
    this.usuarioSubject.next(usuario);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
    this.usuarioSubject.next(null);
  }

  obtenerUsuarioActual(): any {
    return this.usuarioSubject.value;
  }

  private leerUsuarioDelStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('usuario');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }
}
