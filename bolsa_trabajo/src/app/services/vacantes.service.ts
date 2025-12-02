import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api/vacantes';

@Injectable({
  providedIn: 'root',
})
export class VacantesService {
  private http = inject(HttpClient);

  publicarVacante(datos: any): Observable<any> {
    return this.http.post(`${API_URL}/crear`, datos);
  }

  obtenerVacantesPorUsuario(idUsuario: number): Observable<any> {
    return this.http.get(`${API_URL}/usuario/${idUsuario}`);
  }

  obtenerVacantePorId(id: number): Observable<any> {
    return this.http.get(`${API_URL}/detalle/${id}`);
  }

  actualizarVacante(id: number, vacante: any): Observable<any> {
    return this.http.put(`${API_URL}/actualizar/${id}`, vacante);
  }

  eliminarVacante(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/eliminar/${id}`);
  }

  buscarVacantes(filtros: any): Observable<any> {
    return this.http.get(`${API_URL}/buscar`, { params: filtros });
  }
}
