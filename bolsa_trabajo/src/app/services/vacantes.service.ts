import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api/vacantes';

@Injectable({
  providedIn: 'root',
})
export class VacantesService {
  private http = inject(HttpClient);

  // 1. Crear
  publicarVacante(datos: any): Observable<any> {
    return this.http.post(`${API_URL}/crear`, datos);
  }

  // 2. Leer (Por empresa)
  obtenerVacantesPorUsuario(idUsuario: number): Observable<any> {
    return this.http.get(`${API_URL}/usuario/${idUsuario}`);
  }

  // 3. Eliminar
  eliminarVacante(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/eliminar/${id}`);
  }

  // 4. Obtener una (para editar)
  obtenerVacantePorId(id: number): Observable<any> {
    return this.http.get(`${API_URL}/detalle/${id}`);
  }

  // 5. Actualizar
  actualizarVacante(id: number, vacante: any): Observable<any> {
    return this.http.put(`${API_URL}/actualizar/${id}`, vacante);
  }

  buscarVacantes(filtros: any): Observable<any> {
    return this.http.get(`${API_URL}/buscar`, { params: filtros });
  }
}
