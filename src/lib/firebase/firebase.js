import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const requiredEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const environment = import.meta.env ?? {};
const firebaseConfig = {
  apiKey: environment.VITE_FIREBASE_API_KEY ?? '',
  authDomain: environment.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: environment.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: environment.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: environment.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: environment.VITE_FIREBASE_APP_ID ?? '',
};

const missingKeys = requiredEnvKeys.filter((key) => !String(environment[key] ?? '').trim());
export const isFirebaseConfigured = missingKeys.length === 0;
export const firebaseMode = isFirebaseConfigured ? 'configured' : 'unconfigured';
export const firebaseConfigurationError = isFirebaseConfigured
  ? ''
  : `الاتصال بخدمات الحساب غير متاح حالياً. يلزم ضبط متغيرات Firebase التالية: ${missingKeys.join('، ')}.`;

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  // getApps يمنع إنشاء تطبيق ثانٍ أثناء إعادة التحميل أو الاختبارات.
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export const firebaseApp = app;
export const firebaseAuth = auth;
export const firebaseDb = db;
