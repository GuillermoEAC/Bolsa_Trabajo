import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-company-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-register.html',
  styleUrls: ['./company-register.css'],
})
export class CompanyRegisterComponent {
  private companyService = inject(CompanyService);
  private router = inject(Router);

  // Datos del formulario
  cuenta = { email: '', password: '' };
  confirmPassword = '';

  empresa = {
    nombre_empresa: '',
    razon_social: '',
    nit: '',
    sitio_web: '',
    descripcion: '',
    email_contacto: '',
  };

  // Variables para la imagen
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  loading = false;
  error = '';

  // Evento al seleccionar un archivo
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Generar vista previa
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.error = '';

    // Validaciones simples
    if (!this.cuenta.email || !this.cuenta.password || !this.empresa.nombre_empresa) {
      this.error = 'Completa los campos obligatorios.';
      return;
    }
    if (this.cuenta.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;

    // ---------------------------------------------------------
    // CREAR FORM DATA (Empaquetado de datos + archivo)
    // ---------------------------------------------------------
    const formData = new FormData();

    // Datos de la cuenta
    formData.append('email', this.cuenta.email);
    formData.append('password', this.cuenta.password);

    // Datos de la empresa
    formData.append('nombre_empresa', this.empresa.nombre_empresa);
    formData.append('razon_social', this.empresa.razon_social || '');
    formData.append('nit', this.empresa.nit || '');
    formData.append('sitio_web', this.empresa.sitio_web || '');
    formData.append('descripcion', this.empresa.descripcion || '');
    // Usamos el email de la cuenta como contacto por defecto
    formData.append('email_contacto', this.cuenta.email);

    // Archivo del Logo (Si existe)
    if (this.selectedFile) {
      // 'logo' debe coincidir con upload.single('logo') en el backend
      formData.append('logo', this.selectedFile);
    }

    // Enviar al backend
    this.companyService.registrarEmpresa(formData).subscribe({
      next: () => {
        this.loading = false;
        alert('¡Registro Exitoso! Tu cuenta está pendiente de validación.');
        this.router.navigate(['/welcome']);
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.error = err.error?.message || 'Error al registrar la empresa.';
      },
    });
  }
}
