import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../utils/api';

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: { email: string; password: string; first_name?: string; last_name?: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on app load
  useEffect(() => {
    const token = localStorage.getItem('sessionToken');
    if (token) {
      validateSession(token);
    }
  }, []);

  const validateSession = async (token: string) => {
    try {
      const result = await apiService.validateSession(token);
      if (result.valid) {
        setSessionToken(token);
        // Get user profile
        const userProfile = await apiService.getProfile(token);
        setUser(userProfile);
        setIsAuthenticated(true);
        localStorage.setItem('sessionToken', token);
      } else {
        // Clear invalid session
        logout();
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      logout();
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await apiService.login({ email, password });
      if (result.access_token) {
        setSessionToken(result.access_token);
        setUser(result.user);
        setIsAuthenticated(true);
        localStorage.setItem('sessionToken', result.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    if (sessionToken) {
      try {
        await apiService.logout(sessionToken);
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
    setSessionToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('sessionToken');
  };

  const register = async (userData: { email: string; password: string; first_name?: string; last_name?: string }): Promise<boolean> => {
    try {
      const result = await apiService.register(userData);
      if (result.access_token) {
        // Auto-login after successful registration
        setSessionToken(result.access_token);
        setUser(result.user);
        setIsAuthenticated(true);
        localStorage.setItem('sessionToken', result.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    sessionToken,
    isAuthenticated,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 