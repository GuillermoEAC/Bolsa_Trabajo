import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api/notificaciones';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private http = inject(HttpClient);

  obtenerNotificaciones(idUsuario: number): Observable<any> {
    return this.http.get(`${API_URL}/usuario/${idUsuario}`);
  }

  marcarLeida(idNotificacion: number): Observable<any> {
    return this.http.put(`${API_URL}/leer/${idNotificacion}`, {});
  }

  marcarTodasLeidas(idUsuario: number): Observable<any> {
    return this.http.put(`${API_URL}/leer-todas/${idUsuario}`, {});
  }
}
