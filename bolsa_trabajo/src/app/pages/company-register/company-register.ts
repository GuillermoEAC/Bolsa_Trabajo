import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { ValidationService } from '../../services/validation.service';

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
  private validationService = inject(ValidationService);

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

  // Errores de validación por campo
  validationErrors: any = {
    email: '',
    password: '',
    confirmPassword: '',
    nombre_empresa: '',
    nit: '',
  };

  // Validar email en tiempo real
  onEmailChange() {
    const validation = this.validationService.validateEmail(this.cuenta.email);
    this.validationErrors.email = validation.error || '';
  }

  // Validar contraseña en tiempo real
  onPasswordChange() {
    const validation = this.validationService.validatePassword(this.cuenta.password);
    this.validationErrors.password = validation.error || '';

    // Re-validar confirmación si ya tiene contenido
    if (this.confirmPassword) {
      this.onConfirmPasswordChange();
    }
  }

  // Validar confirmación de contraseña
  onConfirmPasswordChange() {
    const validation = this.validationService.validatePasswordMatch(
      this.cuenta.password,
      this.confirmPassword
    );
    this.validationErrors.confirmPassword = validation.error || '';
  }

  // Validar nombre de empresa
  onNombreEmpresaChange() {
    const validation = this.validationService.validateRequired(
      this.empresa.nombre_empresa,
      'Nombre de empresa'
    );
    this.validationErrors.nombre_empresa = validation.error || '';
  }

  // Validar todo el formulario antes de enviar
  validateForm(): boolean {
    let isValid = true;
    this.error = '';

    // Email
    const emailValidation = this.validationService.validateEmail(this.cuenta.email);
    if (!emailValidation.valid) {
      this.validationErrors.email = emailValidation.error || '';
      isValid = false;
    }

    // Password
    const passwordValidation = this.validationService.validatePassword(this.cuenta.password);
    if (!passwordValidation.valid) {
      this.validationErrors.password = passwordValidation.error || '';
      isValid = false;
    }

    // Confirm Password
    const passwordMatchValidation = this.validationService.validatePasswordMatch(
      this.cuenta.password,
      this.confirmPassword
    );
    if (!passwordMatchValidation.valid) {
      this.validationErrors.confirmPassword = passwordMatchValidation.error || '';
      isValid = false;
    }

    // Nombre empresa
    const nombreValidation = this.validationService.validateRequired(
      this.empresa.nombre_empresa,
      'Nombre de empresa'
    );
    if (!nombreValidation.valid) {
      this.validationErrors.nombre_empresa = nombreValidation.error || '';
      isValid = false;
    }

    // NIT/RFC
    const nitValidation = this.validationService.validateRequired(this.empresa.nit, 'NIT/RFC');
    if (!nitValidation.valid) {
      this.validationErrors.nit = nitValidation.error || '';
      isValid = false;
    }

    if (!isValid) {
      this.error = 'Por favor corrige los errores en el formulario';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return isValid;
  }

  // Evento al seleccionar un archivo
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Solo se permiten archivos de imagen (JPG, PNG, WEBP)';
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'El archivo no puede superar los 5MB';
        return;
      }

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

    // Validar formulario
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    // Crear FormData
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
    formData.append('email_contacto', this.cuenta.email);

    // Archivo del Logo
    if (this.selectedFile) {
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
