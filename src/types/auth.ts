export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'pm' | 'designer' | 'engineer' | 'member';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}