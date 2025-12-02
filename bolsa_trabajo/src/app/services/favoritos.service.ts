import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api/favoritos';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private http = inject(HttpClient);

  toggleFavorito(idUsuario: number, idVacante: number): Observable<any> {
    return this.http.post(`${API_URL}/toggle`, { id_usuario: idUsuario, id_vacante: idVacante });
  }

  obtenerMisFavoritos(idUsuario: number): Observable<any> {
    return this.http.get(`${API_URL}/usuario/${idUsuario}`);
  }
}
