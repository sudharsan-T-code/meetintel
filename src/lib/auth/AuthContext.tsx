'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, Permission, hasPermission, hasMinimumRole, getRoleDisplayLabel } from './rbac';

export interface AuthUser {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  title: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  authenticated: boolean;
  roleLabel: string;
  login: (email: string, password?: string) => Promise<boolean>;
  switchPersona: (personaKey: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkPermission: (permission: Permission) => boolean;
  checkMinimumRole: (minimumRole: UserRole) => boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/session', { cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!mounted) return;
        if (data?.authenticated && data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const switchPersona = async (personaKey: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona: personaKey }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        // Refresh router cache
        router.refresh();
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      router.push('/login');
      router.refresh();
    }
  };

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const checkMinimumRole = (minimumRole: UserRole): boolean => {
    if (!user) return false;
    return hasMinimumRole(user.role, minimumRole);
  };

  const roleLabel = user ? getRoleDisplayLabel(user.role) : 'Guest';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authenticated: Boolean(user),
        roleLabel,
        login,
        switchPersona,
        logout,
        checkPermission,
        checkMinimumRole,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
