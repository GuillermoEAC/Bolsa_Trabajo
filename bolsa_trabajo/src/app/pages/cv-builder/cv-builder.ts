// src/app/pages/cv-builder/cv-builder.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cv-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cv-builder.html',
  styleUrl: './cv-builder.css',
})
export class CvBuilderComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentStepSignal = 1;

  steps = [
    { name: '¿Quién eres?', desc: 'Empecemos por tus datos de contacto básicos.' },
    { name: 'Tu Formación', desc: 'Cuéntanos qué has estudiado o estás estudiando.' },
    { name: 'Experiencia', desc: 'Trabajos, prácticas, servicio social o voluntariados.' },
    { name: 'Portafolio', desc: 'Proyectos académicos, investigaciones o logros clave.' },
    { name: 'Habilidades', desc: '¿Qué herramientas dominas y qué idiomas hablas?' },
    { name: 'Guardar', desc: 'Crea tu cuenta para no perder tu progreso.' },
  ];

  cuenta = { email: '', password: '' };

  perfil: any = {
    nombre: '',
    apellido: '',
    titulo_cv: '',
    telefono: '',
    descripcion: '',
    disponibilidad_viajar: false,
    disponibilidad_residencia: false,
    estudios: [],
    experiencias: [],
    proyectos: [],
    habilidades: [],
    idiomas: [],
  };

  currentStep() {
    return this.currentStepSignal;
  }
  changeStep(step: number) {
    this.currentStepSignal = step;
  }

  nextStep() {
    if (this.currentStepSignal === 1) {
      if (!this.perfil.nombre || !this.perfil.apellido) {
        Swal.fire({
          title: 'Faltan datos',
          text: 'Por favor completa tu nombre y apellido para continuar.',
          icon: 'warning',
          confirmButtonColor: '#2563eb',
        });
        return;
      }
    }
    if (this.currentStepSignal < this.steps.length) this.currentStepSignal++;
  }

  prevStep() {
    if (this.currentStepSignal > 1) this.currentStepSignal--;
  }

  addEntry(type: string) {
    if (type === 'estudios') {
      this.perfil.estudios.push({
        nivel_estudio: '',
        carrera: '',
        centro_estudio: '',
        fecha_inicio: '',
        fecha_fin: '',
        en_curso: false,
      });
    } else if (type === 'experiencias') {
      this.perfil.experiencias.push({
        titulo_puesto: '',
        nombre_empresa: '',
        fecha_inicio: '',
        fecha_fin: '',
        actualmente_trabajando: false,
        descripcion_tareas: '',
      });
    } else if (type === 'proyectos') {
      this.perfil.proyectos.push({
        nombre_proyecto: '',
        url_repositorio: '',
        url_demo: '',
        descripcion: '',
      });
    } else if (type === 'habilidades') {
      this.perfil.habilidades.push({ nombre: '', nivel: 'Básico' });
    } else if (type === 'idiomas') {
      this.perfil.idiomas.push({ nombre: '', nivel: 'Básico' });
    }
  }

  removeEntry(type: string, index: number) {
    if (this.perfil[type]) this.perfil[type].splice(index, 1);
  }

  saveProfile() {
    const usuarioLogueado = this.authService.obtenerUsuarioActual();

    if (usuarioLogueado && usuarioLogueado.id_usuario) {
      this.enviarDatosBackend(usuarioLogueado.id_usuario);
    } else {
      if (!this.cuenta.email || !this.cuenta.password) {
        Swal.fire({
          title: 'Atención',
          text: 'Ingresa un correo y contraseña para crear tu cuenta.',
          icon: 'info',
          confirmButtonColor: '#2563eb',
        });
        return;
      }

      this.authService.registro(this.cuenta.email, this.cuenta.password, 2).subscribe({
        next: (res: any) => {
          console.log('Usuario registrado:', res);
          this.authService.guardarSesion('temp_token', {
            id_usuario: res.id_usuario,
            email: res.email,
          });
          this.enviarDatosBackend(res.id_usuario);
        },
        error: (err: any) => {
          console.error(err);

          Swal.fire({
            title: 'Error de Registro',
            text: err.error?.error || 'No se pudo crear la cuenta, verifica los datos.',
            icon: 'error',
          });
        },
      });
    }
  }

  private enviarDatosBackend(idUsuario: number) {
    const payload = { id_usuario: idUsuario, ...this.perfil };

    Swal.fire({
      title: 'Guardando...',
      text: 'Estamos creando tu perfil',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.http.post('http://localhost:3000/api/student/profile', payload).subscribe({
      next: () => {
        Swal.fire({
          title: '¡Bienvenido!',
          text: 'Tu perfil ha sido creado. Ahora puedes postularte a vacantes.',
          icon: 'success',
          confirmButtonText: 'Comenzar',
          confirmButtonColor: '#16a34a',
        }).then(() => {
          this.router.navigate(['/welcome']);
        });
      },
      error: (err) => {
        console.error(err);

        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al guardar tu CV en el servidor.',
          icon: 'error',
        });
      },
    });
  }
}
