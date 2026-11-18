import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { firebaseDb, isFirebaseConfigured } from '../firebase.js';

export const REQUESTS_COLLECTION = 'requests';

function configurationError() {
  const error = new Error('لم يتم إعداد Firebase بعد. أضف متغيرات VITE_FIREBASE_* قبل حفظ الطلبات.');
  error.code = 'firebase-not-configured';
  return error;
}

function requireDatabase() {
  if (!isFirebaseConfigured || !firebaseDb) throw configurationError();
  return firebaseDb;
}

function requireUserId(userId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    const error = new Error('يلزم تسجيل الدخول لتنفيذ هذا الإجراء.');
    error.code = 'auth-required';
    throw error;
  }
  return userId.trim();
}

function requestData({ user, service, form = {} }) {
  const userId = requireUserId(user?.uid);
  if (!service || typeof service.id !== 'string' || typeof service.title !== 'string') {
    const error = new Error('الخدمة المطلوبة غير موجودة.');
    error.code = 'service-not-found';
    throw error;
  }
  return {
    userId,
    serviceId: service.id,
    serviceTitle: service.title.trim(),
    name: String(form.name ?? '').trim(),
    email: String(form.email ?? '').trim(),
    contact: String(form.contact ?? '').trim(),
    details: String(form.details ?? '').trim(),
    preferredDate: String(form.preferredDate ?? '').trim(),
    status: 'pending',
    createdAt: serverTimestamp(),
  };
}

export async function createServiceRequest({ user, service, form }) {
  requireUserId(user?.uid);
  const db = requireDatabase();
  const reference = await addDoc(collection(db, REQUESTS_COLLECTION), requestData({ user, service, form }));
  return { id: reference.id };
}

function timestampValue(value) {
  if (!value) return Number.POSITIVE_INFINITY;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.seconds === 'number') return value.seconds * 1000 + (value.nanoseconds || 0) / 1e6;
  if (value instanceof Date) return value.getTime();
  return Number.POSITIVE_INFINITY;
}

export async function getUserRequests(userId) {
  const ownerId = requireUserId(userId);
  const db = requireDatabase();
  const requestQuery = query(collection(db, REQUESTS_COLLECTION), where('userId', '==', ownerId));
  const snapshot = await getDocs(requestQuery);
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((first, second) => timestampValue(second.createdAt) - timestampValue(first.createdAt));
}

export async function cancelServiceRequest({ requestId, userId }) {
  const ownerId = requireUserId(userId);
  const db = requireDatabase();
  if (typeof requestId !== 'string' || !requestId.trim()) {
    const error = new Error('معرّف الطلب غير صالح.');
    error.code = 'invalid-request-id';
    throw error;
  }

  // لا نرسل userId في التحديث؛ القواعد تتحقق من ملكية الوثيقة وتسمح فقط بإلغاء pending.
  await updateDoc(doc(db, REQUESTS_COLLECTION, requestId.trim()), { status: 'cancelled' });
  return { id: requestId.trim(), userId: ownerId, status: 'cancelled' };
}
