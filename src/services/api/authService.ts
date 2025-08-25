import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_BASE_URL } from '@env';
import type { User, AuthTokens } from '../../types/auth';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'ceo' | 'manager' | 'staff';
  department?: string;
  job_title?: string;
  phone?: string;
}

interface PasswordResetRequest {
  email: string;
}

interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface AuthResponse {
  success: boolean;
  data: AuthTokens & {
    user: User;
  };
}

interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
  };
}

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await this.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (
      token &&
      !endpoint.includes('refresh') &&
      !endpoint.includes('login') &&
      !endpoint.includes('register')
    ) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success) {
      await this.storeTokens(response.data);
    }

    return response;
  }

  async register(
    userData: RegisterRequest,
  ): Promise<{ success: boolean; data: { user: User; message: string } }> {
    const response = await this.makeRequest<{
      success: boolean;
      data: { user: User; message: string };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Logout request failed, proceeding with local logout');
    } finally {
      await this.clearTokens();
    }
  }

  async requestPasswordReset(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest<{
      success: boolean;
      message: string;
    }>('/auth/password-reset-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return response;
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest<{
      success: boolean;
      message: string;
    }>('/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });

    return response;
  }

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = await this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.makeRequest<{
      success: boolean;
      data: AuthTokens;
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.success) {
      await this.storeTokens(response.data);
      return response.data;
    }

    throw new Error('Token refresh failed');
  }

  async getCurrentUser(): Promise<{ success: boolean; data: { user: User } }> {
    const response = await this.makeRequest<{
      success: boolean;
      data: { user: User };
    }>('/auth/me');
    return response;
  }

  async verifyEmail(
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest<{
      success: boolean;
      message: string;
    }>(`/auth/verify-email/${token}`);
    return response;
  }

  // Token management
  private async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        ['accessToken', tokens.accessToken],
        ['refreshToken', tokens.refreshToken],
        ['tokenExpiresAt', (Date.now() + tokens.expiresIn * 1000).toString()],
      ]);
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const expiresAt = await AsyncStorage.getItem('tokenExpiresAt');

      if (!token || !expiresAt) {
        return null;
      }

      // Check if token is expired
      if (Date.now() >= parseInt(expiresAt, 10)) {
        // Try to refresh token
        try {
          const newTokens = await this.refreshToken();
          return newTokens.accessToken;
        } catch (error) {
          await this.clearTokens();
          return null;
        }
      }

      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  private async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'tokenExpiresAt',
      ]);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  async isTokenValid(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Auto-refresh token wrapper
  async withAuth<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall();
    } catch (error: any) {
      if (
        error.message?.includes('401') ||
        error.message?.includes('Unauthorized')
      ) {
        try {
          await this.refreshToken();
          return await apiCall();
        } catch (refreshError) {
          await this.clearTokens();
          throw new Error('Session expired. Please login again.');
        }
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
