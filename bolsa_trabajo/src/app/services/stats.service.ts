import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stats`;

  obtenerContadores() {
    return this.http.get<any>(`${this.apiUrl}/publicos`);
  }
}
