import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import fs from 'node:fs';
import path from 'node:path';

const enabled = process.env.RUN_FIREBASE_RULES_TESTS === '1' && Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const suite = enabled ? describe : describe.skip;
let testEnv;
const validRequest = (userId) => ({
  userId, serviceId: 'service-1', serviceTitle: 'شرح مقرر', name: 'طالب جامعي',
  email: 'student@example.com', contact: 'student@example.com',
  details: 'أحتاج إلى شرح مفصل مع أمثلة عملية للمقرر.', preferredDate: '2999-12-31',
  status: 'pending', createdAt: serverTimestamp(),
});
const validProfile = (uid) => ({ uid, displayName: 'طالب جامعي', email: 'student@example.com', department: 'الحاسبات', createdAt: serverTimestamp() });
const ownerContext = () => testEnv.authenticatedContext('user-1', { email: 'student@example.com' }).firestore();

suite('قواعد Firestore: الطلبات والملفات الشخصية', () => {
  beforeAll(async () => {
    const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-student-marketplace',
      firestore: { host, port: Number(port), rules: fs.readFileSync(path.resolve('firestore.rules'), 'utf8') },
    });
  });
  beforeEach(async () => { await testEnv.clearFirestore(); });
  afterAll(async () => { await testEnv?.cleanup(); });

  it('يرفض إنشاء الطلب من مستخدم غير مسجل', async () => {
    await assertFails(setDoc(doc(testEnv.unauthenticatedContext().firestore(), 'requests/unauthenticated'), validRequest('user-1')));
  });
  it('يسمح للمالك بإنشاء وقراءة طلب صالح', async () => {
    const db = ownerContext();
    await assertSucceeds(setDoc(doc(db, 'requests/own'), validRequest('user-1')));
    await assertSucceeds(getDoc(doc(db, 'requests/own')));
  });
  it('يرفض هوية مختلفة والحقول الإضافية وبيانات نموذج غير صالحة', async () => {
    const db = ownerContext();
    await assertFails(setDoc(doc(db, 'requests/cross-owner'), validRequest('user-2')));
    await assertFails(setDoc(doc(db, 'requests/extra-field'), { ...validRequest('user-1'), consent: true }));
    await assertFails(setDoc(doc(db, 'requests/short-details'), { ...validRequest('user-1'), details: 'قصير' }));
  });
  it('يمنع قراءة طلب مالك آخر فعليًا عبر getDoc', async () => {
    await assertSucceeds(setDoc(doc(ownerContext(), 'requests/private'), validRequest('user-1')));
    const otherDb = testEnv.authenticatedContext('user-2').firestore();
    await assertFails(getDoc(doc(otherDb, 'requests/private')));
    await assertFails(getDoc(doc(testEnv.unauthenticatedContext().firestore(), 'requests/private')));
  });
  it('يسمح باستعلام المالك ويرفض قائمة غير مقيّدة بالمالك', async () => {
    const db = ownerContext();
    await assertSucceeds(setDoc(doc(db, 'requests/own'), validRequest('user-1')));
    await assertSucceeds(getDocs(query(collection(db, 'requests'), where('userId', '==', 'user-1'))));
    await assertFails(getDocs(collection(db, 'requests')));
  });
  it('يسمح بالإلغاء فقط ويرفض تعديل بيانات الطلب أو حذفها أو إعادة تفعيله', async () => {
    const db = ownerContext();
    const ref = doc(db, 'requests/cancellable');
    await assertSucceeds(setDoc(ref, validRequest('user-1')));
    await assertFails(updateDoc(ref, { details: 'تعديل غير مسموح به على الطلب المحفوظ.' }));
    await assertSucceeds(updateDoc(ref, { status: 'cancelled' }));
    await assertFails(updateDoc(ref, { status: 'pending' }));
    await assertFails(deleteDoc(ref));
  });
  it('يسمح بإنشاء الملف الشخصي وقراءته وتعديل حقوله القابلة للتعديل', async () => {
    const ref = doc(ownerContext(), 'profiles/user-1');
    await assertSucceeds(setDoc(ref, validProfile('user-1')));
    await assertSucceeds(getDoc(ref));
    await assertSucceeds(updateDoc(ref, { displayName: 'الاسم الجديد', department: 'هندسة' }));
  });
  it('يرفض أنواع وأطوال الملف الشخصي غير الصالحة والحقول الزائدة والبريد غير المطابق للحساب', async () => {
    const ref = doc(ownerContext(), 'profiles/user-1');
    for (const changes of [{ displayName: 42 }, { displayName: 'أ' }, { displayName: 'أ'.repeat(81) }, { department: {} }, { department: 'أ'.repeat(101) }, { email: 'different@example.com' }, { isAdmin: true }]) {
      await assertFails(setDoc(ref, { ...validProfile('user-1'), ...changes }));
    }
  });
  it('يمنع تعديل uid والبريد وتاريخ إنشاء الملف الشخصي أو حذفه', async () => {
    const ref = doc(ownerContext(), 'profiles/user-1');
    await assertSucceeds(setDoc(ref, validProfile('user-1')));
    await assertFails(updateDoc(ref, { uid: 'user-2' }));
    await assertFails(updateDoc(ref, { email: 'other@example.com' }));
    await assertFails(updateDoc(ref, { createdAt: Timestamp.fromMillis(0) }));
    await assertFails(deleteDoc(ref));
  });
  it('يمنع القراءة والكتابة في ملف طالب آخر وفي مجموعات غير معلنة', async () => {
    await assertSucceeds(setDoc(doc(ownerContext(), 'profiles/user-1'), validProfile('user-1')));
    const db = testEnv.authenticatedContext('user-2', { email: 'student@example.com' }).firestore();
    await assertFails(getDoc(doc(db, 'profiles/user-1')));
    await assertFails(setDoc(doc(db, 'profiles/user-1'), validProfile('user-2')));
    await assertFails(setDoc(doc(db, 'admin/settings'), { enabled: true }));
  });
});
