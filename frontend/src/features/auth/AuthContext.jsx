import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../../services/auth.service.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.me();
      setUser(data);
    } catch (err) {
      setUser(null);
      // 401 is normal when visitor is not logged in
      if (err.status !== 401) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setError(null);
    const data = await authService.login(email, password);
    // After login, refresh or set user
    setUser(data.user);
    return data;
  };

  const register = async (email, username, password) => {
    setError(null);
    return await authService.register(email, username, password);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const logoutAll = async () => {
    try {
      await authService.logoutAll();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    logoutAll,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

