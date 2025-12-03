// src/app/Services/student.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private http = inject(HttpClient);

  // Asegúrate que esta URL es correcta
  private apiUrl = 'http://localhost:3000/api/student';

  getProfile(idUsuario: number): Observable<any> {
    const url = `${this.apiUrl}/${idUsuario}`;
    console.log('🔍 [StudentService] Solicitando perfil:', url);

    return this.http.get(url).pipe(
      tap((response) => console.log('✅ [StudentService] Perfil recibido')),
      catchError(this.handleError)
    );
  }

  saveProfile(payload: any): Observable<any> {
    const url = `${this.apiUrl}/profile`;
    console.log('💾 [StudentService] Guardando perfil:', url);

    return this.http.post(url, payload).pipe(
      tap((response) => console.log('✅ [StudentService] Guardado exitoso')),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMsg = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o red
      errorMsg = `Error de conexión: ${error.error.message}`;
    } else {
      // El backend retornó un código de error
      console.error('❌ [Backend Error]', error);

      // Si el backend envía un mensaje específico en 'detalle' (como puse en el controller)
      if (error.error && error.error.detalle) {
        errorMsg = `Servidor: ${error.error.detalle}`;
      } else if (error.status === 404) {
        errorMsg = 'Usuario o perfil no encontrado.';
      } else if (error.status === 500) {
        errorMsg = 'Error interno del servidor. Revisa la terminal del backend.';
      } else {
        errorMsg = `Error ${error.status}: ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMsg));
  }
  uploadPhoto(formData: FormData): Observable<any> {
    const url = `${this.apiUrl}/upload-photo`;
    console.log('📸 Enviando foto a:', url);

    return this.http.post(url, formData).pipe(
      tap((res) => console.log('✅ Foto subida:', res)),
      catchError(this.handleError)
    );
  }
}
