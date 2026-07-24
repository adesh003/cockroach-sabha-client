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

  const login = async (email, college = '', password = '', username = '') => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, college, password, username }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('unfiltered_user', JSON.stringify(data.user));
        localStorage.setItem('unfiltered_token', data.token);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Connection failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
