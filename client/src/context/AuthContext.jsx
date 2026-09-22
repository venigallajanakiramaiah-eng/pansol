import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingPlantSlug, setPendingPlantSlug] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  // Called when a plant image/card is clicked anywhere in the app.
  const requestPlantAccess = useCallback(
    (slug) => {
      if (user) {
        navigate(`/plant/${slug}`);
      } else {
        setPendingPlantSlug(slug);
        setLoginModalOpen(true);
      }
    },
    [user, navigate]
  );

  const closeLoginModal = useCallback(() => {
    setLoginModalOpen(false);
    setPendingPlantSlug(null);
  }, []);

  const afterAuthSuccess = useCallback(
    (loggedInUser) => {
      setUser(loggedInUser);
      setLoginModalOpen(false);
      if (pendingPlantSlug) {
        navigate(`/plant/${pendingPlantSlug}`);
        setPendingPlantSlug(null);
      }
    },
    [pendingPlantSlug, navigate]
  );

  const login = useCallback(
    async (email, password) => {
      const data = await api.login({ email, password });
      afterAuthSuccess(data.user);
    },
    [afterAuthSuccess]
  );

  const signup = useCallback(
    async (name, email, password) => {
      const data = await api.signup({ name, email, password });
      afterAuthSuccess(data.user);
    },
    [afterAuthSuccess]
  );

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    navigate('/');
  }, [navigate]);

  const value = {
    user,
    authLoading,
    login,
    signup,
    logout,
    requestPlantAccess,
    loginModalOpen,
    openLoginModal: () => setLoginModalOpen(true),
    closeLoginModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
