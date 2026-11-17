import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ getDoc: vi.fn(), setDoc: vi.fn(), updateDoc: vi.fn(), timestamp: { sentinel: 'server-time' } }));
vi.mock('firebase/firestore', () => ({
  doc: (_db, collection, uid) => `${collection}/${uid}`,
  getDoc: mocks.getDoc, setDoc: mocks.setDoc, updateDoc: mocks.updateDoc,
  serverTimestamp: () => mocks.timestamp,
}));
vi.mock('../src/lib/firebase/firebase.js', () => ({ firebaseDb: {}, isFirebaseConfigured: true, firebaseConfigurationError: '' }));
import { saveUserProfile, updateOwnProfile } from '../src/features/profile/profileService.js';
const user = { uid: 'owner-1', email: 'actual@example.com' };

describe('خدمة الملف الشخصي', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('ينشئ ملفًا جديدًا بهوية وبريد جلسة Auth وتاريخ serverTimestamp', async () => {
    mocks.getDoc.mockResolvedValue({ exists: () => false });
    await saveUserProfile({ user, displayName: ' طالب ', email: 'forged@example.com', department: ' حاسبات ' });
    expect(mocks.setDoc).toHaveBeenCalledWith('profiles/owner-1', {
      uid: 'owner-1', email: 'actual@example.com', displayName: 'طالب', department: 'حاسبات', createdAt: mocks.timestamp,
    });
    expect(mocks.updateDoc).not.toHaveBeenCalled();
  });
  it('يحافظ على تاريخ الإنشاء والهوية والبريد في تعديل ملف موجود', async () => {
    const existing = { uid: 'owner-1', email: 'actual@example.com', displayName: 'طالب سابق', department: '', createdAt: 1234 };
    mocks.getDoc.mockResolvedValue({ exists: () => true, data: () => existing });
    const saved = await updateOwnProfile({ user, displayName: 'طالب جديد', department: 'هندسة' });
    expect(mocks.updateDoc).toHaveBeenCalledWith('profiles/owner-1', { displayName: 'طالب جديد', department: 'هندسة' });
    expect(saved.createdAt).toBe(1234);
    expect(mocks.setDoc).not.toHaveBeenCalled();
  });
  it('يرفض كلية طويلة أو بريد حساب غير صالح قبل الاتصال بقاعدة البيانات', async () => {
    await expect(updateOwnProfile({ user, displayName: 'طالب', department: 'أ'.repeat(101) })).rejects.toMatchObject({ code: 'profile/invalid-department' });
    await expect(saveUserProfile({ user: { uid: 'owner-1' }, displayName: 'طالب' })).rejects.toMatchObject({ code: 'profile/invalid-email' });
    expect(mocks.getDoc).not.toHaveBeenCalled();
  });
});
