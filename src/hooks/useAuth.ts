import { useState, useEffect } from 'react';
import { User } from '../types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated (e.g., from AsyncStorage)
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Simulate checking auth status
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, assume user is not authenticated initially
      setIsAuthenticated(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockUser: User = {
        id: '1',
        fullName: 'John Doe',
        email,
        role: 'admin',
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (credentials: any) => {
    try {
      // Simulate registration API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockUser: User = {
        id: '1',
        fullName: credentials.fullName,
        email: credentials.email,
        role: 'member',
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };
};
