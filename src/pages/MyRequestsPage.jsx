import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { getUserRequests, cancelServiceRequest } from '../features/requests/requestsService.js';
import { isFirebaseConfigured } from '../lib/firebase/firebase.js';
import '../styles/requests.css';

function readableRequestsError(error) {
  if (error?.code === 'firebase-not-configured') return 'لم يتم إعداد Firebase بعد. لا يمكن تحميل الطلبات قبل إضافة إعدادات VITE_FIREBASE_*.';
  if (error?.code === 'permission-denied') return 'رفض Firebase قراءة الطلبات. يمكن للحساب قراءة طلباته التي يملكها فقط.';
  return 'تعذر تحميل الطلبات بسبب مشكلة في الاتصال. حاول مجددًا لاحقًا.';
}

function statusLabel(status) {
  return status === 'cancelled' ? 'ملغى' : 'قيد المراجعة';
}

export default function MyRequestsPage() {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const uid = user?.uid ?? null;
  const [requests, setRequests] = useState([]);
  const [requestsOwner, setRequestsOwner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState('');
  const configured = isConfigured !== false && isFirebaseConfigured;
  const currentUid = useRef(uid);
  const generation = useRef(0);
  const mounted = useRef(false);
  currentUid.current = uid;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; generation.current += 1; };
  }, []);

  const loadRequests = useCallback(async () => {
    if (!uid || !configured || !mounted.current) return;
    const token = ++generation.current;
    const isCurrent = () => mounted.current && currentUid.current === uid && generation.current === token;
    setRequestsOwner(uid);
    setLoading(true);
    setError('');
    try {
      const result = await getUserRequests(uid);
      if (isCurrent()) setRequests(result);
    } catch (loadError) {
      if (isCurrent()) setError(readableRequestsError(loadError));
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [configured, uid]);

  useEffect(() => {
    setRequests([]);
    setRequestsOwner(uid);
    setError('');
    setCancellingId('');
    setLoading(false);
    if (uid && configured && !authLoading) loadRequests();
    return () => { generation.current += 1; };
  }, [authLoading, configured, loadRequests, uid]);

  const cancel = async (requestId) => {
    if (!uid || cancellingId || requestsOwner !== uid) return;
    const token = generation.current;
    const isCurrent = () => mounted.current && currentUid.current === uid && generation.current === token;
    setCancellingId(requestId);
    setError('');
    try {
      const result = await cancelServiceRequest({ requestId, userId: uid });
      if (result?.status !== 'cancelled') throw new Error('لم يؤكد Firebase الإلغاء.');
      if (isCurrent()) setRequests((current) => current.map((item) => item.id === requestId ? { ...item, status: 'cancelled' } : item));
    } catch (cancelError) {
      if (isCurrent()) setError(cancelError?.code === 'permission-denied'
        ? 'لا يمكن إلغاء هذا الطلب؛ تحقق من ملكية الحساب وحالة الطلب.'
        : 'تعذر إلغاء الطلب. لم نغيّر حالته محليًا، ويمكنك المحاولة مجددًا.');
    } finally {
      if (isCurrent()) setCancellingId('');
    }
  };

  // إخفاء بيانات المالك القديم يحدث في render نفسه، قبل تشغيل effect للحساب الجديد.
  const ownsState = Boolean(uid) && requestsOwner === uid;
  const visibleRequests = ownsState ? requests : [];
  const visibleError = ownsState ? error : '';
  const ready = !authLoading && user && configured;
  const visibleLoading = ready && (!ownsState || loading);

  return (
    <main className="page-section container requests-page">
      <header className="page-header">
        <p className="eyebrow">مساحتي</p>
        <h1>طلباتي</h1>
        <p className="muted">هذه القائمة تقرأ طلبات حسابك فقط من Firestore.</p>
      </header>
      {authLoading && <LoadingState label="نتحقق من حسابك…" />}
      {!authLoading && !user && (
        <section className="notice notice-error" role="alert">
          <h2>سجّل الدخول لرؤية طلباتك</h2>
          <p>{configured ? 'لا يمكن عرض طلبات حساب غير مسجل.' : 'إعداد Firebase غير مكتمل؛ لن نعرض بيانات وهمية أو نعدك بنتيجة غير حقيقية.'}</p>
          <Button to="/login?redirect=%2Fmy-requests">تسجيل الدخول</Button>
        </section>
      )}
      {!authLoading && user && !configured && (
        <section className="notice notice-error" role="alert">
          <h2>Firebase غير مُعد</h2>
          <p>أضف إعدادات VITE_FIREBASE_* حتى يمكن تحميل طلباتك من Firestore. لا توجد بيانات تجريبية في هذه الصفحة.</p>
        </section>
      )}
      {ready && visibleError && <p className="notice notice-error" role="alert">{visibleError}</p>}
      {ready && visibleError && !visibleLoading && <Button type="button" onClick={loadRequests}>إعادة تحميل الطلبات</Button>}
      {visibleLoading && <LoadingState label="جارٍ تحميل طلباتك…" />}
      {ready && !visibleLoading && !visibleError && visibleRequests.length === 0 && (
        <EmptyState title="لا توجد طلبات بعد" description="عندما ترسل طلب خدمة محفوظًا فعليًا سيظهر هنا." actionLabel="تصفح الخدمات" actionTo="/services" />
      )}
      {ready && !visibleLoading && visibleRequests.length > 0 && (
        <section className="request-list" aria-label="قائمة الطلبات">
          {visibleRequests.map((request) => (
            <article className="request-card card" key={request.id}>
              <div className="request-card__header">
                <div><p className="eyebrow">طلب محفوظ</p><h2>{request.serviceTitle}</h2></div>
                <span className={`badge request-status request-status--${request.status}`}>{statusLabel(request.status)}</span>
              </div>
              <dl className="request-card__details">
                <div><dt>التاريخ المفضل</dt><dd>{request.preferredDate}</dd></div>
                <div><dt>رقم الطلب</dt><dd>{request.id}</dd></div>
              </dl>
              {request.status === 'pending' && (
                <Button type="button" variant="secondary" disabled={Boolean(cancellingId)} onClick={() => cancel(request.id)}>
                  {cancellingId === request.id ? 'جارٍ الإلغاء…' : 'إلغاء الطلب'}
                </Button>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
