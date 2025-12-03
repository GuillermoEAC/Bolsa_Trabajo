import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api/analytics';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);

  obtenerEstadisticasEmpresa(idUsuario: number): Observable<any> {
    return this.http.get(`${API_URL}/empresa/${idUsuario}`);
  }
}
