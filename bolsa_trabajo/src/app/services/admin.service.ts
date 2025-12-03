import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}

  // ========== EMPRESAS ==========
  obtenerEmpresas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/empresas`);
  }

  cambiarEstadoEmpresa(id: number, validada: boolean): Observable<any> {
    // Envía el estado de validación (true/false, que se mapeará a 1/0 en el backend)
    return this.http.put(`${this.apiUrl}/empresas/${id}/estado`, { validada });
  }

  // ========== VACANTES ==========
  obtenerVacantes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vacantes`);
  }

  moderarVacante(id: number, estado: string, idAdmin?: number): Observable<any> {
    // El backend espera { estado: 'APROBADA' | 'RECHAZADA' }
    return this.http.put(`${this.apiUrl}/vacantes/${id}/moderar`, {
      estado: estado,
      id_administrador_aprobador: idAdmin, // Opcional, si lo manejas
    });
  }

  eliminarVacante(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/vacantes/${id}`);
  }

  // ========== USUARIOS (NUEVO) ==========
  obtenerUsuarios(): Observable<any> {
    // Retorna la lista de usuarios más el resumen estadístico
    return this.http.get(`${this.apiUrl}/usuarios`);
  }

  eliminarUsuario(id: number, tipo: 'ESTUDIANTE' | 'EMPRESA'): Observable<any> {
    // Ruta: DELETE /api/admin/usuarios/ESTUDIANTE/123 o /api/admin/usuarios/EMPRESA/456
    return this.http.delete(`${this.apiUrl}/usuarios/${tipo}/${id}`);
  }

  // ========== ESTADÍSTICAS ==========
  obtenerEstadisticas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas`);
  }
}
