export interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  password: string;
  password_confirmation: string;
  token: string;
}

export interface PasswordRecoveryRequest {
  email: string;
}

export interface PasswordResetRequest {
  token: string;
  password: string;
  password_confirmation: string;
}
