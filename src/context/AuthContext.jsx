import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('unfiltered_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('unfiltered_token'));

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('unfiltered_user');
    localStorage.removeItem('unfiltered_token');
  };

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          // Token is invalid/expired (e.g. server restart in dev)
          logout();
        }
      } catch (err) {
        // Ignore network errors to avoid logging out when offline
      }
    };
    verifyToken();
  }, [token]);

  const login = async (email, college = '', password = '', username = '', mode = 'register') => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, college, password, username, mode }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('unfiltered_user', JSON.stringify(data.user));
        localStorage.setItem('unfiltered_token', data.token);
        return { success: true, user: data.user, recoveryKey: data.recoveryKey };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Connection failed' };
    }
  };

  const requestResetCode = async (email) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Connection failed' };
    }
  };

  const resetPassword = async (email, recoveryKey, code, newPassword) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, recoveryKey, code, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Connection failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, requestResetCode, resetPassword, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
