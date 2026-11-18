import { useEffect, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getUserRequests, cancelServiceRequest } from '../services/requestsService.js';
import { isFirebaseConfigured } from '../firebase.js';
import '../styles/requests.css';

function readableRequestsError(error) {
  if (error?.code === 'firebase-not-configured') {
    return 'لم يتم إعداد Firebase بعد. لا يمكن تحميل الطلبات قبل إضافة إعدادات VITE_FIREBASE_*.';
  }
  if (error?.code === 'permission-denied') {
    return 'رفض Firebase قراءة الطلبات. يمكن للحساب قراءة طلباته التي يملكها فقط.';
  }
  return 'تعذر تحميل الطلبات بسبب مشكلة في الاتصال. حاول مجددًا لاحقًا.';
}

function RequestList({ userId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let ignoreResult = false;

    async function loadRequests() {
      setLoading(true);
      setError('');
      try {
        const result = await getUserRequests(userId);
        if (!ignoreResult) setRequests(result);
      } catch (loadError) {
        if (!ignoreResult) setError(readableRequestsError(loadError));
      } finally {
        if (!ignoreResult) setLoading(false);
      }
    }

    loadRequests();
    // لا نعرض نتيجة تحميل قديم بعد إغلاق القائمة أو إعادة تحميلها.
    return () => { ignoreResult = true; };
  }, [userId, reload]);

  function reloadRequests() {
    setReload(reload + 1);
  }

  async function cancelRequest(requestId) {
    if (cancellingId) return;
    setCancellingId(requestId);
    setError('');

    try {
      const result = await cancelServiceRequest({ requestId, userId });
      if (result?.status !== 'cancelled') throw new Error('لم يؤكد Firebase الإلغاء.');

      // نغيّر البطاقة فقط بعد نجاح الحفظ في Firebase.
      setRequests(function (currentRequests) {
        return currentRequests.map(function (request) {
          if (request.id === requestId) return { ...request, status: 'cancelled' };
          return request;
        });
      });
    } catch (cancelError) {
      if (cancelError?.code === 'permission-denied') {
        setError('لا يمكن إلغاء هذا الطلب؛ تحقق من ملكية الحساب وحالة الطلب.');
      } else {
        setError('تعذر إلغاء الطلب. لم نغيّر حالته محليًا، ويمكنك المحاولة مجددًا.');
      }
    } finally {
      setCancellingId('');
    }
  }

  return (
    <>
      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {error && !loading && (
        <Button type="button" onClick={reloadRequests} disabled={Boolean(cancellingId)}>
          إعادة تحميل الطلبات
        </Button>
      )}
      {loading && <LoadingState label="جارٍ تحميل طلباتك…" />}
      {!loading && !error && requests.length === 0 && (
        <EmptyState
          title="لا توجد طلبات بعد"
          description="عندما ترسل طلب خدمة محفوظًا فعليًا سيظهر هنا."
          actionLabel="تصفح الخدمات"
          actionTo="/services"
        />
      )}
      {!loading && requests.length > 0 && (
        <section className="request-list" aria-label="قائمة الطلبات">
          {requests.map((request) => (
            <article className="request-card card" key={request.id}>
              <div className="request-card__header">
                <div>
                  <p className="eyebrow">طلب محفوظ</p>
                  <h2>{request.serviceTitle}</h2>
                </div>
                <span className={`badge request-status request-status--${request.status}`}>
                  {request.status === 'cancelled' ? 'ملغى' : 'قيد المراجعة'}
                </span>
              </div>
              <dl className="request-card__details">
                <div><dt>التاريخ المفضل</dt><dd>{request.preferredDate}</dd></div>
                <div><dt>رقم الطلب</dt><dd>{request.id}</dd></div>
              </dl>
              {request.status === 'pending' && (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={Boolean(cancellingId)}
                  onClick={() => cancelRequest(request.id)}
                >
                  {cancellingId === request.id ? 'جارٍ الإلغاء…' : 'إلغاء الطلب'}
                </Button>
              )}
            </article>
          ))}
        </section>
      )}
    </>
  );
}

export default function MyRequestsPage() {
  const { user, loading, isConfigured } = useAuth();
  const configured = isConfigured !== false && isFirebaseConfigured;

  return (
    <main className="page-section container requests-page">
      <header className="page-header">
        <p className="eyebrow">مساحتي</p>
        <h1>طلباتي</h1>
        <p className="muted">هذه القائمة تقرأ طلبات حسابك فقط من Firestore.</p>
      </header>
      {loading && <LoadingState label="نتحقق من حسابك…" />}
      {!loading && !user && (
        <section className="notice notice-error" role="alert">
          <h2>سجّل الدخول لرؤية طلباتك</h2>
          <p>
            {configured
              ? 'لا يمكن عرض طلبات حساب غير مسجل.'
              : 'إعداد Firebase غير مكتمل؛ لن نعرض بيانات وهمية أو نعدك بنتيجة غير حقيقية.'}
          </p>
          <Button to="/login?redirect=%2Fmy-requests">تسجيل الدخول</Button>
        </section>
      )}
      {!loading && user && !configured && (
        <section className="notice notice-error" role="alert">
          <h2>Firebase غير مُعد</h2>
          <p>أضف إعدادات VITE_FIREBASE_* حتى يمكن تحميل طلباتك من Firestore. لا توجد بيانات تجريبية في هذه الصفحة.</p>
        </section>
      )}
      {!loading && user && configured && (
        // تغيير key ينشئ قائمة جديدة فارغة فورًا عند تغيير الحساب.
        <RequestList key={user.uid} userId={user.uid} />
      )}
    </main>
  );
}
