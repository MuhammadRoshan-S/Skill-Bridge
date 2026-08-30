import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('skillbridge_access_token');
      const savedUser = localStorage.getItem('skillbridge_user');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Refresh in background
          const freshProfile = await authService.getProfile();
          setUser(freshProfile);
        } catch (err) {
          console.error('Failed to restore session:', err);
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const profile = await authService.login(username, password);
    setUser(profile);
    return profile;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    // Auto-login after registration
    return await login(userData.username, userData.password);
  };

  const demoLogin = async () => {
    return await login('demouser', 'demo12345');
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const freshProfile = await authService.getProfile();
      setUser(freshProfile);
      return freshProfile;
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    demoLogin,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
