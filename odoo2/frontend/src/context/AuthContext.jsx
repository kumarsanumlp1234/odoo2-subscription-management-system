import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const stored = authService.getStoredUser();
      if (stored) {
        setUser(stored);
        // Refresh profile in background
        try {
          const profile = await authService.getCurrentUser();
          setUser((prev) => ({ ...prev, ...profile }));
        } catch (e) {
          console.warn('Could not refresh session token:', e.message);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    setUser(res);
    return res;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    setUser(res);
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const roles = user?.roles || [];
  const isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ADMIN');
  const isStaff = roles.includes('ROLE_STAFF') || roles.includes('STAFF');
  const isCustomer = roles.includes('ROLE_CUSTOMER') || roles.includes('CUSTOMER');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        roles,
        isAdmin,
        isStaff,
        isCustomer,
        login,
        register,
        logout,
      }}
    >
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
