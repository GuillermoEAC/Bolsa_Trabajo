// /src/app/serices/Admin.Service.serve.ts
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

  cambiarEstadoEmpresa(id: number, validada: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/empresas/${id}/estado`, { validada });
  }

  // ==========================================
  // ========== VACANTES ==========
  // ==========================================

  obtenerVacantes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vacantes`);
  }

  moderarVacante(id: number, accion: 'aprobar' | 'rechazar', motivo: string = ''): Observable<any> {
    return this.http.put(`${this.apiUrl}/vacantes/${id}/moderar`, {
      accion: accion,
      motivo_rechazo: motivo,
    });
  }

  eliminarVacante(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/vacantes/${id}`);
  }

  // ==========================================
  // ========== USUARIOS ==========
  // ==========================================

  obtenerUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios`);
  }

  eliminarUsuario(id: number, tipo: 'ESTUDIANTE' | 'EMPRESA'): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${tipo}/${id}`);
  }

  // ==========================================
  // ========== ESTADÍSTICAS ==========
  // ==========================================

  obtenerEstadisticas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas`);
  }
}
