import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../../services/auth.service.js';

const SESSION_HINT_KEY = 'evoq_has_session';

/**
 * Single reliable dashboard destination resolver based on user's account type.
 * GAMER -> /gamer/dashboard
 * ORGANIZER -> /organizer/dashboard
 */
export function getDashboardPath(user) {
  if (!user) return '/gamer/login';
  const role = (user.accountType || user.role || '').toUpperCase();
  return role === 'ORGANIZER' ? '/organizer/dashboard' : '/gamer/dashboard';
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => {
    // If the browser holds a session hint, initialize with loading=true while backend validates.
    // If not, visitor is unauthenticated, so initialize loading=false to avoid flashing.
    return typeof window !== 'undefined' && localStorage.getItem(SESSION_HINT_KEY) === 'true';
  });
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async (force = false) => {
    // Check if the browser holds a session hint.
    // If not, the visitor is a guest; skip the eager network call to prevent unwanted 401 console errors.
    const hasSessionHint = typeof window !== 'undefined' && localStorage.getItem(SESSION_HINT_KEY) === 'true';

    if (!hasSessionHint && !force) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await authService.me();
      setUser(data);
      localStorage.setItem(SESSION_HINT_KEY, 'true');
    } catch (err) {
      setUser(null);
      localStorage.removeItem(SESSION_HINT_KEY);
      // 401 is normal when visitor is unauthenticated or session has expired
      if (err.status !== 401) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Multi-tab session synchronization: react to login/logout events across tabs
    const handleStorageChange = (e) => {
      if (e.key === SESSION_HINT_KEY) {
        if (e.newValue === 'true') {
          checkAuth(true);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  const login = async (email, password) => {
    setError(null);
    const data = await authService.login(email, password);
    localStorage.setItem(SESSION_HINT_KEY, 'true');
    setUser(data.user);
    return data;
  };

  const loginGamer = async (email, password) => {
    setError(null);
    const data = await authService.loginGamer(email, password);
    localStorage.setItem(SESSION_HINT_KEY, 'true');
    setUser(data.user);
    return data;
  };

  const loginOrganizer = async (email, password) => {
    setError(null);
    const data = await authService.loginOrganizer(email, password);
    localStorage.setItem(SESSION_HINT_KEY, 'true');
    setUser(data.user);
    return data;
  };

  const register = async (email, username, password) => {
    setError(null);
    return await authService.register(email, username, password);
  };

  const registerGamer = async (data) => {
    setError(null);
    return await authService.registerGamer(data);
  };

  const registerOrganizer = async (data) => {
    setError(null);
    return await authService.registerOrganizer(data);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem(SESSION_HINT_KEY);
      setUser(null);
      setLoading(false);
    }
  };

  const logoutAll = async () => {
    try {
      await authService.logoutAll();
    } finally {
      localStorage.removeItem(SESSION_HINT_KEY);
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    accountType: user?.accountType || user?.role || 'GAMER',
    loading,
    error,
    isAuthenticated: !!user,
    dashboardPath: getDashboardPath(user),
    getDashboardPath,
    login,
    loginGamer,
    loginOrganizer,
    register,
    registerGamer,
    registerOrganizer,
    logout,
    logoutAll,
    refreshUser: (force = true) => checkAuth(force),
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
