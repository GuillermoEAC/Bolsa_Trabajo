import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class PostulacionesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/postulaciones`;

  aplicarVacante(idUsuario: number, idVacante: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/aplicar`, {
      id_usuario: idUsuario,
      id_vacante: idVacante,
    });
  }

  obtenerHistorial(idUsuario: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/historial/${idUsuario}`);
  }

  // --- MÉTODOS PARA EMPRESA ---

  obtenerCandidatos(idVacante: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/vacante/${idVacante}`);
  }

  cambiarEstado(idPostulacion: number, nuevoEstado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/estado/${idPostulacion}`, { nuevo_estado: nuevoEstado });
  }
}
