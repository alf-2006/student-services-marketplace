import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import {
  firebaseConfigurationError,
  firebaseDb,
  isFirebaseConfigured,
} from '../../lib/firebase/firebase.js';

export function profileUnavailableError() {
  const error = new Error(firebaseConfigurationError || 'خدمة الملفات التعريفية غير متاحة حالياً.');
  error.code = 'firebase/unconfigured';
  return error;
}

function requireOwner(user) {
  if (!isFirebaseConfigured || !firebaseDb) throw profileUnavailableError();
  if (!user?.uid) {
    const error = new Error('يلزم تسجيل الدخول لإدارة الملف التعريفي.');
    error.code = 'auth/required';
    throw error;
  }
}

function profileReference(uid) {
  return doc(firebaseDb, 'profiles', uid);
}

export async function getUserProfile(userId) {
  if (!isFirebaseConfigured || !firebaseDb) throw profileUnavailableError();
  if (!userId || typeof userId !== 'string') {
    const error = new Error('معرّف الملف التعريفي غير صالح.');
    error.code = 'profile/invalid-id';
    throw error;
  }
  const snapshot = await getDoc(profileReference(userId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function saveUserProfile({ user, displayName, department }) {
  requireOwner(user);
  const normalizedName = String(displayName ?? '').trim();
  const normalizedEmail = String(user.email ?? '').trim();
  const normalizedDepartment = String(department ?? '').trim();
  if (normalizedName.length < 2 || normalizedName.length > 80) {
    const error = new Error('الاسم يجب أن يكون بين حرفين و80 حرفًا.');
    error.code = 'profile/invalid-name';
    throw error;
  }
  if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    const error = new Error('لا يوجد بريد إلكتروني صالح للحساب.');
    error.code = 'profile/invalid-email';
    throw error;
  }
  if (normalizedDepartment.length > 100) {
    const error = new Error('اسم الكلية أو القسم يجب ألا يتجاوز 100 حرف.');
    error.code = 'profile/invalid-department';
    throw error;
  }

  // الهوية والبريد يأتيان من جلسة Auth، لا من حقول قابلة للتغيير في النموذج.
  const reference = profileReference(user.uid);
  const snapshot = await getDoc(reference);
  const editableFields = { displayName: normalizedName, department: normalizedDepartment };
  if (snapshot.exists()) {
    // تاريخ الإنشاء والبريد وuid ثابتة؛ التعديل يرسل الحقول القابلة للتعديل فقط.
    await updateDoc(reference, editableFields);
    return { ...snapshot.data(), ...editableFields };
  }

  const profile = {
    uid: user.uid,
    email: normalizedEmail,
    ...editableFields,
    createdAt: serverTimestamp(),
  };
  await setDoc(reference, profile);
  return profile;
}

export async function updateOwnProfile({ user, displayName, department }) {
  return saveUserProfile({ user, displayName, department });
}
