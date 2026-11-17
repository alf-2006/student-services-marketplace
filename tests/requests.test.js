import { beforeEach, describe, expect, it, vi } from 'vitest';

const addDoc = vi.fn();
const collection = vi.fn((db, name) => ({ db, name }));
const doc = vi.fn((db, collectionName, id) => ({ db, collectionName, id }));
const getDocs = vi.fn();
const query = vi.fn((...args) => args);
const serverTimestamp = vi.fn(() => ({ __serverTimestamp: true }));
const updateDoc = vi.fn();
const where = vi.fn((...args) => args);

vi.mock('firebase/firestore', () => ({
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
}));

vi.mock('../src/lib/firebase/firebase.js', () => ({
  firebaseDb: { name: 'test-db' },
  isFirebaseConfigured: true,
}));

const { cancelServiceRequest, createServiceRequest, getUserRequests } = await import('../src/features/requests/requestsService.js');

describe('requestsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addDoc.mockResolvedValue({ id: 'request-1' });
    updateDoc.mockResolvedValue(undefined);
  });

  it('ينشئ طلبًا بالحقول المعتمدة ويعيد المعرّف الحقيقي', async () => {
    const result = await createServiceRequest({
      user: { uid: 'user-1' },
      service: { id: 'service-1', title: 'شرح مقرر' },
      form: {
        name: 'طالب جامعي',
        email: 'student@example.com',
        contact: 'student@example.com',
        details: 'أحتاج إلى شرح مفصل مع أمثلة عملية للمقرر.',
        preferredDate: '2999-12-31',
        consent: true,
      },
    });
    expect(result).toEqual({ id: 'request-1' });
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ userId: 'user-1', serviceId: 'service-1', status: 'pending' }),
    );
    expect(addDoc.mock.calls[0][1]).not.toHaveProperty('consent');
  });

  it('يستعلم بالمالك ثم يرتب النتائج على العميل', async () => {
    getDocs.mockResolvedValue({
      docs: [
        { id: 'old', data: () => ({ userId: 'user-1', createdAt: { toMillis: () => 1 } }) },
        { id: 'new', data: () => ({ userId: 'user-1', createdAt: { toMillis: () => 2 } }) },
      ],
    });
    const result = await getUserRequests('user-1');
    expect(where).toHaveBeenCalledWith('userId', '==', 'user-1');
    expect(result.map((item) => item.id)).toEqual(['new', 'old']);
  });

  it('يحدّث الحالة فقط عند الإلغاء ولا يحذف الوثيقة', async () => {
    const result = await cancelServiceRequest({ requestId: 'request-1', userId: 'user-1' });
    expect(result).toMatchObject({ id: 'request-1', status: 'cancelled' });
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { status: 'cancelled' });
  });

  it('يرفض العملية المحمية دون uid', async () => {
    await expect(getUserRequests('')).rejects.toMatchObject({ code: 'auth-required' });
    expect(getDocs).not.toHaveBeenCalled();
  });
});
