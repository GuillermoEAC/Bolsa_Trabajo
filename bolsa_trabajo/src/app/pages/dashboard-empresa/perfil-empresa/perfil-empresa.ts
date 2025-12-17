import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.services';
import { CompanyService } from '../../../services/company.service';
import { IconComponent } from '../../../cositas/icon.component';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-perfil-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './perfil-empresa.html',
  styleUrls: ['./perfil-empresa.css'],
})
export class PerfilEmpresaComponent implements OnInit {
  private authService = inject(AuthService);
  private companyService = inject(CompanyService);
  private cd = inject(ChangeDetectorRef);

  usuario = this.authService.obtenerUsuarioActual();
  perfil: any = {};
  loading = true;
  guardando = false;

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  ngOnInit() {
    if (this.usuario) {
      this.cargarPerfil();
    }
  }

  cargarPerfil() {
    this.loading = true;
    this.cd.markForCheck();

    this.companyService.getProfile(this.usuario.id_usuario).subscribe({
      next: (data: any) => {
        this.perfil = data;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.cd.detectChanges();
        console.error(err);
        Swal.fire('Error', 'No se pudo cargar el perfil', 'error');
      },
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
        this.cd.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  guardarCambios() {
    this.guardando = true;
    this.cd.detectChanges();

    const formData = new FormData();
    formData.append('nombre_empresa', this.perfil.nombre_empresa);
    formData.append('razon_social', this.perfil.razon_social || '');
    formData.append('nit', this.perfil.nit || '');
    formData.append('email_contacto', this.perfil.email_contacto || '');
    formData.append('sitio_web', this.perfil.sitio_web || '');
    formData.append('descripcion', this.perfil.descripcion || '');

    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    this.companyService.updateProfile(this.usuario.id_usuario, formData).subscribe({
      next: (res: any) => {
        this.guardando = false;
        if (res.logo_path) {
          this.perfil.logo_path = res.logo_path;
          this.previewUrl = null;
        }
        this.selectedFile = null;
        this.cd.detectChanges();
        Swal.fire('Éxito', 'Perfil actualizado correctamente', 'success');
      },
      error: (err: any) => {
        this.guardando = false;
        this.cd.detectChanges();
        console.error(err);
        Swal.fire('Error', 'No se pudo guardar los cambios', 'error');
      },
    });
  }

  construirUrlImagen(ruta: string | null): string {
    if (this.previewUrl) return this.previewUrl;
    if (!ruta) return '';
    if (ruta.startsWith('http')) return ruta;

    const baseUrl = environment.apiUrl.replace('/api', '');

    const rutaLimpia = ruta.startsWith('/') ? ruta.substring(1) : ruta;

    return `${baseUrl}/${rutaLimpia}`;
  }
}
