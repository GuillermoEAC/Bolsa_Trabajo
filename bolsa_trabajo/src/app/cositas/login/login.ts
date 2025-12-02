import { Component, EventEmitter, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  logoPaht: string = 'Logo_Completo.png';

  email: string = '';
  password: string = '';
  cargando: boolean = false;
  error: string = '';
  exito: string = '';

  isVisible = input.required<boolean>();
  @Output() close = new EventEmitter<void>();

  constructor(private authService: AuthService, private router: Router) {}

  onClose() {
    this.close.emit();
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  limpiarMensajes() {
    this.error = '';
    this.exito = '';
  }

  onLogin() {
    console.log('🔵 onLogin() llamado');

    this.error = '';
    this.exito = '';

    if (!this.email || !this.password) {
      this.error = 'Por favor ingresa tu email y contraseña';
      return;
    }

    console.log('📤 Enviando al backend...');
    this.cargando = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (respuesta) => {
        console.log('✅ Login exitoso:', respuesta);

        // 1. Guardar sesión
        this.authService.guardarSesion(respuesta.token, respuesta.usuario);

        this.cargando = false;
        this.error = '';
        this.exito = `¡Bienvenido ${respuesta.usuario.email}!`;

        setTimeout(() => {
          // 2. Cerrar modal
          this.onClose();

          // 3. 🔥 REDIRECCIÓN POR ROLES 🔥
          const rol = respuesta.usuario.id_rol;

          if (rol === 1) {
            // 🛡️ ES ADMINISTRADOR -> Va al panel de admin
            this.router.navigate(['/admin']);
          } else if (rol === 3) {
            // 🏢 ES EMPRESA -> Va al dashboard de empresa
            this.router.navigate(['/dashboard-empresa']);
          } else {
            // 🎓 ES ESTUDIANTE (Rol 2) -> Va al inicio
            this.router.navigate(['/welcome']);
          }
        }, 1500);
      },
      error: (error) => {
        console.error('❌ Error completo:', error);
        this.cargando = false;
        this.exito = '';

        if (error.status === 401) {
          this.error = 'Email o contraseña incorrectos';
        } else if (error.status === 400) {
          this.error = error.error?.error || 'Datos inválidos';
        } else if (error.status === 0) {
          this.error = 'No se puede conectar al servidor';
        } else {
          this.error = `Error: ${error.error?.error || 'Error desconocido'}`;
        }
      },
    });
  }
}
