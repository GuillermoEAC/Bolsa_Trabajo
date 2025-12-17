import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/student`;

  getProfile(idUsuario: number): Observable<any> {
    const url = `${this.apiUrl}/${idUsuario}`;
    // console.log('🔍 [StudentService] Solicitando perfil:', url); // Descomentar para debug

    return this.http.get(url).pipe(
      // tap((response) => console.log('✅ [StudentService] Perfil recibido')),
      catchError(this.handleError)
    );
  }

  saveProfile(payload: any): Observable<any> {
    const url = `${this.apiUrl}/profile`;

    return this.http.post(url, payload).pipe(
      // tap((response) => console.log('✅ [StudentService] Guardado exitoso')),
      catchError(this.handleError)
    );
  }

  uploadPhoto(formData: FormData): Observable<any> {
    const url = `${this.apiUrl}/upload-photo`;

    return this.http.post(url, formData).pipe(
      // tap((res) => console.log('✅ Foto subida:', res)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMsg = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMsg = `Error de conexión: ${error.error.message}`;
    } else {
      console.error('❌ [Backend Error]', error);

      if (error.error && error.error.detalle) {
        errorMsg = `Servidor: ${error.error.detalle}`;
      } else if (error.status === 404) {
        errorMsg = 'Usuario o perfil no encontrado.';
      } else if (error.status === 500) {
        errorMsg = 'Error interno del servidor.';
      } else {
        errorMsg = `Error ${error.status}: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMsg));
  }
}
