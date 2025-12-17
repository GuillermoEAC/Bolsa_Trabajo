// /src/app/serices/company.servie.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api/company';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private http = inject(HttpClient);

  // Registrar nueva empresa (envía FormData con el logo y datos)
  registrarEmpresa(payload: FormData): Observable<any> {
    return this.http.post(`${API_URL}/register`, payload);
  }

  // Nuevo método: Obtener estado de validación de la empresa
  // Se usa en el Dashboard para bloquear/desbloquear funciones
  obtenerEstadoEmpresa(idUsuario: number): Observable<any> {
    return this.http.get(`${API_URL}/estado/${idUsuario}`);
  }
}
