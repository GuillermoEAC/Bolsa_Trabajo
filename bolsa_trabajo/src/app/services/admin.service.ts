import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api/admin';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  obtenerEmpresas(): Observable<any> {
    return this.http.get(`${API_URL}/empresas`);
  }

  cambiarEstadoEmpresa(id: number, estado: boolean): Observable<any> {
    return this.http.put(`${API_URL}/validar/${id}`, { estado });
  }
  obtenerVacantes(): Observable<any> {
    return this.http.get(`${API_URL}/vacantes`);
  }

  // Aprobar/Rechazar
  moderarVacante(id: number, estado: 'APROBADA' | 'RECHAZADA'): Observable<any> {
    return this.http.put(`${API_URL}/vacantes/estado/${id}`, { estado });
  }

  // Eliminar definitivamente
  eliminarVacante(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/vacantes/${id}`);
  }
}
