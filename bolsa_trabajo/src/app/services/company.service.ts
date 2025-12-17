import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/company`;

  // Registrar nueva empresa (envía FormData con el logo y datos)
  registrarEmpresa(payload: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, payload);
  }

  // Obtener estado de validación de la empresa
  obtenerEstadoEmpresa(idUsuario: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/estado/${idUsuario}`);
  }
}
