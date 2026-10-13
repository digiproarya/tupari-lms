import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, Role, Permission, ROLE_PERMISSIONS } from '../types';
import { users, schools } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  switchSchool: (schoolId: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock password store (in real app, auth is handled by GAS backend)
const MOCK_CREDENTIALS: Record<string, string> = {
  'admin@tupari.id': 'admin123',
  'budi@tupari.id': 'guru123',
  'kepsek@tupari.id': 'kepsek123',
  'ahmad@tupari.id': 'guru123',
  'dewi@tupari.id': 'guru123',
  'rizki@tupari.id': 'siswa123',
  'anisa@tupari.id': 'siswa123',
  'operator@tupari.id': 'operator123',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('tupari_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const expectedPassword = MOCK_CREDENTIALS[email];
    if (!expectedPassword || expectedPassword !== password) {
      return false;
    }

    const foundUser = users.find(u => u.email === email);
    if (!foundUser || foundUser.status !== 'active') {
      return false;
    }

    setUser(foundUser);
    localStorage.setItem('tupari_user', JSON.stringify(foundUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('tupari_user');
  }, []);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role];
    return userPermissions.includes(permission);
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
