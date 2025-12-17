// /src/app/serices/AdminService.serve.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  // ==========================================
  // ========== EMPRESAS ==========
  // ==========================================

  obtenerEmpresas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/empresas`);
  }

  cambiarEstadoEmpresa(id: number, validada: boolean): Observable<any> {
    // Envía el estado de validación (true = 1, false = 0)
    return this.http.put(`${this.apiUrl}/empresas/${id}/estado`, { validada });
  }

  // ==========================================
  // ========== VACANTES ==========
  // ==========================================

  obtenerVacantes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vacantes`);
  }

  /**
   * Modera una vacante (Aprobar o Rechazar)
   * Nota: Ajustado para coincidir con el backend que espera 'accion'
   */
  moderarVacante(id: number, accion: 'aprobar' | 'rechazar', motivo: string = ''): Observable<any> {
    return this.http.put(`${this.apiUrl}/vacantes/${id}/moderar`, {
      accion: accion, // 'aprobar' o 'rechazar'
      motivo_rechazo: motivo, // Opcional, solo si se rechaza
    });
  }

  eliminarVacante(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/vacantes/${id}`);
  }

  // ==========================================
  // ========== USUARIOS ==========
  // ==========================================

  obtenerUsuarios(): Observable<any> {
    // Retorna la lista de usuarios más el resumen estadístico
    return this.http.get(`${this.apiUrl}/usuarios`);
  }

  eliminarUsuario(id: number, tipo: 'ESTUDIANTE' | 'EMPRESA'): Observable<any> {
    // Ruta: DELETE /api/admin/usuarios/ESTUDIANTE/123 o /api/admin/usuarios/EMPRESA/456
    return this.http.delete(`${this.apiUrl}/usuarios/${tipo}/${id}`);
  }

  // ==========================================
  // ========== ESTADÍSTICAS ==========
  // ==========================================

  obtenerEstadisticas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas`);
  }
}
