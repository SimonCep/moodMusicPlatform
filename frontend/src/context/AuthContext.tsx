import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { loginUser as apiLogin, logoutUser as apiLogout, registerUser as apiRegister } from '../services/api';
import { apiClient } from '../services/api';
import { UserCredentials, RegisterData, UserProfile } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: (credentials: UserCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.get<UserProfile>('/api/profile/');
      setUser(response.data);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Failed to fetch user profile in AuthContext:", error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return false;
    }
  };

  const checkAuth = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('accessToken');
    if (token) {
      await fetchUserProfile();
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: UserCredentials) => {
    setIsLoading(true);
    setUser(null);
    setIsAuthenticated(false);
    try {
      await apiLogin(credentials);
      const profileFetched = await fetchUserProfile();
      if (!profileFetched) {
        throw new Error("Login succeeded but failed to fetch user profile.");
      }
    } catch (error) {
      console.error('Login failed in AuthContext:', error);
      apiLogout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
        await apiRegister(userData);
    } catch (error) {
        console.error('Registration failed in AuthContext:', error);
        apiLogout();
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, register, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 