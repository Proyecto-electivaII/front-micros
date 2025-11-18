import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models/usuario.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginData: LoginRequest = {
    identifier: '',
    password: ''
  };

  showPassword = false;
  rememberMe = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    // Limpiar mensajes previos
    this.errorMessage = '';
    this.successMessage = '';

    // Validar campos
    if (!this.loginData.identifier.trim()) {
      this.errorMessage = 'Por favor ingrese su username o email';
      return;
    }

    if (!this.loginData.password.trim()) {
      this.errorMessage = 'Por favor ingrese su contraseña';
      return;
    }

    if (this.loginData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.isLoading = true;

    // Realizar login
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Login exitoso. Redirigiendo...';
        
        // Guardar en localStorage si "Recordarme" está marcado
        if (this.rememberMe) {
          localStorage.setItem('rememberLogin', 'true');
        }
        
        // Redirigir después de un breve delay
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en login:', error);
        
        // Manejar diferentes tipos de errores
        if (error.status === 401) {
          this.errorMessage = 'Credenciales inválidas. Verifique su username/email y contraseña.';
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión. Verifique su conexión a internet.';
        } else {
          this.errorMessage = error.error?.error || 'Error al iniciar sesión. Inténtelo nuevamente.';
        }
      }
    });
  }

  // Validación en tiempo real
  isFormValid(): boolean {
    return this.loginData.identifier.trim().length > 0 && 
           this.loginData.password.trim().length >= 6;
  }

  // Limpiar mensajes cuando el usuario empiece a escribir
  onInputChange(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }
}
