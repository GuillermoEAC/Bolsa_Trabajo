import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api/company';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private http = inject(HttpClient);

  // Enviar objeto con { cuenta: {...}, empresa: {...} }
  registrarEmpresa(payload: any): Observable<any> {
    return this.http.post(`${API_URL}/register`, payload);
  }
}
