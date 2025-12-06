import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { API_BASE_URL } from '@/lib/api';

type AuthRole = 'admin' | 'super_admin';

interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  role: AuthRole | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AuthRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on first mount
    const stored = localStorage.getItem('auth_user');
    const storedRole = localStorage.getItem('auth_role') as AuthRole | null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
      } catch {
        // ignore
      }
    }
    if (storedRole) {
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json().catch(() => null)) as
        | { success?: boolean; message?: string; error?: string; data?: { id: number; name: string; email: string; role: AuthRole } }
        | null;

      if (!res.ok || !data || data.success === false || !data.data) {
        const message = data?.message || (data as any)?.error || 'Email atau password salah';
        return { error: new Error(message) };
      }

      const safe = data.data;

      const authUser: AuthUser = {
        id: safe.id,
        name: safe.name,
        email: safe.email,
      };

      setUser(authUser);
      setRole(safe.role);
      localStorage.setItem('auth_user', JSON.stringify(authUser));
      localStorage.setItem('auth_role', safe.role);

      return { error: null };
    } catch (err: any) {
      if (err instanceof TypeError) {
        return { error: new Error('Tidak dapat terhubung ke server. Periksa koneksi atau coba lagi.') };
      }
      return { error: err instanceof Error ? err : new Error('Login gagal') };
    }
  };

  const signOut = async () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_role');
  };

  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        signIn,
        signOut,
        isAdmin,
        isSuperAdmin,
      }}
    >
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
