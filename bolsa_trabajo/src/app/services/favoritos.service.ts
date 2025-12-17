import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/favoritos`;

  toggleFavorito(idUsuario: number, idVacante: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/toggle`, {
      id_usuario: idUsuario,
      id_vacante: idVacante,
    });
  }

  obtenerMisFavoritos(idUsuario: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuario/${idUsuario}`);
  }
}
