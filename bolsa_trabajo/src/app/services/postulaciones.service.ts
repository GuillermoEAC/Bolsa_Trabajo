import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api/postulaciones';

@Injectable({
  providedIn: 'root',
})
export class PostulacionesService {
  private http = inject(HttpClient);

  aplicarVacante(idUsuario: number, idVacante: number): Observable<any> {
    return this.http.post(`${API_URL}/aplicar`, { id_usuario: idUsuario, id_vacante: idVacante });
  }

  obtenerHistorial(idUsuario: number): Observable<any> {
    return this.http.get(`${API_URL}/historial/${idUsuario}`);
  }

  // --- MÉTODOS PARA EMPRESA ---

  obtenerCandidatos(idVacante: number): Observable<any> {
    return this.http.get(`${API_URL}/vacante/${idVacante}`);
  }

  cambiarEstado(idPostulacion: number, nuevoEstado: string): Observable<any> {
    return this.http.put(`${API_URL}/estado/${idPostulacion}`, { nuevo_estado: nuevoEstado });
  }
}
