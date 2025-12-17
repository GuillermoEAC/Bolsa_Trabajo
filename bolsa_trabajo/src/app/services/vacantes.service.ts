// src/app/services/vacantes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VacantesService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  obtenerCategorias(): Observable<any> {
    return this.http.get(`${this.baseUrl}/vacantes/categorias`);
  }

  buscarVacantes(filtros: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(filtros).forEach((key) => {
      if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
        params = params.append(key, filtros[key]);
      }
    });
    return this.http.get(`${this.baseUrl}/vacantes/buscar`, { params });
  }

  obtenerVacantePorId(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/vacantes/detalle/${id}`);
  }

  obtenerVacantesPorUsuario(idUsuario: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/vacantes/usuario/${idUsuario}`);
  }

  publicarVacante(vacante: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/vacantes/crear`, vacante);
  }

  actualizarVacante(idVacante: number, vacanteData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/vacantes/actualizar/${idVacante}`, vacanteData);
  }

  eliminarVacante(idVacante: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/vacantes/eliminar/${idVacante}`);
  }

  obtenerCandidatosPorVacante(idVacante: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/postulaciones/vacante/${idVacante}`);
  }

  cambiarEstadoPostulacion(idPostulacion: number, nuevoEstado: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/postulaciones/estado/${idPostulacion}`, {
      estado: nuevoEstado,
    });
  }
}
