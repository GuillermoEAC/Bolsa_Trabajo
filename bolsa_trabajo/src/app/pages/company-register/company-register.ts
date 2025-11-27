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

  cuenta = { email: '', password: '' };
  confirmPassword = '';

  empresa = {
    nombre_empresa: '',
    razon_social: '',
    nit: '',
    sitio_web: '',
    logo_url: '',
    descripcion: '',
    email_contacto: '',
  };

  loading = false;
  error = '';

  onSubmit() {
    this.error = '';

    // Validaciones básicas
    if (!this.cuenta.email || !this.cuenta.password || !this.empresa.nombre_empresa) {
      this.error = 'Completa los campos obligatorios (Email, Password, Nombre Empresa).';
      return;
    }
    if (this.cuenta.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    this.empresa.email_contacto = this.cuenta.email;

    const payload = {
      cuenta: this.cuenta,
      empresa: this.empresa,
    };

    this.companyService.registrarEmpresa(payload).subscribe({
      next: () => {
        this.loading = false;
        alert('¡Registro Exitoso! Tu cuenta está pendiente de aprobación por el administrador.');
        this.router.navigate(['/welcome']);
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.error = err.error?.error || 'Error al registrar la empresa.';
      },
    });
  }
}
