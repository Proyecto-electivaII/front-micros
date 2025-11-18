export interface Usuario {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CUSTOMER';
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegistroUsuarioRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export interface ActualizarUsuarioRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'ADMIN' | 'CUSTOMER';
}

export interface UsuarioStats {
  totalUsuarios: number;
  usuariosActivos: number;
  usuariosInactivos: number;
  totalAdmins: number;
  totalCustomers: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginRequest {
  identifier: string; // username o email
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
  message?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CUSTOMER';
  token: string;
}