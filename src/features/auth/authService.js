import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { firebaseAuth, firebaseConfigurationError, isFirebaseConfigured } from '../../lib/firebase/firebase.js';
import { saveUserProfile } from '../profile/profileService.js';

const fallbackRedirect = '/';

export function getSafeRedirect(candidate, fallback = fallbackRedirect) {
  const safeFallback = typeof fallback === 'string' && fallback.startsWith('/') && !fallback.startsWith('//')
    ? fallback
    : fallbackRedirect;
  if (typeof candidate !== 'string' || !candidate.trim()) return safeFallback;

  const value = candidate.trim();
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return safeFallback;
  try {
    const parsed = new URL(value, 'https://studenthub.invalid');
    if (parsed.origin !== 'https://studenthub.invalid') return safeFallback;
    const decodedPath = decodeURIComponent(parsed.pathname);
    if (decodedPath.startsWith('//') || decodedPath.includes('\\')) return safeFallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return safeFallback;
  }
}

export function mapAuthError(error) {
  const code = error?.code ?? '';
  const messages = {
    'auth/invalid-email': 'اكتب بريدًا إلكترونيًا صحيحًا.',
    'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'auth/user-not-found': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'auth/wrong-password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'auth/email-already-in-use': 'يوجد حساب بهذا البريد الإلكتروني بالفعل. جرّب تسجيل الدخول.',
    'auth/weak-password': 'كلمة المرور ضعيفة. استخدم 8 أحرف أو أكثر.',
    'auth/too-many-requests': 'توقفت المحاولات مؤقتًا لكثرة الطلبات. حاول لاحقًا.',
    'auth/network-request-failed': 'تعذر الاتصال بخدمة الحساب. تحقق من الشبكة وحاول مجددًا.',
    'auth/operation-not-allowed': 'تسجيل الدخول بالبريد وكلمة المرور غير مفعّل في إعدادات Firebase.',
    'auth/user-disabled': 'هذا الحساب موقوف. تواصل مع مسؤول المنصة.',
  };
  return messages[code] ?? 'تعذر إتمام العملية الآن. حاول مرة أخرى أو راجع إعداد Firebase.';
}

export function createAuthError(message, code = 'auth/unknown', options = {}) {
  const error = new Error(message);
  error.name = 'StudentHubAuthError';
  error.code = code;
  if (options.partial) error.partial = true;
  if (options.cause) error.cause = options.cause;
  return error;
}

function assertConfigured() {
  if (!isFirebaseConfigured || !firebaseAuth) {
    throw createAuthError(firebaseConfigurationError, 'firebase/unconfigured');
  }
}

export async function loginWithEmail({ email, password }) {
  assertConfigured();
  try {
    return await signInWithEmailAndPassword(firebaseAuth, String(email).trim(), password);
  } catch (error) {
    throw createAuthError(mapAuthError(error), error?.code ?? 'auth/unknown', { cause: error });
  }
}

export async function registerWithEmail({ name, email, password, department }) {
  assertConfigured();
  let credential;
  try {
    credential = await createUserWithEmailAndPassword(firebaseAuth, String(email).trim(), password);
  } catch (error) {
    throw createAuthError(mapAuthError(error), error?.code ?? 'auth/unknown', { cause: error });
  }

  let displayNameUpdated = true;
  try {
    await updateProfile(credential.user, { displayName: String(name).trim() });
  } catch {
    displayNameUpdated = false;
  }

  try {
    await saveUserProfile({
      user: credential.user,
      displayName: String(name).trim(),
      email: credential.user.email ?? String(email).trim(),
      department: String(department ?? '').trim(),
    });
  } catch (error) {
    throw createAuthError(
      'تم إنشاء الحساب، لكن تعذر حفظ ملفك التعريفي. الحساب موجود ويمكنك محاولة تسجيل الدخول لاحقًا أو إعادة المحاولة.',
      'profile/save-failed',
      { partial: true, cause: error },
    );
  }

  if (!displayNameUpdated) {
    throw createAuthError(
      'تم إنشاء الحساب وحفظ الملف، لكن تعذر تحديث اسم العرض في خدمة الحساب. يمكنك متابعة الدخول وتعديل الملف لاحقًا.',
      'auth/profile-update-failed',
      { partial: true },
    );
  }

  return credential;
}

export async function logoutCurrentUser() {
  assertConfigured();
  try {
    await signOut(firebaseAuth);
  } catch (error) {
    throw createAuthError(mapAuthError(error), error?.code ?? 'auth/unknown', { cause: error });
  }
}
