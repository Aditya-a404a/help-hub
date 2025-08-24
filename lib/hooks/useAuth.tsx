"use client";

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { disasterAPI, User, LoginRequest, SignupRequest, APIError } from '../disaster-api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = disasterAPI.getStoredToken();
      if (token) {
        try {
          const response = await disasterAPI.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          console.error('Failed to get current user:', error);
          disasterAPI.clearToken();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await disasterAPI.login(credentials);
      setUser(response.user);
    } catch (error) {
      throw new APIError(
        error instanceof Error ? error.message : 'Login failed',
        401
      );
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupRequest) => {
    try {
      setIsLoading(true);
      await disasterAPI.signup(data);
      // After signup, user needs to login
    } catch (error) {
      throw new APIError(
        error instanceof Error ? error.message : 'Signup failed',
        400
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    disasterAPI.clearToken();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      await disasterAPI.updateProfile(data);
      // Refresh user data
      const response = await disasterAPI.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      throw new APIError(
        error instanceof Error ? error.message : 'Profile update failed',
        400
      );
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
