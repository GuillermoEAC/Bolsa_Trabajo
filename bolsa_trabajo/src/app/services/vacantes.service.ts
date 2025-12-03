import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VacantesService {
  // Ajusta esta URL si tu backend no usa el puerto 3000
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // ==========================================
  // Rutas PÚBLICAS (Buscador)
  // ==========================================

  /**
   * Busca y filtra vacantes públicas.
   * Corresponde al endpoint: GET /api/vacantes/buscar (con query params)
   */
  buscarVacantes(filtros: any): Observable<any> {
    let params = new HttpParams();
    // Transforma el objeto de filtros en parámetros de URL
    Object.keys(filtros).forEach((key) => {
      if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
        params = params.append(key, filtros[key]);
      }
    });
    return this.http.get(`${this.baseUrl}/vacantes/buscar`, { params });
  }

  /**
   * Obtiene el detalle de una vacante por su ID (Público).
   * Corresponde al endpoint: GET /api/vacantes/detalle/:id
   */
  obtenerVacantePorId(id: number): Observable<any> {
    // Nota: Asumo que la ruta en el router es /detalle/:id, que corresponde a obtenerVacantePorId en el backend
    return this.http.get(`${this.baseUrl}/vacantes/detalle/${id}`);
  }

  // ==========================================
  // Rutas de Vacantes (Empresa - CRUD)
  // ==========================================

  /**
   * Obtiene la lista de vacantes publicadas por un usuario de tipo Empresa.
   * Corresponde al endpoint: GET /api/vacantes/usuario/:id_usuario
   */
  obtenerVacantesPorUsuario(idUsuario: number): Observable<any> {
    // Corresponde a la función obtenerMisVacantes en el backend.
    return this.http.get(`${this.baseUrl}/vacantes/usuario/${idUsuario}`);
  }

  /**
   * Crea una nueva vacante.
   * Corresponde al endpoint: POST /api/vacantes/crear
   */
  publicarVacante(vacante: any): Observable<any> {
    // Corresponde a la función crearVacante en el backend.
    return this.http.post(`${this.baseUrl}/vacantes/crear`, vacante);
  }

  /**
   * Actualiza una vacante existente.
   * Corresponde al endpoint: PUT /api/vacantes/actualizar/:id
   */
  actualizarVacante(idVacante: number, vacanteData: any): Observable<any> {
    // Corresponde a la función actualizarVacante en el backend.
    return this.http.put(`${this.baseUrl}/vacantes/actualizar/${idVacante}`, vacanteData);
  }

  /**
   * Elimina una vacante.
   * Corresponde al endpoint: DELETE /api/vacantes/eliminar/:id
   */
  eliminarVacante(idVacante: number): Observable<any> {
    // Nota: El backend espera /api/vacantes/eliminar/:id (según tu router)
    return this.http.delete(`${this.baseUrl}/vacantes/eliminar/${idVacante}`);
  }

  // ==========================================
  // Rutas de Postulaciones (Empresa)
  // ==========================================

  /**
   * Obtiene la lista de candidatos que se han postulado a una vacante específica.
   * Corresponde al endpoint: GET /api/postulaciones/vacante/:id_vacante
   */
  obtenerCandidatosPorVacante(idVacante: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/postulaciones/vacante/${idVacante}`);
  }

  /**
   * Cambia el estado de una postulación (ej. Aceptar, Rechazar, Entrevista).
   * Corresponde al endpoint: PUT /api/postulaciones/estado/:id_postulacion
   * * @param idPostulacion ID de la postulación a modificar.
   * @param nuevoEstado El nuevo estado (ej. 'Entrevista', 'Rechazado', 'Contratado').
   */
  cambiarEstadoPostulacion(idPostulacion: number, nuevoEstado: string): Observable<any> {
    // 🛑 IMPORTANTE: Usamos PUT y la URL que definimos en el backend.
    return this.http.put(
      `${this.baseUrl}/postulaciones/estado/${idPostulacion}`,
      // El cuerpo del PUT solo necesita el campo 'estado'
      { estado: nuevoEstado }
    );
  }
}
