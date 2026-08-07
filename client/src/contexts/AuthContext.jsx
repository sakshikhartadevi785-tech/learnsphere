import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [basket, setBasket] = useState({ items: [], subtotal: 0, count: 0 });

  const refreshBasket = useCallback(async () => {
    const data = await api('/basket');
    setBasket(data.basket);
    return data.basket;
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const data = await api('/auth/session');
      setUser(data.user || null);
      await refreshBasket();
    } finally {
      setAuthLoading(false);
    }
  }, [refreshBasket]);

  useEffect(() => {
    refreshSession().catch(() => setAuthLoading(false));
  }, [refreshSession]);

  const login = async (credentials) => {
    const data = await api('/auth/login', { method: 'POST', body: credentials });
    setUser(data.user);
    await refreshBasket();
    return data;
  };

  const register = async (details) => {
    const data = await api('/auth/register', { method: 'POST', body: details });
    setUser(data.user);
    await refreshBasket();
    return data;
  };

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' });
    setUser(null);
    setBasket({ items: [], subtotal: 0, count: 0 });
  };

  const addToBasket = async (courseId, scheduleId = null) => {
    const data = await api('/basket/items', { method: 'POST', body: { courseId, scheduleId } });
    setBasket(data.basket);
    return data;
  };

  const updateBasketItem = async (courseId, scheduleId) => {
    const data = await api(`/basket/items/${courseId}`, { method: 'PATCH', body: { scheduleId } });
    setBasket(data.basket);
    return data;
  };

  const removeBasketItem = async (courseId) => {
    const data = await api(`/basket/items/${courseId}`, { method: 'DELETE' });
    setBasket(data.basket);
    return data;
  };

  const clearBasket = async () => {
    const data = await api('/basket', { method: 'DELETE' });
    setBasket(data.basket);
    return data;
  };

  const checkout = async () => {
    const data = await api('/enrollments/checkout', { method: 'POST' });
    setBasket({ items: [], subtotal: 0, count: 0 });
    return data;
  };

  const value = useMemo(() => ({
    user,
    authLoading,
    basket,
    login,
    register,
    logout,
    refreshSession,
    refreshBasket,
    addToBasket,
    updateBasketItem,
    removeBasketItem,
    clearBasket,
    checkout
  }), [user, authLoading, basket, refreshSession, refreshBasket]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
