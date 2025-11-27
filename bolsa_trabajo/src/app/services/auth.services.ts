import { Injectable, inject, PLATFORM_ID } from '@angular/core'; // 👈 1. Importar PLATFORM_ID
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common'; // 👈 2. Importar isPlatformBrowser

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID); // 👈 3. Inyectar el identificador de plataforma

  // Inicializamos el Subject
  private usuarioSubject = new BehaviorSubject<any>(this.leerUsuarioDelStorage());
  public usuario$ = this.usuarioSubject.asObservable();

  constructor() {}

  // ... (Tus métodos login y registro se quedan IGUAL) ...

  login(email: string, password: string): Observable<any> {
    return this.http.post('http://localhost:3000/auth/login', { email, password });
  }

  registro(email: string, password: string, id_rol: number): Observable<any> {
    return this.http.post('http://localhost:3000/auth/registro', { email, password, id_rol });
  }

  guardarSesion(token: string, usuario: any) {
    // 👈 4. Proteger la escritura también
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
    }
    this.usuarioSubject.next(usuario);
  }

  logout() {
    // 👈 5. Proteger el borrado
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
    this.usuarioSubject.next(null);
  }

  obtenerUsuarioActual(): any {
    return this.usuarioSubject.value;
  }

  // 🔥 AQUÍ ESTABA EL ERROR PRINCIPAL 🔥
  private leerUsuarioDelStorage() {
    // 6. Verificamos: ¿Estamos en el navegador?
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('usuario');
      return userStr ? JSON.parse(userStr) : null;
    }
    // Si estamos en el servidor, retornamos null (no hay usuario logueado en el server)
    return null;
  }
}
