import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.services';
import { StudentService } from '../../services/student.service';
import { IconComponent } from '../../cositas/icon.component';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './mi-perfil.html',
  styleUrls: ['./mi-perfil.css'],
})
export class MiPerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private studentService = inject(StudentService);
  private cd = inject(ChangeDetectorRef);

  perfil: any = null;
  loading = true;
  editando = false;
  guardando = false;
  error: string | null = null;

  subiendoFoto = false;

  ngOnInit() {
    this.cargarPerfilAutomatico();
  }

  cargarPerfilAutomatico() {
    this.loading = true;

    // Suscripción reactiva al usuario autenticado
    this.authService.usuario$.subscribe({
      next: (usuario) => {
        if (usuario && usuario.id_usuario) {
          console.log('👤 Usuario detectado:', usuario.id_usuario);
          this.cargarPerfil(usuario.id_usuario);
        } else {
          console.log('⏳ Esperando usuario...');
        }
      },
      error: (err) => {
        console.error('❌ Error auth:', err);
        this.loading = false;
        this.cd.detectChanges(); // Forzar actualización UI
      },
    });
  }

  cargarPerfil(idUsuario: number) {
    this.studentService.getProfile(idUsuario).subscribe({
      next: (data) => {
        console.log('📦 Perfil recibido:', data);

        this.perfil = {
          ...data,
          estudios: data.estudios || [],
          experiencias: data.experiencias || [],
          proyectos: data.proyectos || [],
        };

        this.loading = false;

        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error cargando perfil:', err);
        this.error = 'No se pudo cargar la información.';
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  toggleEdicion() {
    this.editando = !this.editando;

    if (!this.editando && this.perfil?.id_usuario) {
      this.cargarPerfil(this.perfil.id_usuario);
    }
  }

  guardarCambios() {
    if (!this.perfil.nombre || !this.perfil.apellido) {
      alert('Nombre y Apellido son obligatorios');
      return;
    }

    this.guardando = true;

    this.cd.detectChanges();

    const payload = { ...this.perfil };

    this.studentService.saveProfile(payload).subscribe({
      next: (response) => {
        console.log('✅ Guardado exitoso:', response);

        this.guardando = false;
        this.editando = false;

        if (this.perfil.id_usuario) {
          this.cargarPerfil(this.perfil.id_usuario);
        } else {
          this.cd.detectChanges();
        }

        alert('Perfil actualizado correctamente');
      },
      error: (err) => {
        console.error('❌ Error al guardar:', err);
        alert('Error al guardar: ' + (err.message || 'Intente de nuevo'));
        this.guardando = false;
        this.cd.detectChanges();
      },
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && this.perfil?.id_usuario) {
      this.subiendoFoto = true;
      this.cd.detectChanges();

      const formData = new FormData();
      formData.append('foto', file);
      formData.append('id_usuario', this.perfil.id_usuario);

      this.studentService.uploadPhoto(formData).subscribe({
        next: (res) => {
          this.perfil.url_foto_perfil = res.url;
          this.subiendoFoto = false;
          alert('Foto actualizada');
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.subiendoFoto = false;
          alert('Error al subir imagen');
          this.cd.detectChanges();
        },
      });
    }
  }

  agregarItem(tipo: string) {
    const nuevoItem: any = {};
    if (tipo === 'estudios') {
      nuevoItem.nivel_estudio = '';
      nuevoItem.en_curso = false;
      this.perfil.estudios.push(nuevoItem);
    } else if (tipo === 'experiencias') {
      nuevoItem.actualmente_trabajando = false;
      this.perfil.experiencias.push(nuevoItem);
    } else if (tipo === 'proyectos') {
      this.perfil.proyectos.push({});
    }

    this.cd.detectChanges();
  }

  eliminarItem(arr: any[], index: number) {
    if (confirm('¿Eliminar este elemento?')) {
      arr.splice(index, 1);
      this.cd.detectChanges();
    }
  }

  cancelarEdicion() {
    if (confirm('¿Descartar cambios?')) {
      this.editando = false;
      if (this.perfil.id_usuario) this.cargarPerfil(this.perfil.id_usuario);
    }
  }

  get nombreCompleto(): string {
    return this.perfil ? `${this.perfil.nombre} ${this.perfil.apellido}` : '';
  }
}
