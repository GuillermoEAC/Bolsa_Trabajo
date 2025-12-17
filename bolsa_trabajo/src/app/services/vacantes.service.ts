import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VacantesService {
  private http = inject(HttpClient);
  // Usa la variable de entorno + /vacantes
  private apiUrl = `${environment.apiUrl}/vacantes`;

  obtenerCategorias(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categorias`);
  }

  buscarVacantes(filtros: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(filtros).forEach((key) => {
      if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
        params = params.append(key, filtros[key]);
      }
    });
    return this.http.get(`${this.apiUrl}/buscar`, { params });
  }

  obtenerVacantePorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/detalle/${id}`);
  }

  obtenerVacantesPorUsuario(idUsuario: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  publicarVacante(vacante: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, vacante);
  }

  actualizarVacante(idVacante: number, vacanteData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${idVacante}`, vacanteData);
  }

  eliminarVacante(idVacante: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${idVacante}`);
  }

  // Nota: Estas rutas de abajo parecen ser de postulaciones, pero si tu backend
  // las tiene bajo /vacantes, déjalas así. Si no, ajústalas.
  // Basado en tu server.js, creo que deberían ir en PostulacionesService,
  // pero las dejo aquí si tu backend las maneja en vacantes.routes.js
  obtenerCandidatosPorVacante(idVacante: number): Observable<any> {
    // Si esto falla, cambia la URL a: `${environment.apiUrl}/postulaciones/vacante/${idVacante}`
    return this.http.get(`${environment.apiUrl}/postulaciones/vacante/${idVacante}`);
  }

  cambiarEstadoPostulacion(idPostulacion: number, nuevoEstado: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/postulaciones/estado/${idPostulacion}`, {
      estado: nuevoEstado,
    });
  }
}
