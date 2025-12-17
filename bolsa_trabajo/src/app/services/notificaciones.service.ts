import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notificaciones`;

  obtenerNotificaciones(idUsuario: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  marcarLeida(idNotificacion: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/leer/${idNotificacion}`, {});
  }

  marcarTodasLeidas(idUsuario: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/leer-todas/${idUsuario}`, {});
  }
}
