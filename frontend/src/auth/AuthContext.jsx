import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearToken, setToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    api.me()
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({
    user,
    ready,
    async login(credentials) {
      const data = await api.login(credentials);
      setToken(data.token);
      setUser(data.user);
    },
    async register(payload) {
      const data = await api.register(payload);
      setToken(data.token);
      setUser(data.user);
    },
    logout() {
      clearToken();
      setUser(null);
    },
  }), [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth hors AuthProvider');
  return context;
}
