import { Component, EventEmitter, Output, input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private validationService = inject(ValidationService);

  logoPaht: string = 'Logo_Completo.png';

  email: string = '';
  password: string = '';
  cargando: boolean = false;
  error: string = '';
  exito: string = '';

  // Errores específicos por campo
  emailError: string = '';
  passwordError: string = '';

  isVisible = input.required<boolean>();
  @Output() close = new EventEmitter<void>();

  ngOnInit() {
    // Esto asegura que cada vez que el componente se crea, las variables nacen vacías
    this.limpiarFormulario();
  }
  onClose() {
    this.close.emit();
    this.limpiarFormulario();
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  limpiarMensajes() {
    this.error = '';
    this.exito = '';
    this.emailError = '';
    this.passwordError = '';
  }

  limpiarFormulario() {
    this.email = '';
    this.password = '';
    this.limpiarMensajes();
  }

  // Validar en tiempo real mientras escribe
  onEmailChange() {
    const validation = this.validationService.validateEmail(this.email);
    this.emailError = validation.error || '';
  }

  onPasswordChange() {
    const validation = this.validationService.validatePassword(this.password);
    this.passwordError = validation.error || '';
  }

  // Validación completa antes de enviar
  validarFormulario(): boolean {
    this.limpiarMensajes();
    let isValid = true;

    // Validar email
    const emailValidation = this.validationService.validateEmail(this.email);
    if (!emailValidation.valid) {
      this.emailError = emailValidation.error || '';
      isValid = false;
    }

    // Validar password
    const passwordValidation = this.validationService.validatePassword(this.password);
    if (!passwordValidation.valid) {
      this.passwordError = passwordValidation.error || '';
      isValid = false;
    }

    if (!isValid) {
      this.error = 'Por favor corrige los errores en el formulario';
    }

    return isValid;
  }

  onLogin() {
    console.log(' onLogin() llamado');

    if (!this.validarFormulario()) {
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
          this.onClose();

          const rol = respuesta.usuario.id_rol;

          if (rol === 1) {
            this.router.navigate(['/admin']);
          } else if (rol === 3) {
            this.router.navigate(['/dashboard-empresa']);
          } else {
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
