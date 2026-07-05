import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setUnauthorizedListener } from '../services/api';

interface UserInfo {
  username: string;
  userId: string;
  email: string;
}

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const data = await api.get<{ username: string; userId: string; email: string }>('/auth/me');
        setUser({ username: data.username, userId: data.userId, email: data.email });
      } catch (e) {
        console.error("Session restoration failed", e);
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const data = await api.post<{ token: string; username: string; userId: string; email: string }>('/auth/login', {
      username,
      password,
    });
    localStorage.setItem('token', data.token);
    setUser({ username: data.username, userId: data.userId, email: data.email });
  };

  const register = async (username: string, email: string, password: string) => {
    const data = await api.post<{ token: string; username: string; userId: string; email: string }>('/auth/register', {
      username,
      email,
      password,
    });
    localStorage.setItem('token', data.token);
    setUser({ username: data.username, userId: data.userId, email: data.email });
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  // Auto-logout on 401/403 responses from any API call
  useEffect(() => {
    setUnauthorizedListener(() => {
      logout();
    });
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
