import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, Role, Permission, ROLE_PERMISSIONS } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  switchSchool: (schoolId: string) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'checking';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('tupari_user');
      const token = localStorage.getItem('tupari_token');
      if (stored && token) {
        const parsed = JSON.parse(stored);
        // TODO: Verify token validity with backend on app start
        return parsed;
      }
    } catch (e) {
      localStorage.removeItem('tupari_user');
      localStorage.removeItem('tupari_token');
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // Panggil API GAS untuk login
      const response = await api.auth.login(email, password);
      
      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        
        // Simpan token & user
        localStorage.setItem('tupari_token', token);
        localStorage.setItem('tupari_user', JSON.stringify(userData));
        
        setUser(userData);
        setConnectionStatus('connected');
        
        return { success: true };
      } else {
        // Login gagal - tampilkan error dari backend
        return { 
          success: false, 
          error: response.error || 'Email atau password salah' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      setConnectionStatus('disconnected');
      return { 
        success: false, 
        error: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('tupari_token');
      if (token) {
        // Notify backend tentang logout (fire-and-forget)
        api.auth.logout().catch(() => {});
      }
    } catch (e) {
      // Ignore logout errors
    } finally {
      setUser(null);
      localStorage.removeItem('tupari_user');
      localStorage.removeItem('tupari_token');
      setConnectionStatus('disconnected');
    }
  }, []);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role as Role];
    return userPermissions ? userPermissions.includes(permission) : false;
  }, [user]);

  const switchSchool = useCallback((schoolId: string) => {
    if (!user) return;
    if (!user.schoolIds.includes(schoolId)) return;
    const updated = { ...user, activeSchoolId: schoolId };
    setUser(updated);
    localStorage.setItem('tupari_user', JSON.stringify(updated));
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      hasPermission,
      switchSchool,
      isAuthenticated: !!user,
      isLoading,
      connectionStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function usePermission() {
  const { hasPermission } = useAuth();
  return hasPermission;
}
