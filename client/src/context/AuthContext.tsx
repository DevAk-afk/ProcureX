import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { api } from '../lib/api.js';
import { useToast } from './ToastContext.js';

export const DEMO_ACCOUNTS: Array<{ role: UserRole; email: string; name: string }> = [
  { role: 'Admin', email: 'admin@procurex.com', name: 'Alexander Vance' },
  { role: 'Purchase Manager', email: 'proc.manager@procurex.com', name: 'Rohit Kulkarni' },
  { role: 'Employee / Requester', email: 'employee@procurex.com', name: 'Rahul Verma' },
  { role: 'Vendor', email: 'vendor@techlogix.com', name: 'TechLogix Representative' },
  { role: 'Inventory Manager', email: 'inventory@procurex.com', name: 'Gaurav Patil' },
];

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  quickDemoLogin: (email: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setUser(res.data.user);
        if (res.data.token) {
          localStorage.setItem('procurex_token', res.data.token);
        }
        success('Welcome back', `Signed in as ${res.data.user.name} (${res.data.user.role})`);
        return true;
      }
      return false;
    } catch (err: any) {
      error('Login failed', err.response?.data?.message || 'Invalid credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async (email: string): Promise<boolean> => {
    return login(email, 'Password123!');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('procurex_token');
      setUser(null);
      success('Logged out', 'You have been safely signed out.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        quickDemoLogin,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
