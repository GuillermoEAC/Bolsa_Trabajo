import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/company`;

  registrarEmpresa(payload: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, payload);
  }

  obtenerEstadoEmpresa(idUsuario: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/estado/${idUsuario}`);
  }

  getProfile(idUsuario: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/${idUsuario}`);
  }

  updateProfile(idUsuario: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/${idUsuario}`, formData);
  }
}
