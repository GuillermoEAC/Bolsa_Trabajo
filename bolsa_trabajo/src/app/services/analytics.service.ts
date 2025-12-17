//  src/app/services/analytics.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
const API_URL = `${environment.apiUrl}/api/analytics`;

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);

  obtenerEstadisticasEmpresa(idUsuario: number): Observable<any> {
    return this.http.get(`${API_URL}/empresa/${idUsuario}`);
  }
}
