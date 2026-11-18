import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import FormField from '../components/ui/FormField.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getServiceById } from '../data/services.js';
import { isFirebaseConfigured } from '../firebase.js';
import { createServiceRequest } from '../services/requestsService.js';
import { todayDateOnly, validateRequest } from '../utils/validators.js';
import '../styles/requests.css';

function readableRequestError(error) {
  if (error?.code === 'firebase-not-configured') {
    return 'لم يتم إعداد Firebase بعد. لا يمكن حفظ الطلب قبل إضافة إعدادات VITE_FIREBASE_*.';
  }
  if (error?.code === 'permission-denied') {
    return 'لا يملك الحساب صلاحية حفظ هذا الطلب. سجّل الدخول بالحساب الصحيح وحاول مجددًا.';
  }
  return 'تعذر حفظ الطلب بسبب مشكلة في الاتصال. لم يتم تسجيل طلب ناجح، ويمكنك المحاولة مجددًا.';
}

export default function ServiceRequestPage() {
  const { serviceId } = useParams();
  const { user, loading: authLoading, isConfigured } = useAuth();
  const service = getServiceById(serviceId);
  const configured = isConfigured !== false && isFirebaseConfigured;
  const [form, setForm] = useState({
    name: '',
    email: '',
    contact: '',
    details: '',
    preferredDate: '',
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // نملأ الاسم والبريد من الحساب، مع السماح بتعديل بيانات التواصل في الطلب.
  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      name: current.name || user.displayName || '',
      email: current.email || user.email || '',
    }));
  }, [user]);

  function updateField(event) {
    const { name, type, value, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setForm((current) => ({ ...current, [name]: fieldValue }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    setSuccess('');
    setFormError('');

    // نفحص المدخلات أولًا، ثم الحساب، ثم نحاول الحفظ.
    const nextErrors = validateRequest(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormError('راجع الحقول المميزة بالأخطاء ثم أرسل النموذج مجددًا.');
      const formElement = event.currentTarget;
      requestAnimationFrame(() => formElement.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    if (!user) {
      setFormError('يجب تسجيل الدخول بحساب حقيقي قبل إرسال طلب الخدمة.');
      return;
    }
    if (!configured) {
      setFormError('لم يتم إعداد Firebase بعد. لن نعلن نجاحًا قبل تفعيل الاتصال الحقيقي.');
      return;
    }

    setSaving(true);
    try {
      const result = await createServiceRequest({ user, service, form });
      if (!result?.id) throw new Error('لم يُرجع Firebase معرّف الطلب.');
      setSuccess(`تم حفظ طلبك بنجاح برقم ${result.id}.`);
    } catch (error) {
      setFormError(readableRequestError(error));
    } finally {
      setSaving(false);
    }
  }

  if (!service) {
    return (
      <main className="page-section container request-page">
        <EmptyState
          title="الخدمة غير موجودة"
          description="لا نملك خدمة بهذا المعرّف. عُد إلى قائمة الخدمات لاختيار خدمة متاحة."
          actionLabel="تصفح الخدمات"
          actionTo="/services"
        />
      </main>
    );
  }

  const loginPath = '/login?redirect=' + encodeURIComponent('/request/' + service.id);

  return (
    <main className="page-section container request-page">
      <header className="page-header">
        <p className="eyebrow">طلب خدمة</p>
        <h1>أرسل تفاصيل طلبك</h1>
        <p className="muted">املأ البيانات بوضوح، وسيراجع مقدم الخدمة طلبك عبر وسيلة التواصل التي تكتبها.</p>
      </header>

      <section className="request-summary card" aria-labelledby="request-service-title">
        <p className="eyebrow">الخدمة المختارة</p>
        <h2 id="request-service-title">{service.title}</h2>
        <p>{service.description}</p>
        <p className="request-summary__price">
          <strong>{service.price} جنيه</strong> <span className="muted">{service.unit}</span>
        </p>
      </section>

      {authLoading && <p className="notice" aria-live="polite">نتحقق من حالة تسجيل الدخول…</p>}
      {!authLoading && !user && (
        <section className="notice notice-error" role="alert">
          <h2>يلزم تسجيل الدخول</h2>
          <p>لا نستخدم دخولًا وهميًا ولا نحفظ كلمات المرور محليًا. سجّل الدخول بحساب Firebase حقيقي لإرسال هذا الطلب.</p>
          {!configured && <p>إعداد Firebase غير مكتمل حاليًا؛ سيظل التصفح متاحًا ولن يتم الادعاء بحفظ الطلب.</p>}
          <Button to={configured ? loginPath : '/login'}>الانتقال إلى تسجيل الدخول</Button>
        </section>
      )}
      {!authLoading && user && (
        <form className="request-form panel" onSubmit={handleSubmit} noValidate>
          {formError && <p className="notice notice-error" role="alert">{formError}</p>}
          {success && <p className="notice notice-success" role="status" aria-live="polite">{success}</p>}
          <div className="form-grid">
            <FormField
              label="الاسم"
              id="request-name"
              name="name"
              value={form.name}
              onChange={updateField}
              error={errors.name}
              autoComplete="name"
              required
            />
            <FormField
              label="البريد الإلكتروني"
              id="request-email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              error={errors.email}
              autoComplete="email"
              required
            />
            <FormField
              label="وسيلة التواصل المفضلة"
              id="request-contact"
              name="contact"
              hint="مثل بريدك الجامعي أو رقم يمكن التواصل عبره."
              value={form.contact}
              onChange={updateField}
              error={errors.contact}
              required
            />
            <FormField
              label="التاريخ المفضل"
              id="request-date"
              name="preferredDate"
              type="date"
              min={todayDateOnly()}
              value={form.preferredDate}
              onChange={updateField}
              error={errors.preferredDate}
              required
            />
          </div>
          <FormField
            as="textarea"
            label="تفاصيل الطلب"
            id="request-details"
            name="details"
            rows="6"
            hint="اذكر المطلوب، المستوى، والنتيجة المتوقعة. الحد الأدنى 20 حرفًا."
            value={form.details}
            onChange={updateField}
            error={errors.details}
            required
          />
          <div className={`field request-consent ${errors.consent ? 'field--error' : ''}`}>
            <label htmlFor="request-consent">
              <input
                id="request-consent"
                name="consent"
                type="checkbox"
                checked={form.consent}
                onChange={updateField}
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? 'request-consent-error' : undefined}
              />
              <span>أوافق على مشاركة هذه البيانات مع مقدم الخدمة لمعالجة الطلب.</span>
            </label>
            {errors.consent && <p className="field-error" id="request-consent-error" role="alert">{errors.consent}</p>}
          </div>
          <div className="request-actions">
            <Button type="submit" disabled={saving}>{saving ? 'جارٍ الحفظ…' : 'إرسال الطلب'}</Button>
            <Link className="btn btn-secondary" to={`/services/${service.id}`}>العودة إلى الخدمة</Link>
          </div>
        </form>
      )}
    </main>
  );
}
