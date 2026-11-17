import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseConfigurationError, isFirebaseConfigured } from '../../../lib/firebase/firebase.js';
import { validateEmail, validatePassword } from '../../../utils/validators.js';
import {
  createAuthError,
  loginWithEmail,
  logoutCurrentUser,
  registerWithEmail,
} from '../authService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState(isFirebaseConfigured ? null : firebaseConfigurationError);

  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      setUser(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (nextUser) => {
        setUser(nextUser ?? null);
        setAuthError(null);
        setLoading(false);
      },
      () => {
        setUser(null);
        setAuthError('تعذر التحقق من جلسة الحساب. حاول تحديث الصفحة أو راجع إعداد Firebase.');
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    if (!validateEmail(email) || !validatePassword(password)) {
      const error = createAuthError('تحقق من البريد الإلكتروني وكلمة المرور قبل المتابعة.', 'validation/invalid');
      setAuthError(error.message);
      throw error;
    }
    setAuthError(null);
    try {
      const credential = await loginWithEmail({ email, password });
      return credential.user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const register = useCallback(async ({ name, email, password, department }) => {
    if (!String(name ?? '').trim() || !validateEmail(email) || !validatePassword(password)) {
      const error = createAuthError('تحقق من الاسم والبريد الإلكتروني وكلمة المرور قبل المتابعة.', 'validation/invalid');
      setAuthError(error.message);
      throw error;
    }
    setAuthError(null);
    try {
      const credential = await registerWithEmail({ name, email, password, department });
      return credential.user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthError(null);
    try {
      await logoutCurrentUser();
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    authError,
    login,
    register,
    logout,
    isConfigured: isFirebaseConfigured,
  }), [user, loading, authError, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
