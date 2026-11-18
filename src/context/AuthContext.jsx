import { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseConfigurationError, isFirebaseConfigured } from '../firebase.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import { createAuthError, loginWithEmail, logoutCurrentUser, registerWithEmail } from '../services/authService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState(isFirebaseConfigured ? null : firebaseConfigurationError);

  // Firebase يخبرنا بالحساب الحالي عند فتح الصفحة أو تسجيل الخروج.
  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      function (currentUser) {
        setUser(currentUser);
        setAuthError(null);
        setLoading(false);
      },
      function () {
        setUser(null);
        setAuthError('تعذر التحقق من جلسة الحساب. حاول تحديث الصفحة أو راجع إعداد Firebase.');
        setLoading(false);
      },
    );
    // نوقف الاستماع عندما يُغلق هذا المكون.
    return unsubscribe;
  }, []);

  async function login({ email, password }) {
    if (!validateEmail(email) || !validatePassword(password)) {
      const error = createAuthError('تحقق من البريد الإلكتروني وكلمة المرور قبل المتابعة.', 'validation/invalid');
      setAuthError(error.message);
      throw error;
    }
    setAuthError(null);
    try {
      const result = await loginWithEmail({ email, password });
      return result.user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }

  async function register({ name, email, password, department }) {
    if (!String(name || '').trim() || !validateEmail(email) || !validatePassword(password)) {
      const error = createAuthError('تحقق من الاسم والبريد الإلكتروني وكلمة المرور قبل المتابعة.', 'validation/invalid');
      setAuthError(error.message);
      throw error;
    }
    setAuthError(null);
    try {
      const result = await registerWithEmail({ name, email, password, department });
      return result.user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }

  async function logout() {
    setAuthError(null);
    try {
      await logoutCurrentUser();
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }

  // الصفحات تشارك حالة الحساب بدل إنشاء اتصال جديد في كل صفحة.
  const account = { user, loading, authError, login, register, logout, isConfigured: isFirebaseConfigured };
  return <AuthContext.Provider value={account}>{children}</AuthContext.Provider>;
}
