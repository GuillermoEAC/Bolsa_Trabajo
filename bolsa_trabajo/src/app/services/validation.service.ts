import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  // Validar Email
  validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email || email.trim() === '') {
      return { valid: false, error: 'El email es requerido' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'El formato del email no es válido' };
    }

    return { valid: true };
  }

  // Validar Contraseña
  validatePassword(password: string): { valid: boolean; error?: string } {
    if (!password || password.trim() === '') {
      return { valid: false, error: 'La contraseña es requerida' };
    }

    if (password.length < 2) {
      return { valid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    // Validar que contenga al menos una letra y un número
    // const hasLetter = /[a-zA-Z]/.test(password);
    // const hasNumber = /\d/.test(password);

    // if (!hasLetter || !hasNumber) {
    //   return { valid: false, error: 'La contraseña debe contener letras y números' };
    // }

    return { valid: true };
  }

  // Validar que las contraseñas coincidan
  validatePasswordMatch(
    password: string,
    confirmPassword: string
  ): { valid: boolean; error?: string } {
    if (password !== confirmPassword) {
      return { valid: false, error: 'Las contraseñas no coinciden' };
    }
    return { valid: true };
  }

  // Validar campos requeridos generales
  validateRequired(value: any, fieldName: string): { valid: boolean; error?: string } {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { valid: false, error: `${fieldName} es requerido` };
    }
    return { valid: true };
  }

  // Validar teléfono
  validatePhone(phone: string): { valid: boolean; error?: string } {
    if (!phone || phone.trim() === '') {
      return { valid: true }; // Opcional
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return { valid: false, error: 'El teléfono debe tener 10 dígitos' };
    }

    return { valid: true };
  }
}
